"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { StatusBadge } from "@/components/ui/StatusBadge";

type DisputeStatus = "under_review" | "resolved" | "escalated";

interface Dispute {
  id: string;
  contractId: string;
  contractTitle: string;
  milestoneIndex: number;
  milestoneDescription: string;
  reason: string;
  status: DisputeStatus;
  evidenceCount: number;
  initiatedAt: string;
  resolvedAt?: string;
  resolution?: string;
}

const mockDisputes: Dispute[] = [
  {
    id: "DSP-001",
    contractId: "CS-772-ML",
    contractTitle: "Liquidity Pool UI",
    milestoneIndex: 2,
    milestoneDescription: "API Integration",
    reason: "Freelancer claims work is complete but deliverables don't match specification. Core smart contract read functions are missing.",
    status: "under_review",
    evidenceCount: 3,
    initiatedAt: "2024-01-15",
  },
  {
    id: "DSP-002",
    contractId: "CS-445-TZ",
    contractTitle: "NFT Marketplace",
    milestoneIndex: 1,
    milestoneDescription: "Smart Contract Audit",
    reason: "Client disputes the quality of the security audit report, citing insufficient coverage of edge cases.",
    status: "escalated",
    evidenceCount: 5,
    initiatedAt: "2024-01-02",
  },
  {
    id: "DSP-003",
    contractId: "CS-331-KR",
    contractTitle: "DeFi Yield Aggregator",
    milestoneIndex: 3,
    milestoneDescription: "Testing & QA",
    reason: "Disagreement over test coverage requirements. Contract specified 90% but delivered 72%.",
    status: "resolved",
    evidenceCount: 4,
    initiatedAt: "2023-12-10",
    resolvedAt: "2024-01-08",
    resolution: "Split release: 72% of milestone amount released, remainder refunded to client.",
  },
  {
    id: "DSP-004",
    contractId: "CS-220-PQ",
    contractTitle: "Governance Dashboard",
    milestoneIndex: 2,
    milestoneDescription: "Voting Mechanism",
    reason: "Client filed dispute after freelancer missed two consecutive deadlines without communication.",
    status: "resolved",
    evidenceCount: 2,
    initiatedAt: "2023-11-20",
    resolvedAt: "2023-12-15",
    resolution: "Full refund issued to client. Contract cancelled.",
  },
];

const filterOptions: { value: "all" | DisputeStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "under_review", label: "Under Review" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
];

function getStatusBadge(status: DisputeStatus) {
  switch (status) {
    case "under_review":
      return <StatusBadge status="active" label="Under Review" />;
    case "escalated":
      return <StatusBadge status="disputed" label="Escalated" />;
    case "resolved":
      return <StatusBadge status="completed" label="Resolved" />;
  }
}

function getStatusIcon(status: DisputeStatus) {
  switch (status) {
    case "under_review":
      return "pending_actions";
    case "escalated":
      return "priority_high";
    case "resolved":
      return "check_circle";
  }
}

export default function DisputesPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"all" | DisputeStatus>("all");

  const filtered = mockDisputes.filter((d) => {
    if (activeFilter === "all") return true;
    return d.status === activeFilter;
  });

  const underReview = mockDisputes.filter((d) => d.status === "under_review").length;
  const escalated = mockDisputes.filter((d) => d.status === "escalated").length;
  const resolved = mockDisputes.filter((d) => d.status === "resolved").length;

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

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
            Escalated
          </p>
          <p className="text-3xl font-bold text-white headline-font">
            {String(escalated).padStart(2, "0")}
          </p>
          <div className="mt-4 flex items-center text-error text-xs font-bold">
            <span className="material-symbols-outlined text-sm mr-1">priority_high</span>
            Requires attention
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
          {filtered.map((dispute) => (
            <div
              key={dispute.id}
              className="glass-card rounded-2xl border border-white/5 shadow-xl overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-surface-container-high/50 px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      dispute.status === "under_review"
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : dispute.status === "escalated"
                        ? "bg-error/10 border-error/30 text-error"
                        : "bg-secondary/10 border-secondary/30 text-secondary"
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {getStatusIcon(dispute.status)}
                    </span>
                  </div>
                  <div>
                    <h3 className="headline-font text-lg font-bold text-white">
                      {dispute.contractTitle}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant font-medium">
                      Dispute {dispute.id} &middot; Contract {dispute.contractId}
                    </p>
                  </div>
                </div>
                {getStatusBadge(dispute.status)}
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
                      #{dispute.milestoneIndex + 1}: {dispute.milestoneDescription}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    Reason
                  </p>
                  <p className="text-sm text-on-surface leading-relaxed">{dispute.reason}</p>
                </div>

                {/* Resolution (if resolved) */}
                {dispute.resolution && (
                  <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4">
                    <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">
                      Resolution
                    </p>
                    <p className="text-sm text-on-surface leading-relaxed">
                      {dispute.resolution}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-2">
                      Resolved on {dispute.resolvedAt}
                    </p>
                  </div>
                )}

                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[11px] text-on-surface-variant font-medium pt-2">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">event</span>
                    Filed: {dispute.initiatedAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">folder</span>
                    {dispute.evidenceCount} evidence file{dispute.evidenceCount !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => router.push(`/contracts/${dispute.contractId}`)}
                    className="ml-auto px-4 py-1.5 rounded-lg bg-surface-container-high text-xs font-bold text-white border border-white/5 hover:border-primary/50 transition-all hover:bg-surface-container-highest active:scale-95"
                  >
                    View Contract
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Background Accents */}
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-error/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0" />
    </AppShell>
  );
}