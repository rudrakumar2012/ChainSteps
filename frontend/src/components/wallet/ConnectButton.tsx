"use client";

import { useWalletContext } from "./WalletProvider";
import { Button } from "../ui/Button";

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectButton({ location = "unknown" }: { location?: string }) {
  const {
    address,
    isConnected,
    isConnecting,
    isWrongNetwork,
    connect,
    switchToSepolia,
    disconnect,
    error,
  } = useWalletContext();

  if (isConnecting) {
    return (
      <Button variant="primary" size="md" disabled>
        <span className="material-symbols-outlined text-sm animate-spin">
          progress_activity
        </span>
        Connecting...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-2">
        {error && <div className="text-xs text-error max-w-[200px] text-right">{error}</div>}
        <Button variant="primary" size="md" onClick={connect}>
          <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
          {error ? "Retry Connection" : "Connect Wallet"}
        </Button>
      </div>
    );
  }

  if (isWrongNetwork) {
    return (
      <Button variant="danger" size="md" onClick={switchToSepolia}>
        <span className="material-symbols-outlined text-sm">warning</span>
        Switch to Sepolia
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container">
          <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4edea3]" />
          <span className="text-sm font-mono text-white">{truncateAddress(address!)}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={disconnect} className="hover:bg-error/10 hover:text-error">
          <span className="material-symbols-outlined text-sm">logout</span>
          Disconnect
        </Button>
      </div>
      <div className="text-[10px] text-on-surface-variant mr-1">
        Connected to MetaMask
      </div>
    </div>
  );
}