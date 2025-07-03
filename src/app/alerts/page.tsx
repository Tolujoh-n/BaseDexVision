"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface Alert {
  pairAddress: string;
  tokenName: string;
  tokenSymbol: string;
  targetPrice: number;
  direction: "above" | "below";
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    pairAddress: "",
    targetPrice: "",
    direction: "above",
  });
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load alerts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("bdv_alerts");
    setAlerts(stored ? JSON.parse(stored) : []);
  }, []);

  // Fetch token data for alerts
  useEffect(() => {
    async function fetchTokens() {
      setLoading(true);
      if (alerts.length === 0) {
        setTokens([]);
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(
          alerts.map(async (alert) => {
            const res = await fetch(
              `https://api.dexscreener.com/latest/dex/pairs/base/${alert.pairAddress}`
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
  }, [alerts]);

  // Remove alert
  function removeAlert(
    pairAddress: string,
    targetPrice: number,
    direction: string
  ) {
    const updated = alerts.filter(
      (a) =>
        !(
          a.pairAddress === pairAddress &&
          a.targetPrice === targetPrice &&
          a.direction === direction
        )
    );
    setAlerts(updated);
    localStorage.setItem("bdv_alerts", JSON.stringify(updated));
  }

  // Add alert
  function addAlert(e: any) {
    e.preventDefault();
    if (!form.pairAddress || !form.targetPrice) return;
    // Find token info for name/symbol
    const token = searchResults.find((t) => t.pairAddress === form.pairAddress);
    if (!token) return;
    const newAlert: Alert = {
      pairAddress: form.pairAddress,
      tokenName: token.baseToken?.name || "",
      tokenSymbol: token.baseToken?.symbol || "",
      targetPrice: Number(form.targetPrice),
      direction: form.direction as "above" | "below",
    };
    const updated = [...alerts, newAlert];
    setAlerts(updated);
    localStorage.setItem("bdv_alerts", JSON.stringify(updated));
    setForm({ pairAddress: "", targetPrice: "", direction: "above" });
    setSearch("");
    setSearchResults([]);
  }

  // Search for tokens
  async function handleSearch(e: any) {
    setSearch(e.target.value);
    setSearchLoading(true);
    if (e.target.value.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(e.target.value)}`
      );
      const data = await res.json();
      setSearchResults(
        data.pairs?.filter((p: any) => p.chainId === "base") || []
      );
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-white">Alerts</h1>
      {/* Add Alert Form */}
      <form
        onSubmit={addAlert}
        className="mb-8 bg-gray-900 rounded p-4 flex flex-col md:flex-row gap-4 items-center"
      >
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Search token by name or symbol..."
            className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-full"
            value={search}
            onChange={handleSearch}
            autoComplete="off"
          />
          {search && searchResults.length > 0 && (
            <div className="absolute bg-gray-900 border border-gray-700 rounded mt-1 w-full z-20 max-h-60 overflow-y-auto">
              {searchResults.map((pair) => (
                <div
                  key={pair.pairAddress}
                  className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    setForm({ ...form, pairAddress: pair.pairAddress });
                    setSearch(
                      pair.baseToken?.name + " (" + pair.baseToken?.symbol + ")"
                    );
                    setSearchResults([]);
                  }}
                >
                  {pair.info?.imageUrl && (
                    <img
                      src={pair.info.imageUrl}
                      alt={pair.baseToken?.symbol}
                      className="w-5 h-5 rounded-full border border-gray-700"
                    />
                  )}
                  <span className="text-white font-semibold">
                    {pair.baseToken?.name}
                  </span>
                  <span className="text-gray-400 text-xs">
                    ({pair.baseToken?.symbol})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <input
          type="number"
          step="0.000001"
          min="0"
          placeholder="Target Price (USD)"
          className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-40"
          value={form.targetPrice}
          onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
        />
        <select
          className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-32"
          value={form.direction}
          onChange={(e) => setForm({ ...form, direction: e.target.value })}
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <button
          type="submit"
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={!form.pairAddress || !form.targetPrice}
        >
          <Bell size={16} /> Add Alert
        </button>
      </form>
      {/* Alerts Table */}
      <div className="overflow-x-auto rounded shadow bg-gray-900">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-gray-300 font-semibold">Token</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Symbol</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">
                Current Price
              </th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Alert</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : alerts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  No alerts set.
                </td>
              </tr>
            ) : (
              alerts.map((alert, idx) => {
                const token = tokens.find(
                  (t) => t?.pairAddress === alert.pairAddress
                );
                return (
                  <tr
                    key={
                      alert.pairAddress + alert.targetPrice + alert.direction
                    }
                    className="border-b border-gray-800 hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-3 flex items-center gap-2">
                      {token?.info?.imageUrl && (
                        <img
                          src={token.info.imageUrl}
                          alt={alert.tokenSymbol}
                          className="w-6 h-6 rounded-full border border-gray-700"
                        />
                      )}
                      <span className="text-white font-semibold">
                        {alert.tokenName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {alert.tokenSymbol}
                    </td>
                    <td className="px-4 py-3 text-gray-200">
                      {token ? `$${Number(token.priceUsd).toFixed(6)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-200">
                      {alert.direction === "above" ? "Above" : "Below"} $
                      {alert.targetPrice}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="inline-flex items-center gap-1 text-red-400 hover:underline font-semibold"
                        onClick={() =>
                          removeAlert(
                            alert.pairAddress,
                            alert.targetPrice,
                            alert.direction
                          )
                        }
                      >
                        Remove
                      </button>
                      <Link
                        href={`/token/${alert.pairAddress}`}
                        className="inline-flex items-center gap-1 text-blue-400 hover:underline font-semibold ml-2"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
