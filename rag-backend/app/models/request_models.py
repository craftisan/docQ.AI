from pydantic import BaseModel
from typing import List

class IngestRequest(BaseModel):
    document_uuid: str
    document_name: str
    document_content: str

class QARequest(BaseModel):
    document_uuid: str
    question: str

class IngestChunksRequest(BaseModel):
    document_uuid: str
    document_name: str
    chunks: List[str]
