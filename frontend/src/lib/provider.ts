import { ethers } from "ethers";
import type { EIP1193Provider } from "./eip6963";

let provider: ethers.BrowserProvider | null = null;
let providerSource: EIP1193Provider | null = null;

export function getProvider(eip1193Provider: EIP1193Provider): ethers.BrowserProvider {
  if (!provider || providerSource !== eip1193Provider) {
    provider = new ethers.BrowserProvider(eip1193Provider);
    providerSource = eip1193Provider;
  }
  return provider;
}

export function resetProvider(): void {
  provider = null;
  providerSource = null;
}

const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

let readOnlyProvider: ethers.JsonRpcProvider | null = null;

export function getReadOnlyProvider(): ethers.JsonRpcProvider {
  if (!readOnlyProvider) {
    readOnlyProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  }
  return readOnlyProvider;
}