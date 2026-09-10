from pydantic import BaseModel, Field

class CompileRequest(BaseModel):
    regex: str = Field(min_length=1, max_length=1000)

class SimulateRequest(BaseModel):
    regex: str = Field(min_length=1, max_length=1000)
    text: str = Field(max_length=5000)

class BatchRequest(BaseModel):
    regex: str = Field(min_length=1, max_length=1000)
    strings: list[str] = Field(max_length=500)

class AssistantRequest(BaseModel):
    prompt: str = Field(min_length=2, max_length=1000)
