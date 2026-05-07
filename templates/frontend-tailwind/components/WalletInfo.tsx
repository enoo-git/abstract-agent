"use client";

import { useAccount, useBalance } from "wagmi";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contracts";
import { Coins, Wallet } from "lucide-react";

export function WalletInfo() {
  const { address, isConnected } = useAccount();

  const { data: ethBalance } = useBalance({ address });

  const { data: tokenBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address },
  });

  const { data: tokenName } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "name",
  });

  if (!isConnected || !address) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <Wallet className="h-10 w-10 text-white/20" />
          <p className="text-white/40 text-sm">Connect your wallet to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-violet-400" />
          Wallet
        </CardTitle>
        <CardDescription className="font-mono text-xs break-all">{address}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 border border-white/8 p-4">
          <p className="text-xs text-white/40 mb-1">ETH Balance</p>
          <p className="text-xl font-semibold text-white">
            {ethBalance ? Number(formatEther(ethBalance.value)).toFixed(4) : "—"}
          </p>
          <p className="text-xs text-white/30 mt-0.5">ETH</p>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/8 p-4">
          <p className="text-xs text-white/40 mb-1">{tokenName ?? "Token"} Balance</p>
          <p className="text-xl font-semibold text-white">
            {tokenBalance !== undefined
              ? Number(formatEther(tokenBalance as bigint)).toLocaleString()
              : "—"}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Coins className="h-3 w-3 text-violet-400" />
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              {tokenName ?? "TOKEN"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
