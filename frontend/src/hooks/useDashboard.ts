"use client";

import { useMemo } from "react";
import { useEscrows } from "./useEscrows";
import type { DashboardStats, Escrow } from "@/types";

interface UseDashboardResult {
  stats: DashboardStats;
  escrows: Escrow[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(address?: string | null): UseDashboardResult {
  const { data: escrows, loading, error, refetch } = useEscrows(address);

  const stats = useMemo<DashboardStats>(() => {
    const active = escrows.filter((e) => e.state === 1); // Active
    const totalLocked = active.reduce((sum, e) => sum + parseFloat(e.totalAmount), 0);
    const pendingMilestones = escrows.reduce((sum, e) => {
      if (e.state === 1) {
        return sum + (e.milestoneCount - e.currentMilestone);
      }
      return sum;
    }, 0);

    return {
      totalLocked: totalLocked.toFixed(2),
      activeContracts: active.length,
      pendingMilestones,
    };
  }, [escrows]);

  return { stats, escrows, loading, error, refetch };
}