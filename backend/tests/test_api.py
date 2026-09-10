from fastapi.testclient import TestClient
from app.main import app
client=TestClient(app)

def test_compile_api():
    r=client.post('/api/compile',json={'regex':'a|b'})
    assert r.status_code==200 and r.json()['stats']['alphabet_size']==2

def test_simulation_api():
    r=client.post('/api/simulate',json={'regex':'a+','text':'aaa'})
    assert r.status_code==200 and r.json()['simulation']['accepted']

def test_validation():
    r=client.post('/api/compile',json={'regex':''})
    assert r.status_code==422
