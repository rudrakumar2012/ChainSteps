"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchAllEscrowsPublic } from "@/lib/contract";
import type { DashboardStats, Escrow } from "@/types";

export function useHomepageStats() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllEscrowsPublic();
      setEscrows(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch protocol data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const stats = useMemo<DashboardStats>(() => {
    const active = escrows.filter((e) => e.state === 1);
    const completed = escrows.filter((e) => e.state === 3);
    const totalLocked = active.reduce((sum, e) => sum + parseFloat(e.totalAmount), 0);
    const pendingMilestones = escrows.reduce((sum, e) => {
      if (e.state === 1) return sum + (e.milestoneCount - e.currentMilestone);
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

  return { stats, loading, error, refetch: fetch };
}