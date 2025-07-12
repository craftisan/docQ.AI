from pydantic import BaseModel

class IngestResponse(BaseModel):
    status: bool
    message: str

class QAResponse(BaseModel):
    question: str
    answer: str
    sources: list[str] = []
