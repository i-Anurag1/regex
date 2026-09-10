from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(title="Regex Compiler and Automata Visualizer API", version="1.0.0", description="Deterministic compiler pipeline for regular expressions.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"name": "Regex Compiler and Automata Visualizer", "docs": "/docs"}
