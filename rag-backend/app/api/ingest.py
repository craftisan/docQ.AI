from fastapi import APIRouter
from app.models.request_models import IngestRequest
from app.models.response_models import IngestResponse
from app.services.rag_service import ingest_document

router = APIRouter()

@router.post("/", response_model=IngestResponse)
async def ingest_endpoint(request: IngestRequest):
    result = await ingest_document(request)
    return result
