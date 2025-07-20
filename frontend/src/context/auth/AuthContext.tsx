"use client";

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/auth/User";

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

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken) {
      setTokenState(storedToken);
    }
    if (storedUser) {
      try {
        setUserState(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const setToken = (value: string | null) => {
    if (value) {
      localStorage.setItem("token", value);
      setTokenState(value);
    } else {
      localStorage.removeItem("token");
      setTokenState(null);
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


  const logout = () => {
    setToken(null);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
