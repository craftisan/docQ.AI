import axios from "axios";
import { Doc } from "@/types/document/Doc";
import { User } from "@/types/auth/User";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9001/api/";
export const RAG_API_URL = process.env.NEXT_PUBLIC_RAG_API_URL || "http://localhost:8000/";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});
const ragClient = axios.create({
  baseURL: RAG_API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function register(name: string, email: string, password: string) {
  const res = await client.post("auth/register", { name, email, password });
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await client.post("auth/login", { email, password });
  return res.data;
}

export async function listDocuments(token: string): Promise<Doc[]> {
  const res = await client.get<Doc[]>("documents", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getDocument(id: string, token: string): Promise<Doc> {
  const res = await client.get<Doc>(`documents/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function uploadDocument(name: string, content: string, token: string) {
  const res = await client.post(
    "documents/upload",
    { name, content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// User management
export async function getUsers(token: string): Promise<User[]> {
  const res = await client.get<User[]>("users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateUserRole(userId: string, role: string, token: string) {
  const res = await client.patch(
    `users/${userId}/role`,
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// Ingestion management
export async function getIngestionStatus(token: string) {
  const res = await client.get("ingestion/status", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function triggerIngestion(token: string) {
  const res = await ragClient.post(
    "ingest",
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// Q&A
export async function askQuestion(question: string, token: string) {
  const res = await ragClient.post(
    "qa",
    { question },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}