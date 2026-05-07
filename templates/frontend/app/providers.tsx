"use client";

import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";

// Change to `abstract` (no "Testnet") when deploying to mainnet
const CHAIN = abstractTestnet;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AbstractWalletProvider chain={CHAIN}>
      {children}
    </AbstractWalletProvider>
  );
}
