"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth/AuthContext";
import { getIngestionStatus, listDocuments, triggerBulkIngestion, triggerIngestion, } from "@/lib/api";
import clsx from "clsx";
import { IngestionJob } from "@/types/ingestion/IngestionJob";
import { Doc } from "@/types/document/Doc";

interface DocWithStatus extends Doc {
  latestStatus: string | null;
}

export default function IngestionPage() {
  const { loading } = useAuth();
  const [docs, setDocs] = useState<DocWithStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [triggering, setTriggering] = useState<Record<string, boolean>>({});
  const [bulkTriggering, setBulkTriggering] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const fetchData = async() => {
    try {
      const [docList, jobs] = await Promise.all([
        listDocuments(),
        getIngestionStatus(),
      ]);
      const enriched: DocWithStatus[] = docList.map((doc: Doc): DocWithStatus => {
        const related = jobs
          .filter((j: IngestionJob) => j.documentIds.includes(doc.id))
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() -
              new Date(a.updatedAt).getTime()
          );
        return {
          ...doc,
          latestStatus: related.length > 0 ? related[0].status : null,
        };
      });
      setDocs(enriched);
      // clear selections for docs no longer eligible
      setSelected((prev) => {
        const next: Record<string, boolean> = {};
        enriched.forEach((d) => {
          if (d.latestStatus !== "done" && prev[d.id]) {
            next[d.id] = true;
          }
        });
        return next;
      });
    } catch {
      setError("Failed to load documents or ingestion status.");
    }
  }

  useEffect(() => {
    if (!loading) {
      void fetchData();
    }
  }, [loading]);

  const handleIngest = async(doc: Doc) => {
    setTriggering((t) => ({ ...t, [doc.id]: true }));
    try {
      await triggerIngestion(doc);
      await fetchData();
    } catch {
      setError("Failed to trigger ingestion.");
    } finally {
      setTriggering((t) => ({ ...t, [doc.id]: false }));
    }
  };

  const toggleSelect = (docId: string) => {
    setSelected((s) => ({ ...s, [docId]: !s[docId] }));
  };

  const handleBulkIngest = async() => {
    const docsToIngest = docs
      .filter((d) => selected[d.id] && d.latestStatus !== "done")
      .map((d) => d.id);
    if (docsToIngest.length === 0) return;

    setBulkTriggering(true);
    try {
      // one API call instead of looping
      await triggerBulkIngestion(docsToIngest);
      await fetchData();
      setSelected({});
    } catch {
      setError("Failed to trigger bulk ingestion.");
    } finally {
      setBulkTriggering(false);
    }
  };

  const anySelected = Object.values(selected).some(Boolean);

  const selectableIds = docs
    .filter((d) => d.latestStatus !== "done")
    .map((d) => d.id);

  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => selected[id]);

  const someSelected =
    selectableIds.some((id) => selected[id]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Ingestion Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4 flex items-center space-x-4">
        <button
          onClick={handleBulkIngest}
          disabled={!anySelected || bulkTriggering}
          className={clsx(
            "px-4 py-2 rounded shadow",
            bulkTriggering
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-800"
          )}
        >
          {bulkTriggering ? "Ingesting..." : "Bulk Ingest"}
        </button>
      </div>

      <div className="overflow-auto rounded-lg shadow-xl">
        <table className="w-full bg-white">
          <thead className="rounded-lg bg-blue-500">
            <tr className="*:p-4 *:text-left text-white rounded-lg">
              <th>
                {/* header checkbox to select all */}
                <input
                  type="checkbox"
                  checked={allSelected}               // always controlled
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelected(() =>
                      selectableIds.reduce<Record<string, boolean>>((acc, id) => {
                        acc[id] = checked;
                        return acc;
                      }, {})
                    );
                  }}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  disabled={selectableIds.length === 0}
                />
              </th>
              <th>Document</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="*:border-t *:border-gray-200 *:*:p-4 *:*:text-left">
            {docs.map((doc) => (
              <tr key={doc.id}>
                <td>
                  {doc.latestStatus !== "done" && (
                    <input
                      type="checkbox"
                      checked={selected[doc.id]}
                      onChange={() => toggleSelect(doc.id)}
                    />
                  )}
                </td>
                <td>
                  <Link
                    href={`/documents/${doc.id}/qa`}
                    className="text-blue-500 hover:underline"
                  >
                    {doc.name}
                  </Link>
                </td>
                <td className="capitalize">
                  {doc.latestStatus ?? (
                    <span className="text-gray-500">Pending</span>
                  )}
                </td>
                <td>
                  {doc.latestStatus !== "done" && (
                    <button
                      onClick={() => handleIngest(doc)}
                      disabled={triggering[doc.id]}
                      className={clsx(
                        "px-3 py-1 rounded shadow",
                        triggering[doc.id]
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      )}
                    >
                      {triggering[doc.id] ? "Ingesting..." : "Ingest"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
