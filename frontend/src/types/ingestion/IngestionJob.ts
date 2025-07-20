export const INGESTION_STATUS = ["pending", "running", "done", "failed"] as const;

export type IngestionStatus = typeof INGESTION_STATUS[number];

export interface IngestionJob {
  id: string;
  documentIds: number[];
  status: IngestionStatus;
  createdAt: string;
  updatedAt: string;
}