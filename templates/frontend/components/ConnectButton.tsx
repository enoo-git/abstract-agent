"use client";

import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";

export function ConnectButton() {
  const { login, logout } = useLoginWithAbstract();
  const { address, isConnected } = useAccount();

  if (isConnected && address) {
    return (
      <div>
        <p style={{ color: "#16a34a", marginBottom: 8 }}>
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
        <button
          onClick={logout}
          style={buttonStyle("#dc2626")}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={login} style={buttonStyle("#6366f1")}>
      Connect with Abstract
    </button>
  );
}

function buttonStyle(bg: string): React.CSSProperties {
  return {
    background: bg,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 15,
    cursor: "pointer",
    fontWeight: 600,
  };
}
