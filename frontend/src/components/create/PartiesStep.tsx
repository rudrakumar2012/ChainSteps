"use client";

import { CreateEscrowFormData } from "@/types";

interface PartiesStepProps {
  formData: CreateEscrowFormData;
  onUpdate: (data: Partial<CreateEscrowFormData>) => void;
  errors: Record<string, string>;
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function PartiesStep({ formData, onUpdate, errors }: PartiesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white headline-font tracking-tight mb-2">
          Enter Contract Parties
        </h3>
        <p className="text-sm text-on-surface-variant">
          Set the freelancer who will deliver the work and optionally an arbitrator for disputes.
        </p>
      </div>

      <div className="space-y-4">
        {/* Freelancer Address */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Freelancer Address <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={formData.freelancer}
            onChange={(e) => onUpdate({ freelancer: e.target.value })}
            placeholder="0x..."
            className={`
              w-full bg-surface-container-low border rounded-lg px-4 py-3
              text-white placeholder:text-on-surface-variant/50
              focus:outline-none focus:ring-2 focus:ring-primary/50
              ${errors.freelancer ? "border-error" : "border-white/10"}
            `}
          />
          {errors.freelancer && (
            <p className="text-xs text-error mt-1">{errors.freelancer}</p>
          )}
          {!errors.freelancer && formData.freelancer && isValidAddress(formData.freelancer) && (
            <p className="text-xs text-secondary mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Valid Ethereum address
            </p>
          )}
        </div>

        {/* Arbitrator Address (Optional) */}
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Arbitrator Address <span className="text-on-surface-variant/50">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.arbitrator || ""}
            onChange={(e) => onUpdate({ arbitrator: e.target.value })}
            placeholder="0x... (defaults to ChainSteps protocol)"
            className={`
              w-full bg-surface-container-low border rounded-lg px-4 py-3
              text-white placeholder:text-on-surface-variant/50
              focus:outline-none focus:ring-2 focus:ring-primary/50
              ${errors.arbitrator ? "border-error" : "border-white/10"}
            `}
          />
          {errors.arbitrator && (
            <p className="text-xs text-error mt-1">{errors.arbitrator}</p>
          )}
          {!formData.arbitrator && (
            <p className="text-xs text-on-surface-variant/70 mt-1">
              Leave empty to use the protocol default arbitrator
            </p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-surface-container-low rounded-xl p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary mt-0.5">info</span>
          <div>
            <p className="text-xs font-bold text-white mb-1">About Escrow Parties</p>
            <p className="text-xs text-on-surface-variant">
              The <span className="text-secondary font-bold">freelancer</span> will deliver work and request milestone completions.
              The <span className="text-primary font-bold">client</span> is your connected wallet address.
              An <span className="text-tertiary font-bold">arbitrator</span> resolves disputes if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}