import { Escrow, EscrowState } from "@/types";
import { StatusBadge } from "../ui/StatusBadge";
import { ProgressBar } from "../ui/ProgressBar";
import { getEscrowStatus, truncateAddress, escrowProgress } from "@/lib/utils";

interface ContractRowProps {
  escrow: Escrow;
  currentRole?: "client" | "freelancer" | "arbitrator" | null;
  onClick?: () => void;
}

function getRoleBadge(role: "client" | "freelancer" | "arbitrator") {
  if (role === "client") return { label: "Client", className: "bg-primary/10 text-primary border-primary/20" };
  if (role === "freelancer") return { label: "Freelancer", className: "bg-secondary/10 text-secondary border-secondary/20" };
  return { label: "Arbitrator", className: "bg-tertiary/10 text-tertiary border-tertiary/20" };
}

export function ContractRow({ escrow, currentRole, onClick }: ContractRowProps) {
  const status = getEscrowStatus(escrow);
  const progress = Math.round(
    (escrow.milestoneCount > 0 ? escrow.currentMilestone / escrow.milestoneCount : 0) * 100
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(); } }}
      className="glass-card p-5 cursor-pointer transition-all duration-200 hover:scale-[1.01] @media-[hover:hover]:hover:scale-[1.01]"
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
          <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">
            Total Value
          </p>
          <p className="text-sm font-bold text-primary headline-font">
            {escrow.totalAmount} ETH
          </p>
        </div>
        <div className="bg-surface-container-low rounded-lg p-3">
          <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">
            Milestones
          </p>
          <p className="text-sm font-bold text-white">
            {escrow.currentMilestone}/{escrow.milestoneCount}
          </p>
        </div>
        <div className="bg-surface-container-low rounded-lg p-3">
          <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1">
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