"use client"
import { useRouter } from "next/navigation"

export default function DocumentCard({
  id,
  name,
  date,
  status,
}: {
  id: string
  name: string
  date: string
  status: string
}) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/documents/${id}/qa`)}
      className="cursor-pointer bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl"
    >
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-gray-500">{new Date(date).toLocaleString()}</p>
      <p className="mt-2 text-sm">Status: {status}</p>
    </div>
  )
}
