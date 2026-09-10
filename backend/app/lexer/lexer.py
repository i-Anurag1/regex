from dataclasses import dataclass

class LexError(ValueError):
    pass

@dataclass(frozen=True)
class Token:
    kind: str
    value: object
    start: int
    end: int

OPERATORS = {'|':'UNION','*':'STAR','+':'PLUS','?':'QUESTION','(':'LPAREN',')':'RPAREN','{':'LBRACE','}':'RBRACE',',':'COMMA'}
ASCII = ''.join(chr(i) for i in range(128))
SHORTHANDS = {
    'd': ''.join(chr(i) for i in range(ord('0'), ord('9')+1)),
    'D': ''.join(c for c in ASCII if c not in set('0123456789')),
    'w': ''.join(chr(i) for i in range(128) if chr(i).isalnum() or chr(i) == '_'),
    'W': ''.join(chr(i) for i in range(128) if not (chr(i).isalnum() or chr(i) == '_')),
    's': ' \t\n\r\f\v',
    'S': ''.join(c for c in ASCII if c not in set(' \t\n\r\f\v')),
}

class Lexer:
    def __init__(self, source: str): self.source = source

    def _escape(self, i: int, in_class: bool = False):
        s = self.source
        if i + 1 >= len(s): raise LexError(f"Dangling escape at position {i}.")
        c = s[i+1]
        if c in SHORTHANDS:
            return ('CLASS', SHORTHANDS[c], i, i+2)
        if c == 'x':
            raw = s[i+2:i+4]
            if len(raw) != 2 or any(ch not in '0123456789abcdefABCDEF' for ch in raw):
                raise LexError(f"Invalid hex escape at position {i}. Expected \\xHH.")
            return ('LITERAL', chr(int(raw,16)), i, i+4)
        if c == 'u':
            raw = s[i+2:i+6]
            if len(raw) != 4 or any(ch not in '0123456789abcdefABCDEF' for ch in raw):
                raise LexError(f"Invalid Unicode escape at position {i}. Expected \\uHHHH.")
            return ('LITERAL', chr(int(raw,16)), i, i+6)
        return ('LITERAL', c, i, i+2)

    def _class(self, start: int):
        s = self.source; i = start + 1; neg = False
        if i < len(s) and s[i] == '^': neg = True; i += 1
        items = []
        while i < len(s) and s[i] != ']':
            if s[i] == '\\':
                kind, value, a, b = self._escape(i, True); items.append((value, a, b)); i = b
            else:
                items.append((s[i], i, i+1)); i += 1
        if i >= len(s): raise LexError(f"Unclosed character class starting at position {start}.")
        if not items: raise LexError(f"Empty character class at position {start}.")
        chars = []
        j = 0
        while j < len(items):
            value, a, b = items[j]
            if not isinstance(value, str): raise LexError(f"Invalid class item at position {a}.")
            if j + 2 < len(items) and items[j+1][0] == '-' and len(value) == 1 and len(items[j+2][0]) == 1:
                end = items[j+2][0]
                if ord(value) > ord(end): raise LexError(f"Invalid range {value}-{end} at position {a}.")
                chars.extend(chr(k) for k in range(ord(value), ord(end)+1)); j += 3
            else:
                chars.extend(value); j += 1
        chars = list(dict.fromkeys(chars))
        if neg: chars = [c for c in ASCII if c not in set(chars)]
        return Token('CLASS', ''.join(chars), start, i+1), i+1

    def tokenize(self) -> list[Token]:
        s = self.source; out=[]; i=0
        while i < len(s):
            c=s[i]
            if c.isspace(): i += 1; continue
            if c == '\\':
                kind,value,a,b=self._escape(i); out.append(Token(kind,value,a,b)); i=b; continue
            if c == '[':
                token,i=self._class(i); out.append(token); continue
            if c in OPERATORS:
                out.append(Token(OPERATORS[c],c,i,i+1)); i+=1; continue
            if c == '.': out.append(Token('CLASS',ASCII,i,i+1)); i+=1; continue
            if c == '^': out.append(Token('CARET',c,i,i+1)); i+=1; continue
            if c == '$': out.append(Token('DOLLAR',c,i,i+1)); i+=1; continue
            if c == 'ε': out.append(Token('EPSILON',c,i,i+1)); i+=1; continue
            if s.startswith('epsilon',i) and (i+7 == len(s) or not (s[i+7].isalnum() or s[i+7]=='_')):
                out.append(Token('EPSILON','epsilon',i,i+7)); i+=7; continue
            if c == ']': raise LexError(f"Unexpected ']' at position {i}.")
            out.append(Token('LITERAL',c,i,i+1)); i+=1
        out.append(Token('EOF','',len(s),len(s))); return out
