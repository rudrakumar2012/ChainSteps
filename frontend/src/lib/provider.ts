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