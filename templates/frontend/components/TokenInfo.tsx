"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../lib/contracts";

export function TokenInfo() {
  const { address } = useAccount();

  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "name",
  });

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "symbol",
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "totalSupply",
  });

  const { data: balance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Token Info</h2>
      <p><strong>Contract:</strong> {CONTRACT_ADDRESS.slice(0, 10)}...</p>
      <p><strong>Name:</strong> {name ?? "Loading..."}</p>
      <p><strong>Symbol:</strong> {symbol ?? "..."}</p>
      <p><strong>Total Supply:</strong> {totalSupply ? formatEther(totalSupply) : "..."} {symbol}</p>
      <p><strong>Your Balance:</strong> {balance ? formatEther(balance) : "0"} {symbol}</p>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
};
