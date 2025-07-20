"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/lib/api";

export default function UploadForm({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const router = useRouter();

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    try {
      await uploadDocument(name, content, token);
      setName("");
      setContent("");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
        alert("Error: " + err.message);
      } else {
        console.error(err);
        alert("An unexpected error occurred");
      }
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4 mt-6">
      <h2 className="text-lg font-bold">Upload Document</h2>
      <input
        type="text"
        placeholder="Document Name"
        className="border p-2 w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Document Content"
        className="border p-2 w-full"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Upload
      </button>
    </form>
  );
}
