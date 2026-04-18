"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { EscrowState, Milestone } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

// Mock data — will be replaced with real on-chain data
function getMockEscrow(id: string) {
  return {
    id,
    client: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    freelancer: "0x8626f214e5FaB0Fa2dE47a0e5f3C4c7d8a9b0c12",
    state: EscrowState.Active,
    currentMilestone: 1,
    milestoneCount: 4,
    totalAmount: "5.50",
    title: "DEX Frontend Dev",
    description:
      "Development of a high-performance, responsive React frontend for the upcoming Genesis DEX protocol.",
  };
}

const mockMilestones: Milestone[] = [
  {
    description: "UI Mockups",
    amount: "1.00",
    isCompleted: true,
    isApproved: true,
    completedAt: "2023-10-12",
    approvalTimeout: "72h",
  },
  {
    description: "Frontend Setup",
    amount: "1.50",
    isCompleted: true,
    isApproved: false,
    completedAt: "2023-11-05",
    approvalTimeout: "72h",
  },
  {
    description: "API Integration",
    amount: "2.00",
    isCompleted: false,
    isApproved: false,
    completedAt: "",
    approvalTimeout: "72h",
  },
  {
    description: "Deployment",
    amount: "1.00",
    isCompleted: false,
    isApproved: false,
    completedAt: "",
    approvalTimeout: "72h",
  },
];

const mockEvidence = [
  {
    milestoneIndex: 0,
    label: "MILESTONE 1",
    ipfsHash: "ipfs://QmXoyp...32jN7",
    description: "Figma Prototype Assets",
  },
  {
    milestoneIndex: 1,
    label: "MILESTONE 2 (CURRENT)",
    ipfsHash: "ipfs://QmTz9k...R9s2z",
    description: "GitHub Commit #82a1c",
  },
];

type MilestoneState = "released" | "in_review" | "funded" | "unfunded";

function getMilestoneState(milestone: Milestone, index: number, currentIndex: number): MilestoneState {
  if (milestone.isApproved) return "released";
  if (milestone.isCompleted) return "in_review";
  if (index <= currentIndex) return "funded";
  return "unfunded";
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const escrow = getMockEscrow(id);
  const progress = Math.round(
    (escrow.milestoneCount > 0 ? escrow.currentMilestone / escrow.milestoneCount : 0) * 100
  );

  return (
    <AppShell>
      {/* Breadcrumb (overlaps TopBar area) */}
      <div className="mb-4 flex items-center gap-2 text-on-surface-variant text-xs font-medium">
        <Link href="/contracts" className="hover:text-primary transition-colors">
          Contracts
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-bold">{escrow.title}</span>
      </div>

      {/* Header Section */}
      <div className="mb-12 flex justify-between items-end">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            Contract ID: {escrow.id}
          </span>
          <h1 className="headline-font text-5xl font-bold tracking-tighter text-on-surface mb-2">
            {escrow.title}
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg font-light leading-relaxed">
            {escrow.description}
          </p>
        </div>
        <div className="text-right">
          <div className="text-on-surface-variant text-sm font-medium mb-1">Total Escrow Value</div>
          <div className="headline-font text-4xl font-bold text-on-surface">
            {escrow.totalAmount} <span className="text-primary-container">ETH</span>
          </div>
          <div className="text-[10px] text-secondary font-bold flex items-center justify-end gap-1 mt-1">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            FULLY FUNDED
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Timeline Section (Col 8) */}
        <div className="col-span-8 space-y-8">
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

              {mockMilestones.map((milestone, index) => {
                const state = getMilestoneState(milestone, index, escrow.currentMilestone);
                const isActive = state === "in_review";
                const isReleased = state === "released";
                const isFunded = state === "funded";

                return (
                  <div
                    key={index}
                    className={`relative flex gap-8 ${index < mockMilestones.length - 1 ? "mb-12" : ""}`}
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
                      <div className="flex justify-between items-start mb-2">
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

                      {isReleased && (
                        <p className="text-sm text-on-surface-variant mb-4">
                          Complete Figma design system and high-fidelity prototypes.
                        </p>
                      )}
                      {isActive && (
                        <p className="text-on-surface leading-relaxed mb-6">
                          Initial codebase setup with Tailwind CSS, Wagmi integration, and basic
                          routing framework.
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-on-surface-variant font-medium">
                        {milestone.completedAt && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">event</span>
                            {milestone.completedAt}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          {milestone.amount} ETH
                        </span>
                      </div>

                      {/* Action Buttons for Active Milestone */}
                      {isActive && (
                        <div className="flex gap-4 p-4 rounded-lg bg-surface-container-lowest/50 mt-4">
                          <button
                            onClick={() => console.log("Approve milestone", index)}
                            className="flex-1 bg-secondary text-on-secondary font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              verified_user
                            </span>
                            Approve &amp; Pay
                          </button>
                          <button
                            onClick={() => console.log("Dispute milestone", index)}
                            className="flex-1 border border-error/50 text-error font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-error/10 active:scale-[0.98] transition-all"
                          >
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                            Initiate Dispute
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Panel (Col 4) */}
        <div className="col-span-4 space-y-8">
          {/* Evidence Links */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">
              Evidence Links
            </h3>
            <div className="space-y-4">
              {mockEvidence.map((evidence, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-lg bg-surface-container-high border border-outline-variant/5 hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-[10px] font-bold ${
                        evidence.milestoneIndex === escrow.currentMilestone
                          ? "text-primary"
                          : "text-secondary"
                      }`}
                    >
                      {evidence.label}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                      open_in_new
                    </span>
                  </div>
                  <div className="text-xs font-mono text-on-surface-variant break-all">
                    {evidence.ipfsHash}
                  </div>
                  <div className="text-[10px] text-outline mt-1 italic">
                    {evidence.description}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-[10px] font-bold text-outline-variant uppercase tracking-widest border border-dashed border-outline-variant/40 rounded hover:bg-white/5 transition-all">
              View All Evidence
            </button>
          </div>

          {/* Project Participants */}
          <div className="bg-surface-container-high/60 rounded-xl overflow-hidden border border-outline-variant/10">
            <div className="p-6">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-widest mb-4">
                Project Participants
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs border border-outline-variant/20">
                    {truncateAddress(escrow.client).slice(0, 6)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-none">Client</div>
                    <div className="text-[10px] text-on-surface-variant italic">
                      Genesis Protocol DAO
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs border border-outline-variant/20">
                    {truncateAddress(escrow.freelancer).slice(0, 6)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-none">Freelancer</div>
                    <div className="text-[10px] text-on-surface-variant italic">
                      StarkBuild Dev Team
                    </div>
                  </div>
                </div>
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
                Funds are held in a multi-sig smart contract. Released only upon verification or
                mutual agreement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}