"use client";

import { useState, useCallback, useEffect } from "react";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

const SEPOLIA_CHAIN_ID = 11155111;

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[];

      const chainId = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;

      if (accounts.length > 0) {
        setState({
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          isConnected: true,
          isConnecting: false,
          error: null,
        });
      }
    } catch (err) {
      console.error("Failed to check connection:", err);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accountList = accounts as string[];
        if (accountList.length === 0) {
          setState((prev) => ({
            ...prev,
            address: null,
            isConnected: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            address: accountList[0],
          }));
        }
      };

      const handleChainChanged = (chainId: unknown) => {
        setState((prev) => ({
          ...prev,
          chainId: parseInt(chainId as string, 16),
        }));
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [checkConnection]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState((prev) => ({
        ...prev,
        error: "MetaMask is not installed",
        isConnecting: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const chainId = (await window.ethereum.request({
        method: "eth_chainId",
      })) as string;

      setState({
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (err) {
      const error = err as { code?: number; message?: string };
      if (error.code === 4001) {
        setState((prev) => ({
          ...prev,
          error: "Connection rejected",
          isConnecting: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: "Failed to connect",
          isConnecting: false,
        }));
      }
    }
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (err) {
      const error = err as { code?: number };
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: "Sepolia Testnet",
              nativeCurrency: {
                name: "SepoliaETH",
                symbol: "SepoliaETH",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.infura.io/v3/"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const isWrongNetwork = state.chainId !== SEPOLIA_CHAIN_ID;

  return {
    ...state,
    connect,
    disconnect,
    switchToSepolia,
    isWrongNetwork,
  };
}