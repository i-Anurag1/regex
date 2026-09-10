from dataclasses import dataclass, field
from app.ast.nodes import Node
EPS=None
@dataclass
class NState:
    id:int
    transitions:dict[str|None,set[int]]=field(default_factory=dict)
    def add(self,symbol,target): self.transitions.setdefault(symbol,set()).add(target)

class Thompson:
    def __init__(self): self.states={}; self.next=0
    def state(self): s=NState(self.next); self.states[s.id]=s; self.next+=1; return s.id
    def edge(self,a,b,s): self.states[a].add(s,b)
    def build(self,n):
        k=n.kind
        if k=='Literal' or k=='CharClass':
            a,b=self.state(),self.state()
            for ch in (n.value if k=='CharClass' else [n.value]): self.edge(a,b,ch)
            return a,b
        if k in ('Epsilon','AnchorStart','AnchorEnd'):
            a,b=self.state(),self.state(); self.edge(a,b,EPS); return a,b
        if k=='Concat':
            fr,to=self.build(n.children[0])
            for c in n.children[1:]: x,y=self.build(c); self.edge(to,x,EPS); to=y
            return fr,to
        if k=='Union':
            a,b=self.state(),self.state()
            for c in n.children: x,y=self.build(c); self.edge(a,x,EPS); self.edge(y,b,EPS)
            return a,b
        if k=='Star':
            a,b=self.state(),self.state(); x,y=self.build(n.children[0]); self.edge(a,b,EPS); self.edge(a,x,EPS); self.edge(y,x,EPS); self.edge(y,b,EPS); return a,b
        if k=='Plus':
            a,b=self.state(),self.state(); x,y=self.build(n.children[0]); self.edge(a,x,EPS); self.edge(y,x,EPS); self.edge(y,b,EPS); return a,b
        if k=='Optional':
            a,b=self.state(),self.state(); x,y=self.build(n.children[0]); self.edge(a,b,EPS); self.edge(a,x,EPS); self.edge(y,b,EPS); return a,b
        if k=='Repeat':
            mn=n.value['min']; mx=n.value['max']; child=n.children[0]
            if mx is None:
                if mn==0: return self._star_fragment(child)
                fr,to=self.build(child)
                for _ in range(1,mn): x,y=self.build(child); self.edge(to,x,EPS); to=y
                b=self.state(); self.edge(to,b,EPS)
                x,y=self.build(child); self.edge(to,x,EPS); self.edge(y,x,EPS); self.edge(y,b,EPS)
                return fr,b
            if mn==mx:
                if mn==0:
                    a,b=self.state(),self.state(); self.edge(a,b,EPS); return a,b
                fr,to=self.build(child)
                for _ in range(1,mn): x,y=self.build(child); self.edge(to,x,EPS); to=y
                return fr,to
            a,b=self.state(),self.state(); cur=a
            for _ in range(mn):
                x,y=self.build(child); self.edge(cur,x,EPS); cur=y
            self.edge(cur,b,EPS)
            for _ in range(mn,mx):
                x,y=self.build(child); self.edge(cur,x,EPS); self.edge(cur,b,EPS); cur=y
            self.edge(cur,b,EPS)
            return a,b
        raise ValueError(f'Unknown AST node {k}')
    def _star_fragment(self,n):
        a,b=self.state(),self.state(); x,y=self.build(n); self.edge(a,b,EPS); self.edge(a,x,EPS); self.edge(y,x,EPS); self.edge(y,b,EPS); return a,b

def serialize_nfa(states,start,accept):
    trans=[]
    for sid,s in states.items():
        for sym,targets in s.transitions.items():
            for t in sorted(targets): trans.append({'from':sid,'to':t,'symbol':'ε' if sym is None else sym})
    alphabet=sorted({x['symbol'] for x in trans if x['symbol']!='ε'})
    return {'states':[{'id':i,'start':i==start,'accept':i==accept} for i in sorted(states)],'transitions':trans,'start':start,'accepts':[accept],'alphabet':alphabet}
