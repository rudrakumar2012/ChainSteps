"use client";

import { StatsCard } from "./StatsCard";
import { ContractsGrid, ContractsLedger } from "@/components/contracts";
import { Escrow, EscrowState, DashboardStats } from "@/types";

interface DashboardProps {
  stats: DashboardStats;
  escrows: Escrow[];
  currentAddress?: string | null;
  onContractClick?: (escrow: Escrow) => void;
}

export function Dashboard({ stats, escrows, currentAddress, onContractClick }: DashboardProps) {
  const activeEscrows = escrows.filter((e) => e.state === EscrowState.Active);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Locked"
          value={stats.totalLocked}
          subtitle="ETH in active escrows"
          icon={
            <span className="material-symbols-outlined text-primary text-xl">
              lock
            </span>
          }
        />
        <StatsCard
          title="Active Contracts"
          value={stats.activeContracts}
          subtitle="Currently in progress"
          icon={
            <span className="material-symbols-outlined text-secondary text-xl">
              handshake
            </span>
          }
        />
        <StatsCard
          title="Pending Milestones"
          value={stats.pendingMilestones}
          subtitle="Awaiting approval"
          icon={
            <span className="material-symbols-outlined text-tertiary text-xl">
              pending_actions
            </span>
          }
        />
      </div>

      {/* Active Contracts Grid */}
      <div>
        <h3 className="text-lg font-bold text-white headline-font tracking-tight mb-4">
          Active Escrows
        </h3>
        <ContractsGrid
          escrows={activeEscrows}
          currentAddress={currentAddress}
          onContractClick={onContractClick}
          emptyMessage="No active escrows. Create one to get started."
        />
      </div>

      {/* My Contracts Ledger */}
      <ContractsLedger
        escrows={escrows}
        currentAddress={currentAddress}
        onContractClick={onContractClick}
      />
    </div>
  );
}