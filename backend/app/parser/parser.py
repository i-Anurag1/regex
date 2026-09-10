from app.lexer.lexer import Token
from app.ast.nodes import Node

class ParseError(ValueError): pass
STARTERS={'LITERAL','CLASS','EPSILON','LPAREN','CARET'}
POSTFIX={'STAR','PLUS','QUESTION','LBRACE'}

class Parser:
    def __init__(self,tokens): self.t=tokens; self.i=0; self.next_id=1
    def cur(self): return self.t[self.i]
    def take(self): x=self.cur(); self.i+=1; return x
    def node(self,kind,start,end,children=None,value=None):
        n=Node(self.next_id,kind,start,end,children or [],value); self.next_id+=1; return n
    def parse(self):
        if self.cur().kind=='EOF': raise ParseError('Regex is empty.')
        root=self.union()
        if self.cur().kind=='DOLLAR':
            end=self.take(); root=self.node('Concat',root.start,end.end,[root,self.node('AnchorEnd',end.start,end.end,value='$')])
        if self.cur().kind!='EOF': raise ParseError(f"Unexpected token '{self.cur().value or self.cur().kind}' at position {self.cur().start}.")
        self._validate_anchors(root)
        return root
    def union(self):
        left=self.concat()
        while self.cur().kind=='UNION':
            op=self.take()
            if self.cur().kind not in STARTERS: raise ParseError(f"Expected expression after '|' at position {op.end}.")
            right=self.concat(); left=self.node('Union',left.start,right.end,[left,right])
        return left
    def concat(self):
        if self.cur().kind not in STARTERS: raise ParseError(f"Expected expression at position {self.cur().start}, found '{self.cur().value or self.cur().kind}'.")
        parts=[self.repeat()]
        while self.cur().kind in STARTERS: parts.append(self.repeat())
        return parts[0] if len(parts)==1 else self.node('Concat',parts[0].start,parts[-1].end,parts)
    def repeat(self):
        n=self.atom()
        while self.cur().kind in POSTFIX:
            op=self.cur()
            if op.kind=='LBRACE':
                mn,mx,end=self.bounds(); n=self.node('Repeat',n.start,end,[n],{'min':mn,'max':mx}); continue
            self.take(); n=self.node({'STAR':'Star','PLUS':'Plus','QUESTION':'Optional'}[op.kind],n.start,op.end,[n])
        return n
    def bounds(self):
        left=self.take(); digits=''
        while self.cur().kind=='LITERAL' and str(self.cur().value).isdigit(): digits += str(self.take().value)
        if not digits: raise ParseError(f"Expected number after '{{' at position {self.cur().start}.")
        mn=int(digits); mx=mn
        if self.cur().kind=='COMMA':
            self.take(); digits2=''
            while self.cur().kind=='LITERAL' and str(self.cur().value).isdigit(): digits2 += str(self.take().value)
            mx=None if not digits2 else int(digits2)
            if mx is not None and mx<mn: raise ParseError(f"Invalid repetition {{{mn},{mx}}}: maximum is smaller than minimum.")
        if self.cur().kind!='RBRACE': raise ParseError(f"Expected '}}' for repetition starting at position {left.start}.")
        end=self.take().end
        if mn>100: raise ParseError('Repetition bound is limited to 100 to keep automata size practical.')
        if mx is not None and mx>100: raise ParseError('Repetition bound is limited to 100 to keep automata size practical.')
        return mn,mx,end
    def atom(self):
        x=self.cur()
        if x.kind=='LITERAL': self.take(); return self.node('Literal',x.start,x.end,value=x.value)
        if x.kind=='CLASS': self.take(); return self.node('CharClass',x.start,x.end,value=x.value)
        if x.kind=='EPSILON': self.take(); return self.node('Epsilon',x.start,x.end,value='ε')
        if x.kind=='CARET': self.take(); return self.node('AnchorStart',x.start,x.end,value='^')
        if x.kind=='LPAREN':
            left=self.take()
            if self.cur().kind=='RPAREN': raise ParseError(f'Empty group at position {left.start}.')
            inner=self.union()
            if self.cur().kind!='RPAREN': raise ParseError(f"Missing ')' for '(' at position {left.start}.")
            right=self.take(); inner.start=left.start; inner.end=right.end; return inner
        if x.kind=='RPAREN': raise ParseError(f"Unexpected ')' at position {x.start}.")
        if x.kind in POSTFIX: raise ParseError(f"Operator '{x.value}' at position {x.start} has no operand.")
        if x.kind=='DOLLAR': self.take(); return self.node('AnchorEnd',x.start,x.end,value='$')
        raise ParseError(f"Expected operand at position {x.start}.")
    def _validate_anchors(self,n):
        flat=[]
        def walk(x):
            if x.kind in ('AnchorStart','AnchorEnd'): flat.append(x)
            for c in x.children: walk(c)
        walk(n)
        if not flat: return
        # Full-string simulation gives ^ and $ their natural meaning only at expression edges.
        def first(x):
            if x.kind=='Concat': return first(x.children[0])
            return x
        def last(x):
            if x.kind=='Concat': return last(x.children[-1])
            return x
        if any(a.kind=='AnchorStart' and a is not first(n) for a in flat): raise ParseError("'^' is only supported at the start of the expression.")
        if any(a.kind=='AnchorEnd' and a is not last(n) for a in flat): raise ParseError("'$' is only supported at the end of the expression.")
