"use client";

import { createContext, useContext, ReactNode } from "react";
import { useHomepageStats } from "@/hooks/useHomepageStats";
import type { DashboardStats } from "@/types";

interface HomepageStatsValue {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const HomepageStatsContext = createContext<HomepageStatsValue | null>(null);

export function HomepageStatsProvider({ children }: { children: ReactNode }) {
  const data = useHomepageStats();
  return (
    <HomepageStatsContext.Provider value={data}>
      {children}
    </HomepageStatsContext.Provider>
  );
}

export function useHomepageStatsContext() {
  const context = useContext(HomepageStatsContext);
  if (!context) throw new Error("useHomepageStatsContext must be used within HomepageStatsProvider");
  return context;
}