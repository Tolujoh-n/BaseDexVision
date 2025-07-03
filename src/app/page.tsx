"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { getCoinsMostValuable } from "@zoralabs/coins-sdk";

interface Coin {
  id: string;
  name: string;
  description: string;
  address: string;
  symbol: string;
  totalSupply: string;
  totalVolume: string;
  volume24h: string;
  createdAt?: string;
  creatorAddress?: string;
  marketCap: string;
  mediaContent?: {
    previewImage?: {
      medium: string;
    };
  };
}

const PAGE_SIZE = 20;

export default function Dashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCoinsMostValuable({ count: 100 });
      const coinsData = response.data?.exploreList?.edges?.map(
        (edge: any) => edge.node
      );
      setCoins(coinsData || []);
    } catch (err) {
      setError("Failed to fetch token data.");
      setCoins([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCoins.length / PAGE_SIZE);
  const paginatedCoins = filteredCoins.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">Token Dashboard</h1>
        <input
          type="text"
          placeholder="Search by name or symbol..."
          className="border border-gray-700 bg-gray-900 text-white rounded px-4 py-2 w-full md:w-64"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <div className="overflow-x-auto rounded shadow bg-gray-900">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-gray-300 font-semibold">#</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Token</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Symbol</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">
                Market Cap
              </th>
              <th className="px-4 py-3 text-gray-300 font-semibold">
                24h Volume
              </th>
              <th className="px-4 py-3 text-gray-300 font-semibold">
                Total Supply
              </th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Created</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  Loading tokens...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-red-400">
                  {error}
                </td>
              </tr>
            ) : paginatedCoins.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  No tokens found.
                </td>
              </tr>
            ) : (
              paginatedCoins.map((coin, idx) => (
                <tr
                  key={coin.address}
                  className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition"
                  onClick={() =>
                    (window.location.href = `/token/${coin.address}`)
                  }
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2 text-white">
                    {coin.mediaContent?.previewImage?.medium && (
                      <img
                        src={coin.mediaContent.previewImage.medium}
                        alt={coin.name}
                        className="w-8 h-8 rounded"
                      />
                    )}
                    <span className="font-semibold text-white">
                      {coin.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{coin.symbol}</td>
                  <td className="px-4 py-3 text-white">{coin.marketCap}</td>
                  <td className="px-4 py-3 text-white">{coin.volume24h}</td>
                  <td className="px-4 py-3 text-white">{coin.totalSupply}</td>
                  <td className="px-4 py-3 text-white">
                    {coin.createdAt
                      ? new Date(coin.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-white">
                    <Link
                      href={`/token/${coin.address}`}
                      className="text-blue-600 hover:underline font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Star size={16} className="inline-block" /> View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
