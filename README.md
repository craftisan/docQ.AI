# DocQ.ai - RAG based Document Search (Q&A) Application

![DocQ.ai App](https://github.com/user-attachments/assets/29adc4da-ac25-4d87-b442-7a62c8bdd085)

## Features

* Dashboard (list of all documents)
* Document Upload (.txt, .pdf, .docx)
* Document Ingestion
  * Automatic and manual (in chunks with background job, redis)
  * Vector Storage in ChromaDB
* Q&A - Ask question related to the document and get answer powered by AI
  * LLM - HuggingFace (sentence-transformers/all-MiniLM-L6-v2)
  * Text Generation - google/flan-t5-base
* Delete Document
* Ingestion Management (with Bulk ingestion)
* User Management (with update User Role)
* Login/Registration & Logout
* CI/CD - using Github Actions with AWS ECS on EC2 via GHCR (GitHub Container Registry)


## Resources

* [Full Documentation](https://github.com/craftisan/docQ.AI/wiki)
* [App Screenshots](https://github.com/craftisan/docQ.AI/wiki/Screenshots)
