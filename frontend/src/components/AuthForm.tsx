"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register, login } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthForm({ mode }: { mode: "register" | "login" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setToken } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = mode === "login"
        ? await login(email, password)
        : await register(email, password);

      if (data.access_token) {
        setToken(data.access_token);
        router.push("/documents");
      } else {
        alert("Error: " + JSON.stringify(data));
      }
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
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4 mt-10">
      <h2 className="text-xl font-bold">{mode === "login" ? "Login" : "Register"}</h2>
      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        {mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
}
