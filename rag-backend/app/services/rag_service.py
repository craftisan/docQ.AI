import os

from chromadb.config import Settings
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama

from app.models.request_models import IngestRequest, QARequest
from app.models.response_models import IngestResponse, QAResponse

USE_LOCAL_EMBEDDINGS = os.getenv("USE_LOCAL_EMBEDDINGS", "false").lower() == "true"

# -------------------------
# Embedding model selection
# -------------------------
if USE_LOCAL_EMBEDDINGS:
    from langchain_huggingface import HuggingFaceEmbeddings

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
else:
    from langchain_openai import OpenAIEmbeddings

    embeddings = OpenAIEmbeddings()

# -------------------------
# Config
# -------------------------
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100

# -------------------------
# Vector Store
# -------------------------

def get_vectorstore():
    return Chroma(
        collection_name="documents",
        embedding_function=embeddings,
        client_settings=Settings()
    )

# -------------------------
# Ingestion API
# -------------------------
async def ingest_document(request: IngestRequest) -> IngestResponse:
    # Split document into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    chunks = splitter.create_documents([request.document_content])

    if not chunks:
        return IngestResponse(status=False, message="No chunks generated from document.")

    # Add metadata
    for doc in chunks:
        doc.metadata["document_name"] = request.document_name

    store = get_vectorstore()
    store.add_documents(chunks)

    return IngestResponse(
        status=True,
        message=f"Document '{request.document_name}' ingested successfully with {len(chunks)} chunks."
    )

# -------------------------
# QA API
# -------------------------
async def answer_question(request: QARequest) -> QAResponse:
    # Load vector store
    store = get_vectorstore()

    # Filter on document_name
    retriever = store.as_retriever(search_kwargs={
        "filter": {"document_name": {"$eq": request.document_name}},
        "k": 5
    })

    if not retriever:
        return QAResponse(
            question=request.question,
            answer="No documents have been ingested yet. Please ingest first.",
            sources=[]
        )

    # CPU-Friendly Local Model
    from transformers import pipeline
    from langchain_huggingface import HuggingFacePipeline

    generator = pipeline(
        "text2text-generation",
        model="google/flan-t5-small",
        device=-1  # CPU only
    )

    # Set up LLM
    llm = HuggingFacePipeline(pipeline=generator)

    # Create RetrievalQA chain
    qa = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True
    )

    # Query
    result = qa.invoke(request.question)

    # Extract answer and sources
    answer = result.get('result', 'No answer found.')
    sources = list({doc.metadata.get('source', 'N/A') for doc in result.get('source_documents', [])})

    return QAResponse(
        question=request.question,
        answer=answer,
        sources=sources
    )
