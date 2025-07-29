"use client";

import React, { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/lib/api";
import clsx from "clsx";

export default function UploadButton() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async(e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await uploadDocument(file);
      router.push(`/documents/${data.id}/qa`);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      // reset uploading and clear the input so user can re-select
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const showInput = uploading || Boolean(error);

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={clsx(
          "bg-blue-600 text-white px-4 py-2 shadow hover:bg-blue-700 disabled:opacity-50",
          {
            "rounded-lg": !showInput,
            "rounded-l-lg": showInput,
          }
        )}
      >
        {uploading ? "Uploading..." : "Upload New Document"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={onFileChange}
        className={clsx(
          "px-4 py-2 bg-white shadow",
          {
            "hidden": !showInput,
            "rounded-r-lg": showInput,
          }
        )}
      />

      {error && <p className="text-red-500 ml-4">{error}</p>}
    </div>
  );
}
