"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { login as apiLogin, register as apiRegister } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthFormData, authSchema } from "@/lib/validation";

export default function AuthForm({mode}: { mode: "register" | "login" }) {
  const router = useRouter();
  const {setToken} = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting},
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  async function onSubmit(data: AuthFormData) {
    setApiError(null);
    try {
      const res = mode === "login"
        ? await apiLogin(data.email, data.password)
        : await apiRegister(data.email, data.password);

      if(res.access_token) {
        setToken(res.access_token);
        router.push("/documents");
      } else {
        setApiError("Unexpected response: " + JSON.stringify(res));
      }
    } catch(err) {
      console.error(err);
      setApiError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-sm mx-auto space-y-4 mt-10 border p-4 rounded shadow"
    >
      <h2 className="text-xl font-bold">
        {mode === "login" ? "Login" : "Register"}
      </h2>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full rounded"
        {...register("email")}
      />
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )}

      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full rounded"
        {...register("password")}
      />
      {errors.password && (
        <p className="text-red-500 text-sm">{errors.password.message}</p>
      )}

      {apiError && <p className="text-red-600">{apiError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
}
