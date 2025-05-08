"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { parseEther } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSignMessage,
} from "wagmi";
import Image from "next/image";

import aaa from "../assets/aaa.jpg";
import bbb from "../assets/bbb.jpg";
import ccc from "../assets/ccc.jpg";
import ddd from "../assets/ddd.jpg";
import eee from "../assets/eee.jpg";
import fff from "../assets/fff.jpg";
import ggg from "../assets/ggg.png";
import hhh from "../assets/hhh.jpg";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import doge from "../assets/iii.jpg";

const dummyMemes = [
  { id: "1", name: "NebulaBit", image: aaa },
  { id: "2", name: "QuantumPaw", image: bbb },
  { id: "3", name: "EchoSphere", image: ccc },
  { id: "4", name: "ZenithChain", image: ddd },
  { id: "5", name: "SolisToken", image: eee },
  { id: "6", name: "AetherSwap", image: fff },
  { id: "7", name: "NimbusByte", image: ggg },
  { id: "8", name: "VertexPay", image: hhh },
];

export default function Page() {
  const router = useRouter();
  const account = useAccount();
  const walletAddress = account.addresses?.[0];
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync, data } = useSendTransaction();
  const { signMessage, data: signData } = useSignMessage();

  const [isFundOpen, setIsFundOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  function truncateAddress(walletAddress: string, chars = 4) {
    return `${walletAddress.slice(0, chars + 2)}...${walletAddress.slice(-chars)}`;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="flex justify-between items-center p-5 border-b border-gray-700">
        <div className="text-xl font-bold">
          <a href="/">Fundit</a>
        </div>
        <div className="flex items-center space-x-4">
          {account.status === "connected" ? (
            <div className="flex items-center space-x-4">
              <p className="text-green-600">
                {truncateAddress(walletAddress || "")}
              </p>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                type="button"
                onClick={() => disconnect()}
              >
                Disconnect
              </button>
            </div>
          ) : (
            connectors
              .filter((connector) => connector.name === "Coinbase Wallet")
              .map((connector) => (
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  type="button"
                >
                  Connect Smart Wallet
                </button>
              ))
          )}
        </div>
      </nav>

      <main className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">View Campaigns</h1>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => setIsFundOpen(true)}
          >
            Create Campaign
          </button>
        </div>
        <p className="mb-8">
          Sub Account Address: {JSON.stringify(account.addresses)}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dummyMemes.map((m) => (
            <div
              key={m.id}
              className="bg-gray-800 rounded p-2 cursor-pointer hover:scale-105 transition"
              onClick={() => router.push(`/memes/${m.id}`)}
            >
              <Image
                src={m.image}
                alt={m.name}
                className="rounded w-full h-48 object-cover"
              />
              <h3 className="mt-2 text-xl md:text-2xl font-bold">{m.name}</h3>
              <p className="text-sm md:text-base text-gray-300">
                Just use a simple local state or save campaign data on-chain.
                Smart Contract: Minimal crowdfunding contract.
              </p>
              <div className="flex gap-2 mt-4 items-center">
                <p className="text-sm">
                  <b>Target:</b> 5 ETH
                </p>
                <button
                  onClick={() => setIsFundOpen(true)}
                  className="flex-1 bg-blue-600 py-2 rounded text-sm font-semibold"
                >
                  Donate
                </button>
              </div>
            </div>
          ))}
        </div>

        {isFundOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 text-white p-6 border border-gray-300 rounded  w-full ml-2 mr-2 max-w-md">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold"
                onClick={() => setIsFundOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="w-full h-60 border border-dashed border-gray-500 flex items-center justify-center rounded mb-4 relative">
                <Image
                  src={aaa}
                  alt="Generated Meme"
                  className="w-full h-full object-cover rounded"
                  width={500}
                  height={300}
                />
              </div>

              <h2 className="text-xl font-bold mb-4">
                Croundfund Project Title
              </h2>

              <p>
                Just use a simple local state or save campaign data on-chain.
                Smart Contract: Minimal crowdfunding contract.
              </p>
              <input
                type="text"
                placeholder="Amount to Donate (in ETH)"
                className="w-full bg-white text-black border px-2 py-1 mb-2 rounded-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <div className="flex justify-between">
                <button className="bg-green-600 text-white px-3 py-1 rounded">
                  Send ETH
                </button>
              </div>

              <p> <b>{data && "Transaction sent successfully! 🎉"}</b>{" "}
              <span>{data}</span></p>

              <div className="flex justify-between">
                <p></p>
                <button
                  className="bg-yellow-600 text-white px-3 py-1 rounded"
                  onClick={() => setIsFundOpen(false)}
                  aria-label="Close"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-gray-500 mt-8 mb-8">
        BUILT ON BASE
        <br></br>
        <br></br>
      </footer>
    </div>
  );
}
