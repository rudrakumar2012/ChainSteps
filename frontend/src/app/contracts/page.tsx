"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { Escrow, EscrowState, EscrowFilter } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

// Mock data — will be replaced with real on-chain data
const mockEscrows: Escrow[] = [
  {
    id: "CS-992-PX",
    client: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    freelancer: "0x8626f214e5FaB0Fa2dE47a0e5f3C4c7d8a9b0c12",
    state: EscrowState.Active,
    currentMilestone: 3,
    milestoneCount: 5,
    totalAmount: "4.20",
  },
  {
    id: "CS-881-ZQ",
    client: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    freelancer: "0x9536f214e5FaB0Fa2dE47a0e5f3C4c7d8a9b0c34",
    state: EscrowState.Completed,
    currentMilestone: 4,
    milestoneCount: 4,
    totalAmount: "8.50",
  },
  {
    id: "CS-772-ML",
    client: "0x123d35Cc6634C0532925a3b844Bc9e7595f8fC45",
    freelancer: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    state: EscrowState.Disputed,
    currentMilestone: 2,
    milestoneCount: 3,
    totalAmount: "2.15",
  },
  {
    id: "CS-643-AB",
    client: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    freelancer: "0xabcd6f214e5FaB0Fa2dE47a0e5f3C4c7d8a9b0c56",
    state: EscrowState.Active,
    currentMilestone: 1,
    milestoneCount: 4,
    totalAmount: "3.75",
  },
  {
    id: "CS-514-QR",
    client: "0x9876e5FaB0Fa2dE47a0e5f3C4c7d8a9b0c67",
    freelancer: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    state: EscrowState.Active,
    currentMilestone: 2,
    milestoneCount: 6,
    totalAmount: "6.00",
  },
  {
    id: "CS-445-TZ",
    client: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    freelancer: "0xdef16f214e5FaB0Fa2dE47a0e5f3C4c7d8a9b0c78",
    state: EscrowState.Completed,
    currentMilestone: 3,
    milestoneCount: 3,
    totalAmount: "2.50",
  },
];

const MOCK_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21";

const filterOptions: { value: EscrowFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "client", label: "As Client" },
  { value: "freelancer", label: "As Freelancer" },
];

const projectIcons: Record<string, string> = {
  "CS-992-PX": "architecture",
  "CS-881-ZQ": "smart_toy",
  "CS-772-ML": "token",
  "CS-643-AB": "code",
  "CS-514-QR": "web",
  "CS-445-TZ": "palette",
};

function getEscrowStatus(escrow: Escrow): "active" | "completed" | "pending" | "disputed" {
  switch (escrow.state) {
    case EscrowState.Active: return "active";
    case EscrowState.Completed: return "completed";
    case EscrowState.Disputed: return "disputed";
    case EscrowState.Created: return "pending";
    default: return "pending";
  }
}

function getPhaseLabel(escrow: Escrow): string {
  if (escrow.state === EscrowState.Completed) return "Final Milestone";
  if (escrow.state === EscrowState.Disputed) return "Arbitration";
  if (escrow.state === EscrowState.Created) return "Phase 1: Setup";
  return `Phase ${escrow.currentMilestone}: Development`;
}

function getProjectName(id: string): string {
  const names: Record<string, string> = {
    "CS-992-PX": "Web3 DApp Redesign",
    "CS-881-ZQ": "AI Agent Audit",
    "CS-772-ML": "Liquidity Pool UI",
    "CS-643-AB": "Smart Contract Audit",
    "CS-514-QR": "DeFi Dashboard",
    "CS-445-TZ": "NFT Marketplace",
  };
  return names[id] || `Escrow #${id}`;
}

