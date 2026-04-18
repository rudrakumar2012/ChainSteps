import { ethers } from "ethers";
import { getProvider } from "./provider";
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