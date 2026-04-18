"use client";

import { useState, useCallback } from "react";
import { CreateEscrowFormData, MilestoneInput } from "@/types";
import { PartiesStep } from "./PartiesStep";
import { MilestonesStep } from "./MilestonesStep";
import { ReviewStep } from "./ReviewStep";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";

interface EscrowWizardProps {
  clientAddress: string;
  onSubmit: (data: CreateEscrowFormData) => Promise<void>;
  onCancel: () => void;
}

type Step = "parties" | "milestones" | "review";

const STEPS: { key: Step; label: string }[] = [
  { key: "parties", label: "Parties" },
  { key: "milestones", label: "Milestones" },
  { key: "review", label: "Review" },
];

const STEP_INDEX: Record<Step, number> = {
  parties: 0,
  milestones: 1,
  review: 2,
};

const initialFormData: CreateEscrowFormData = {
  freelancer: "",
  arbitrator: "",
  milestones: [],
};

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function EscrowWizard({ clientAddress, onSubmit, onCancel }: EscrowWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>("parties");
  const [formData, setFormData] = useState<CreateEscrowFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((STEP_INDEX[currentStep] + 1) / STEPS.length) * 100;

  const updateFormData = useCallback((data: Partial<CreateEscrowFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setErrors({});
  }, []);

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === "parties") {
      if (!formData.freelancer.trim()) {
        newErrors.freelancer = "Freelancer address is required";
      } else if (!isValidAddress(formData.freelancer)) {
        newErrors.freelancer = "Invalid Ethereum address format";
      }
      if (formData.arbitrator && !isValidAddress(formData.arbitrator)) {
        newErrors.arbitrator = "Invalid Ethereum address format";
      }
    }

    if (step === "milestones") {
      if (formData.milestones.length === 0) {
        newErrors.milestones = "At least one milestone is required";
      }
      const hasInvalid = formData.milestones.some(
        (m) => !m.description.trim() || !m.amount || parseFloat(m.amount) <= 0
      );
      if (hasInvalid) {
        newErrors.milestones = "All milestones must have a description and amount > 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === "parties") {
      setCurrentStep("milestones");
    } else if (currentStep === "milestones") {
      setCurrentStep("review");
    }
  };

  const handleBack = () => {
    if (currentStep === "milestones") {
      setCurrentStep("parties");
    } else if (currentStep === "review") {
      setCurrentStep("milestones");
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error("Escrow creation failed:", err);
      setErrors({ submit: "Failed to create escrow. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white headline-font tracking-tight mb-2">
          Create New Escrow
        </h2>
        <p className="text-sm text-on-surface-variant">
          Set up a milestone-based escrow contract in 3 steps.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  transition-all duration-300
                  ${
                    STEP_INDEX[currentStep] >= index
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant"
                  }
                `}
              >
                {STEP_INDEX[currentStep] > index ? (
                  <span className="material-symbols-outlined text-sm">check</span>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`
                  ml-2 text-xs font-bold
                  ${STEP_INDEX[currentStep] >= index ? "text-primary" : "text-on-surface-variant"}
                `}
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    w-16 h-0.5 mx-3
                    ${STEP_INDEX[currentStep] > index ? "bg-primary" : "bg-surface-container"}
                  `}
                />
              )}
            </div>
          ))}
        </div>
        <ProgressBar value={progress} />
      </div>

      {/* Step Content */}
      <div className="min-h-[320px]">
        {currentStep === "parties" && (
          <PartiesStep formData={formData} onUpdate={updateFormData} errors={errors} />
        )}
        {currentStep === "milestones" && (
          <MilestonesStep formData={formData} onUpdate={updateFormData} errors={errors} />
        )}
        {currentStep === "review" && (
          <ReviewStep formData={formData} clientAddress={clientAddress} />
        )}
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{errors.submit}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 bg-surface-container-low/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl">
        <Button variant="ghost" size="md" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <div className="flex gap-3">
          {currentStep !== "parties" && (
            <Button variant="ghost" size="md" onClick={handleBack} disabled={isSubmitting}>
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back
            </Button>
          )}
          {currentStep !== "review" ? (
            <Button variant="primary" size="md" onClick={handleNext}>
              Next
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Button>
          ) : (
            <Button variant="primary" size="md" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Deploying...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  Deploy Escrow
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}