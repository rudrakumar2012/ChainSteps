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
    const active = escrows.filter((e) => e.state === 1);
    const completed = escrows.filter((e) => e.state === 3);
    const totalLocked = active.reduce((sum, e) => sum + parseFloat(e.totalAmount), 0);
    const pendingMilestones = escrows.reduce((sum, e) => {
      if (e.state === 1) {
        return sum + (e.milestoneCount - e.currentMilestone);
      }
      return sum;
    }, 0);
    const totalMilestones = escrows.reduce((sum, e) => sum + e.milestoneCount, 0);
    const completedMilestones = completed.reduce((sum, e) => sum + e.milestoneCount, 0);
    const milestoneCompletionRate = totalMilestones > 0
      ? ((completedMilestones / totalMilestones) * 100).toFixed(1)
      : "0.0";

    return {
      totalLocked: totalLocked.toFixed(2),
      activeContracts: active.length,
      pendingMilestones,
      totalEscrows: escrows.length,
      completedEscrows: completed.length,
      milestoneCompletionRate,
    };
  }, [escrows]);

  return { stats, escrows, loading, error, refetch };
}