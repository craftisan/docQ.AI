"use client";

import { useEffect, useState } from "react";
import { listDocuments } from "@/lib/api";
import { Document } from "@/types/Document";

export default function DocumentList({ token }: { token: string }) {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await listDocuments(token);
        setDocs(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [token]);

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-2">Your Documents</h2>
      <ul className="list-disc pl-6">
        {docs.map((doc) => (
          <li key={doc.id}>
            <strong>{doc.name}</strong>: {doc.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
