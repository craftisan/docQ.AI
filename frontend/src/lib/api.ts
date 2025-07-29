import axios from "axios";
import { ChunkPage, Doc } from "@/types/document/Doc";
import { User } from "@/types/auth/User";
import { IngestionJob } from "@/types/ingestion/IngestionJob";
import { QAResponse } from "@/types/document/QAResponse";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9001/api/";
export const RAG_API_URL = process.env.NEXT_PUBLIC_RAG_API_URL || "http://localhost:8000/";

export const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});
const ragClient = axios.create({
  baseURL: RAG_API_URL,
  headers: { "Content-Type": "application/json" },
});

// To set auth token in headers. Called by AuthContext.
export function setAuthTokenAPIHeader(token: string | null) {
  if (token) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common["Authorization"];
  }
}

export async function register(name: string, email: string, password: string) {
  const res = await client.post("auth/register", { name, email, password });
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await client.post("auth/login", { email, password });
  return res.data;
}

/* Authenticated API calls */

export async function listDocuments(): Promise<Doc[]> {
  const res = await client.get<Doc[]>("documents");
  return res.data;
}

export async function getDocument(id: string): Promise<Doc> {
  const res = await client.get<Doc>(`documents/${id}`);
  return res.data;
}

export async function fetchDocumentChunks(
  documentId: string,
  page: number,
  perPage: number,
): Promise<ChunkPage> {
  const { data } = await client.get<ChunkPage>(
    `documents/${documentId}/chunks`,
    {
      params: { page, perPage },
    }
  );
  return data;
}

export async function uploadDocument(file: File): Promise<Doc> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await client.post(
    "documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    }
  );
  return res.data;
}

export async function deleteDocument(id: string): Promise<boolean> {
  const res = await client.delete(`documents/${id}`);
  return res.data;
}

// User management
export async function getUsers(): Promise<User[]> {
  const res = await client.get<User[]>("users");
  return res.data;
}

export async function getUser(userId: string): Promise<User> {
  const res = await client.get<User>(`users/${userId}`);
  return res.data;
}

export async function updateUserRole(userId: string, role: string) {
  const res = await client.patch(
    `users/${userId}/role`,
    { role },
  );
  return res.data;
}

// Ingestion management
export async function getIngestionStatus(): Promise<IngestionJob[]> {
  const res = await client.get<IngestionJob[]>("ingestion/status");
  return res.data;
}

export async function triggerIngestion(doc: Doc): Promise<IngestionJob> {
  const res = await client.post<IngestionJob>(
    "ingestion/trigger",
    {
      "documentIds": [doc.id],
    },
  );
  return res.data;
}

export async function triggerBulkIngestion(documentIds: string[]): Promise<IngestionJob> {
  const { data } = await client.post<IngestionJob>("ingestion/trigger", { documentIds });
  return data;
}

// Q&A
export async function askQuestion(document_uuid: string, question: string): Promise<QAResponse> {
  const res = await ragClient.post<QAResponse>(
    "qa",
    { document_uuid, question },
  );
  return res.data;
}