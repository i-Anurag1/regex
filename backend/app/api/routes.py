from fastapi import APIRouter, HTTPException
from app.schemas.models import CompileRequest, SimulateRequest, BatchRequest, AssistantRequest
from app.compiler.pipeline import compile_regex
from app.automata.simulator import simulate
from app.core.config import settings
import urllib.request, json

router=APIRouter()

def compile_safe(regex):
    try: return compile_regex(regex)
    except (ValueError, KeyError) as e: raise HTTPException(status_code=422, detail=str(e))

@router.get('/health')
def health(): return {'status':'ok'}

@router.post('/compile')
def compile_endpoint(req: CompileRequest): return compile_safe(req.regex)

@router.post('/simulate')
def simulate_endpoint(req: SimulateRequest):
    c=compile_safe(req.regex); return {'regex':req.regex,'text':req.text,'simulation':simulate(c['minimized_dfa'],req.text),'stats':c['stats']}

@router.post('/batch-simulate')
def batch(req: BatchRequest):
    c=compile_safe(req.regex); return {'regex':req.regex,'results':[{'text':s,**simulate(c['minimized_dfa'],s)} for s in req.strings],'stats':c['stats']}

@router.post('/assistant')
def assistant(req: AssistantRequest):
    p=req.prompt.lower()
    if settings.ai_api_url and settings.ai_api_key:
        payload=json.dumps({'model':settings.ai_model,'messages':[{'role':'system','content':'Suggest a regex and explain it briefly.'},{'role':'user','content':req.prompt}]}).encode()
        request=urllib.request.Request(settings.ai_api_url,data=payload,headers={'Content-Type':'application/json','Authorization':f'Bearer {settings.ai_api_key}'})
        try:
            with urllib.request.urlopen(request,timeout=8) as r: data=json.loads(r.read())
            content=data.get('choices',[{}])[0].get('message',{}).get('content','')
        except Exception:
            content = ''
        if content:
            return {'source':'configured-ai','answer':content}
    suggestions=[]
    if 'email' in p: suggestions.append(('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$','basic email shape'))
    if 'digit' in p or 'number' in p: suggestions.append(('^[0-9]+$','one or more digits'))
    if 'phone' in p: suggestions.append(('^[0-9]{10}$','ten digits'))
    if 'binary' in p: suggestions.append(('^[01]+$','one or more binary digits'))
    if not suggestions: suggestions.append(('(a|b)*abb','example: strings over a/b ending in abb'))
    return {'source':'local-rules','answer':'No external AI is configured. Here is a deterministic suggestion.','suggestions':[{'regex':r,'explanation':e} for r,e in suggestions]}
