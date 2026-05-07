import { Escrow } from "@/types";
import { ContractRow } from "./ContractRow";

interface ContractsGridProps {
  escrows: Escrow[];
  currentAddress?: string | null;
  onContractClick?: (escrow: Escrow) => void;
  emptyMessage?: string;
}

export function ContractsGrid({
  escrows,
  currentAddress,
  onContractClick,
  emptyMessage = "No active contracts found",
}: ContractsGridProps) {
  if (escrows.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container mx-auto mb-4 flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-3xl">
            inbox
          </span>
        </div>
        <p className="text-on-surface-variant">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {escrows.map((escrow) => (
        <ContractRow
          key={escrow.id}
          escrow={escrow}
          currentRole={
            currentAddress
              ? escrow.client.toLowerCase() === currentAddress.toLowerCase()
                ? "client"
                : escrow.freelancer.toLowerCase() === currentAddress.toLowerCase()
                ? "freelancer"
                : escrow.arbitrator?.toLowerCase() === currentAddress.toLowerCase()
                ? "arbitrator"
                : null
              : null
          }
          onClick={() => onContractClick?.(escrow)}
        />
      ))}
    </div>
  );
}