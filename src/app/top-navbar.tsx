"use client";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSignMessage,
} from "wagmi";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TopNavbar() {
  const router = useRouter();
  const account = useAccount();
  const [isSending, setIsSending] = useState(false);
  const walletAddress = account.addresses?.[0];
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: walletAddress,
  });
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync, data } = useSendTransaction();
  const { signMessage, data: signData } = useSignMessage();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isFundOpen, setIsFundOpen] = useState(false);
  const [form, setForm] = useState({ amount: "" });

  function truncateAddress(walletAddress: string, chars = 4) {
    return `${walletAddress.slice(0, chars + 2)}...${walletAddress.slice(-chars)}`;
  }

  return (
    <nav className="sticky top-0 z-20 flex justify-between items-center p-5 border-b border-gray-800 bg-gray-950">
      <div className="text-xl font-bold">
        <a href="/">BaseDexVision</a>
      </div>
      <div className="flex items-center space-x-4">
        {account.status === "connected" ? (
          <div className="flex items-center space-x-4">
            <p className="text-green-400">
              Balance(Main):{" "}
              {isBalanceLoading
                ? "Loading..."
                : balanceData
                  ? `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
                  : "N/A"}
            </p>
            <p className="text-white">{truncateAddress(walletAddress || "")}</p>
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
  );
}
