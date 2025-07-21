// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/AuthContext";
import { listDocuments } from "@/lib/api";
import DocumentCard from "@/components/document/DocumentCard";
import UploadButton from "@/components/document/UploadButton";
import { Doc, getLatestIngestionJob } from "@/types/document/Doc";

export default function DashboardPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!token) return router.push("/");
      Promise.all([listDocuments(token)])
        .then(([docsRes]) => {
          setDocs(docsRes);
        })
        .finally(() => setLoadingData(false));
    }
  }, [loading, token, router]);

  if (loadingData) return <p>Loading...</p>;

  const recent = docs
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((doc) => ({
      ...doc,
      status: getLatestIngestionJob(doc)?.status || "pending"
    }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {recent.map((d) => (
          <DocumentCard
            key={d.id}
            id={d.id.toString()}
            name={d.name}
            date={d.updatedAt}
            status={d.status}
          />
        ))}
      </div>
      <UploadButton/>
    </div>
  );
}
