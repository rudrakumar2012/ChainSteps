import { ethers } from "ethers";
import { config } from "../config/index.js";
import type { Escrow, Milestone } from "../types/index.js";

let provider: ethers.JsonRpcProvider | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(config.sepoliaRpcUrl);
  }
  return provider;
}

export async function getEscrow(escrowId: number): Promise<Escrow> {
  const contract = getContract();
  const escrow = await contract.getEscrow(escrowId);
  return {
    client: escrow[0],
    freelancer: escrow[1],
    state: Number(escrow[2]),
    currentMilestone: Number(escrow[3]),
    milestoneCount: Number(escrow[4]),
    totalAmount: escrow[5].toString(),
  };
}

export async function getMilestone(escrowId: number, milestoneId: number): Promise<Milestone> {
  const contract = getContract();
  const milestone = await contract.getMilestone(escrowId, milestoneId);
  return {
    description: milestone[0],
    amount: milestone[1].toString(),
    isCompleted: milestone[2],
    isApproved: milestone[3],
    completedAt: milestone[4].toString(),
    approvalTimeout: milestone[5].toString(),
  };
}

export async function getApprovalTimeout(escrowId: number): Promise<string> {
  const contract = getContract();
  const timeout = await contract.getApprovalTimeout(escrowId);
  return timeout.toString();
}

function getContract() {
  const abi = [
    "function getEscrow(uint256 _escrowId) external view returns (address client, address freelancer, uint8 state, uint256 currentMilestone, uint256 milestoneCount, uint256 totalAmount)",
    "function getMilestone(uint256 _escrowId, uint256 _milestoneId) external view returns (string description, uint256 amount, bool isCompleted, bool isApproved, uint256 completedAt, uint256 approvalTimeout)",
    "function getApprovalTimeout(uint256 _escrowId) external view returns (uint256)",
  ];
  return new ethers.Contract(config.contractAddress, abi, getProvider());
}
