export interface Escrow {
  client: string;
  freelancer: string;
  state: number;
  currentMilestone: number;
  milestoneCount: number;
  totalAmount: string;
}

export interface Milestone {
  description: string;
  amount: string;
  isCompleted: boolean;
  isApproved: boolean;
  completedAt: string;
  approvalTimeout: string;
}

export enum EscrowState {
  Created = 0,
  Active = 1,
  Disputed = 2,
  Completed = 3,
  Cancelled = 4
}

export interface CreateEscrowRequest {
  freelancer: string;
  arbitrator?: string;
}

export interface AddMilestoneRequest {
  description: string;
  amount: string;
}

export interface FundEscrowRequest {
  amount: string;
}

export interface ResolveDisputeRequest {
  clientPercent: number;
}

export interface TransactionResult {
  success: boolean;
  message?: string;
}
