"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UploadForm from "@/components/UploadForm";
import DocumentList from "@/components/DocumentList";
import { useAuth } from "@/context/AuthContext";

export default function DocumentsPage() {
  const { token, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg">Redirecting to login...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Document Management</h1>
        <button onClick={logout} className="text-red-500 underline">
          Logout
        </button>
      </div>
      <UploadForm token={token} />
      <DocumentList token={token} />
    </div>
  );
}
