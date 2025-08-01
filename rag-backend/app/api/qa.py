from fastapi import APIRouter, HTTPException
from app.models.request_models import QARequest
from app.models.response_models import QAResponse
from app.services.rag_service import answer_question

router = APIRouter()

@router.post("", response_model=QAResponse)
async def qa_endpoint(request: QARequest):
    try :
        return await answer_question(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
