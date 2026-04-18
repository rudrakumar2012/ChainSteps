"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useEscrows } from "@/hooks";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { EscrowState, Dispute } from "@/types";

type DisputeStatus = "under_review" | "resolved";

const filterOptions: { value: "all" | DisputeStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "under_review", label: "Under Review" },
  { value: "resolved", label: "Resolved" },
];

function buildDisputess(escrows: { id: string; client: string; freelancer: string; state: EscrowState; currentMilestone: number; disputeTimeout: string; arbitrator: string }[]): Dispute[] {
  return escrows
    .filter((e) => e.state === EscrowState.Disputed)
    .map((e) => ({
      escrowId: e.id,
      client: e.client,
      freelancer: e.freelancer,
      milestoneIndex: e.currentMilestone,
      milestoneDescription: `Milestone #${e.currentMilestone}`,
      disputeTimeout: e.disputeTimeout,
      arbitrator: e.arbitrator,
    }));
}

function getDisputeStatus(dispute: Dispute): DisputeStatus {
  return "under_review";
}

function getStatusBadge(status: DisputeStatus) {
  switch (status) {
    case "under_review":
      return <StatusBadge status="active" label="Under Review" />;
    case "resolved":
      return <StatusBadge status="completed" label="Resolved" />;
  }
}

function getStatusIcon(status: DisputeStatus) {
  switch (status) {
    case "under_review":
      return "pending_actions";
    case "resolved":
      return "check_circle";
  }
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function DisputesPage() {
  const router = useRouter();
  const { address, isConnected } = useWalletContext();
  const { data: escrows, loading, error } = useEscrows(isConnected ? address : undefined);
  const [activeFilter, setActiveFilter] = useState<"all" | DisputeStatus>("all");

  const disputes = buildDisputess(escrows);
  const filtered = disputes.filter((d) => {
    if (activeFilter === "all") return true;
    return getDisputeStatus(d) === activeFilter;
  });

  const underReview = disputes.filter((d) => getDisputeStatus(d) === "under_review").length;
  const resolved = disputes.filter((d) => getDisputeStatus(d) === "resolved").length;

  return (
    <AppShell>
      {/* Page Header */}
      <div className="mb-12">
        <h2 className="headline-font text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] leading-none font-bold text-white -ml-1">
          Disputes
        </h2>
        <p className="text-primary tracking-[0.3em] font-medium text-xs mt-2">
          RESOLUTION &amp; ARBITRATION
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-primary text-3xl animate-spin">
            progress_activity
          </span>
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center">
          <span className="material-symbols-outlined text-error text-3xl mb-3 block">error</span>
          <p className="text-sm text-error">{error}</p>
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-xl">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">
                Under Review
              </p>
              <p className="text-3xl font-bold text-white headline-font">
                {String(underReview).padStart(2, "0")}
              </p>
              <div className="mt-4 flex items-center text-primary text-xs font-bold">
                <span className="material-symbols-outlined text-sm mr-1">hourglass_top</span>
                Awaiting arbitration
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-xl">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">
                Resolved
              </p>
              <p className="text-3xl font-bold text-white headline-font">
                {String(resolved).padStart(2, "0")}
              </p>
              <div className="mt-4 flex items-center text-secondary text-xs font-bold">
                <span className="material-symbols-outlined text-sm mr-1">verified</span>
                Successfully closed
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-surface-container-low p-1.5 rounded-xl border border-white/5 mb-8 w-fit">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`
                  px-6 py-2 rounded-lg text-xs font-bold transition-colors
                  ${
                    activeFilter === option.value
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-white"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Dispute Cards */}
          {filtered.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3 block">
                gavel
              </span>
              <p className="text-sm text-on-surface-variant">No disputes found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((dispute) => {
                const status = getDisputeStatus(dispute);
                return (
                  <div
                    key={dispute.escrowId}
                    className="glass-card rounded-2xl border border-white/5 shadow-xl overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="bg-surface-container-high/50 px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-primary/10 border-primary/30 text-primary">
                          <span className="material-symbols-outlined">
                            {getStatusIcon(status)}
                          </span>
                        </div>
                        <div>
                          <h3 className="headline-font text-lg font-bold text-white">
                            Escrow #{dispute.escrowId}
                          </h3>
                          <p className="text-[10px] text-on-surface-variant font-medium">
                            {truncateAddress(dispute.client)} vs {truncateAddress(dispute.freelancer)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(status)}
                    </div>

                    {/* Card Body */}
                    <div className="px-4 sm:px-8 py-6 space-y-4">
                      {/* Disputed Milestone */}
                      <div className="flex items-center gap-3 bg-surface-container-low rounded-xl p-4">
                        <span className="material-symbols-outlined text-primary">flag</span>
                        <div>
                          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                            Disputed Milestone
                          </p>
                          <p className="text-sm text-white">
                            {dispute.milestoneDescription}
                          </p>
                        </div>
                      </div>

                      {/* Meta Row */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] text-on-surface-variant font-medium pt-2">
                        {dispute.arbitrator && dispute.arbitrator !== "0x0000000000000000000000000000000000000000" && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">gavel</span>
                            Arbitrator: {truncateAddress(dispute.arbitrator)}
                          </span>
                        )}
                        <button
                          onClick={() => router.push(`/contracts/${dispute.escrowId}`)}
                          className="ml-auto px-4 py-1.5 rounded-lg bg-surface-container-high text-xs font-bold text-white border border-white/5 hover:border-primary/50 transition-all hover:bg-surface-container-highest active:scale-95"
                        >
                          View Contract
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Background Accents */}
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-error/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
    </AppShell>
  );
}