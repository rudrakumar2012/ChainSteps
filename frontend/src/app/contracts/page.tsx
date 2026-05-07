"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { Escrow, EscrowState, EscrowFilter } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useEscrows } from "@/hooks";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { getEscrowStatus, truncateAddress } from "@/lib/utils";

const filterOptions: { value: EscrowFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "client", label: "As Client" },
  { value: "freelancer", label: "As Freelancer" },
];

function getPhaseLabel(escrow: Escrow): string {
  if (escrow.state === EscrowState.Completed) return "Final Milestone";
  if (escrow.state === EscrowState.Disputed) return "Arbitration";
  if (escrow.state === EscrowState.Created) return "Awaiting Funding";
  if (escrow.currentMilestone === 0) return "First Milestone";
  return `Milestone ${escrow.currentMilestone}/${escrow.milestoneCount}`;
}

export default function ContractsPage() {
  const router = useRouter();
  const { address, isConnected } = useWalletContext();
  const { data: escrows, loading, error } = useEscrows(isConnected ? address : undefined);
  const [activeFilter, setActiveFilter] = useState<EscrowFilter>("all");

  const filteredEscrows = escrows.filter((escrow) => {
    if (activeFilter === "all") return true;
    if (!address) return false;
    if (activeFilter === "client") {
      return escrow.client.toLowerCase() === address.toLowerCase();
    }
    if (activeFilter === "freelancer") {
      return escrow.freelancer.toLowerCase() === address.toLowerCase();
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
                px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg text-xs font-bold transition-colors min-h-[44px] sm:min-h-0
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

      {loading ? (
        <div className="flex items-center justify-center py-20" role="status" aria-label="Loading contracts">
          <span className="material-symbols-outlined text-primary text-3xl animate-spin">
            progress_activity
          </span>
          <span className="sr-only">Loading...</span>
        </div>
      ) : error ? (
        <div className="glass-card p-8 text-center">
          <span className="material-symbols-outlined text-error text-3xl mb-3 block">error</span>
          <p className="text-sm text-error">{error}</p>
        </div>
      ) : (
        <>
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
                On-chain activity
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-xl">
              <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-1">
                Success Rate
              </p>
              <p className="text-3xl font-bold text-white headline-font">{successRate}%</p>
              <div className="mt-4 flex items-center text-primary text-xs font-bold">
                <span className="material-symbols-outlined text-sm mr-1">verified</span>
                Milestone completion
              </div>
            </div>
          </div>

          {/* Contract Table */}
          <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            {/* Table Header */}
            <div className="bg-surface-container-high/50 px-4 sm:px-8 py-5 flex items-center justify-between gap-2">
              <h3 className="font-bold headline-font text-lg text-white">Recent Contracts</h3>
            </div>

            {/* Table — hidden on mobile, shown on sm+ */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/30 border-b border-white/5">
                    <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Escrow</th>
                    <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Role</th>
                    <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Value</th>
                    <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Current Phase</th>
                    <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                    <th className="px-4 sm:px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredEscrows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 sm:px-8 py-12 text-center text-on-surface-variant">
                        No contracts found
                      </td>
                    </tr>
                  ) : (
                    filteredEscrows.map((escrow) => {
                      const status = getEscrowStatus(escrow);
                      const isClient = address && escrow.client.toLowerCase() === address.toLowerCase();
                      const isArbitrator = escrow.arbitrator && escrow.arbitrator !== "0x0000000000000000000000000000000000000000" && address && escrow.arbitrator.toLowerCase() === address.toLowerCase();
                      const role = isClient ? "client" : isArbitrator ? "arbitrator" : "freelancer";

                      return (
                        <tr
                          key={escrow.id}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-4 sm:px-8 py-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-white/10 transition-colors">
                                <span className={`material-symbols-outlined ${
                                  status === "active" ? "text-primary" : status === "completed" ? "text-secondary" : "text-error"
                                }`}>
                                  description
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white headline-font">
                                  Escrow #{escrow.id}
                                </p>
                                <p className="text-[10px] text-on-surface-variant font-medium">
                                  {escrow.client.slice(0, 6)}...{escrow.client.slice(-4)} → {escrow.freelancer.slice(0, 6)}...{escrow.freelancer.slice(-4)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-8 py-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                              role === "freelancer"
                                ? "bg-tertiary/10 text-tertiary"
                                : "bg-primary/10 text-primary"
                            }`}>
                              {role === "freelancer" ? "Freelancer" : "Client"}
                            </span>
                          </td>
                          <td className="px-4 sm:px-8 py-6">
                            <p className="text-sm font-bold text-white headline-font">{escrow.totalAmount} ETH</p>
                          </td>
                          <td className="px-4 sm:px-8 py-6">
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
                          <td className="px-4 sm:px-8 py-6">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-4 sm:px-8 py-6 text-right">
                            <button
                              onClick={() => router.push(`/contracts/${escrow.id}`)}
                              className="px-4 py-2 min-h-[44px] rounded-lg bg-surface-container-high text-xs font-bold text-white border border-white/5 hover:border-primary/50 transition-all hover:bg-surface-container-highest active:scale-95"
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

            {/* Card view — visible on mobile only */}
            <div className="sm:hidden space-y-3 p-4">
              {filteredEscrows.length === 0 ? (
                <div className="py-12 text-center text-on-surface-variant">
                  No contracts found
                </div>
              ) : (
                filteredEscrows.map((escrow) => {
                  const status = getEscrowStatus(escrow);
                  const isClient = address && escrow.client.toLowerCase() === address.toLowerCase();
                  const isArbitrator = escrow.arbitrator && escrow.arbitrator !== "0x0000000000000000000000000000000000000000" && address && escrow.arbitrator.toLowerCase() === address.toLowerCase();
                  const role = isClient ? "client" : isArbitrator ? "arbitrator" : "freelancer";

                  return (
                    <button
                      key={escrow.id}
                      onClick={() => router.push(`/contracts/${escrow.id}`)}
                      className="w-full text-left glass-card rounded-xl p-4 border border-white/5 hover:border-primary/30 transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-white/10">
                            <span className={`material-symbols-outlined ${
                              status === "active" ? "text-primary" : status === "completed" ? "text-secondary" : "text-error"
                            }`}>
                              description
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white headline-font">Escrow #{escrow.id}</p>
                            <p className="text-[11px] text-on-surface-variant font-medium">
                              {escrow.client.slice(0, 6)}...{escrow.client.slice(-4)} → {escrow.freelancer.slice(0, 6)}...{escrow.freelancer.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={status} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                            role === "freelancer" ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
                          }`}>
                            {role === "freelancer" ? "Freelancer" : "Client"}
                          </span>
                          <span className="text-xs text-on-surface">{getPhaseLabel(escrow)}</span>
                        </div>
                        <p className="text-sm font-bold text-white headline-font">{escrow.totalAmount} ETH</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            <div className="px-4 sm:px-8 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 bg-surface-container-low/10">
              <p className="text-[10px] text-on-surface-variant font-medium">
                Showing <span className="text-white">{filteredEscrows.length}</span> of{" "}
                <span className="text-white">{escrows.length}</span> contracts
              </p>
            </div>
          </div>
        </>
      )}

      {/* Background Accents */}
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/4 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none z-0" />
    </AppShell>
  );
}