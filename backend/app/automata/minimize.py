def minimize(dfa):
    states={s['id'] for s in dfa['states']}; accepts=set(dfa['accepts']); alpha=dfa['alphabet']
    delta={(e['from'],e['symbol']):e['to'] for e in dfa['transitions']}
    sink=max(states,default=-1)+1
    work_states=set(states)
    for s in states:
        for a in alpha:
            if (s,a) not in delta: delta[(s,a)]=sink
    if sink not in states and any((s,a) not in {(e['from'],e['symbol']) for e in dfa['transitions']} for s in states for a in alpha): work_states.add(sink)
    P=[set(accepts), work_states-set(accepts)]
    P=[x for x in P if x]
    W=P.copy(); steps=[{'partitions':[sorted(x) for x in P]}]
    while W:
        A=W.pop()
        for c in alpha:
            X={q for q in work_states if delta.get((q,c),sink) in A}
            new=[]
            for Y in P:
                i=Y & X; d=Y-X
                if i and d:
                    new += [i,d]
                    if Y in W: W.remove(Y); W += [i,d]
                    else: W.append(i if len(i)<=len(d) else d)
                else: new.append(Y)
            P=new
            steps.append({'symbol':c,'splitter':sorted(A),'partitions':[sorted(x) for x in P]})
    P_sorted=sorted(P,key=lambda x:(0 if 0 in x else 1,min(x)))
    block={s:i for i,p in enumerate(P_sorted) for s in p}
    edges={}
    for i,p in enumerate(P_sorted):
        rep=min(p)
        for a in alpha:
            t=delta.get((rep,a),sink)
            if t in block: edges[(i,a)]=block[t]
    out_states=[]
    for i,p in enumerate(P_sorted):
        out_states.append({'id':i,'members':sorted(p),'start':0 in p,'accept':bool(p&accepts)})
    out_edges=[{'from':a,'to':b,'symbol':s} for (a,s),b in sorted(edges.items())]
    out_accepts=[s['id'] for s in out_states if s['accept']]
    return {'states':out_states,'transitions':out_edges,'start':block[0],'accepts':out_accepts,'alphabet':alpha,'minimization_steps':steps}
