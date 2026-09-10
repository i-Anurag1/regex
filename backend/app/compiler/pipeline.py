import time
from app.lexer.lexer import Lexer
from app.parser.parser import Parser
from app.automata.nfa import Thompson, serialize_nfa
from app.automata.dfa import subset_construct
from app.automata.minimize import minimize

def compile_regex(regex):
    t=time.perf_counter()
    tokens=Lexer(regex).tokenize()
    ast=Parser(tokens).parse()
    th=Thompson(); start,accept=th.build(ast)
    nfa=serialize_nfa(th.states,start,accept)
    dfa=subset_construct(th.states,start,accept)
    md=minimize(dfa)
    ast_nodes=sum(1 for _ in walk(ast))
    stats={'token_count':len([x for x in tokens if x.kind!='EOF']),'ast_nodes':ast_nodes,'nfa_states':len(nfa['states']),'dfa_states':len(dfa['states']),'minimized_states':len(md['states']),'alphabet_size':len(dfa['alphabet']),'compilation_ms':round((time.perf_counter()-t)*1000,3)}
    return {'regex':regex,'tokens':[{'kind':x.kind,'value':x.value,'start':x.start,'end':x.end} for x in tokens if x.kind!='EOF'],'ast':ast.to_dict(),'nfa':nfa,'dfa':dfa,'minimized_dfa':md,'stats':stats}

def walk(n):
    yield n
    for c in n.children: yield from walk(c)
