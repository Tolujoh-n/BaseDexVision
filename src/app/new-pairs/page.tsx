"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusSquare } from "lucide-react";

export default function NewPairs() {
  const [pairs, setPairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPairs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://api.dexscreener.com/latest/dex/pairs/base"
        );
        const data = await res.json();
        // Sort by pairCreatedAt descending (newest first)
        const sorted = (data.pairs || []).sort(
          (a: any, b: any) => (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0)
        );
        setPairs(sorted);
      } catch (err) {
        setError("Failed to fetch new pairs.");
      } finally {
        setLoading(false);
      }
    }
    fetchPairs();
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-white">New Pairs</h1>
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
              <th className="px-4 py-3 text-gray-300 font-semibold">
                Created At
              </th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-red-400">
                  {error}
                </td>
              </tr>
            ) : pairs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No new pairs found.
                </td>
              </tr>
            ) : (
              pairs.map((pair, idx) => (
                <tr
                  key={pair.pairAddress}
                  className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition"
                  onClick={() =>
                    (window.location.href = `/token/${pair.pairAddress}`)
                  }
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
                  <td className="px-4 py-3 text-gray-200">
                    {pair.pairCreatedAt
                      ? new Date(pair.pairCreatedAt).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/token/${pair.pairAddress}`}
                      className="inline-flex items-center gap-1 text-blue-400 hover:underline font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PlusSquare size={16} className="inline-block" /> View
                    </Link>
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
