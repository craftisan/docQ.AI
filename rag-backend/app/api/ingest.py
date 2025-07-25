import os

from fastapi import APIRouter, HTTPException, BackgroundTasks, status

from app.models.request_models import IngestRequest, IngestChunksRequest
from app.models.response_models import IngestResponse
from app.services.rag_service import ingest_document, ingest_document_chunks

router = APIRouter()

# Check if synchronous option is enabled
SYNC_INGEST = os.getenv("SYNC_INGEST", "false").lower() == "true"


@router.post("", response_model=IngestResponse, status_code=status.HTTP_202_ACCEPTED)
async def ingest_endpoint(background_tasks: BackgroundTasks, request: IngestRequest) -> IngestResponse:
    # Kick off ingestion in background.
    # Returns 202 immediately.
    try:
        if SYNC_INGEST:
            return await ingest_document(request)
        else:
            # In production, replace with queue
            background_tasks.add_task(ingest_document, request)
            return IngestResponse(
                status=True,
                message=f"Document '{request.document_name}' queued for ingestion successfully",
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/chunks", response_model=IngestResponse)
async def ingest_chunks(request: IngestChunksRequest) -> IngestResponse:
    try :
        return await ingest_document_chunks(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
