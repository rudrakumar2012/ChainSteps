"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { Dashboard } from "@/components/dashboard";
import { useDashboard } from "@/hooks";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { Escrow } from "@/types";

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useWalletContext();
  const { stats, escrows, loading, error } = useDashboard(isConnected ? address : undefined);

  const handleContractClick = (escrow: Escrow) => {
    router.push(`/contracts/${escrow.id}`);
  };

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
        <div>
          <h2 className="headline-font text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">
            Protocol Overview
          </h2>
          <p className="text-on-surface-variant max-w-lg">
            Monitor your decentralized escrow contracts and milestone-based
            liquidity flows across the network.
          </p>
        </div>
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
        <Dashboard
          stats={stats}
          escrows={escrows}
          currentAddress={address}
          onContractClick={handleContractClick}
        />
      )}
    </AppShell>
  );
}