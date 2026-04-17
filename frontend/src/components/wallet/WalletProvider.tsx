"use client";

import { createContext, useContext, ReactNode, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";

interface WalletContextValue {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isWrongNetwork: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToSepolia: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();

  useEffect(() => {
    // Debug: expose wallet state globally for troubleshooting
    if (typeof window !== "undefined") {
      (window as any).__walletDebug = wallet;
    }
  }, [wallet]);

  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
}