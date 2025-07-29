"use client";

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth/User";
import { client, getUser, setAuthTokenAPIHeader } from "@/lib/api";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {
  },
  user: null,
  setUser: () => {
  },
  logout: () => {
  },
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();


  const setToken = (value: string | null) => {
    if (value) {
      localStorage.setItem("token", value);
      setTokenState(value);
      setAuthTokenAPIHeader(value);
    } else {
      localStorage.removeItem("token");
      setTokenState(null);
      setAuthTokenAPIHeader(null);
    }
  };

  const setUser = (userData: User | null) => {
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUserState(userData);
    } else {
      localStorage.removeItem("user");
      setUserState(null);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    router.push("/");
  }, [router]);

  useEffect(() => {
    // 1. Register global 401 interceptor for API client
    const interceptor = client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    // 2. Bootstrap - Check if token and user exist in localstorage
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    // If not, logout and redirect
    if (!storedToken || !storedUser) {
      setLoading(false);
      logout();
      return () => client.interceptors.response.eject(interceptor);
    }

    // 3. Parse the user JSON
    let parsedUser: User;
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (e) {
      // If invalid JSON in localStorage, clear and force logout
      console.error("Failed to parse stored user:", e);
      setLoading(false);
      logout();
      return () => void client.interceptors.response.eject(interceptor);
    }

    // 4. JWT expiry check
    try {
      const { exp } = jwtDecode<JwtPayload>(storedToken);
      if (!exp || Date.now() / 1000 > exp) {
        throw new Error("Token expired");
      }
    } catch {
      setLoading(false);
      logout();
      return () => client.interceptors.response.eject(interceptor);
    }

    // 5. All good: hydrate state + header, then verify with API
    setToken(storedToken);
    setUser(parsedUser);

    // 6. Check 401 with user API
    getUser(parsedUser.id)
      .then((res) => setUser(res))
      .catch(() => logout())
      .finally(() => setLoading(false));

    // Cleanup interceptors on unmount
    return () => {
      client.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
