from collections import deque
from app.automata.nfa import NState

def closure(states, nfa):
    stack=list(states); out=set(states)
    while stack:
        s=stack.pop()
        for t in nfa[s].transitions.get(None,set()):
            if t not in out: out.add(t); stack.append(t)
    return frozenset(out)

def move(states, symbol, nfa):
    out=set()
    for s in states: out.update(nfa[s].transitions.get(symbol,set()))
    return out

def subset_construct(nfa, start, accept):
    start_set=closure({start},nfa)
    ids={start_set:0}; sets=[start_set]; trans={}; q=deque([start_set]); steps=[]
    alphabet=sorted({sym for s in nfa.values() for sym in s.transitions if sym is not None})
    while q:
        cur=q.popleft(); cid=ids[cur]; trans.setdefault(cid,{})
        for sym in alphabet:
            nxt=closure(move(cur,sym,nfa),nfa)
            steps.append({'from_set':sorted(cur),'symbol':sym,'move_set':sorted(move(cur,sym,nfa)),'closure_set':sorted(nxt)})
            if not nxt: continue
            if nxt not in ids: ids[nxt]=len(sets); sets.append(nxt); q.append(nxt)
            trans[cid][sym]=ids[nxt]
    accepts=sorted(i for st,i in ids.items() if accept in st)
    states=[{'id':i,'nfa_states':sorted(st),'start':i==0,'accept':i in accepts} for st,i in sorted(ids.items(), key=lambda x:x[1])]
    edges=[{'from':a,'to':b,'symbol':sym} for a,ds in trans.items() for sym,b in sorted(ds.items())]
    return {'states':states,'transitions':edges,'start':0,'accepts':accepts,'alphabet':alphabet,'subset_steps':steps}
