"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { resetProvider } from "@/lib/provider";
import {
  useEIP6963Providers,
  type EIP1193Provider,
  type EIP6963ProviderDetail,
} from "@/lib/eip6963";

const SEPOLIA_CHAIN_ID = 11155111;
const STORAGE_KEY_PROVIDER = "chainsteps_provider_rdns";
const STORAGE_KEY_DISCONNECTED = "chainsteps_disconnected";

interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const router = useRouter();
  const providers = useEIP6963Providers();
  const [selectedDetail, setSelectedDetail] = useState<EIP6963ProviderDetail | null>(null);
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });
  const listenersRef = useRef<{ provider: EIP1193Provider; handlers: Record<string, (...args: unknown[]) => void> } | null>(null);

  const selectedProvider = selectedDetail?.provider ?? null;

  // Attach event listeners to a provider, tearing down any previous ones
  const attachListeners = useCallback((detail: EIP6963ProviderDetail) => {
    const provider = detail.provider;

    // Remove previous listeners
    if (listenersRef.current) {
      const { provider: prev, handlers } = listenersRef.current;
      prev.removeListener?.("accountsChanged", handlers.accountsChanged);
      prev.removeListener?.("chainChanged", handlers.chainChanged);
    }

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (!accounts || accounts.length === 0) {
        setState((prev) => ({ ...prev, address: null, isConnected: false }));
      } else {
        localStorage.removeItem(STORAGE_KEY_DISCONNECTED);
        setState((prev) => ({ ...prev, address: accounts[0], isConnected: true }));
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainIdHex = args[0] as string;
      resetProvider();
      setState((prev) => ({ ...prev, chainId: parseInt(chainIdHex, 16) }));
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    listenersRef.current = {
      provider,
      handlers: { accountsChanged: handleAccountsChanged, chainChanged: handleChainChanged },
    };
  }, []);

  // Auto-reconnect with previously selected provider
  useEffect(() => {
    if (providers.length === 0) return;
    if (localStorage.getItem(STORAGE_KEY_DISCONNECTED) === "true") return;
    if (selectedDetail) return; // already have a selection

    const savedRdns = localStorage.getItem(STORAGE_KEY_PROVIDER);
    if (!savedRdns) return;

    const match = providers.find((p) => p.info.rdns === savedRdns);
    if (!match) return;

    setSelectedDetail(match);
    attachListeners(match);

    match.provider
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        const accs = accounts as string[];
        if (accs.length > 0) {
          return match.provider.request({ method: "eth_chainId" }).then((cid) => {
            setState({
              address: accs[0],
              chainId: parseInt(cid as string, 16),
              isConnected: true,
              isConnecting: false,
              error: null,
            });
          });
        }
      })
      .catch(console.error);
  }, [providers, selectedDetail, attachListeners]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        const { provider, handlers } = listenersRef.current;
        provider.removeListener?.("accountsChanged", handlers.accountsChanged);
        provider.removeListener?.("chainChanged", handlers.chainChanged);
      }
    };
  }, []);

  const selectProvider = useCallback(
    (rdns: string) => {
      const detail = providers.find((p) => p.info.rdns === rdns);
      if (!detail) return;

      // Clean up old listeners
      if (listenersRef.current) {
        const { provider: prev, handlers } = listenersRef.current;
        prev.removeListener?.("accountsChanged", handlers.accountsChanged);
        prev.removeListener?.("chainChanged", handlers.chainChanged);
      }

      localStorage.setItem(STORAGE_KEY_PROVIDER, rdns);
      localStorage.removeItem(STORAGE_KEY_DISCONNECTED);
      setSelectedDetail(detail);
      attachListeners(detail);
    },
    [providers, attachListeners]
  );

  const connect = useCallback(async (overrideProvider?: EIP1193Provider) => {
    const provider = overrideProvider || selectedProvider;
    if (!provider) {
      setState((prev) => ({ ...prev, error: "No wallet selected" }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      const chainIdHex = (await provider.request({
        method: "eth_chainId",
      })) as string;

      localStorage.removeItem(STORAGE_KEY_DISCONNECTED);
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
  }, [selectedProvider]);

  const switchToSepolia = useCallback(async () => {
    if (!selectedProvider) return;
    try {
      await selectedProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await selectedProvider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: "Sepolia Testnet",
                nativeCurrency: { name: "SepoliaETH", symbol: "SepoliaETH", decimals: 18 },
                rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
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
  }, [selectedProvider]);

  const disconnect = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_DISCONNECTED, "true");
    resetProvider();
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
      if (protectedPaths.some((path) => currentPath.startsWith(path))) {
        router.push("/");
      }
    }
  }, [router]);

  const isWrongNetwork = state.isConnected && state.chainId !== SEPOLIA_CHAIN_ID;

  return {
    ...state,
    providers,
    selectedProvider,
    selectedDetail,
    selectProvider,
    connect,
    disconnect,
    switchToSepolia,
    isWrongNetwork,
  };
}