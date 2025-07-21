import { Doc } from "@/types/document/Doc";

export const INGESTION_STATUS = ["pending", "running", "done", "failed"] as const;

export type IngestionStatus = typeof INGESTION_STATUS[number];

export interface IngestionJob {
  id: string;
  documentIds: string[];
  documents: Doc[];
  status: IngestionStatus;
  createdAt: string;
  updatedAt: string;
}