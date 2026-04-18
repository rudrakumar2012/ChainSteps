"use client";

import { useState, useCallback, useEffect } from "react";

declare global {
  interface Window {
    ethereum?: any;
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
    if (typeof window !== "undefined" && window.ethereum) {
      // Don't auto-connect if user explicitly disconnected
      if (localStorage.getItem("chainsteps_disconnected") === "true") {
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" }) as string;
        
        if (accounts && accounts.length > 0) {
          setState({
            address: accounts[0],
            chainId: parseInt(chainIdHex, 16),
            isConnected: true,
            isConnecting: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Failed to check connection:", error);
      }
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accountList = accounts as string[];
        if (!accountList || accountList.length === 0) {
          setState((prev) => ({ ...prev, address: null, isConnected: false }));
        } else {
          // If accounts changed to a valid one, clear the disconnected flag
          localStorage.removeItem("chainsteps_disconnected");
          setState((prev) => ({ ...prev, address: accountList[0], isConnected: true }));
        }
      };

      const handleChainChanged = (chainIdHex: unknown) => {
        setState((prev) => ({ ...prev, chainId: parseInt(chainIdHex as string, 16) }));
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener?.("chainChanged", handleChainChanged);
      };
    }
  }, [checkConnection]);

  const connect = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" }) as string;
        
        localStorage.removeItem("chainsteps_disconnected");
        setState({
          address: accounts[0],
          chainId: parseInt(chainIdHex, 16),
          isConnected: true,
          isConnecting: false,
          error: null,
        });
      } catch (error: any) {
        console.error("Connection error:", error);
        setState((prev) => ({
          ...prev,
          error: error.message || "Failed to connect wallet",
          isConnecting: false,
        }));
      }
    } else {
      setState((prev) => ({
        ...prev,
        error: "MetaMask is not detected in the browser",
        isConnecting: false,
      }));
      if (typeof window !== "undefined") {
        alert("MetaMask is not detected in the browser");
      }
    }
  };

  const switchToSepolia = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
                  chainName: "Sepolia Testnet",
                  nativeCurrency: { name: "SepoliaETH", symbol: "SepoliaETH", decimals: 18 },
                  rpcUrls: ["https://sepolia.infura.io/v3/"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } catch (addError) {
            console.error("Failed to add Sepolia network:", addError);
          }
        } else {
          console.error("Failed to switch to Sepolia:", error);
        }
      }
    }
  };

  const disconnect = () => {
    localStorage.setItem("chainsteps_disconnected", "true");
    setState({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });

    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      const protectedPaths = ["/dashboard", "/contracts", "/create", "/disputes"];
      if (protectedPaths.some(path => currentPath.startsWith(path))) {
        window.location.href = "/";
      }
    }
  };

  const isWrongNetwork = state.isConnected && state.chainId !== SEPOLIA_CHAIN_ID;

  return {
    ...state,
    connect,
    disconnect,
    switchToSepolia,
    isWrongNetwork,
  };
}