import { ethers } from "ethers";
import { getProvider, getReadOnlyProvider } from "./provider";
import ABI from "./abi.json";
import type { Escrow, Milestone, EscrowState } from "@/types";

export const CONTRACT_ADDRESS = "0x7b2D41F3A7592c55CB73502ddECf8F84289e9021";

export function getReadContract(): ethers.Contract {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
}

export async function getWriteContract(): Promise<ethers.Contract> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

export async function fetchEscrow(id: number): Promise<Escrow> {
  const contract = getReadContract();
  const raw = await contract.getEscrow(id);
  return {
    id: String(id),
    client: raw.client as string,
    freelancer: raw.freelancer as string,
    state: Number(raw.state) as EscrowState,
    currentMilestone: Number(raw.currentMilestone),
    milestoneCount: Number(raw.milestoneCount),
    totalAmount: ethers.formatEther(raw.totalAmount),
    arbitrator: ethers.ZeroAddress,
    disputeTimeout: "0",
  };
}

export async function fetchEscrowFull(id: number): Promise<Escrow> {
  const contract = getReadContract();
  const [getEscrowData, escrowData] = await Promise.all([
    contract.getEscrow(id),
    contract.escrows(id),
  ]);
  return {
    id: String(id),
    client: getEscrowData.client as string,
    freelancer: getEscrowData.freelancer as string,
    state: Number(getEscrowData.state) as EscrowState,
    currentMilestone: Number(getEscrowData.currentMilestone),
    milestoneCount: Number(getEscrowData.milestoneCount),
    totalAmount: ethers.formatEther(getEscrowData.totalAmount),
    arbitrator: escrowData.arbitrator as string,
    disputeTimeout: escrowData.disputeTimeout.toString(),
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
  const promises = Array.from({ length: count }, (_, i) => fetchEscrowFull(i));
  return Promise.all(promises);
}

export async function fetchEscrowsByAddress(address: string): Promise<Escrow[]> {
  const all = await fetchAllEscrows();
  const lower = address.toLowerCase();
  return all.filter(
    (e) => e.client.toLowerCase() === lower || e.freelancer.toLowerCase() === lower
  );
}

// Public (no wallet) contract reader for homepage stats

export function getPublicReadContract(): ethers.Contract {
  const provider = getReadOnlyProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
}

export async function fetchAllEscrowsPublic(): Promise<Escrow[]> {
  const contract = getPublicReadContract();
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
  const promises = Array.from({ length: count }, (_, i) => {
    return (async () => {
      const [getEscrowData, escrowData] = await Promise.all([
        contract.getEscrow(i),
        contract.escrows(i),
      ]);
      return {
        id: String(i),
        client: getEscrowData.client as string,
        freelancer: getEscrowData.freelancer as string,
        state: Number(getEscrowData.state) as EscrowState,
        currentMilestone: Number(getEscrowData.currentMilestone),
        milestoneCount: Number(getEscrowData.milestoneCount),
        totalAmount: ethers.formatEther(getEscrowData.totalAmount),
        arbitrator: escrowData.arbitrator as string,
        disputeTimeout: escrowData.disputeTimeout.toString(),
      };
    })();
  });
  return Promise.all(promises);
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
  const tx = await contract.raiseDispute(escrowId);
  return { hash: tx.hash, wait: () => tx.wait() };
}

export async function resolveDisputeTx(escrowId: number, clientPercent: number): Promise<TxHandle> {
  const contract = await getWriteContract();
  const tx = await contract.resolveDispute(escrowId, clientPercent);
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