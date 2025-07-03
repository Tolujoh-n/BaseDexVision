"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Line } from "react-chartjs-2";
import { getCoinsMostValuable } from "@zoralabs/coins-sdk";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Star, Bell, ShoppingCart, ArrowLeftRight } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

export default function TokenDetails() {
  const { id } = useParams();
  const [coin, setCoin] = useState<Coin | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWatched, setIsWatched] = useState(false);

  // Sync watchlist state
  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem("bdv_watchlist");
    const list = stored ? JSON.parse(stored) : [];
    setIsWatched(list.includes(id));
  }, [id]);

  // Add/remove from watchlist
  function toggleWatchlist() {
    const stored = localStorage.getItem("bdv_watchlist");
    let list = stored ? JSON.parse(stored) : [];
    if (isWatched) {
      list = list.filter((pid: string) => pid !== id);
    } else {
      list.push(id);
    }
    localStorage.setItem("bdv_watchlist", JSON.stringify(list));
    setIsWatched(!isWatched);
  }

  useEffect(() => {
    fetchToken();
  }, [id]);

  const fetchToken = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCoinsMostValuable({ count: 100 });
      const coinsData = response.data?.exploreList?.edges?.map(
        (edge: any) => edge.node
      );
      // Find by address (case-insensitive)
      const found = coinsData?.find(
        (c: Coin) => c.address.toLowerCase() === String(id).toLowerCase()
      );
      setCoin(found || null);
    } catch (err) {
      setError("Failed to fetch token data.");
      setCoin(null);
    } finally {
      setLoading(false);
    }
  };

  // Chart data (use price points if available, else placeholder)
  let chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Price (USD)",
        data: [1.2, 1.4, 1.3, 1.5, 1.7, 1.6, 1.8],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.1)",
        tension: 0.4,
      },
    ],
  };
  if (coin?.totalVolume) {
    // If price chart data is available, use it (DEX Screener API may not provide OHLC, so use current price as a flat line)
    chartData = {
      labels: Array(20)
        .fill(0)
        .map((_, i) => `T-${20 - i}`),
      datasets: [
        {
          label: "Price (USD)",
          data: Array(20).fill(Number(coin.totalVolume)),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.1)",
          tension: 0.4,
        },
      ],
    };
  }
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#e5e7eb" } },
    },
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {loading ? (
        <div className="p-8 text-gray-300">Loading token details...</div>
      ) : error ? (
        <div className="p-8 text-red-400">{error}</div>
      ) : !coin ? (
        <div className="p-8 text-gray-300">Token not found.</div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Chart and Transactions */}
          <div className="flex-1 min-w-0">
            {/* Chart */}
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-bold mb-2 text-white">Price Chart</h2>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
            {/* Recent Transactions (if available) */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h2 className="text-lg font-bold mb-2 text-white">
                Recent Transactions
              </h2>
              <div className="text-gray-500">
                Transaction data is not available for this token.
              </div>
            </div>
          </div>
          {/* Right: Token Details and Actions */}
          <div className="w-full md:w-96 flex-shrink-0">
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                {coin.mediaContent?.previewImage?.medium && (
                  <img
                    src={coin.mediaContent.previewImage.medium}
                    alt={coin.name}
                    className="w-14 h-14 rounded-full border border-gray-700"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {coin.name}{" "}
                    <span className="text-lg text-gray-400">
                      ({coin.symbol})
                    </span>
                  </h1>
                  <div className="flex gap-2 mt-2">
                    <button
                      className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${isWatched ? "bg-yellow-600 text-white hover:bg-yellow-700" : "bg-gray-800 text-gray-200 hover:bg-gray-700"}`}
                      onClick={toggleWatchlist}
                    >
                      <Star size={16} />{" "}
                      {isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-gray-200 rounded hover:bg-gray-700 text-sm">
                      <Bell size={16} /> Set Price Alert
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-gray-300 text-sm mb-4">
                <div>
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="font-semibold text-white">
                    ${Number(coin.totalVolume).toFixed(6)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">24h Change</div>
                  <div className="text-white">N/A</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">24h Volume</div>
                  <div className="font-semibold">
                    {Number(coin.volume24h).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Market Cap</div>
                  <div className="font-semibold">
                    {coin.marketCap
                      ? Number(coin.marketCap).toLocaleString()
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Total Supply</div>
                  <div className="font-semibold">{coin.totalSupply}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Created</div>
                  <div className="font-semibold">
                    {coin.createdAt
                      ? new Date(coin.createdAt).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Token Address</div>
                  <div className="font-mono text-xs break-all">
                    {coin.address}
                  </div>
                </div>
              </div>
            </div>
            {/* Buy/Sell panel */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Buy / Sell</h2>
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded justify-center">
                  <ShoppingCart size={18} /> Buy
                </button>
                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded justify-center">
                  <ArrowLeftRight size={18} /> Sell
                </button>
              </div>
              <p className="text-gray-500 mt-4 text-sm">
                Trading functionality coming soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
