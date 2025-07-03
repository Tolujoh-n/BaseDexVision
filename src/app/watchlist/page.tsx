"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load watchlist from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("bdv_watchlist");
    setWatchlist(stored ? JSON.parse(stored) : []);
  }, []);

  // Fetch token data for watchlist
  useEffect(() => {
    async function fetchTokens() {
      setLoading(true);
      if (watchlist.length === 0) {
        setTokens([]);
        setLoading(false);
        return;
      }
      try {
        // Fetch each pair by address
        const results = await Promise.all(
          watchlist.map(async (pairAddress) => {
            const res = await fetch(
              `https://api.dexscreener.com/latest/dex/pairs/base/${pairAddress}`
            );
            const data = await res.json();
            return data.pairs?.[0] || null;
          })
        );
        setTokens(results.filter(Boolean));
      } catch (err) {
        setTokens([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTokens();
  }, [watchlist]);

  // Remove from watchlist
  function removeFromWatchlist(pairAddress: string) {
    const updated = watchlist.filter((id) => id !== pairAddress);
    setWatchlist(updated);
    localStorage.setItem("bdv_watchlist", JSON.stringify(updated));
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-white">Watchlist</h1>
      <div className="overflow-x-auto rounded shadow bg-gray-900">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-gray-300 font-semibold">#</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Token</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Symbol</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Price</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">
                24h Change
              </th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : tokens.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  No tokens in your watchlist.
                </td>
              </tr>
            ) : (
              tokens.map((pair, idx) => (
                <tr
                  key={pair.pairAddress}
                  className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-200">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {pair.info?.imageUrl && (
                      <img
                        src={pair.info.imageUrl}
                        alt={pair.baseToken?.symbol}
                        className="w-7 h-7 rounded-full border border-gray-700"
                      />
                    )}
                    <span className="text-white font-semibold">
                      {pair.baseToken?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {pair.baseToken?.symbol}
                  </td>
                  <td className="px-4 py-3 text-gray-200">
                    ${Number(pair.priceUsd).toFixed(6)}
                  </td>
                  <td
                    className={
                      "px-4 py-3 font-semibold " +
                      (Number(pair.priceChange?.h24) > 0
                        ? "text-green-400"
                        : Number(pair.priceChange?.h24) < 0
                          ? "text-red-400"
                          : "text-gray-200")
                    }
                  >
                    {Number(pair.priceChange?.h24) > 0 ? "+" : ""}
                    {pair.priceChange?.h24}%
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link
                      href={`/token/${pair.pairAddress}`}
                      className="inline-flex items-center gap-1 text-blue-400 hover:underline font-semibold"
                    >
                      <Star size={16} className="inline-block" /> View
                    </Link>
                    <button
                      className="inline-flex items-center gap-1 text-red-400 hover:underline font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(pair.pairAddress);
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
