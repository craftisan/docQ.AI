// src/components/Navbar.tsx
"use client"
import Link from "next/link"
import { useAuth } from "@/context/auth/AuthContext"

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col py-6 px-4">
      <div className="mb-8">
        <div className="text-lg font-semibold">{user?.name}</div>
        <div className="text-sm">{user?.email}</div>
      </div>
      <nav className="flex-1 *:p-2 *:hover:bg-gray-500 *:cursor-pointer *:rounded-md">
        <Link href="/dashboard" className="block">Dashboard</Link>
        <Link href="/ingestion" className="block">Ingestion Status</Link>
        {user?.role === "admin" && (
          <Link href="/admin/users" className="block">Users</Link>
        )}
      </nav>
      <button onClick={logout} className="mt-auto text-left hover:underline">
        Logout
      </button>
    </aside>
  )
}
