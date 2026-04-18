"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { Dashboard } from "@/components/dashboard";
import { Escrow, EscrowState } from "@/types";

// Mock data for demonstration
const mockStats = {
  totalLocked: "12.5",
  activeContracts: 3,
  pendingMilestones: 7,
};

const mockEscrows: Escrow[] = [
  {
    id: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    client: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    freelancer: "0x8626f214e5FaB0Fa2dE47a0e5f3C4c7d8a9b0c12",
    state: EscrowState.Active,
    currentMilestone: 2,
    milestoneCount: 4,
    totalAmount: "5.0",
  },
  {
    id: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    client: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    freelancer: "0x9536f214e5FaB0Fa2dE47a0e5f3C4c7d8a9b0c34",
    state: EscrowState.Active,
    currentMilestone: 1,
    milestoneCount: 3,
    totalAmount: "2.5",
  },
  {
    id: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    client: "0x123d35Cc6634C0532925a3b844Bc9e7595f8fC45",
    freelancer: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    state: EscrowState.Completed,
    currentMilestone: 3,
    milestoneCount: 3,
    totalAmount: "3.0",
  },
  {
    id: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    client: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    freelancer: "0xabcd6f214e5FaB0Fa2dE47a0e5f3C4c7d8a9b0c56",
    state: EscrowState.Disputed,
    currentMilestone: 1,
    milestoneCount: 5,
    totalAmount: "7.5",
  },
  {
    id: "0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff",
    client: "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21",
    freelancer: "0x9876e5FaB0Fa2dE47a0e5f3C4c7d8a9b0c67",
    state: EscrowState.Created,
    currentMilestone: 0,
    milestoneCount: 2,
    totalAmount: "1.5",
  },
];

// Mock connected address (would come from wallet in Phase 4D)
const MOCK_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc9e7595f8fC21";

export default function Home() {
  const router = useRouter();

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

      <Dashboard
        stats={mockStats}
        escrows={mockEscrows}
        currentAddress={MOCK_ADDRESS}
        onContractClick={handleContractClick}
      />
    </AppShell>
  );
}