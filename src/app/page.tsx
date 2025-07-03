"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function Dashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      const response = await getCoinsMostValuable({ count: 50 });
      const coinsData = response.data?.exploreList?.edges?.map(
        (edge) => edge.node
      );
      setCoins(coinsData || []);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Token Dashboard</h1>
        <input
          type="text"
          placeholder="Search by name or symbol..."
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded shadow bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Market Cap</th>
              <th className="px-4 py-3">24h Volume</th>
              <th className="px-4 py-3">Total Supply</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  Loading tokens...
                </td>
              </tr>
            ) : filteredCoins.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  No tokens found.
                </td>
              </tr>
            ) : (
              filteredCoins.map((coin, idx) => (
                <tr key={coin.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {coin.mediaContent?.previewImage?.medium && (
                      <img
                        src={coin.mediaContent.previewImage.medium}
                        alt={coin.name}
                        className="w-8 h-8 rounded"
                      />
                    )}
                    <span>{coin.name}</span>
                  </td>
                  <td className="px-4 py-3">{coin.symbol}</td>
                  <td className="px-4 py-3">{coin.marketCap}</td>
                  <td className="px-4 py-3">{coin.volume24h}</td>
                  <td className="px-4 py-3">{coin.totalSupply}</td>
                  <td className="px-4 py-3">
                    {coin.createdAt
                      ? new Date(coin.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/token/${coin.id}`}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      View
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
