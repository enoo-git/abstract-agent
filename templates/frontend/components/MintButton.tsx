"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../lib/contracts";

export function MintButton() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("100");

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const handleMint = () => {
    if (!address) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "mint",
      args: [address, parseEther(amount)],
    });
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Mint Tokens</h2>
      <p style={{ color: "#6b7280", fontSize: 14 }}>
        Only the contract owner can mint. Make sure you're connected with the deployer wallet.
      </p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={inputStyle}
          placeholder="Amount"
        />
        <button
          onClick={handleMint}
          disabled={isPending || isConfirming}
          style={buttonStyle}
        >
          {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : "Mint"}
        </button>
      </div>

      {isSuccess && (
        <p style={{ color: "#16a34a" }}>
          Minted! Tx:{" "}
          <a
            href={`https://sepolia.abscan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Abscan
          </a>
        </p>
      )}

      {error && (
        <p style={{ color: "#dc2626", fontSize: 14 }}>
          Error: {error.message.slice(0, 100)}
        </p>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
};

const inputStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "8px 12px",
  fontSize: 15,
  width: 120,
};

const buttonStyle: React.CSSProperties = {
  background: "#6366f1",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 16px",
  fontSize: 15,
  cursor: "pointer",
  fontWeight: 600,
};
