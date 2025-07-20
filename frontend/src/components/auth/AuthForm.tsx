"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/AuthContext";
import { login as apiLogin, register as apiRegister } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthFormData, authFormSchema, } from "@/lib/validation";


export default function AuthForm({ mode }: { mode: "register" | "login" }) {
  const isRegister = mode === "register";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { mode },
  });

  const { setToken, setUser } = useAuth();
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async(data: AuthFormData) => {
    setApiError(null);
    try {
      const res = isRegister
        ? await apiRegister(data.name!, data.email, data.password)
        : await apiLogin(data.email, data.password);

      if (!res.access_token) {
        throw new Error("Authentication failed");
      }
      setToken(res.access_token);
      setUser(res.user);
      router.push("/dashboard");
    } catch (err: unknown) {
      let message = "Authentication failed";
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        message = axiosErr.response?.data?.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setApiError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md space-y-4"
    >
      {/*<input type="hidden" defaultValue={mode} {...register("mode")} />*/}

      {isRegister && (
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            {...register("name")}
            className="w-full border px-4 py-2 rounded"
            placeholder="Full Name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>
      )}
      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          {...register("email")}
          className="w-full border px-4 py-2 rounded"
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className="w-full border px-4 py-2 rounded"
            placeholder="Password"
          />
          {isRegister && (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-3 flex items-center"
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      {apiError && <p className="text-red-600 text-sm">{apiError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        {isSubmitting
          ? "Please wait..."
          : isRegister
            ? "Register"
            : "Login"}
      </button>
    </form>
  );
}
