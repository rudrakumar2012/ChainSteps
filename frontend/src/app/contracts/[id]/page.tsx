"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { EscrowState, Milestone } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useEscrowDetail } from "@/hooks";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import {
  fundEscrowTx,
  completeMilestoneTx,
  approveMilestoneTx,
  raiseDisputeTx,
  claimMilestoneTx,
  cancelEscrowTx,
} from "@/lib/contract";
import { ethers } from "ethers";

type MilestoneState = "released" | "in_review" | "funded" | "unfunded";

function getMilestoneState(milestone: Milestone, index: number, currentIndex: number, escrowState: EscrowState): MilestoneState {
  if (milestone.isApproved) return "released";
  if (milestone.isCompleted) return "in_review";
  if (escrowState !== EscrowState.Created && index <= currentIndex) return "funded";
  return "unfunded";
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { address } = useWalletContext();
  const { escrow, milestones, loading, error, refetch } = useEscrowDetail(id);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-primary text-3xl animate-spin">
            progress_activity
          </span>
        </div>
      </AppShell>
    );
  }

  if (error || !escrow) {
    return (
      <AppShell>
        <div className="glass-card p-8 text-center">
          <span className="material-symbols-outlined text-error text-3xl mb-3 block">error</span>
          <p className="text-sm text-error">{error || "Escrow not found"}</p>
        </div>
      </AppShell>
    );
  }

  const progress = Math.round(
    (escrow.milestoneCount > 0 ? escrow.currentMilestone / escrow.milestoneCount : 0) * 100
  );
  const isClient = address?.toLowerCase() === escrow.client.toLowerCase();
  const isFreelancer = address?.toLowerCase() === escrow.freelancer.toLowerCase();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const escrowIdNum = Number(escrow.id);

  const handleAction = async (label: string, fn: () => Promise<ethers.TransactionReceipt | null>) => {
    setPendingAction(label);
    setActionError(null);
    try {
      await fn();
      refetch();
    } catch (err: any) {
      setActionError(err?.reason || err?.message || `${label} failed`);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-on-surface-variant text-xs font-medium">
        <Link href="/contracts" className="hover:text-primary transition-colors">
          Contracts
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">Escrow #{escrow.id}</span>
      </div>

      {/* Header Section */}
      <div className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Contract ID: {escrow.id}
          </span>
          <h1 className="headline-font text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-on-surface mb-2">
            Escrow #{escrow.id}
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-light leading-relaxed">
            {truncateAddress(escrow.client)} → {truncateAddress(escrow.freelancer)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-on-surface-variant text-sm font-medium mb-1">Total Escrow Value</div>
          <div className="headline-font text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface">
            {escrow.totalAmount} <span className="text-primary-container">ETH</span>
          </div>
          {escrow.state === EscrowState.Active && (
            <div className="text-[10px] text-secondary font-bold flex items-center justify-end gap-1 mt-1">
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              FULLY FUNDED
            </div>
          )}
          {escrow.state === EscrowState.Created && (
            <div className="text-[10px] text-on-surface-variant font-bold flex items-center justify-end gap-1 mt-1">
              Awaiting Funding
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Timeline Section (Col 8) */}
        <div className="md:col-span-8 space-y-8">
          <div className="bg-surface-container rounded-xl p-8 backdrop-blur-md relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h2 className="headline-font text-xl font-bold flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full" />
                Contract Milestones
              </h2>
            </div>

            {/* Vertical Stepper */}
            <div className="relative ml-4">
              {/* Dashed Line */}
              <div className="absolute left-[11px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-outline-variant/40" />

              {milestones.map((milestone, index) => {
                const state = getMilestoneState(milestone, index, escrow.currentMilestone, escrow.state);
                const isActive = state === "in_review";
                const isReleased = state === "released";
                const isFunded = state === "funded";

                return (
                  <div
                    key={index}
                    className={`relative flex gap-8 ${index < milestones.length - 1 ? "mb-12" : ""}`}
                  >
                    {/* Dot */}
                    <div className="relative z-10 mt-1">
                      {isReleased && (
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-[16px] font-bold">
                            check
                          </span>
                        </div>
                      )}
                      {isActive && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(76,215,246,0.5)]">
                          <div className="w-2 h-2 rounded-full bg-on-primary" />
                        </div>
                      )}
                      {isFunded && (
                        <div className="w-6 h-6 rounded-full border-2 border-outline-variant bg-surface-container" />
                      )}
                      {state === "unfunded" && (
                        <div className="w-6 h-6 rounded-full border-2 border-outline-variant bg-surface-container" />
                      )}
                    </div>

                    {/* Card */}
                    <div
                      className={`flex-1 rounded-xl p-6 transition-all ${
                        isActive
                          ? "bg-surface-container-high border-2 border-primary/20 shadow-2xl shadow-primary/5"
                          : isReleased
                          ? "bg-surface-container-high/40 border border-outline-variant/10 hover:bg-surface-container-high/60"
                          : "bg-surface-container-high/40 border border-outline-variant/10"
                      } ${state === "unfunded" ? "opacity-40" : isFunded ? "opacity-60" : ""}`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <h3
                          className={`text-lg font-semibold ${
                            isActive ? "text-primary font-bold" : "text-white"
                          }`}
                        >
                          {milestone.description}
                        </h3>
                        <StatusBadge
                          status={
                            isReleased
                              ? "completed"
                              : isActive
                              ? "active"
                              : isFunded
                              ? "funded"
                              : "unfunded"
                          }
                          label={
                            isReleased
                              ? "RELEASED"
                              : isActive
                              ? "IN REVIEW"
                              : isFunded
                              ? "FUNDED"
                              : "UNFUNDED"
                          }
                        />
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-on-surface-variant font-medium">
                        {milestone.completedAt && milestone.completedAt !== "0" && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">event</span>
                            {new Date(Number(milestone.completedAt) * 1000).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          {milestone.amount} ETH
                        </span>
                      </div>

                      {/* Action Buttons */}
                      {isActive && isClient && (
                        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-surface-container-lowest/50 mt-4">
                          <button
                            onClick={() => handleAction("Approve", () => approveMilestoneTx(escrowIdNum))}
                            disabled={!!pendingAction}
                            className="flex-1 bg-secondary text-on-secondary font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {pendingAction === "Approve" ? (
                              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-[20px]">verified_user</span>
                            )}
                            {pendingAction === "Approve" ? "Confirming..." : "Approve & Pay"}
                          </button>
                          <button
                            onClick={() => handleAction("Dispute", () => raiseDisputeTx(escrowIdNum))}
                            disabled={!!pendingAction}
                            className="flex-1 border border-error/50 text-error font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-error/10 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                            Initiate Dispute
                          </button>
                        </div>
                      )}
                      {isActive && isFreelancer && !milestones[index].isCompleted && (
                        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-surface-container-lowest/50 mt-4">
                          <button
                            onClick={() => handleAction("Complete", () => completeMilestoneTx(escrowIdNum))}
                            disabled={!!pendingAction}
                            className="flex-1 bg-primary text-on-primary font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {pendingAction === "Complete" ? (
                              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            )}
                            {pendingAction === "Complete" ? "Confirming..." : "Mark Complete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fund Escrow (Created state) */}
          {escrow.state === EscrowState.Created && isClient && (
            <div className="bg-surface-container rounded-xl p-8 border border-primary/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white headline-font mb-1">Fund This Escrow</h3>
                  <p className="text-sm text-on-surface-variant">
                    Send {escrow.totalAmount} ETH to activate the contract.
                  </p>
                </div>
                <button
                  onClick={() => handleAction("Fund", () => fundEscrowTx(escrowIdNum, escrow.totalAmount))}
                  disabled={!!pendingAction}
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-3 px-6 rounded-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {pendingAction === "Fund" ? (
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                  )}
                  {pendingAction === "Fund" ? "Confirming..." : `Fund ${escrow.totalAmount} ETH`}
                </button>
              </div>
            </div>
          )}

          {/* Cancel Escrow (Created state, client only) */}
          {escrow.state === EscrowState.Created && isClient && (
            <div className="p-4">
              <button
                onClick={() => handleAction("Cancel", () => cancelEscrowTx(escrowIdNum))}
                disabled={!!pendingAction}
                className="text-on-surface-variant hover:text-error text-xs font-bold transition-colors disabled:opacity-50"
              >
                Cancel Escrow
              </button>
            </div>
          )}

          {/* Claim Milestone (after timeout) */}
          {escrow.state === EscrowState.Active && isFreelancer && milestones[escrow.currentMilestone]?.isCompleted && !milestones[escrow.currentMilestone]?.isApproved && (
            <div className="bg-surface-container rounded-xl p-6 border border-tertiary/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white headline-font mb-1">Claim Milestone</h3>
                  <p className="text-xs text-on-surface-variant">
                    If approval timeout has passed, you can claim the milestone.
                  </p>
                </div>
                <button
                  onClick={() => handleAction("Claim", () => claimMilestoneTx(escrowIdNum))}
                  disabled={!!pendingAction}
                  className="bg-tertiary text-on-tertiary font-bold py-2 px-4 rounded-md text-sm flex items-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {pendingAction === "Claim" ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">redeem</span>
                  )}
                  {pendingAction === "Claim" ? "Confirming..." : "Claim"}
                </button>
              </div>
            </div>
          )}

          {/* Action Error */}
          {actionError && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{actionError}</p>
            </div>
          )}
        </div>

        {/* Side Panel (Col 4) */}
        <div className="md:col-span-4 space-y-8">
          {/* Project Participants */}
          <div className="bg-surface-container-high/60 rounded-xl overflow-hidden border border-outline-variant/10">
            <div className="p-6">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest mb-4">
                Project Participants
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs border border-outline-variant/20">
                    {escrow.client.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-none">Client</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">
                      {truncateAddress(escrow.client)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs border border-outline-variant/20">
                    {escrow.freelancer.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-none">Freelancer</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">
                      {truncateAddress(escrow.freelancer)}
                    </div>
                  </div>
                </div>
                {escrow.arbitrator && escrow.arbitrator !== "0x0000000000000000000000000000000000000000" && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs border border-outline-variant/20">
                      {escrow.arbitrator.slice(2, 4).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-none">Arbitrator</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">
                        {truncateAddress(escrow.arbitrator)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-8 pt-6 border-t border-outline-variant/10">
                <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase mb-2">
                  <span>Contract Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_10px_rgba(76,215,246,0.3)] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 flex items-start gap-3">
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
            <div>
              <div className="text-[11px] font-bold text-secondary uppercase">
                Secured by ChainSteps
              </div>
              <p className="text-[10px] text-on-surface-variant leading-tight mt-1">
                Funds are held in a smart contract. Released only upon verification or
                mutual agreement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}