"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCoinsMostValuable } from "@zoralabs/coins-sdk";
// Chart.js imports
import { Line } from "react-chartjs-2";
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

  useEffect(() => {
    fetchToken();
  }, [id]);

  const fetchToken = async () => {
    try {
      setLoading(true);
      const response = await getCoinsMostValuable({ count: 50 });
      const coinsData = response.data?.exploreList?.edges?.map(
        (edge) => edge.node
      );
      const found = coinsData?.find((c) => c.id === id);
      setCoin(found || null);
    } catch (error) {
      console.error("Error fetching token:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data (replace with real price data when available)
  const chartData = {
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

  if (loading) return <div className="p-8">Loading token details...</div>;
  if (!coin) return <div className="p-8">Token not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {coin.mediaContent?.previewImage?.medium && (
          <img
            src={coin.mediaContent.previewImage.medium}
            alt={coin.name}
            className="w-32 h-32 rounded mb-4 md:mb-0"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {coin.name}{" "}
            <span className="text-lg text-gray-500">({coin.symbol})</span>
          </h1>
          <p className="text-gray-700 mb-4">{coin.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Market Cap</div>
              <div className="font-semibold">{coin.marketCap}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">24h Volume</div>
              <div className="font-semibold">{coin.volume24h}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Supply</div>
              <div className="font-semibold">{coin.totalSupply}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Volume</div>
              <div className="font-semibold">{coin.totalVolume}</div>
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
              <div className="text-xs text-gray-500">Creator Address</div>
              <div className="font-mono text-xs break-all">
                {coin.creatorAddress}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Chart section */}
      <div className="my-8">
        <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-400">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      {/* Buy/Sell panel placeholder */}
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Buy / Sell</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded">
            Buy
          </button>
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded">
            Sell
          </button>
        </div>
        <p className="text-gray-500 mt-4">Trading functionality coming soon.</p>
      </div>
    </div>
  );
}
