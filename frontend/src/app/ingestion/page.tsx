"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { getIngestionStatus, triggerIngestion } from "@/lib/api";

interface IngestionJob {
  id: string;
  documentName: string;
  status: string;
  progress: number;
}

export default function IngestionPage() {
  const { token, loading } = useAuth();
  const [jobs, setJobs] = useState<IngestionJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async() => {
    if (!token) return;
    try {
      const data = await getIngestionStatus(token!);
      setJobs(data);
    } catch {
      setError("Failed to fetch ingestion status.");
    }
  }, [token]);

  useEffect(() => {
    if (!loading) {
      void fetchStatus();
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, loading]);

  const handleTrigger = async() => {
    try {
      await triggerIngestion(token!);
      void fetchStatus();
    } catch {
      setError("Failed to trigger ingestion.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ingestion Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={handleTrigger}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Trigger Ingestion
      </button>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Document</th>
            <th className="p-2">Status</th>
            <th className="p-2">Progress</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <tr key={job.id} className="border-t">
              <td className="p-2">{job.documentName}</td>
              <td className="p-2">{job.status}</td>
              <td className="p-2">
                <progress value={job.progress} max={100}/>
                {job.progress}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
