from pydantic import BaseModel

class IngestRequest(BaseModel):
    document_name: str
    document_content: str

class QARequest(BaseModel):
    question: str
    document_name: str
