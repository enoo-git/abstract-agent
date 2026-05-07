"use client";

import { ConnectButton } from "../components/ConnectButton";
import { TokenInfo } from "../components/TokenInfo";
import { MintButton } from "../components/MintButton";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main style={{ maxWidth: 600, margin: "60px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <h1>My Abstract Dapp</h1>
      <p style={{ color: "#666" }}>
        Built on Abstract Chain — fast, cheap, powered by Ethereum security.
      </p>

      <div style={{ marginTop: 32 }}>
        <ConnectButton />
      </div>

      {isConnected && (
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 24 }}>
          <TokenInfo />
          <MintButton />
        </div>
      )}
    </main>
  );
}
