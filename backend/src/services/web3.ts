import { ethers } from "ethers";
import { config } from "../config/index.js";
import type { Escrow, Milestone } from "../types/index.js";

let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(config.sepoliaRpcUrl);
  }
  return provider;
}

export function getWallet(): ethers.Wallet {
  if (!wallet) {
    wallet = new ethers.Wallet(config.privateKey, getProvider());
  }
  return wallet;
}

// Read operations
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

// Write operations
export async function createEscrow(freelancer: string, arbitrator?: string): Promise<number> {
  const contract = getContractWithSigner();
  const tx = await contract.createEscrow(freelancer, arbitrator || ethers.ZeroAddress);
  const receipt = await tx.wait();
  const event = receipt?.logs[0];
  const parsed = contract.interface.parseLog(event);
  const escrowId = Number(parsed?.args[0]);
  return escrowId;
}

export async function addMilestone(escrowId: number, description: string, amount: string): Promise<void> {
  const contract = getContractWithSigner();
  const value = ethers.parseEther(amount);
  const tx = await contract.addMilestone(escrowId, description, value);
  await tx.wait();
}

export async function fundEscrow(escrowId: number, amount: string): Promise<void> {
  const contract = getContractWithSigner();
  const value = ethers.parseEther(amount);
  const tx = await contract.fundEscrow(escrowId, { value });
  await tx.wait();
}

export async function completeMilestone(escrowId: number): Promise<void> {
  const contract = getContractWithSigner();
  const tx = await contract.completeMilestone(escrowId);
  await tx.wait();
}

export async function approveMilestone(escrowId: number): Promise<void> {
  const contract = getContractWithSigner();
  const tx = await contract.approveMilestone(escrowId);
  await tx.wait();
}

export async function raiseDispute(escrowId: number): Promise<void> {
  const contract = getContractWithSigner();
  const tx = await contract.raiseDispute(escrowId);
  await tx.wait();
}

export async function resolveDispute(escrowId: number, clientPercent: number): Promise<void> {
  const contract = getContractWithSigner();
  const tx = await contract.resolveDispute(escrowId, clientPercent);
  await tx.wait();
}

export async function claimMilestone(escrowId: number): Promise<void> {
  const contract = getContractWithSigner();
  const tx = await contract.claimMilestone(escrowId);
  await tx.wait();
}

// Internal
function getContract() {
  const abi = [
    "function getEscrow(uint256 _escrowId) external view returns (address client, address freelancer, uint8 state, uint256 currentMilestone, uint256 milestoneCount, uint256 totalAmount)",
    "function getMilestone(uint256 _escrowId, uint256 _milestoneId) external view returns (string description, uint256 amount, bool isCompleted, bool isApproved, uint256 completedAt, uint256 approvalTimeout)",
    "function getApprovalTimeout(uint256 _escrowId) external view returns (uint256)",
  ];
  return new ethers.Contract(config.contractAddress, abi, getProvider());
}

function getContractWithSigner() {
  const abi = [
    "function createEscrow(address _freelancer, address _arbitrator) external returns (uint256)",
    "function addMilestone(uint256 _escrowId, string calldata _description, uint256 _amount) external",
    "function fundEscrow(uint256 _escrowId) external payable",
    "function completeMilestone(uint256 _escrowId) external",
    "function approveMilestone(uint256 _escrowId) external",
    "function raiseDispute(uint256 _escrowId) external",
    "function resolveDispute(uint256 _escrowId, uint256 _clientPercent) external",
    "function claimMilestone(uint256 _escrowId) external",
  ];
  return new ethers.Contract(config.contractAddress, abi, getWallet());
}
