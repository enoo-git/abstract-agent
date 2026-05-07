"use client";

import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, Loader2 } from "lucide-react";

export function ConnectButton() {
  const { login, logout } = useLoginWithAbstract();
  const { address, isConnected, isConnecting } = useAccount();

  if (isConnecting) {
    return (
      <Button disabled size="lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting…
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="success" className="font-mono">
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
          {address.slice(0, 6)}…{address.slice(-4)}
        </Badge>
        <Button variant="ghost" size="sm" onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button size="lg" onClick={() => login()}>
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
