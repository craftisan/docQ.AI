"use client"
import { useRouter } from "next/navigation"
import IngestionStatusBadge from "@/components/ingestion/IngestionStatusBadge";
import React from "react";
import { IngestionStatus } from "@/types/ingestion/IngestionJob";

export default function DocumentCard({
  id,
  name,
  date,
  status,
}: {
  id: string
  name: string
  date: string
  status: IngestionStatus
}) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/documents/${id}/qa`)}
      className="space-y-2 cursor-pointer bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl"
    >
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-gray-500">{new Date(date).toLocaleString()}</p>
      <IngestionStatusBadge status={status}/>
    </div>
  )
}
