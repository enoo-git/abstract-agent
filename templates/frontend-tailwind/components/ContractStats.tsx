"use client";

import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contracts";
import { BarChart3 } from "lucide-react";

export function ContractStats() {
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <span className="text-sm text-white/40">Name</span>
          <span className="text-sm text-white font-medium">{name ?? "—"}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <span className="text-sm text-white/40">Symbol</span>
          <Badge variant="blue">{symbol ?? "—"}</Badge>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <span className="text-sm text-white/40">Total Supply</span>
          <span className="text-sm text-white font-mono">
            {totalSupply !== undefined
              ? Number(formatEther(totalSupply as bigint)).toLocaleString()
              : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-white/40">Address</span>
          <a
            href={`https://explorer.testnet.abs.xyz/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            {CONTRACT_ADDRESS.slice(0, 8)}…{CONTRACT_ADDRESS.slice(-6)}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
