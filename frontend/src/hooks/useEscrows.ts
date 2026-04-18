"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAllEscrows, fetchEscrowsByAddress } from "@/lib/contract";
import type { Escrow } from "@/types";

interface UseEscrowsResult {
  data: Escrow[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEscrows(address?: string | null): UseEscrowsResult {
  const [data, setData] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const escrows = address
        ? await fetchEscrowsByAddress(address)
        : await fetchAllEscrows();
      setData(escrows);
    } catch (err: any) {
      setError(err.message || "Failed to fetch escrows");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}