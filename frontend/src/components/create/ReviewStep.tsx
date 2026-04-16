"use client";

import { CreateEscrowFormData } from "@/types";

interface ReviewStepProps {
  formData: CreateEscrowFormData;
  clientAddress: string;
}

function truncateAddress(address: string): string {
  if (!address) return "—";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ReviewStep({ formData, clientAddress }: ReviewStepProps) {
  const totalAmount = formData.milestones.reduce(
    (sum, m) => sum + parseFloat(m.amount || "0"),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white headline-font tracking-tight mb-2">
          Review & Confirm
        </h3>
        <p className="text-sm text-on-surface-variant">
          Review the escrow configuration before deploying to the blockchain.
        </p>
      </div>

      {/* Parties Summary */}
      <div className="glass-card p-5">
        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">
          Contract Parties
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-container-low rounded-lg p-4">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">
              Client (You)
            </p>
            <p className="text-sm font-mono text-primary truncate">
              {truncateAddress(clientAddress)}
            </p>
          </div>
          <div className="bg-surface-container-low rounded-lg p-4">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">
              Freelancer
            </p>
            <p className="text-sm font-mono text-secondary truncate">
              {truncateAddress(formData.freelancer)}
            </p>
          </div>
          <div className="bg-surface-container-low rounded-lg p-4">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">
              Arbitrator
            </p>
            <p className="text-sm font-mono text-tertiary truncate">
              {formData.arbitrator ? truncateAddress(formData.arbitrator) : "Protocol Default"}
            </p>
          </div>
        </div>
      </div>

      {/* Milestones Summary */}
      <div className="glass-card p-5">
        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">
          Milestones ({formData.milestones.length})
        </h4>
        <div className="space-y-3">
          {formData.milestones.map((milestone, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-surface-container-low rounded-lg p-3"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{milestone.description}</p>
              </div>
              <div className="text-sm font-bold text-primary">
                {parseFloat(milestone.amount).toFixed(2)} ETH
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
          <span className="text-sm font-bold text-white uppercase tracking-widest">
            Total Escrow Value
          </span>
          <span className="text-2xl font-bold text-primary headline-font">
            {totalAmount.toFixed(2)} ETH
          </span>
        </div>
      </div>

      {/* Deploy Info */}
      <div className="bg-surface-container-low rounded-xl p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary mt-0.5">info</span>
          <div>
            <p className="text-xs font-bold text-white mb-1">Deploying to Sepolia Testnet</p>
            <p className="text-xs text-on-surface-variant">
              This will create a new escrow contract on the Ethereum Sepolia testnet.
              Make sure you have enough ETH in your wallet to fund the milestones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}