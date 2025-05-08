"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

import { parseEther } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSignMessage,
} from "wagmi";
import Image from "next/image";
import type { StaticImageData } from "next/image";

type Campaign = {
  id: string;
  name: string;
  description: string;
  target: string;
  image: StaticImageData;
};

import aaa from "../assets/caaa.webp";
import bbb from "../assets/cbbb.webp";
import ccc from "../assets/cddd.jpg";
import ddd from "../assets/cccc.webp";
import eee from "../assets/ceee.webp";
import fff from "../assets/cfff.jpg";
import ggg from "../assets/cggg.webp";
import hhh from "../assets/chhh.webp";

const dummyMemes: Campaign[] = [
  {
    id: "1",
    name: "REAL Change for Climate and Nature",
    description:
      "Things CAN get better. Will you help us call for the REAL change we need for climate, nature.",
    target: "6 ETH",
    image: aaa,
  },
  {
    id: "2",
    name: "Just a little something",
    description:
      "I'm raising money to help give my daughter a treat after a stressful time going up against the FA",
    target: "5 ETH",
    image: bbb,
  },
  {
    id: "3",
    name: "Y Bont needs your help",
    description:
      "Y Bont is the only specialist Day Nursery facility for children under 5yrs with Disabilities.",
    target: "4 ETH",
    image: ccc,
  },
  {
    id: "4",
    name: "Audrey support fund",
    description:
      "We’re raising money to support Audrey during and after imprisonment",
    target: "7 ETH",
    image: ddd,
  },
  {
    id: "5",
    name: "The Rape Gang Inquiry",
    description:
      "What happened, how did it happen, why was it allowed to happen?",
    target: "3.5 ETH",
    image: eee,
  },
  {
    id: "6",
    name: "Keep on Growing",
    description:
      "Our aim is to grow food and community in planet positive ways. We desperately need an injection etc",
    target: "2 ETH",
    image: fff,
  },
  {
    id: "7",
    name: "The White Mannie Memorial Repairs",
    description:
      "The beloved Mannie Statue, a symbol of our coastal community’s resilience, now needs urgent",
    target: "10 ETH",
    image: ggg,
  },
  {
    id: "8",
    name: "Wishaw Cameras",
    description: "Raise £1,250 to fund 6 cameras and accessories for Wishaw.",
    target: "12 ETH",
    image: hhh,
  },
];

export default function Page() {
  const router = useRouter();
  const account = useAccount();
  const [isSending, setIsSending] = useState(false);
  const walletAddress = account.addresses?.[0];
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync, data } = useSendTransaction();
  const { signMessage, data: signData } = useSignMessage();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [isFundOpen, setIsFundOpen] = useState(false);
  const [form, setForm] = useState({ amount: "" });

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
            onClick={() => toast.info("Feature coming soon!")}
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
            >
              <Image
                src={m.image}
                alt={m.name}
                className="rounded w-full h-48 object-cover"
              />
              <h3 className="mt-2 text-l md:text-l font-bold">{m.name}</h3>
              <p className="text-sm md:text-base text-gray-300">
                {m.description}
              </p>
              <div className="flex gap-2 mt-4 items-center">
                <p className="text-sm">
                  <b>Target:</b> {m.target}
                </p>
                <button
                  onClick={() => {
                    setSelectedCampaign(m);
                    setIsFundOpen(true);
                  }}
                  className="flex-1 bg-blue-600 py-2 rounded text-sm font-semibold"
                >
                  Donate
                </button>
              </div>
            </div>
          ))}
        </div>

        {isFundOpen && selectedCampaign && (
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
                  src={selectedCampaign?.image || aaa}
                  alt="Generated Meme"
                  className="w-full h-full object-cover rounded"
                  width={500}
                  height={300}
                />
              </div>

              <h2 className="text-xl font-bold mb-4">
                {selectedCampaign?.name}
              </h2>

              <p>{selectedCampaign?.description}</p>
              <br />

              <p className="text-sm">
                <b>Target:</b> {selectedCampaign?.target}
              </p>

              <input
                type="text"
                placeholder="Amount to Donate (in ETH)"
                className="w-full bg-white text-black border px-2 py-1 mb-2 rounded-sm"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />

              <div className="flex justify-between">
                <button
                  disabled={isSending}
                  onClick={async () => {
                    try {
                      setIsSending(true);
                      await sendTransactionAsync({
                        to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
                        value: parseEther(form.amount || "0"),
                      });
                      setForm({ amount: "" }); // Clear input on success
                    } catch (error) {
                      console.error("Transaction failed:", error);
                      toast.error("Transaction failed. Please try again.");
                    } finally {
                      setIsSending(false);
                    }
                  }}
                  className={`${
                    isSending
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-green-600"
                  } text-white px-3 py-1 rounded`}
                >
                  {isSending ? "Sending..." : "Send ETH"}
                </button>
              </div>

              <p>
                {" "}
                <b>{data && "Transaction sent successfully! 🎉"}</b>{" "}
                {data && (
                  <div className="flex items-center mt-2">
                    <span className="truncate max-w-xs overflow-hidden break-all">
                      {data}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(data);
                        toast.success("Copied to clipboard!");
                      }}
                      className="ml-2 w-10 h-10 flex items-center justify-center bg-gray-500 text-white rounded-full text-lg hover:bg-gray-600 transition"
                    >
                      📋
                    </button>
                  </div>
                )}
              </p>

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
      <Toaster position="top-center" />

      <footer className="text-center text-gray-500 mt-8 mb-8">
        BUILT ON BASE
        <br></br>
        <br></br>
      </footer>
    </div>
  );
}
