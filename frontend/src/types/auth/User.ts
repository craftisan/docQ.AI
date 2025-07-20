import { Doc } from "@/types/document/Doc";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  documents: Doc[];
}
