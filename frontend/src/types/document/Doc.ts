import { User } from "@/types/auth/User";
import { IngestionJob } from "@/types/ingestion/IngestionJob";

export interface Doc {
  id: string;
  name: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  ingestionJobs: IngestionJob[];
}

/**
 * Get the latest ingestion job associated with the Doc.
 * Returns null if no jobs found for the Doc.
 *
 * @param doc
 */
export function getLatestIngestionJob(
  doc: Doc | null
): IngestionJob | null {

  const jobs = doc?.ingestionJobs;

  if (!jobs || jobs.length === 0) return null;

  // Find the job with the max updatedAt
  return jobs.reduce((prev, curr) =>
    new Date(curr.updatedAt) > new Date(prev.updatedAt) ? curr : prev
  );
}
