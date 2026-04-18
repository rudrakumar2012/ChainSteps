"use client";

import { useState } from "react";
import { Escrow, EscrowFilter, EscrowState } from "@/types";
import { StatusBadge } from "../ui/StatusBadge";

interface ContractsLedgerProps {
  escrows: Escrow[];
  currentAddress?: string | null;
  onContractClick?: (escrow: Escrow) => void;
}

const filterOptions: { value: EscrowFilter; label: string }[] = [
  { value: "all", label: "All Contracts" },
  { value: "client", label: "As Client" },
  { value: "freelancer", label: "As Freelancer" },
];

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getEscrowStatus(escrow: Escrow): "active" | "completed" | "pending" | "disputed" {
  switch (escrow.state) {
    case EscrowState.Active:
      return "active";
    case EscrowState.Completed:
      return "completed";
    case EscrowState.Disputed:
      return "disputed";
    case EscrowState.Created:
      return "pending";
    default:
      return "pending";
  }
}

export function ContractsLedger({
  escrows,
  currentAddress,
  onContractClick,
}: ContractsLedgerProps) {
  const [activeFilter, setActiveFilter] = useState<EscrowFilter>("all");

  const filteredEscrows = escrows.filter((escrow) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "client") {
      return currentAddress && escrow.client.toLowerCase() === currentAddress.toLowerCase();
    }
    if (activeFilter === "freelancer") {
      return currentAddress && escrow.freelancer.toLowerCase() === currentAddress.toLowerCase();
    }
    return true;
  });

  return (
    <div className="glass-card p-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-white headline-font tracking-tight">
          My Contracts
        </h3>
        <div className="flex gap-2 bg-surface-container-low rounded-lg p-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={`
                px-4 py-2 rounded-md text-xs font-bold transition-all duration-200
                ${
                  activeFilter === option.value
                    ? "bg-primary/20 text-primary"
                    : "text-on-surface-variant hover:text-white hover:bg-white/5"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-[10px] text-on-surface-variant uppercase tracking-widest pb-4 font-bold">
                Escrow ID
              </th>
              <th className="text-left text-[10px] text-on-surface-variant uppercase tracking-widest pb-4 font-bold">
                Counterparty
              </th>
              <th className="text-left text-[10px] text-on-surface-variant uppercase tracking-widest pb-4 font-bold">
                Role
              </th>
              <th className="text-left text-[10px] text-on-surface-variant uppercase tracking-widest pb-4 font-bold">
                Value
              </th>
              <th className="text-left text-[10px] text-on-surface-variant uppercase tracking-widest pb-4 font-bold">
                Milestones
              </th>
              <th className="text-left text-[10px] text-on-surface-variant uppercase tracking-widest pb-4 font-bold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEscrows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                  No contracts found
                </td>
              </tr>
            ) : (
              filteredEscrows.map((escrow) => {
                const role = currentAddress
                  ? escrow.client.toLowerCase() === currentAddress.toLowerCase()
                    ? "client"
                    : escrow.freelancer.toLowerCase() === currentAddress.toLowerCase()
                    ? "freelancer"
                    : null
                  : null;

                return (
                  <tr
                    key={escrow.id}
                    onClick={() => onContractClick?.(escrow)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="py-4">
                      <span className="text-sm font-mono text-white">
                        #{escrow.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-on-surface-variant font-mono">
                        {truncateAddress(
                          role === "client" ? escrow.freelancer : escrow.client
                        )}
                      </span>
                    </td>
                    <td className="py-4">
                      {role ? (
                        <span
                          className={`
                            inline-flex text-xs font-bold px-2 py-1 rounded-md border
                            ${
                              role === "client"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-secondary/10 text-secondary border-secondary/20"
                            }
                          `}
                        >
                          {role === "client" ? "Client" : "Freelancer"}
                        </span>
                      ) : (
                        <span className="text-xs text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-bold text-primary headline-font">
                        {escrow.totalAmount} ETH
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-white">
                        {escrow.currentMilestone}/{escrow.milestoneCount}
                      </span>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={getEscrowStatus(escrow)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}