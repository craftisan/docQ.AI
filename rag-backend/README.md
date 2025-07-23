source .venv/bin/activate

chroma run --port 8001

uvicorn app.main:app --reload