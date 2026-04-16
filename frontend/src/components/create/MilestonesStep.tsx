"use client";

import { useState } from "react";
import { CreateEscrowFormData, MilestoneInput } from "@/types";
import { Button } from "../ui/Button";

interface MilestonesStepProps {
  formData: CreateEscrowFormData;
  onUpdate: (data: Partial<CreateEscrowFormData>) => void;
  errors: Record<string, string>;
}

export function MilestonesStep({ formData, onUpdate, errors }: MilestonesStepProps) {
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const addMilestone = () => {
    if (!newDescription.trim() || !newAmount.trim()) return;

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;

    const newMilestone: MilestoneInput = {
      description: newDescription.trim(),
      amount: newAmount.trim(),
    };

    onUpdate({ milestones: [...formData.milestones, newMilestone] });
    setNewDescription("");
    setNewAmount("");
  };

  const removeMilestone = (index: number) => {
    const updated = formData.milestones.filter((_, i) => i !== index);
    onUpdate({ milestones: updated });
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: string) => {
    const updated = [...formData.milestones];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ milestones: updated });
  };

  const totalAmount = formData.milestones.reduce(
    (sum, m) => sum + parseFloat(m.amount || "0"),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white headline-font tracking-tight mb-2">
          Define Milestones
        </h3>
        <p className="text-sm text-on-surface-variant">
          Break the project into measurable milestones with ETH amounts.
        </p>
      </div>

      {/* Add New Milestone Form */}
      <div className="bg-surface-container-low rounded-xl p-5 border border-white/10">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Description
            </label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="e.g., Design mockups delivered"
              className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Amount (ETH)
            </label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="0.5"
              step="0.01"
              min="0"
              className="w-full bg-surface-container border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button variant="primary" size="md" onClick={addMilestone}>
            <span className="material-symbols-outlined text-sm">add</span>
            Add
          </Button>
        </div>
      </div>

      {/* Milestones List */}
      {formData.milestones.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container mx-auto mb-3 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">flag</span>
          </div>
          <p className="text-sm text-on-surface-variant">
            No milestones yet. Add at least one milestone to continue.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {formData.milestones.map((milestone, index) => (
            <div
              key={index}
              className="glass-card p-4 flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{index + 1}</span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={milestone.description}
                  onChange={(e) => updateMilestone(index, "description", e.target.value)}
                  className="w-full bg-transparent text-sm text-white border-none focus:outline-none"
                />
              </div>
              <div className="w-28">
                <div className="relative">
                  <input
                    type="number"
                    value={milestone.amount}
                    onChange={(e) => updateMilestone(index, "amount", e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-primary text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant">
                    ETH
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeMilestone(index)}
                className="w-8 h-8 rounded-lg hover:bg-error/10 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-on-surface-variant uppercase tracking-widest">
                Total Escrow Value
              </span>
              <span className="text-2xl font-bold text-primary headline-font">
                {totalAmount.toFixed(2)} ETH
              </span>
            </div>
          </div>
        </div>
      )}

      {errors.milestones && (
        <p className="text-xs text-error">{errors.milestones}</p>
      )}
    </div>
  );
}