// src/lib/api.ts
import axios from "axios";

export const API_URL = "http://localhost:9001/api/";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function register(email: string, password: string) {
  const res = await client.post("auth/register", { email, password });
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await client.post("auth/login", { email, password });
  return res.data;
}

export async function listDocuments(token: string) {
  const res = await client.get("documents", {
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
