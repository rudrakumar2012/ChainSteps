export enum EscrowState {
  Created = 0,
  Active = 1,
  Disputed = 2,
  Completed = 3,
  Cancelled = 4
}

export interface Escrow {
  id: string;
  client: string;
  freelancer: string;
  state: EscrowState;
  currentMilestone: number;
  milestoneCount: number;
  totalAmount: string;
  createdAt?: string;
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
}

export interface CreateEscrowFormData {
  freelancer: string;
  arbitrator?: string;
  milestones: MilestoneInput[];
}