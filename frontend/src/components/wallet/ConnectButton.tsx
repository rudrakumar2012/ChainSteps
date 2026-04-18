"use client";

import { useRef, useEffect } from "react";
import { useWalletContext } from "./WalletProvider";
import { Button } from "../ui/Button";
import { truncateAddress } from "@/lib/utils";

export function ConnectButton({
  location = "unknown",
  onConnected,
}: {
  location?: string;
  onConnected?: () => void;
}) {
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

  const prevConnectedRef = useRef(isConnected);
  useEffect(() => {
    if (isConnected && !prevConnectedRef.current) {
      onConnected?.();
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected, onConnected]);

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
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-surface-container">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-secondary shadow-[0_0_8px_#4edea3]" />
        <span className="text-xs sm:text-sm font-mono text-white">{truncateAddress(address!)}</span>
      </div>
      <button
        onClick={disconnect}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
        title="Disconnect"
      >
        <span className="material-symbols-outlined text-lg">logout</span>
      </button>
    </div>
  );
}