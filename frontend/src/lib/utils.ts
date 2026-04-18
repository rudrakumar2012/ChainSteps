import { EscrowState } from "@/types";

export type EscrowStatusLabel = "active" | "completed" | "pending" | "disputed" | "cancelled";

export function getEscrowStatus(escrow: { state: EscrowState }): EscrowStatusLabel {
  switch (escrow.state) {
    case EscrowState.Active: return "active";
    case EscrowState.Completed: return "completed";
    case EscrowState.Disputed: return "disputed";
    case EscrowState.Cancelled: return "cancelled";
    case EscrowState.Created: return "pending";
    default: return "pending";
  }
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function escrowProgress(currentMilestone: number, milestoneCount: number): number {
  return Math.round((milestoneCount > 0 ? currentMilestone / milestoneCount : 0) * 100);
}