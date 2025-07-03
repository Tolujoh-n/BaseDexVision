"use client";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Star,
  Bell,
  PlusSquare,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:top-0 md:left-0 md:h-screen md:w-64 md:bg-gray-900 md:border-r md:border-gray-800 md:flex md:flex-col md:z-30 md:shadow-lg">
        <div className="h-20 flex items-center px-6 text-2xl font-bold border-b border-gray-800">
          <span className="text-white">BaseDexVision</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <SidebarLinks />
        </nav>
      </aside>
      {/* Mobile Nav Toggle & Sidebar */}
      <div className="md:hidden flex items-center justify-between px-4 h-16 bg-gray-950 border-b border-gray-800 sticky top-0 z-40">
        <button
          className="text-gray-300 hover:text-white focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="text-white text-xl font-bold">BaseDexVision</span>
        <div />
      </div>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 h-full bg-gray-900 border-r border-gray-800 flex flex-col shadow-xl z-50 animate-slideInLeft">
            <div className="h-20 flex items-center justify-between px-6 text-2xl font-bold border-b border-gray-800">
              <span className="text-white">BaseDexVision</span>
              <button
                className="text-gray-300 hover:text-white focus:outline-none"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6L6 18M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="flex-1 py-6 px-4 space-y-2">
              <SidebarLinks onClick={() => setSidebarOpen(false)} />
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarLinks({ onClick }: { onClick?: () => void }) {
  const linkClass =
    "flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-800 transition text-white font-medium";
  return (
    <>
      <Link href="/" className={linkClass} onClick={onClick}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </Link>
      <Link href="/watchlist" className={linkClass} onClick={onClick}>
        <Star size={20} />
        <span>Watchlist</span>
      </Link>
      <Link href="/alerts" className={linkClass} onClick={onClick}>
        <Bell size={20} />
        <span>Alerts</span>
      </Link>
      <Link href="/new-pairs" className={linkClass} onClick={onClick}>
        <PlusSquare size={20} />
        <span>New Pairs</span>
      </Link>
      <Link href="/gainers-losers" className={linkClass} onClick={onClick}>
        <TrendingUp size={20} />
        <span>Gainers & Losers</span>
      </Link>
      <Link href="/portfolio" className={linkClass} onClick={onClick}>
        <Wallet size={20} />
        <span>Portfolio</span>
      </Link>
    </>
  );
}

// Add slide-in animation for mobile sidebar
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } } .animate-slideInLeft { animation: slideInLeft 0.25s cubic-bezier(0.4,0,0.2,1) both; }`;
  document.head.appendChild(style);
}
