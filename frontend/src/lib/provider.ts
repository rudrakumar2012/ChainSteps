import { ethers } from "ethers";

let provider: ethers.BrowserProvider | null = null;

export function getProvider(): ethers.BrowserProvider {
  if (!provider) {
    if (!window.ethereum) {
      throw new Error("No Ethereum provider found. Install MetaMask.");
    }
    provider = new ethers.BrowserProvider(window.ethereum);
  }
  return provider;
}

export function resetProvider(): void {
  provider = null;
}

const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

let readOnlyProvider: ethers.JsonRpcProvider | null = null;

export function getReadOnlyProvider(): ethers.JsonRpcProvider {
  if (!readOnlyProvider) {
    readOnlyProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  }
  return readOnlyProvider;
}