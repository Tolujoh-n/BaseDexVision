import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { type ReactNode } from "react";
import { cookieToInitialState } from "wagmi";
import Link from "next/link";

import { getConfig } from "../wagmi";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fundit",
  description: "Onchain crowdfunding platform built on Base",
};

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get("cookie")
  );
  return (
    <html lang="en">
      <body className={inter.className + " bg-gray-100 min-h-screen"}>
        <Providers initialState={initialState}>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col border-r border-gray-800">
              <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-gray-800">
                BaseDexVision
              </div>
              <nav className="flex-1 py-6 px-4 space-y-2">
                <Link
                  href="/"
                  className="block py-2 px-4 rounded hover:bg-gray-800 transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/watchlist"
                  className="block py-2 px-4 rounded hover:bg-gray-800 transition"
                >
                  Watchlist
                </Link>
                <Link
                  href="/alerts"
                  className="block py-2 px-4 rounded hover:bg-gray-800 transition"
                >
                  Alerts
                </Link>
                <Link
                  href="/new-pairs"
                  className="block py-2 px-4 rounded hover:bg-gray-800 transition"
                >
                  New Pairs
                </Link>
                <Link
                  href="/gainers-losers"
                  className="block py-2 px-4 rounded hover:bg-gray-800 transition"
                >
                  Gainers & Losers
                </Link>
                <Link
                  href="/portfolio"
                  className="block py-2 px-4 rounded hover:bg-gray-800 transition"
                >
                  Portfolio
                </Link>
              </nav>
            </aside>
            {/* Mobile sidebar toggle (optional, can add later) */}
            {/* Main content */}
            <main className="flex-1 min-w-0 bg-white md:bg-gray-100 p-0 md:p-8">
              {props.children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
