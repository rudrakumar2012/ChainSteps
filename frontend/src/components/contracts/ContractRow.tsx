import { Escrow, EscrowState } from "@/types";
import { StatusBadge } from "../ui/StatusBadge";
import { ProgressBar } from "../ui/ProgressBar";

interface ContractRowProps {
  escrow: Escrow;
  currentRole?: "client" | "freelancer" | null;
  onClick?: () => void;
}

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

function getRoleBadge(role: "client" | "freelancer") {
  return role === "client"
    ? { label: "Client", className: "bg-primary/10 text-primary border-primary/20" }
    : { label: "Freelancer", className: "bg-secondary/10 text-secondary border-secondary/20" };
}

export function ContractRow({ escrow, currentRole, onClick }: ContractRowProps) {
  const status = getEscrowStatus(escrow);
  const progress = Math.round(
    (escrow.milestoneCount > 0 ? escrow.currentMilestone / escrow.milestoneCount : 0) * 100
  );

  return (
    <div
      onClick={onClick}
      className="glass-card p-5 hover:scale-[1.01] cursor-pointer transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container flex items-center justify-center border border-white/5">
            <span className="material-symbols-outlined text-primary text-lg">
              description
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-0.5">
              Escrow #{escrow.id.slice(0, 8)}
            </p>
            <p className="text-xs text-on-surface-variant">
              {truncateAddress(escrow.client)} → {truncateAddress(escrow.freelancer)}
            </p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <div className="bg-surface-container-low rounded-lg p-3">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
            Total Value
          </p>
          <p className="text-sm font-bold text-primary headline-font">
            {escrow.totalAmount} ETH
          </p>
        </div>
        <div className="bg-surface-container-low rounded-lg p-3">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
            Milestones
          </p>
          <p className="text-sm font-bold text-white">
            {escrow.currentMilestone}/{escrow.milestoneCount}
          </p>
        </div>
        <div className="bg-surface-container-low rounded-lg p-3">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
            Your Role
          </p>
          {currentRole ? (
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md border ${getRoleBadge(currentRole).className}`}>
              {getRoleBadge(currentRole).label}
            </span>
          ) : (
            <span className="text-xs text-on-surface-variant">—</span>
          )}
        </div>
      </div>

      <ProgressBar value={progress} />
    </div>
  );
}