"use client";

import { useEffect, useState } from "react";

// EIP-6963 interfaces
export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

export interface EIP1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

interface EIP6963AnnounceProviderEvent {
  detail: {
    info: EIP6963ProviderInfo;
    provider: EIP1193Provider;
  };
}

// Store for discovered providers
const providers = new Map<string, EIP6963ProviderDetail>();

export function useEIP6963Providers(): EIP6963ProviderDetail[] {
  const [providerList, setProviderList] = useState<EIP6963ProviderDetail[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: Event) => {
      const detail = (event as unknown as EIP6963AnnounceProviderEvent).detail;
      providers.set(detail.info.rdns, {
        info: detail.info,
        provider: detail.provider,
      });
      setProviderList(Array.from(providers.values()));
    };

    window.addEventListener("eip6963:announceProvider", handler);

    // Request already-injected providers to announce themselves
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Also check for a fallback window.ethereum if no EIP-6963 providers appear
    const fallbackTimer = setTimeout(() => {
      if (providers.size === 0 && (window as any).ethereum) {
        const eth = (window as any).ethereum;
        providers.set("fallback", {
          info: {
            uuid: "fallback",
            name: eth.isMetaMask ? "MetaMask" : "Browser Wallet",
            icon: "",
            rdns: "fallback",
          },
          provider: eth as EIP1193Provider,
        });
        setProviderList(Array.from(providers.values()));
      }
    }, 500);

    return () => {
      window.removeEventListener("eip6963:announceProvider", handler);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return providerList;
}