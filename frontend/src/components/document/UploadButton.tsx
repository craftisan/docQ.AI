"use client"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth/AuthContext"
import { uploadDocument } from "@/lib/api"

export default function UploadButton() {
  const { token } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async () => {
    const file = inputRef.current?.files?.[0]
    if (file && token) {
      setUploading(true)
      const content = await file.text()
      const data = await uploadDocument(file.name, content, token)
      setUploading(false)
      router.push(`/documents/${data.id}/qa`)
    }
  }

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
      >
        {uploading ? "Uploading..." : "Upload New Document"}
      </button>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )
}
