"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, Plus, ArrowRightLeft, ShoppingCart, Send } from "lucide-react";
import { useAccount, useWriteContract, useSwitchChain } from "wagmi";
import { getCoinsMostValuable } from "@zoralabs/coins-sdk";

const COVALENT_API_KEY = "ckey_demo"; // Replace with your Covalent API key for production
const BASE_SEPOLIA_CHAIN_ID = 84532;

// Minimal ERC20 bytecode and ABI for testnet deployment (OpenZeppelin standard)
// For production, use a verified contract and bytecode!
const ERC20_ABI = [
  "constructor(string name, string symbol, uint256 initialSupply)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
];
// This is a placeholder. You must replace with your own deployed ERC20 bytecode for real deployments.
const ERC20_BYTECODE = "0x..."; // <-- Replace with real bytecode for actual deployment

const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap v3 router on Base Sepolia

export default function Portfolio() {
  const account = useAccount();
  const walletAddress = account.addresses?.[0];
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState({
    token: "",
    to: "",
    amount: "",
  });
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    symbol: "",
    supply: "",
  });
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const { writeContractAsync, data: writeData } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const [showSwap, setShowSwap] = useState(false);
  const [swapForm, setSwapForm] = useState({
    tokenIn: "",
    tokenOut: "",
    amount: "",
  });
  const [swapStatus, setSwapStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPortfolio() {
      setLoading(true);
      setError(null);
      try {
        // Fetch tokens from Zora (like dashboard)
        const response = await getCoinsMostValuable({ count: 100 });
        const coinsData = response.data?.exploreList?.edges?.map(
          (edge: any) => edge.node
        );
        setTokens(coinsData || []);
      } catch (err) {
        setError("Failed to fetch portfolio.");
        setTokens([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  async function handleTransfer(e: any) {
    e.preventDefault();
    setTransferStatus(null);
    try {
      // Switch to Base Sepolia if needed
      await switchChainAsync({ chainId: BASE_SEPOLIA_CHAIN_ID });
      const token = tokens.find(
        (t) => t.contract_address === transferForm.token
      );
      if (!token) throw new Error("Token not found");
      const decimals = token.contract_decimals;
      const amount = BigInt(
        Math.floor(Number(transferForm.amount) * 10 ** decimals)
      );
      await writeContractAsync({
        address: token.contract_address,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [transferForm.to, amount],
        chainId: BASE_SEPOLIA_CHAIN_ID,
      });
      setTransferStatus("Transfer successful!");
    } catch (err: any) {
      setTransferStatus("Transfer failed: " + (err?.message || err));
    }
  }

  // ERC20 create logic
  async function handleCreate(e: any) {
    e.preventDefault();
    setCreateStatus(null);
    try {
      if (!ERC20_BYTECODE || ERC20_BYTECODE === "0x...") {
        setCreateStatus(
          "ERC20 bytecode not set. Please provide a valid bytecode for deployment."
        );
        return;
      }
      await switchChainAsync({ chainId: BASE_SEPOLIA_CHAIN_ID });
      const initialSupply = BigInt(createForm.supply) * 10n ** 18n; // 18 decimals
      const tx = await writeContractAsync({
        abi: ERC20_ABI,
        bytecode: ERC20_BYTECODE,
        functionName: "constructor",
        args: [createForm.name, createForm.symbol, initialSupply],
        chainId: BASE_SEPOLIA_CHAIN_ID,
      });
      setCreateStatus("Token creation transaction sent! Tx hash: " + tx);
    } catch (err: any) {
      setCreateStatus("Token creation failed: " + (err?.message || err));
    }
  }

  // Real swap logic (Uniswap v3 exactInputSingle)
  async function handleSwap(e: any) {
    e.preventDefault();
    setSwapStatus(null);
    try {
      await switchChainAsync({ chainId: BASE_SEPOLIA_CHAIN_ID });
      const tokenIn = tokens.find(
        (t) => t.contract_address === swapForm.tokenIn
      );
      const tokenOut = tokens.find(
        (t) => t.contract_address === swapForm.tokenOut
      );
      if (!tokenIn || !tokenOut) throw new Error("Token not found");
      const amountIn = BigInt(
        Math.floor(Number(swapForm.amount) * 10 ** tokenIn.contract_decimals)
      );
      // Uniswap v3 exactInputSingle params
      const abi = [
        "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint160)) external payable returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
      ];
      // Approve router to spend tokenIn
      await writeContractAsync({
        address: tokenIn.contract_address,
        abi,
        functionName: "approve",
        args: [UNISWAP_V3_ROUTER, amountIn],
        chainId: BASE_SEPOLIA_CHAIN_ID,
      });
      // Call exactInputSingle
      const params = [
        {
          tokenIn: tokenIn.contract_address,
          tokenOut: tokenOut.contract_address,
          fee: 3000, // 0.3%
          recipient: walletAddress,
          deadline: Math.floor(Date.now() / 1000) + 60 * 10,
          amountIn,
          amountOutMinimum: 0,
          sqrtPriceLimitX96: 0,
        },
      ];
      await writeContractAsync({
        address: UNISWAP_V3_ROUTER,
        abi,
        functionName: "exactInputSingle",
        args: params,
        chainId: BASE_SEPOLIA_CHAIN_ID,
      });
      setSwapStatus("Swap successful!");
    } catch (err: any) {
      setSwapStatus("Swap failed: " + (err?.message || err));
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Wallet size={24} /> Portfolio
      </h1>
      {!walletAddress ? (
        <div className="bg-gray-900 rounded p-8 text-center text-gray-300">
          Connect your wallet to view your real portfolio on Base Sepolia.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowCreate(true)}
            >
              <Plus size={18} /> Create Token
            </button>
            <button
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowTransfer(true)}
            >
              <Send size={18} /> Transfer
            </button>
            <button
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowSwap(true)}
            >
              <ArrowRightLeft size={18} /> Swap
            </button>
          </div>
          <div className="overflow-x-auto rounded shadow bg-gray-900 mb-8">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-gray-300 font-semibold">#</th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">
                    Token
                  </th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-red-400">
                      {error}
                    </td>
                  </tr>
                ) : tokens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      No tokens in your wallet on Base Sepolia.
                    </td>
                  </tr>
                ) : (
                  tokens.map((token, idx) => (
                    <tr
                      key={token.contract_address}
                      className="border-b border-gray-800 hover:bg-gray-800 transition"
                    >
                      <td className="px-4 py-3 font-medium text-gray-200">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <span className="text-white font-semibold">
                          {token.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {token.symbol}
                      </td>
                      <td className="px-4 py-3 text-gray-200">
                        {token.balance ? token.balance.toFixed(4) : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="text-yellow-400 hover:underline font-semibold"
                          onClick={() => {
                            setShowTransfer(true);
                            setTransferForm({
                              ...transferForm,
                              token: token.contract_address,
                            });
                          }}
                        >
                          Transfer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Create Token Modal */}
          {showCreate && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-white">
                  Create Token (Base Sepolia)
                </h2>
                <form onSubmit={handleCreate}>
                  <input
                    type="text"
                    placeholder="Token Name"
                    className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-full mb-3"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Symbol"
                    className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-full mb-3"
                    value={createForm.symbol}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, symbol: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Initial Supply"
                    className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-full mb-3"
                    value={createForm.supply}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, supply: e.target.value })
                    }
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-2"
                    disabled={
                      !createForm.name ||
                      !createForm.symbol ||
                      !createForm.supply
                    }
                  >
                    Create
                  </button>
                  <button
                    className="w-full py-2 mt-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      setShowCreate(false);
                      setCreateForm({ name: "", symbol: "", supply: "" });
                      setCreateStatus(null);
                    }}
                  >
                    Cancel
                  </button>
                  {createStatus && (
                    <div className="mt-4 text-center text-sm text-white">
                      {createStatus}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
          {/* Transfer Modal */}
          {showTransfer && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-white">
                  Transfer Token (Base Sepolia)
                </h2>
                <form onSubmit={handleTransfer}>
                  <select
                    className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-full mb-3"
                    value={transferForm.token}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        token: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Token</option>
                    {tokens.map((t) => (
                      <option
                        key={t.contract_address}
                        value={t.contract_address}
                      >
                        {t.name} ({t.symbol})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Recipient Address"
                    className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-full mb-3"
                    value={transferForm.to}
                    onChange={(e) =>
                      setTransferForm({ ...transferForm, to: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Amount"
                    className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-full mb-3"
                    value={transferForm.amount}
                    onChange={(e) =>
                      setTransferForm({
                        ...transferForm,
                        amount: e.target.value,
                      })
                    }
                  />
                  <button
                    type="submit"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded w-full mb-2"
                    disabled={
                      !transferForm.token ||
                      !transferForm.to ||
                      !transferForm.amount
                    }
                  >
                    Transfer
                  </button>
                  <button
                    className="w-full py-2 mt-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      setShowTransfer(false);
                      setTransferForm({ token: "", to: "", amount: "" });
                      setTransferStatus(null);
                    }}
                  >
                    Cancel
                  </button>
                  {transferStatus && (
                    <div className="mt-4 text-center text-sm text-white">
                      {transferStatus}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
          {/* Swap Modal */}
          {showSwap && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4 text-white">
                  Swap Tokens (Base Sepolia)
                </h2>
                <form onSubmit={handleSwap}>
                  <select
                    className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-full mb-3"
                    value={swapForm.tokenIn}
                    onChange={(e) =>
                      setSwapForm({ ...swapForm, tokenIn: e.target.value })
                    }
                  >
                    <option value="">Select Token In</option>
                    {tokens.map((t) => (
                      <option
                        key={t.contract_address}
                        value={t.contract_address}
                      >
                        {t.name} ({t.symbol})
                      </option>
                    ))}
                  </select>
                  <select
                    className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-full mb-3"
                    value={swapForm.tokenOut}
                    onChange={(e) =>
                      setSwapForm({ ...swapForm, tokenOut: e.target.value })
                    }
                  >
                    <option value="">Select Token Out</option>
                    {tokens.map((t) => (
                      <option
                        key={t.contract_address}
                        value={t.contract_address}
                      >
                        {t.name} ({t.symbol})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Amount"
                    className="border border-gray-700 bg-gray-800 text-white rounded px-4 py-2 w-full mb-3"
                    value={swapForm.amount}
                    onChange={(e) =>
                      setSwapForm({ ...swapForm, amount: e.target.value })
                    }
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full mb-2"
                    disabled={
                      !swapForm.tokenIn ||
                      !swapForm.tokenOut ||
                      !swapForm.amount
                    }
                  >
                    Swap
                  </button>
                  <button
                    className="w-full py-2 mt-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      setShowSwap(false);
                      setSwapForm({ tokenIn: "", tokenOut: "", amount: "" });
                      setSwapStatus(null);
                    }}
                  >
                    Cancel
                  </button>
                  {swapStatus && (
                    <div className="mt-4 text-center text-sm text-white">
                      {swapStatus}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
