export enum EscrowState {
  Created = 0,
  Active = 1,
  Disputed = 2,
  Completed = 3,
  Cancelled = 4,
}

export const RESOLUTION_DELAY_SECONDS = 86400;       // 1 day
export const MAX_DISPUTE_DURATION_SECONDS = 2592000;  // 30 days
export const DISPUTE_BOND_ETH = "0.001";

export interface Escrow {
  id: string;
  client: string;
  freelancer: string;
  state: EscrowState;
  currentMilestone: number;
  milestoneCount: number;
  totalAmount: string;
  arbitrator: string;
  disputeTimeout: string;
  disputeRaisedAt: string;
  disputeRaiser: string;
  disputeBond: string;
}

export interface Milestone {
  description: string;
  amount: string;
  isCompleted: boolean;
  isApproved: boolean;
  completedAt: string;
  approvalTimeout: string;
}

export interface MilestoneInput {
  description: string;
  amount: string;
}

export interface EscrowWithMilestones extends Escrow {
  milestones: Milestone[];
}

export type EscrowFilter = "all" | "client" | "freelancer";
export type EscrowStatus = "active" | "completed" | "pending" | "disputed" | "funded" | "unfunded";

export interface DashboardStats {
  totalLocked: string;
  activeContracts: number;
  pendingMilestones: number;
  totalEscrows: number;
  completedEscrows: number;
  milestoneCompletionRate: string;
}

export interface CreateEscrowFormData {
  freelancer: string;
  arbitrator: string;
  milestones: MilestoneInput[];
}

export type TransactionStatus = "idle" | "pending" | "confirmed" | "failed";

export interface TransactionState {
  id: string;
  status: TransactionStatus;
  hash: string | null;
  error: string | null;
  label: string;
  createdAt: number;
  retry?: () => Promise<void>;
}

export interface Dispute {
  escrowId: string;
  client: string;
  freelancer: string;
  milestoneIndex: number;
  milestoneDescription: string;
  disputeTimeout: string;
  arbitrator: string;
  disputeRaisedAt: string;
  disputeRaiser: string;
  disputeBond: string;
}