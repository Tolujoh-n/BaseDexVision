import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { type ReactNode } from "react";
import { cookieToInitialState } from "wagmi";
import Link from "next/link";
import {
  LayoutDashboard,
  Star,
  Bell,
  PlusSquare,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getConfig } from "../wagmi";
import { Providers } from "./providers";
import dynamic from "next/dynamic";
const TopNavbar = dynamic(() => import("./top-navbar"), { ssr: false });
import Sidebar from "./sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BaseDexVision",
  description: "Professional DEX Screener on Base chain.",
};

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get("cookie")
  );
  return (
    <html lang="en">
      <body
        className={inter.className + " bg-gray-950 min-h-screen text-white"}
      >
        <Providers initialState={initialState}>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 min-w-0 flex flex-col md:ml-64">
              <TopNavbar />
              <main className="flex-1 p-0 md:p-8 bg-gray-950 overflow-y-auto">
                {props.children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
