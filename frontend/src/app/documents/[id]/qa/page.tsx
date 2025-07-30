"use client";

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth/AuthContext"
import { askQuestion, deleteDocument, fetchDocumentChunks, getDocument, triggerIngestion } from "@/lib/api"
import { ChunkPage, Doc, getLatestIngestionJob } from "@/types/document/Doc";
import { QAResponse } from "@/types/document/QAResponse";
import IngestionStatusBadge from "@/components/ingestion/IngestionStatusBadge";
import clsx from "clsx";
import { TrashIcon } from "@heroicons/react/24/outline";
import { IngestResponse } from "@/types/document/IngestResponse";
import axios, { AxiosError } from "axios";
import { IngestionJob, IngestionStatus } from "@/types/ingestion/IngestionJob";

export default function DocumentQAPage() {
  const { id } = useParams() as { id: string };
  const { loading } = useAuth()
  const router = useRouter()
  const [document, setDocument] = useState<Doc | null>(null)
  const [question, setQuestion] = useState("")
  const [qaResponse, setQAResponse] = useState<Partial<QAResponse> | null>(null)
  const [ingestResponse, setIngestResponse] = useState<IngestResponse | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingQA, setLoadingQA] = useState(false)
  const [loadingIngest, setLoadingIngest] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteResponse, setDeleteResponse] = useState<{ status: boolean, message: string } | null>(null)
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [chunks, setChunks] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!loading) {
      if (!id) return router.push("/dashboard");

      getDocument(id)
        .then((res: Doc) => {
          setDocument(res);
        })
        .catch(() => {
          router.push("/dashboard");
        })
        .finally(() => {
          setLoadingData(false);
        });

      fetchDocumentChunks(id, page, perPage)
        .then((res: ChunkPage) => {
          setChunks(res.chunks.map((c) => c.text));

          setTotalPages(Math.ceil(res.total / res.perPage));
        })
        .catch(() => {
          router.push("/dashboard");
        })
        .finally(() => {
          setLoadingData(false);
        });
    }
  }, [loading, id, router, page]);

  const handleAsk = async(e: React.FormEvent) => {
    e.preventDefault()
    setLoadingQA(true)
    try {
      const res: QAResponse = await askQuestion(document!.id, question)
      res.status = true;
      setQAResponse(res)
    } catch (err) {
      let message = "Something went wrong, please try again.";
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setQAResponse({ status: false, error: message });
    } finally {
      setLoadingQA(false)
    }
  }

  const handleIngest = async(e: React.FormEvent) => {
    e.preventDefault()
    if (!document) return
    setLoadingIngest(true);
    try {
      // Trigger ingestion API call
      const res: IngestionJob = await triggerIngestion(document)
      setIngestResponse({ status: true, message: "Document ingested successfully!" })
      // Update document object with the new ingestion job
      document.ingestionJobs.push(res);
      setDocument(document);
    } catch (err) {
      let message = "Ingestion failed, please try again later.";
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setIngestResponse({ status: false, message: message });
    } finally {
      setLoadingIngest(false);
    }
  }

  const handleDelete = async(e: React.FormEvent) => {
    e.preventDefault()
    if (!document) return
    setLoadingDelete(true);
    try {
      // Trigger ingestion API call
      const deleted = await deleteDocument(document.id);
      if (deleted) {
        setDeleteResponse({ status: true, message: "Document deleted successfully!" })
        // Wait 2 seconds so user can read the message
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push("/dashboard");
        return;
      }
      setDeleteResponse({ status: false, message: "Could not delete document, please try again." })
    } catch (err) {
      let message = "Could not delete document, please try again later.";
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setDeleteResponse({ status: false, message: message });
    } finally {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLoadingDelete(false);
      setShowDeleteConfirm(false);
      setDeleteResponse(null);

    }
  }

  const status = getLatestIngestionJob(document)?.status || "pending";
  const disabledQA = loadingQA || status !== 'done' || status === 'running' as IngestionStatus;
  const disabledIngest = loadingIngest || status === 'done' || status === 'running';

  if (loadingData) return <p>Loading...</p>

  return (
    <>
      <div className="h-full flex flex-col space-y-5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl">{document?.name}</h1>
            <IngestionStatusBadge status={status}/>
          </div>
          <time className="text-sm">{document ? new Date(document.updatedAt).toLocaleString() : ''}</time>
        </div>
        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-lg">
          <div className="sticky top-0 w-full p-4 flex justify-end items-center space-x-2 bg-white shadow-lg">
            {!disabledIngest && (
              <>
                {ingestResponse && (
                  <span className={clsx("text-sm", {
                    "text-red-500": !ingestResponse.status,
                    "text-green-800": ingestResponse.status,
                  })}>
                  {ingestResponse.message}
                </span>
                )}
                <button type="button"
                        className="text-sm text-blue-800 rounded-lg border-2 border-blue-300 px-4 py-1 cursor-pointer hover:bg-blue-300 transition-colors duration-500"
                        onClick={handleIngest}
                >
                  {loadingIngest ? "Ingesting..." : "Ingest"}
                </button>
              </>
            )}
            <button type="button" className="text-sm text-red-500 rounded-lg px-2 py-1 cursor-pointer"
                    onClick={() => setShowDeleteConfirm(true)}
            >
              <TrashIcon className="h-5 w-5 hover:fill-red-200"/>
            </button>
          </div>
          <pre className="whitespace-pre-wrap p-8">
          {chunks.map((text, i) => (
              <span key={i}>
                {text}
              </span>
            )
          )}
        </pre>
          {/* pagination controls */}
          <div className="sticky bottom-0 mt-4 flex justify-center items-center gap-4 bg-white p-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span>Page {page} of {totalPages}</span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Answer */}
        {qaResponse && (
          <div className="bg-white p-4 rounded-lg shadow-lg overflow-y-auto max-h-1/2">
            {!qaResponse.status && (
              <p className="text-red-500">{qaResponse.error}</p>
            )}
            {qaResponse.status && (
              <>
                <h2 className="font-semibold">Answer</h2>
                <p className="mt-2">{qaResponse.answer}</p>
                {qaResponse.sources && qaResponse.sources.length > 0 && (
                  <div className="flex flex-col space-y-2 items-center justify-center">
                    <h3 className="mt-4 font-semibold">Sources</h3>
                    <ul className="list-disc list-inside mt-2">
                      {qaResponse.sources.map((source, i) => (
                        <li key={i}>
                          <p className="text-sm text-gray-500">{source}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Ask Question Input */}
        <form onSubmit={handleAsk} className="flex">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={disabledQA ? "Ingestion " + status : "Ask a question..."}
            className={clsx(
              "flex-1 p-4 rounded-l-lg bg-white shadow-lg",
              {
                "cursor-not-allowed bg-gray-300!": disabledQA
              }
            )}
            disabled={disabledQA}
            required
          />
          <button
            type="submit"
            disabled={disabledQA}
            className="bg-blue-500 text-white p-4 rounded-r-lg w-[10%]"
          >
            {loadingQA ? "Asking..." : "Ask"}
          </button>
        </form>
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">Delete Document?</h2>
            <p className={clsx(
              "text-sm mb-6",
              {
                "text-gray-700": !deleteResponse,
                "text-green-500": deleteResponse && deleteResponse.status,
                "text-red-500": deleteResponse && !deleteResponse.status,
              }
            )}>
              {deleteResponse ? deleteResponse.message : "Are you sure you want to delete this document? This action cannot be undone."}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                className={clsx(
                  "px-4 py-2 bg-gray-200 rounded hover:bg-gray-300",
                  {
                    "cursor-not-allowed": loadingDelete,
                    "cursor-pointer": !loadingDelete,
                  }
                )}
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loadingDelete}
              >
                Cancel
              </button>
              <button
                className={clsx(
                  "px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600",
                  {
                    "cursor-not-allowed": loadingDelete,
                    "cursor-pointer": !loadingDelete,
                  }
                )}
                onClick={handleDelete}
                disabled={loadingDelete}
              >
                {loadingDelete ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