export default function ContractsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<EscrowFilter>("all");

  const filteredEscrows = mockEscrows.filter((escrow) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "client") {
      return escrow.client.toLowerCase() === MOCK_ADDRESS.toLowerCase();
    }
    if (activeFilter === "freelancer") {
      return escrow.freelancer.toLowerCase() === MOCK_ADDRESS.toLowerCase();
    }
    return true;
  });

  const totalLocked = filteredEscrows
    .reduce((sum, e) => sum + parseFloat(e.totalAmount), 0)
    .toFixed(2);
  const activeCount = filteredEscrows.filter((e) => e.state === EscrowState.Active).length;
  const completedCount = filteredEscrows.filter((e) => e.state === EscrowState.Completed).length;
  const successRate = filteredEscrows.length > 0
    ? ((completedCount / filteredEscrows.length) * 100).toFixed(1)
    : "0.0";

  return (
    <AppShell>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="headline-font text-[2rem] sm:text-[2.75rem] md:text-[3.5rem] leading-none font-bold text-white -ml-1">
            Ledger
          </h2>
          <p className="text-primary tracking-[0.3em] font-medium text-xs mt-2">
            TRANSACTIONAL OVERVIEW &amp; CONTRACTS
          </p>
        </div>
        <div className="flex space-x-1 bg-surface-container-low p-1.5 rounded-xl border border-white/5">
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
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-xl">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">
            Total Locked Value
          </p>
          <p className="text-3xl font-bold text-white headline-font">{totalLocked} ETH</p>
          <div className="mt-4 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary w-3/4 shadow-[0_0_8px_rgba(76,215,246,0.5)]" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-xl">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">
            Active Contracts
          </p>
          <p className="text-3xl font-bold text-white headline-font">
            {String(activeCount).padStart(2, "0")}
          </p>
          <div className="mt-4 flex items-center text-secondary text-xs font-bold">
            <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
            +2 this month
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-xl">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">
            Success Rate
          </p>
          <p className="text-3xl font-bold text-white headline-font">{successRate}%</p>
          <div className="mt-4 flex items-center text-primary text-xs font-bold">
            <span className="material-symbols-outlined text-sm mr-1">verified</span>
            High Trust Score
          </div>
        </div>
      </div>

      {/* Contract Table */}
      <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="bg-surface-container-high/50 px-4 sm:px-8 py-5 flex items-center justify-between gap-2">
          <h3 className="font-bold headline-font text-lg text-white">Recent Contracts</h3>
          <div className="flex items-center space-x-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-white/5">
                <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Project</th>
                <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Value</th>
                <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Current Phase</th>
                <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEscrows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-on-surface-variant">
                    No contracts found
                  </td>
                </tr>
              ) : (
                filteredEscrows.map((escrow) => {
                  const status = getEscrowStatus(escrow);
                  const isClient = escrow.client.toLowerCase() === MOCK_ADDRESS.toLowerCase();
                  const role = isClient ? "client" : "freelancer";
                  const icon = projectIcons[escrow.id] || "description";
                  const statusBorderColor =
                    status === "active"
                      ? "group-hover:border-primary/50"
                      : status === "completed"
                      ? "group-hover:border-secondary/50"
                      : "group-hover:border-error/50";

                  return (
                    <tr
                      key={escrow.id}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-white/10 ${statusBorderColor} transition-colors`}>
                            <span className={`material-symbols-outlined ${
                              status === "active" ? "text-primary" : status === "completed" ? "text-secondary" : "text-error"
                            }`}>
                              {icon}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white headline-font">
                              {getProjectName(escrow.id)}
                            </p>
                            <p className="text-[10px] text-on-surface-variant font-medium">
                              ID: {escrow.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                          role === "freelancer"
                            ? "bg-tertiary/10 text-tertiary"
                            : "bg-primary/10 text-primary"
                        }`}>
                          {role === "freelancer" ? "Freelancer" : "Client"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-white headline-font">{escrow.totalAmount} ETH</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-on-surface">{getPhaseLabel(escrow)}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            status === "active"
                              ? "bg-primary shadow-[0_0_5px_#4cd7f6]"
                              : status === "completed"
                              ? "bg-secondary shadow-[0_0_5px_#4edea3]"
                              : "bg-error shadow-[0_0_5px_#ffb4ab]"
                          }`} />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => router.push(`/contracts/${escrow.id}`)}
                          className="px-4 py-1.5 rounded-lg bg-surface-container-high text-xs font-bold text-white border border-white/5 hover:border-primary/50 transition-all hover:bg-surface-container-highest active:scale-95"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-8 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 bg-surface-container-low/10">
          <p className="text-[10px] text-on-surface-variant font-medium">
            Showing <span className="text-white">{filteredEscrows.length}</span> of{" "}
            <span className="text-white">{mockEscrows.length}</span> contracts
          </p>
          <div className="flex space-x-2">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container-high text-on-surface-variant border border-white/5 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-on-primary font-bold text-[10px]">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container-high text-on-surface-variant border border-white/5 hover:text-white transition-colors text-[10px]">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container-high text-on-surface-variant border border-white/5 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Background Accents */}
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none z-0" />
    </AppShell>
  );
}