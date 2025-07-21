from pydantic import BaseModel

class IngestRequest(BaseModel):
    document_uuid: str
    document_name: str
    document_content: str

class QARequest(BaseModel):
    document_uuid: str
    question: str
