import { ethers } from "ethers";
import { getProvider, getReadOnlyProvider } from "./provider";
import ABI from "./abi.json";
import type { Escrow, Milestone, EscrowState } from "@/types";

export const CONTRACT_ADDRESS = "0xD518149F0b1e50E3486C32A295809a65BFF40DE0";

export function getReadContract(): ethers.Contract {
  const provider = typeof window !== "undefined" && window.ethereum
    ? getProvider()
    : getReadOnlyProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
}

export async function getWriteContract(): Promise<ethers.Contract> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

export async function fetchEscrow(id: number): Promise<Escrow> {
  const contract = getReadContract();
  const data = await contract.getEscrow(id);
  return {
    id: String(id),
    client: data.client as string,
    freelancer: data.freelancer as string,
    state: Number(data.state) as EscrowState,
    currentMilestone: Number(data.currentMilestone),
    milestoneCount: Number(data.milestoneCount),
    totalAmount: ethers.formatEther(data.totalAmount),
    arbitrator: data.arbitrator as string,
    disputeTimeout: data.disputeTimeout.toString(),
    disputeRaisedAt: data.disputeRaisedAt.toString(),
    disputeRaiser: data.disputeRaiser as string,
    disputeBond: ethers.formatEther(data.disputeBond),
  };
}

export async function fetchMilestone(escrowId: number, index: number): Promise<Milestone> {
  const contract = getReadContract();
  const raw = await contract.getMilestone(escrowId, index);
  return {
    description: raw.description as string,
    amount: ethers.formatEther(raw.amount),
    isCompleted: raw.isCompleted as boolean,
    isApproved: raw.isApproved as boolean,
    completedAt: raw.completedAt.toString(),
    approvalTimeout: raw.approvalTimeout.toString(),
  };
}

export async function fetchAllMilestones(escrowId: number, count: number): Promise<Milestone[]> {
  const promises = Array.from({ length: count }, (_, i) => fetchMilestone(escrowId, i));
  return Promise.all(promises);
}

export async function fetchEscrowCount(): Promise<number> {
  const contract = getReadContract();
  let count = 0;
  while (true) {
    try {
      const creator = await contract.escrowCreators(count);
      if (creator === ethers.ZeroAddress) break;
      count++;
    } catch {
      break;
    }
  }
  return count;
}

export async function fetchAllEscrows(): Promise<Escrow[]> {
  const count = await fetchEscrowCount();
  const promises = Array.from({ length: count }, (_, i) => fetchEscrow(i));
  return Promise.all(promises);
}

export async function fetchEscrowsByAddress(address: string): Promise<Escrow[]> {
  const all = await fetchAllEscrows();
  const lower = address.toLowerCase();
  return all.filter(
    (e) =>
      e.client.toLowerCase() === lower ||
      e.freelancer.toLowerCase() === lower ||
      (e.arbitrator && e.arbitrator.toLowerCase() === lower)
  );
}

// Write operations — each sends a transaction via MetaMask
// Returns TxHandle with hash exposed immediately; caller decides when to await confirmation

export interface TxHandle {
  hash: string;
  wait: () => Promise<ethers.TransactionReceipt | null>;
}

export async function createEscrowTx(freelancer: string, arbitrator: string): Promise<TxHandle> {
  const contract = await getWriteContract();
  const tx = await contract.createEscrow(freelancer, arbitrator);
  return { hash: tx.hash, wait: () => tx.wait() };
}

export async function addMilestoneTx(escrowId: number, description: string, amount: string): Promise<TxHandle> {
  const contract = await getWriteContract();
  const value = ethers.parseEther(amount);
  const tx = await contract.addMilestone(escrowId, description, value);
  return { hash: tx.hash, wait: () => tx.wait() };
}

export async function fundEscrowTx(escrowId: number, amount: string): Promise<TxHandle> {
  const contract = await getWriteContract();
  const value = ethers.parseEther(amount);
  const tx = await contract.fundEscrow(escrowId, { value });
  return { hash: tx.hash, wait: () => tx.wait() };
}

export async function completeMilestoneTx(escrowId: number): Promise<TxHandle> {
  const contract = await getWriteContract();
  const tx = await contract.completeMilestone(escrowId);
  return { hash: tx.hash, wait: () => tx.wait() };
}

export async function approveMilestoneTx(escrowId: number): Promise<TxHandle> {
  const contract = await getWriteContract();
  const tx = await contract.approveMilestone(escrowId);
  return { hash: tx.hash, wait: () => tx.wait() };
}

export async function raiseDisputeTx(escrowId: number): Promise<TxHandle> {
  const contract = await getWriteContract();
  const bondAmount = await contract.DISPUTE_BOND();
  const tx = await contract.raiseDispute(escrowId, { value: bondAmount });
  return { hash: tx.hash, wait: () => tx.wait() };
}

export async function resolveDisputeTx(escrowId: number, clientPercent: number): Promise<TxHandle> {
  const contract = await getWriteContract();
  const tx = await contract.resolveDispute(escrowId, clientPercent);
  return { hash: tx.hash, wait: () => tx.wait() };
}

export async function expireDisputeTx(escrowId: number): Promise<TxHandle> {
  const contract = await getWriteContract();
  const tx = await contract.expireDispute(escrowId);
  return { hash: tx.hash, wait: () => tx.wait() };
}

export async function claimMilestoneTx(escrowId: number): Promise<TxHandle> {
  const contract = await getWriteContract();
  const tx = await contract.claimMilestone(escrowId);
  return { hash: tx.hash, wait: () => tx.wait() };
}

export async function cancelEscrowTx(escrowId: number): Promise<TxHandle> {
  const contract = await getWriteContract();
  const tx = await contract.cancelEscrow(escrowId);
  return { hash: tx.hash, wait: () => tx.wait() };
}