"use client";

import React from "react";
import "./globals.css";
import { useSelectedLayoutSegments } from "next/navigation";
import { AuthProvider } from "@/context/auth/AuthContext";
import Navbar from "@/components/nav/Navbar";
import clsx from "clsx";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {

  const isAuthPage = useSelectedLayoutSegments().length === 0;

  return (
    <html lang="en">
      <body suppressHydrationWarning className={clsx(
        geistSans.variable, geistMono.variable, "antialiased h-screen w-screen",
        {
          "bg-white": isAuthPage,
          "bg-gray-50": !isAuthPage,
        })}>
        <AuthProvider>
          <div className="flex h-full w-full">
            {!isAuthPage && <Navbar/>}
            <main className={clsx(
              {
                "flex-1 overflow-auto bg-gray-100 p-6": !isAuthPage,
                "w-full": isAuthPage
              }
            )}>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
