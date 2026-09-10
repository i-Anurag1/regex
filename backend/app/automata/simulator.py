def simulate(dfa, text):
    delta={(e['from'],e['symbol']):e['to'] for e in dfa['transitions']}
    state=dfa['start']; trace=[]
    for idx,ch in enumerate(text):
        nxt=delta.get((state,ch))
        trace.append({'index':idx,'input':ch,'from':state,'to':nxt,'status':'ok' if nxt is not None else 'missing-transition'})
        if nxt is None: return {'accepted':False,'trace':trace,'final_state':None,'reason':f"No transition from state {state} on '{ch}'."}
        state=nxt
    accepted=state in set(dfa['accepts'])
    return {'accepted':accepted,'trace':trace,'final_state':state,'reason':'Accepted by the DFA.' if accepted else f'Finished in non-accepting state {state}.'}
