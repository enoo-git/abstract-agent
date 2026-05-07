"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contracts";
import { Loader2, Sparkles, ExternalLink } from "lucide-react";

export function MintButton() {
  const { address, isConnected } = useAccount();
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-400" />
          Mint Tokens
        </CardTitle>
        <CardDescription>Mint tokens directly to your wallet</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 rounded-lg bg-white/5 border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-white/30"
            placeholder="Amount"
            min="1"
          />
          <Button
            onClick={handleMint}
            disabled={!isConnected || isPending || isConfirming || !amount}
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isPending ? "Confirm…" : "Minting…"}
              </>
            ) : (
              "Mint"
            )}
          </Button>
        </div>

        {isSuccess && txHash && (
          <a
            href={`https://explorer.testnet.abs.xyz/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Transaction confirmed
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error.message.split("\n")[0]}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
