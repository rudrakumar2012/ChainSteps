"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchEscrow, fetchAllMilestones } from "@/lib/contract";
import type { Escrow, Milestone } from "@/types";

interface UseEscrowDetailResult {
  escrow: Escrow | null;
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEscrowDetail(id: string | null): UseEscrowDetailResult {
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setEscrow(null);
      setMilestones([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const escrowData = await fetchEscrow(Number(id));
      setEscrow(escrowData);

      if (escrowData.milestoneCount > 0) {
        const milestonesData = await fetchAllMilestones(
          Number(id),
          escrowData.milestoneCount
        );
        setMilestones(milestonesData);
      } else {
        setMilestones([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch escrow detail");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { escrow, milestones, loading, error, refetch: fetch };
}