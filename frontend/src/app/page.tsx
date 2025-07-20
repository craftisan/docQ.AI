"use client";

import { useState } from "react";
import Image from "next/image";
import AuthForm from "@/components/auth/AuthForm";

export default function HomePage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const isRegister = mode === "register";

  return (
    <div className="flex h-full w-full">
      {/* Left side */}
      <div className="w-1/2 bg-blue-600 flex flex-col items-center justify-center text-white p-8">
        <Image src="/file.svg" alt="App Logo" width={80} height={80} priority/>
        <h1 className="text-4xl font-bold mt-4">RAG App</h1>
      </div>

      {/* Right side */}
      <div className="w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6">
            {isRegister ? "Register" : "Login"}
          </h2>

          <AuthForm mode={mode}/>

          <button
            onClick={() => setMode(isRegister ? "login" : "register")}
            className="mt-4 text-blue-600 hover:underline"
          >
            {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
