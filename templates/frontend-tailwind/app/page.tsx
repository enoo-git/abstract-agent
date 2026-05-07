import { ConnectButton } from "@/components/ConnectButton";
import { WalletInfo } from "@/components/WalletInfo";
import { MintButton } from "@/components/MintButton";
import { ContractStats } from "@/components/ContractStats";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <span className="font-semibold text-white text-sm">Abstract Dapp</span>
        </div>
        <ConnectButton />
      </nav>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-2xl px-6 py-16 flex flex-col gap-6">
        {/* Hero */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            <span className="gradient-text">Your Dapp</span>
            <br />
            <span className="text-white/80 text-3xl font-normal">on Abstract Chain</span>
          </h1>
          <p className="text-white/40 text-sm max-w-sm mx-auto">
            Fast, cheap, and secured by Ethereum. Built for real users.
          </p>
        </div>

        <WalletInfo />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MintButton />
          <ContractStats />
        </div>
      </main>
    </div>
  );
}
