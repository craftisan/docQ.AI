from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ingest, qa, health

app = FastAPI(
    title="RAG Backend",
    description="Handles document ingestion and RAG Q&A",
    version="0.1.0",
)

origins = [
    "http://localhost:3000",
    "http://localhost:9001",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(ingest.router, prefix="/ingest", tags=["Ingestion"])
app.include_router(qa.router, prefix="/qa", tags=["Q&A"])
