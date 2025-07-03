"use client";

import { parseEther } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSignMessage,
} from "wagmi";
import { getCoinsMostValuable } from "@zoralabs/coins-sdk";
import { useEffect, useState } from "react";

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

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync, data } = useSendTransaction();
  const { signMessage, data: signData } = useSignMessage();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [tipAmounts, setTipAmounts] = useState<{ [key: string]: string }>({});
  const [tipStatus, setTipStatus] = useState<{
    [key: string]: "idle" | "pending" | "success" | "error" | string;
  }>({});
  const [tipTxHash, setTipTxHash] = useState<{ [key: string]: string }>({});
  const [showTipForm, setShowTipForm] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showDescription, setShowDescription] = useState<{
    [key: string]: boolean;
  }>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const [showAccountBox, setShowAccountBox] = useState(true);

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const maskAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 2)}****...****${address.slice(-4)}`;
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      const response = await getCoinsMostValuable({
        count: 21,
      });
      const coinsData = response.data?.exploreList?.edges?.map(
        (edge) => edge.node
      );
      setCoins(coinsData || []);
    } catch (error) {
      console.error("Error mengambil data koin:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        gap: "20px",
        width: "100vw",
        boxSizing: "border-box",
        background: isDarkMode ? "#1a1a1a" : "#f6f8fa",
        color: isDarkMode ? "#ffffff" : "#000000",
        transition: "all 0.3s ease",
      }}
    >
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "10px",
          borderRadius: "50%",
          border: "none",
          backgroundColor: isDarkMode ? "#ffffff" : "#1a1a1a",
          color: isDarkMode ? "#1a1a1a" : "#ffffff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        {isDarkMode ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM2 13H4C4.55 13 5 12.55 5 12C5 11.45 4.55 11 4 11H2C1.45 11 1 11.45 1 12C1 12.55 1.45 13 2 13ZM20 13H22C22.55 13 23 12.55 23 12C23 11.45 22.55 11 22 11H20C19.45 11 19 11.45 19 12C19 12.55 19.45 13 20 13ZM11 2V4C11 4.55 11.45 5 12 5C12.55 5 13 4.55 13 4V2C13 1.45 12.55 1 12 1C11.45 1 11 1.45 11 2ZM11 20V22C11 22.55 11.45 23 12 23C12.55 23 13 22.55 13 22V20C13 19.45 12.55 19 12 19C11.45 19 11 19.45 11 20ZM5.99 4.58C5.6 4.19 4.96 4.19 4.58 4.58C4.19 4.97 4.19 5.61 4.58 5.99L5.64 7.05C6.03 7.44 6.67 7.44 7.05 7.05C7.44 6.66 7.44 6.02 7.05 5.64L5.99 4.58ZM18.36 16.95C17.97 16.56 17.33 16.56 16.95 16.95C16.56 17.34 16.56 17.98 16.95 18.36L18.01 19.42C18.4 19.81 19.04 19.81 19.42 19.42C19.81 19.03 19.81 18.39 19.42 18.01L18.36 16.95ZM19.42 5.99C19.81 5.6 19.81 4.96 19.42 4.58C19.03 4.19 18.39 4.19 18.01 4.58L16.95 5.64C16.56 6.03 16.56 6.67 16.95 7.05C17.34 7.44 17.98 7.44 18.36 7.05L19.42 5.99ZM7.05 18.36C7.44 17.97 7.44 17.33 7.05 16.95C6.66 16.56 6.02 16.56 5.64 16.95L4.58 18.01C4.19 18.4 4.19 19.04 4.58 19.42C4.97 19.81 5.61 19.81 5.99 19.42L7.05 18.36Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3ZM12 19C8.14 19 5 15.86 5 12C5 8.14 8.14 5 12 5C15.86 5 19 8.14 19 12C19 15.86 15.86 19 12 19Z"
              fill="currentColor"
            />
            <path
              d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>

      {(account.status !== "connected" || !signData || showAccountBox) && (
        <div
          className="container"
          style={{
            position: "relative",
            backgroundColor: isDarkMode ? "#2d2d2d" : "white",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: isDarkMode
              ? "0 2px 8px rgba(255,255,255,0.1)"
              : "0 2px 8px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "600px",
            marginBottom: "32px",
            color: isDarkMode ? "#f1f1f1" : "#1a1a1a",
          }}
        >
          {account.status === "connected" && signData && (
            <button
              onClick={() => setShowAccountBox(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                color: isDarkMode ? "#cccccc" : "#666",
                fontSize: 18,
                cursor: "pointer",
                zIndex: 2,
              }}
              title="Hide Account Box"
            >
              &#10006;
            </button>
          )}
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: isDarkMode ? "#fff" : "#1a1a1a",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textShadow: isDarkMode ? "0 1px 6px rgba(0,0,0,0.5)" : "none",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
                fill="#4CAF50"
              />
            </svg>
            Account Wallet
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontWeight: "500", color: "#666" }}>Status:</span>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor:
                    account.status === "connected" ? "#e8f5e9" : "#ffebee",
                  color: account.status === "connected" ? "#2e7d32" : "#c62828",
                  fontSize: "14px",
                }}
              >
                {account.status}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                padding: "12px",
                backgroundColor: isDarkMode ? "#232323" : "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  fontWeight: "500",
                  color: isDarkMode ? "#cccccc" : "#666",
                }}
              >
                Wallet Address:
              </span>
              <div
                style={{
                  fontFamily: "monospace",
                  padding: "8px 12px",
                  backgroundColor: isDarkMode ? "#181818" : "#fff",
                  borderRadius: "6px",
                  border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
                  wordBreak: "break-all",
                  color: isDarkMode ? "#f1f1f1" : "#1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {account.status === "connected" && signData ? (
                  <>
                    {showWalletAddress
                      ? account.addresses
                        ? truncateAddress(account.addresses[0])
                        : "Not connected"
                      : account.addresses
                        ? maskAddress(account.addresses[0])
                        : "Not connected"}
                    <button
                      onClick={() => setShowWalletAddress(!showWalletAddress)}
                      style={{
                        marginLeft: 8,
                        background: "none",
                        border: "none",
                        color: isDarkMode ? "#4CAF50" : "#2196f3",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {showWalletAddress ? "Hide" : "Show"}
                    </button>
                  </>
                ) : (
                  <span style={{ color: isDarkMode ? "#888" : "#bbb" }}>
                    {account.addresses
                      ? maskAddress(account.addresses[0])
                      : "Not connected"}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontWeight: "500", color: "#666" }}>
                Chain ID:
              </span>
              <span
                style={{
                  padding: "4px 8px",
                  backgroundColor: "#e3f2fd",
                  color: "#1565c0",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                {account.chainId}
              </span>
            </div>
          </div>

          {account.status === "connected" ? (
            <button
              type="button"
              onClick={async () => {
                try {
                  await disconnect();
                } catch (error) {
                  console.error("Error disconnecting:", error);
                }
              }}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%",
                fontSize: "16px",
                fontWeight: "500",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#d32f2f")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#f44336")
              }
            >
              Disconnect Wallet
            </button>
          ) : (
            connectors
              .filter((connector) => connector.name === "Coinbase Wallet")
              .map((connector) => (
                <button
                  key={connector.uid}
                  onClick={async () => {
                    try {
                      await connect({ connector });
                    } catch (error) {
                      console.error("Error connecting:", error);
                    }
                  }}
                  type="button"
                  style={{
                    marginTop: "20px",
                    padding: "12px 24px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    width: "100%",
                    fontSize: "16px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#388e3c")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#4CAF50")
                  }
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 7.28V5C21 3.9 20.1 3 19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V16.72C21.59 16.37 22 15.74 22 15V9C22 8.26 21.59 7.63 21 7.28ZM20 9V15H13V9H20ZM5 19V5H19V7H13C11.9 7 11 7.9 11 9V15C11 16.1 11.9 17 13 17H19V19H5Z"
                      fill="white"
                    />
                    <path
                      d="M16 13.5C16.8284 13.5 17.5 12.8284 17.5 12C17.5 11.1716 16.8284 10.5 16 10.5C15.1716 10.5 14.5 11.1716 14.5 12C14.5 12.8284 15.1716 13.5 16 13.5Z"
                      fill="white"
                    />
                  </svg>
                  Connect Wallet
                </button>
              ))
          )}

          <div style={{ marginTop: "24px" }}>
            <div
              style={{
                fontWeight: "500",
                color: "#666",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z"
                  fill="#666"
                />
              </svg>
              Sign Message
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await signMessage({ message: "Hello World" });
                } catch (error) {
                  console.error("Error signing message:", error);
                }
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                width: "100%",
                fontSize: "16px",
                fontWeight: "500",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#1976d2")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#2196f3")
              }
            >
              Sign Message
            </button>
            {signData && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "#e3f2fd",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  color: "#1565c0",
                  wordBreak: "break-all",
                }}
              >
                {truncateAddress(signData)}
              </div>
            )}
          </div>
        </div>
      )}
      {account.status === "connected" && signData && !showAccountBox && (
        <button
          onClick={() => setShowAccountBox(true)}
          style={{
            background: isDarkMode ? "#232323" : "#f8f9fa",
            color: isDarkMode ? "#f1f1f1" : "#1a1a1a",
            border: isDarkMode ? "1px solid #333" : "1px solid #e0e0e0",
            borderRadius: 8,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 24,
            cursor: "pointer",
            boxShadow: isDarkMode
              ? "0 2px 8px rgba(255,255,255,0.05)"
              : "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          Show Account Wallet
        </button>
      )}

      {/* <div className="container" style={{ width: '100%', boxSizing: 'border-box' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Most Valuable Coins</h2>
      </div> */}
      {loading ? (
        <div>Loading coins data...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
            padding: 0,
          }}
        >
          {coins.map((coin, index) => (
            <div
              key={index}
              style={{
                padding: "20px",
                border: `1px solid ${isDarkMode ? "#404040" : "#ccc"}`,
                borderRadius: "12px",
                backgroundColor: isDarkMode ? "#2d2d2d" : "#f9f9f9",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                color: isDarkMode ? "#f1f1f1" : "#1a1a1a",
              }}
            >
              {coin.mediaContent?.previewImage?.medium && (
                <img
                  src={coin.mediaContent.previewImage.medium}
                  alt={coin.name}
                  style={{
                    width: "100%",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "15px",
                  }}
                />
              )}
              <h3
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: isDarkMode ? "#fff" : "#1a1a1a",
                  textShadow: isDarkMode ? "0 1px 6px rgba(0,0,0,0.5)" : "none",
                }}
              >
                {index + 1}. {coin.name}
                <span
                  style={{
                    fontSize: "16px",
                    color: isDarkMode ? "#cccccc" : "#666",
                    marginLeft: "8px",
                    fontWeight: 500,
                  }}
                >
                  ({coin.symbol})
                </span>
              </h3>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: isDarkMode ? "#404040" : "#fff",
                    borderRadius: "8px",
                    border: `1px solid ${isDarkMode ? "#505050" : "#e0e0e0"}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: isDarkMode ? "#cccccc" : "#666",
                        fontWeight: "500",
                      }}
                    >
                      Description
                    </div>
                    <button
                      onClick={() =>
                        setShowDescription({
                          ...showDescription,
                          [coin.id]: !showDescription[coin.id],
                        })
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#2196f3",
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {showDescription[coin.id] ? (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"
                              fill="currentColor"
                            />
                          </svg>
                          Hide
                        </>
                      ) : (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M16.59 8.59L12 13.17L7.41 8.59L6 10L12 16L18 10L16.59 8.59Z"
                              fill="currentColor"
                            />
                          </svg>
                          Show
                        </>
                      )}
                    </button>
                  </div>
                  <div
                    style={{
                      color: isDarkMode ? "#cccccc" : "#666",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      maxHeight: showDescription[coin.id] ? "none" : "60px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {coin.description}
                    {!showDescription[coin.id] && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "40px",
                          background: "linear-gradient(transparent, #fff)",
                        }}
                      />
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: isDarkMode ? "#404040" : "#fff",
                      borderRadius: "8px",
                      border: `1px solid ${isDarkMode ? "#505050" : "#e0e0e0"}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: isDarkMode ? "#cccccc" : "#666",
                        marginBottom: "4px",
                      }}
                    >
                      Market Cap
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: isDarkMode ? "#f1f1f1" : "#1a1a1a",
                      }}
                    >
                      {coin.marketCap}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: isDarkMode ? "#404040" : "#fff",
                      borderRadius: "8px",
                      border: `1px solid ${isDarkMode ? "#505050" : "#e0e0e0"}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: isDarkMode ? "#cccccc" : "#666",
                        marginBottom: "4px",
                      }}
                    >
                      24h Volume
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: isDarkMode ? "#f1f1f1" : "#1a1a1a",
                      }}
                    >
                      {coin.volume24h}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: isDarkMode ? "#404040" : "#fff",
                      borderRadius: "8px",
                      border: `1px solid ${isDarkMode ? "#505050" : "#e0e0e0"}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: isDarkMode ? "#cccccc" : "#666",
                        marginBottom: "4px",
                      }}
                    >
                      Total Supply
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: isDarkMode ? "#f1f1f1" : "#1a1a1a",
                      }}
                    >
                      {coin.totalSupply}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      backgroundColor: isDarkMode ? "#404040" : "#fff",
                      borderRadius: "8px",
                      border: `1px solid ${isDarkMode ? "#505050" : "#e0e0e0"}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: isDarkMode ? "#cccccc" : "#666",
                        marginBottom: "4px",
                      }}
                    >
                      Total Volume
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: isDarkMode ? "#f1f1f1" : "#1a1a1a",
                      }}
                    >
                      {coin.totalVolume}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px",
                    backgroundColor: isDarkMode ? "#404040" : "#fff",
                    borderRadius: "8px",
                    border: `1px solid ${isDarkMode ? "#505050" : "#e0e0e0"}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: isDarkMode ? "#cccccc" : "#666",
                      marginBottom: "4px",
                    }}
                  >
                    Creator Address
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontFamily: "monospace",
                      color: isDarkMode ? "#f1f1f1" : "#1a1a1a",
                      wordBreak: "break-all",
                    }}
                  >
                    {coin.creatorAddress}
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px",
                    backgroundColor: isDarkMode ? "#404040" : "#fff",
                    borderRadius: "8px",
                    border: `1px solid ${isDarkMode ? "#505050" : "#e0e0e0"}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: isDarkMode ? "#cccccc" : "#666",
                      marginBottom: "4px",
                    }}
                  >
                    Created At
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: isDarkMode ? "#f1f1f1" : "#1a1a1a",
                    }}
                  >
                    {coin.createdAt
                      ? new Date(coin.createdAt).toLocaleString()
                      : "Date not available"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {!showTipForm[coin.id] ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowTipForm({ ...showTipForm, [coin.id]: true });
                      setTipAmounts({ ...tipAmounts, [coin.id]: "0.0001" });
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "4px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Tip Creator
                  </button>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      width: "100%",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="number"
                        min="0"
                        step="0.000001"
                        placeholder="Tip Amount (ETH)"
                        value={tipAmounts[coin.id] || "0.0001"}
                        onChange={(e) =>
                          setTipAmounts({
                            ...tipAmounts,
                            [coin.id]: e.target.value,
                          })
                        }
                        style={{
                          width: 120,
                          padding: 8,
                          borderRadius: 4,
                          border: "1px solid #ccc",
                        }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            if (!tipAmounts[coin.id])
                              return alert("Please enter a tip amount!");
                            if (
                              !coin.creatorAddress ||
                              typeof coin.creatorAddress !== "string" ||
                              !coin.creatorAddress.startsWith("0x")
                            )
                              return alert("Invalid creator address!");
                            setTipStatus({
                              ...tipStatus,
                              [coin.id]: "pending",
                            });
                            const tx = await sendTransactionAsync({
                              to: coin.creatorAddress as `0x${string}`,
                              value: parseEther(tipAmounts[coin.id]),
                            });
                            setTipStatus({
                              ...tipStatus,
                              [coin.id]: "success",
                            });
                            setTipTxHash({ ...tipTxHash, [coin.id]: tx });
                            setShowTipForm({
                              ...showTipForm,
                              [coin.id]: false,
                            });
                          } catch (error) {
                            setTipStatus({ ...tipStatus, [coin.id]: "error" });
                            alert("Failed to send tip!");
                            console.error("Error sending tip:", error);
                          }
                        }}
                        disabled={tipStatus[coin.id] === "pending"}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "4px",
                          backgroundColor: "#4CAF50",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {tipStatus[coin.id] === "pending"
                          ? "Sending..."
                          : "Send Tip"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setShowTipForm({ ...showTipForm, [coin.id]: false })
                        }
                        style={{
                          padding: "8px 16px",
                          borderRadius: "4px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Tip transaction status */}
              {tipStatus[coin.id] === "success" && (
                <div style={{ color: "green", marginTop: 4 }}>
                  Tip sent successfully! 🎉
                  {tipTxHash[coin.id] && (
                    <div>
                      <a
                        href={`https://sepolia.basescan.org/tx/${tipTxHash[coin.id]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#1a73e8",
                          textDecoration: "underline",
                          wordBreak: "break-all",
                        }}
                      >
                        View on BaseScan
                      </a>
                    </div>
                  )}
                </div>
              )}
              {tipStatus[coin.id] === "error" && (
                <div style={{ color: "red", marginTop: 4 }}>
                  Failed to send tip.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
