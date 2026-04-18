"use client";

import { Escrow, EscrowState, Milestone } from "@/types";
import { StatusBadge } from "../ui/StatusBadge";
import { ProgressBar } from "../ui/ProgressBar";
import { Button } from "../ui/Button";

interface ContractDetailProps {
  escrow: Escrow;
  milestones: Milestone[];
  currentAddress?: string | null;
  onBack: () => void;
  onFund?: (escrowId: string, amount: string) => void;
  onCompleteMilestone?: (escrowId: string, milestoneIndex: number) => void;
  onApproveMilestone?: (escrowId: string, milestoneIndex: number) => void;
  onDispute?: (escrowId: string) => void;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getEscrowStatus(escrow: Escrow): "active" | "completed" | "pending" | "disputed" {
  switch (escrow.state) {
    case EscrowState.Active:
      return "active";
    case EscrowState.Completed:
      return "completed";
    case EscrowState.Disputed:
      return "disputed";
    case EscrowState.Created:
      return "pending";
    default:
      return "pending";
  }
}

function getMilestoneStatus(milestone: Milestone): "funded" | "unfunded" | "completed" {
  if (milestone.isApproved) return "completed";
  if (milestone.isCompleted) return "completed"; // In review
  return "unfunded";
}

export function ContractDetail({
  escrow,
  milestones,
  currentAddress,
  onBack,
  onFund,
  onCompleteMilestone,
  onApproveMilestone,
  onDispute,
}: ContractDetailProps) {
  const isClient = currentAddress?.toLowerCase() === escrow.client.toLowerCase();
  const isFreelancer = currentAddress?.toLowerCase() === escrow.freelancer.toLowerCase();
  const progress = Math.round(
    (escrow.milestoneCount > 0 ? escrow.currentMilestone / escrow.milestoneCount : 0) * 100
  );

  const totalFunded = milestones.reduce((sum, m) =>
    m.isApproved ? sum + parseFloat(m.amount) : sum, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-white headline-font tracking-tight">
              Escrow #{escrow.id.slice(0, 8)}
            </h2>
            <StatusBadge status={getEscrowStatus(escrow)} />
          </div>
          <p className="text-sm text-on-surface-variant">
            {truncateAddress(escrow.client)} → {truncateAddress(escrow.freelancer)}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Total Value</p>
          <p className="text-2xl font-bold text-primary headline-font">{escrow.totalAmount} ETH</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Funded</p>
          <p className="text-2xl font-bold text-secondary headline-font">{totalFunded.toFixed(2)} ETH</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Milestones</p>
          <p className="text-2xl font-bold text-white headline-font">
            {escrow.currentMilestone}/{escrow.milestoneCount}
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Your Role</p>
          {isClient && <span className="text-sm font-bold text-primary">Client</span>}
          {isFreelancer && <span className="text-sm font-bold text-secondary">Freelancer</span>}
          {!isClient && !isFreelancer && <span className="text-sm text-on-surface-variant">—</span>}
        </div>
      </div>

      {/* Progress */}
      <div className="glass-card p-5">
        <ProgressBar value={progress} showLabel />
      </div>

      {/* Milestones Timeline */}
      <div className="glass-card p-5">
        <h3 className="text-lg font-bold text-white headline-font tracking-tight mb-6">
          Milestones
        </h3>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="relative">
              {/* Timeline connector */}
              {index < milestones.length - 1 && (
                <div className="absolute left-4 top-14 w-0.5 h-full bg-surface-container-highest" />
              )}

              <div className="flex gap-4">
                {/* Status indicator */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
                    ${milestone.isApproved
                      ? "bg-secondary text-on-secondary"
                      : milestone.isCompleted
                      ? "bg-tertiary text-on-tertiary"
                      : "bg-surface-container text-on-surface-variant"
                    }
                  `}
                >
                  {milestone.isApproved ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : milestone.isCompleted ? (
                    <span className="material-symbols-outlined text-sm">hourglass_top</span>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 bg-surface-container-low rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">{milestone.description}</p>
                      <p className="text-xs text-on-surface-variant">
                        {milestone.isApproved
                          ? "Approved"
                          : milestone.isCompleted
                          ? "In Review - Awaiting Approval"
                          : "Not Started"}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-primary headline-font">{milestone.amount} ETH</p>
                  </div>

                  {/* Action buttons for current milestone */}
                  {index === escrow.currentMilestone && escrow.state === EscrowState.Active && (
                    <div className="flex gap-2 mt-3 pt-3 bg-surface-container-low/30 -mx-4 -mb-4 px-4 pb-4 rounded-b-xl">
                      {isFreelancer && !milestone.isCompleted && !milestone.isApproved && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onCompleteMilestone?.(escrow.id, index)}
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Mark Complete
                        </Button>
                      )}
                      {isClient && milestone.isCompleted && !milestone.isApproved && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onApproveMilestone?.(escrow.id, index)}
                          >
                            <span className="material-symbols-outlined text-sm">thumb_up</span>
                            Approve & Release
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDispute?.(escrow.id)}
                          >
                            <span className="material-symbols-outlined text-sm">gavel</span>
                            Dispute
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fund Action */}
      {escrow.state === EscrowState.Created && isClient && (
        <div className="glass-card p-5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white mb-1">Fund This Escrow</p>
              <p className="text-xs text-on-surface-variant">
                Fund the escrow with {escrow.totalAmount} ETH to activate the contract.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => onFund?.(escrow.id, escrow.totalAmount)}
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              Fund {escrow.totalAmount} ETH
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}