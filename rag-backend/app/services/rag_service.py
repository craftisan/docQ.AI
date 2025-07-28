import os

from chromadb.config import Settings
from langchain.chains import RetrievalQA
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.models.request_models import IngestRequest, QARequest, IngestChunksRequest
from app.models.response_models import IngestResponse, QAResponse
from app.services.qa_chain import make_qa_chain

USE_LOCAL_EMBEDDINGS = os.getenv("USE_LOCAL_EMBEDDINGS", "false").lower() == "true"
EMBEDDING_MODEL = os.getenv("HUGGINGFACE_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

# -------------------------
# Embedding model selection
# -------------------------
if USE_LOCAL_EMBEDDINGS:
    from langchain_huggingface import HuggingFaceEmbeddings

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
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
    # Uncomment to connect to a remote chromadb server, https://docs.trychroma.com/reference/python/client#httpclient
    # To run that server - https://docs.trychroma.com/docs/cli/run#running-a-chroma-server
    # client = chromadb.HttpClient(host="localhost", port=8001, ssl=False)
    return Chroma(
        collection_name="documents",
        embedding_function=embeddings,
        client_settings=Settings(),
        # client=client, # For remote chromadb instance
        persist_directory="./chroma"
    )


# -------------------------
# Ingestion API
# -------------------------

async def ingest_document_chunks(request: IngestChunksRequest) -> IngestResponse:
    # Build LangChain documents from your pre-chunked text:
    docs = []
    for chunk in request.chunks:
        d = Document(
            page_content=chunk,
            metadata={
                "document_name": request.document_name,
                "uuid": request.document_uuid,
            },
        )
        docs.append(d)

    store = get_vectorstore()
    store.add_documents(docs)

    return IngestResponse(
        status=True,
        message=f"Document '{request.document_name}' ingested ({len(docs)} chunks)."
    )

# Not in use. TODO: remove
async def ingest_document(request: IngestRequest) -> IngestResponse:
    # Split document into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    chunks = splitter.create_documents([request.document_content])

    if not chunks:
        return IngestResponse(status=False, message=f"Document '{request.document_name}' could not be processed.")

    # Add metadata
    for doc in chunks:
        doc.metadata["document_name"] = request.document_name
        doc.metadata["uuid"] = request.document_uuid

    store = get_vectorstore()
    store.add_documents(chunks)

    return IngestResponse(
        status=True,
        message=f"Document '{request.document_name}' ingested successfully."
    )


# -------------------------
# QA API
# -------------------------
async def answer_question(request: QARequest) -> QAResponse:
    # Load vector store
    store = get_vectorstore()

    # Filter on document_name
    retriever = store.as_retriever(search_kwargs={
        "filter": {"uuid": {"$eq": request.document_uuid}},
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
        model="google/flan-t5-base",
        device=-1  # CPU only
    )

    # Set up LLM
    llm = HuggingFacePipeline(pipeline=generator)

    # Create RetrievalQA chain
    qa = make_qa_chain(llm, retriever)

    # Query
    result = qa.invoke(request.question)

    # Extract answer and sources
    answer = result.get('result', 'No answer found.')
    sources = list({
        doc.metadata.get('source')
        for doc in result.get('source_documents', [])
        if doc.metadata.get('source')})

    return QAResponse(
        question=request.question,
        answer=answer,
        sources=sources
    )
