# DocQ.ai - RAG based Document Search Application

## Table of Contents

* [System Requirements](#system-requirements)
* [Local Setup](#local-setup)

    * [Environment Variables](#environment-variables)
* [Installation & Running](#installation--running)

    * [Frontend](#frontend)
    * [Backend](#backend)
    * [RAG-Backend](#rag-backend)
* [Testing](#testing)

    * [Frontend Testing](#frontend-testing)
    * [Backend Testing](#backend-testing)
    * [RAG-Backend Testing](#rag-backend-testing)
* [Production Setup with ECS on EC2](#production-setup-with-ecs-on-ec2)
* [API Reference](#api-reference)

    * [Backend APIs](#backend-apis)
    * [RAG-Backend APIs](#rag-backend-apis)

## System Requirements

| Component | Requirement                | Version    |
| --------- | -------------------------- | ---------- |
| OS        | macOS / Linux / Windows    | Any modern |
| Node.js   | JavaScript runtime         | >= 20.x    |
| npm       | Node package manager       | >= 9.x     |
| Python    | Python interpreter         | >= 3.13    |
| pip       | Python package manager     | >= 23.x    |
| Docker    | Container runtime          | >= 20.x    |
| AWS CLI   | AWS command-line interface | >= 2.x     |
| Git       | Version control            | >= 2.x     |

## Local Setup

1. Clone this repository:

   ```bash
   git clone https://github.com/your-org/rag-app.git
   cd rag-app
   ```
2. Navigate into each subdirectory and set up environment variables.

### Environment Variables

Copy the sample `.env.example` files and set your own values.

* **Frontend** (`frontend/.env.local`):

  ```ini
  NEXT_PUBLIC_API_URL=http://localhost:3001
  NEXT_PUBLIC_RAG_API_URL=http://localhost:8001
  ```

* **Backend** (`backend/.env`):

  ```ini
  PORT=3001
  DATABASE_URL=postgresql://user:password@localhost:5432/yourdb
  JWT_SECRET=your_jwt_secret
  ```

* **RAG-Backend** (`rag-backend/.env`):

  ```ini
  OPENAI_API_KEY=your_openai_api_key
  CHROMA_DB_URL=postgresql://chroma:chroma@localhost:5432/chromadb
  FASTAPI_PORT=8001
  ```

## Installation & Running

### Frontend

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Backend

```bash
cd backend
npm install
npm run start:dev
# Open http://localhost:3001
```

### RAG-Backend

```bash
cd rag-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port ${FASTAPI_PORT:-8001}
# chroma run --port 8001 # To run Chroma-DB (vector store DB) in foreground
```

## Testing

### Frontend Testing

```bash
cd frontend
npm run test
```

### Backend Testing

```bash
cd backend
npm run test:cov
```

### RAG-Backend Testing

Currently no automated tests are provided. You can add tests using `pytest`.

```bash
cd rag-backend
pip install pytest
pytest
```

## Production Setup with ECS on EC2

1. **Create ECR Repositories** for each component or use GHCR:

   ```bash
   aws ecr create-repository --repository-name frontend
   aws ecr create-repository --repository-name backend
   aws ecr create-repository --repository-name rag-backend
   ```

2. **Authenticate Docker to ECR**:

   ```bash
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com
   ```

3. **Build and Push Docker Images**:

   ```bash
   # Frontend
   docker build -t frontend:latest frontend/
   docker tag frontend:latest <ecr_uri>/frontend:latest
   docker push <ecr_uri>/frontend:latest

   # Backend
   docker build -t backend:latest backend/
   docker tag backend:latest <ecr_uri>/backend:latest
   docker push <ecr_uri>/backend:latest

   # RAG-Backend
   docker build -t rag-backend:latest rag-backend/
   docker tag rag-backend:latest <ecr_uri>/rag-backend:latest
   docker push <ecr_uri>/rag-backend:latest
   ```

4. **Create an ECS Cluster** (EC2 launch type, free-tier eligible):

   ```bash
   aws ecs create-cluster --cluster-name rag-app-cluster
   ```

5. **Register Task Definitions** for each service, specifying container images, port mappings, environment variables, and IAM roles.

6. **Create Services** associated with the task definitions, attach to an Application Load Balancer (ALB), and configure an Auto Scaling group of EC2 instances (e.g., t2.micro).

7. **Configure Networking**:

    * Security Groups to allow HTTP/HTTPS.
    * Load Balancer listeners on ports 80/443.
    * Set up Route 53 DNS if needed.

8. **Deploy** and verify each service is running:

   ```bash
   aws ecs update-service --cluster rag-app-cluster --service frontend-service --desired-count 2
   aws ecs update-service --cluster rag-app-cluster --service backend-service --desired-count 2
   aws ecs update-service --cluster rag-app-cluster --service rag-backend-service --desired-count 2
   ```

## API Reference

### Backend APIs

| Endpoint         | Method | Description                    |
| ---------------- | ------ | ------------------------------ |
| `/auth/register` | POST   | Register a new user            |
| `/auth/login`    | POST   | Authenticate and receive a JWT |
| `/users`         | GET    | List all users                 |
| `/users/:id`     | GET    | Get user by ID                 |
| `/documents`     | GET    | Retrieve all documents         |
| `/documents`     | POST   | Upload/Create a new document   |
| `/documents/:id` | GET    | Get document by ID             |
| `/ingestion`     | POST   | Trigger document ingestion     |

### RAG-Backend APIs

| Endpoint  | Method | Description                              |
| --------- | ------ | ---------------------------------------- |
| `/ingest` | POST   | Ingest documents into the vector store   |
| `/qa`     | POST   | Query the vector store and get an answer |
| `/health` | GET    | Health check endpoint                    |
| `/docs`   | GET    | Automatic API documentation (Swagger UI) |

> **Note:** Replace `<ecr_uri>`, `<aws_account_id>`, `<region>`, and other placeholders with your actual values as needed.
