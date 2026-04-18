"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout";
import { PartiesStep } from "@/components/create/PartiesStep";
import { MilestonesStep } from "@/components/create/MilestonesStep";
import { ReviewStep } from "@/components/create/ReviewStep";
import { CreateEscrowFormData } from "@/types";
import { useWalletContext } from "@/components/wallet/WalletProvider";
import { useTransactionContext } from "@/components/tx";
import { createEscrowTx, addMilestoneTx, fundEscrowTx } from "@/lib/contract";
import { isValidAddress } from "@/lib/utils";
import { ethers } from "ethers";

type Step = "parties" | "milestones" | "review";

const STEPS: { key: Step; label: string; subtitle: string; icon: string }[] = [
  { key: "parties", label: "Basic Info", subtitle: "Agreement foundations", icon: "fact_check" },
  { key: "milestones", label: "Milestones", subtitle: "Payment trigger logic", icon: "flag" },
  { key: "review", label: "Review", subtitle: "Verify & Deploy", icon: "rocket_launch" },
];

const STEP_INDEX: Record<Step, number> = { parties: 0, milestones: 1, review: 2 };

const initialFormData: CreateEscrowFormData = {
  freelancer: "",
  arbitrator: "",
  milestones: [],
};

export default function CreateEscrowPage() {
  const router = useRouter();
  const { address, isConnected } = useWalletContext();
  const { trackTx } = useTransactionContext();
  const [currentStep, setCurrentStep] = useState<Step>("parties");
  const [formData, setFormData] = useState<CreateEscrowFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentIndex = STEP_INDEX[currentStep];

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
    if (currentStep === "parties") setCurrentStep("milestones");
    else if (currentStep === "milestones") setCurrentStep("review");
  };

  const handleBack = () => {
    if (currentStep === "milestones") setCurrentStep("parties");
    else if (currentStep === "review") setCurrentStep("milestones");
  };

  const [submitStep, setSubmitStep] = useState<string>("");

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      const arbitrator = formData.arbitrator || ethers.ZeroAddress;

      // Step 1: Create escrow
      setSubmitStep("Creating escrow...");
      const createHandle = await trackTx("Create Escrow", () => createEscrowTx(formData.freelancer, arbitrator));
      const receipt = await createHandle.wait();
      if (!receipt) throw new Error("Transaction failed");

      // Extract escrowId from EscrowCreated event
      const iface = new ethers.Interface([
        "event EscrowCreated(uint256 indexed escrowId, address client, address freelancer)",
      ]);
      let escrowId: number | null = null;
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
          if (parsed) {
            escrowId = Number(parsed.args[0]);
            break;
          }
        } catch {}
      }
      if (escrowId === null) throw new Error("Could not determine escrow ID from transaction");

      // Step 2: Add milestones
      for (let i = 0; i < formData.milestones.length; i++) {
        const m = formData.milestones[i];
        const label = `Add Milestone ${i + 1}/${formData.milestones.length}`;
        setSubmitStep(label + "...");
        const handle = await trackTx(label, () => addMilestoneTx(escrowId!, m.description, m.amount));
        await handle.wait();
      }

      // Step 3: Fund escrow
      setSubmitStep("Funding escrow...");
      const fundHandle = await trackTx("Fund Escrow", () => fundEscrowTx(escrowId!, totalAmount));
      await fundHandle.wait();

      router.push(`/contracts/${escrowId}`);
    } catch (err: any) {
      console.error("Escrow creation failed:", err);
      setErrors({ submit: err?.reason || err?.message || "Failed to create escrow. Please try again." });
    } finally {
      setIsSubmitting(false);
      setSubmitStep("");
    }
  };

  const totalAmount = ethers.formatEther(
    formData.milestones.reduce(
      (sum, m) => sum + (m.amount ? ethers.parseEther(m.amount) : BigInt(0)),
      BigInt(0)
    )
  );

  const clientAddress = address || "0x0000000000000000000000000000000000000000";

  return (
    <AppShell>
      {/* Editorial Header */}
      <section className="mb-12 max-w-4xl">
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mb-2">
          <h1 className="headline-font text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            New Escrow
          </h1>
          <span className="text-primary headline-font text-xl opacity-50">#0042</span>
        </div>
        <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
          Establish a trustless agreement by defining clear milestones and locking
          liquidity in the architectural ledger.
        </p>
      </section>

      {/* Multi-Step Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Left Column: Vertical Stepper Track */}
        <div className="hidden md:block md:col-span-3">
          <div className="md:sticky md:top-28 space-y-12">
            {STEPS.map((step, index) => {
              const isCompleted = currentIndex > index;
              const isActive = currentIndex === index;
              const isPending = currentIndex < index;

              return (
                <div key={step.key} className="flex items-start group">
                  <div className="flex flex-col items-center mr-4">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center z-10
                        ${
                          isCompleted
                            ? "border-2 border-primary bg-primary text-on-primary"
                            : isActive
                            ? "border-2 border-primary bg-transparent text-primary shadow-[0_0_15px_rgba(76,215,246,0.3)]"
                            : "border-2 border-surface-container-highest bg-transparent text-on-surface-variant"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {step.icon}
                        </span>
                      ) : isActive ? (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      ) : (
                        <span className="text-xs font-bold headline-font">{String(index + 1).padStart(2, "0")}</span>
                      )}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`
                          w-[2px] h-16 mt-2
                          ${isCompleted ? "bg-primary" : "border-l-2 border-dashed border-outline-variant"}
                        `}
                      />
                    )}
                  </div>
                  <div className={`pt-1 ${isPending ? "opacity-40" : ""}`}>
                    <h3
                      className={`headline-font font-bold ${
                        isActive ? "text-primary" : "text-white"
                      }`}
                    >
                      {step.label}
                    </h3>
                    <p
                      className={`text-xs mt-1 ${
                        isActive ? "text-primary/70" : "text-on-surface-variant"
                      }`}
                    >
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Form Canvas */}
        <div className="md:col-span-9 space-y-8">
          {/* Step Content */}
          {currentStep === "parties" && (
            <div className="glass-card rounded-xl p-8 border border-white/5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
              </div>
              <h2 className="headline-font text-xl font-bold text-white mb-8 flex items-center">
                <span className="w-8 h-[2px] bg-primary mr-3" />
                Contract Participants
              </h2>
              <PartiesStep formData={formData} onUpdate={updateFormData} errors={errors} />
            </div>
          )}

          {currentStep === "milestones" && (
            <div className="glass-card rounded-xl p-8 border border-white/5 shadow-xl">
              <div className="flex justify-between items-center mb-10">
                <h2 className="headline-font text-xl font-bold text-white flex items-center">
                  <span className="w-8 h-[2px] bg-primary mr-3" />
                  Milestone Configuration
                </h2>
              </div>
              <MilestonesStep formData={formData} onUpdate={updateFormData} errors={errors} />
            </div>
          )}

          {currentStep === "review" && (
            <div className="glass-card rounded-xl p-8 border border-white/5 shadow-xl">
              <h2 className="headline-font text-xl font-bold text-white mb-8 flex items-center">
                <span className="w-8 h-[2px] bg-primary mr-3" />
                Review &amp; Deploy
              </h2>
              <ReviewStep formData={formData} clientAddress={clientAddress} />
            </div>
          )}

          {/* Error */}
          {errors.submit && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-sm text-error">{errors.submit}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:text-white transition-colors"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              {currentStep !== "parties" && (
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg text-sm font-bold text-on-surface-variant hover:text-white border border-white/5 hover:border-primary/50 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back
                  </span>
                </button>
              )}
              {currentStep !== "review" ? (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    Next
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      {submitStep || "Deploying..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">rocket_launch</span>
                      Deploy Escrow
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Summary & Deploy Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end">
            <div className="md:col-span-2 glass-card rounded-xl p-8 border border-primary/20 bg-primary/5 relative">
              <div className="absolute -top-3 -left-3 bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-primary/20">
                Summary
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                    Total Locked Value
                  </p>
                  <div className="flex items-baseline space-x-2">
                    <span className="headline-font text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                      {parseFloat(totalAmount).toFixed(2)}
                    </span>
                    <span className="headline-font text-xl text-primary font-medium">ETH</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                    Network Fee
                  </p>
                  <p className="text-sm font-medium text-on-surface">~ 0.0042 ETH</p>
                </div>
              </div>
              <div className="mt-6 pt-6 bg-surface-container-low/30 -mx-8 -mb-8 px-8 pb-6 rounded-b-xl flex items-center space-x-4">
                <span className="material-symbols-outlined text-secondary">verified_user</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Tokens will be held in the{" "}
                  <span className="text-white font-mono">StepsV2</span> contract and
                  only released upon mutual approval or dispute resolution.
                </p>
              </div>
            </div>
            <button
              onClick={currentStep === "review" ? handleSubmit : handleNext}
              disabled={isSubmitting}
              className="h-20 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl flex flex-col items-center justify-center shadow-2xl shadow-primary/20 group relative overflow-hidden transition-all active:scale-95 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="headline-font text-lg font-bold tracking-tight">
                {isSubmitting ? (submitStep || "Deploying...") : "Deploy to Sepolia"}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">
                {isSubmitting ? "Confirm in MetaMask" : "Initialize Contract"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Background */}
      <div className="fixed bottom-0 left-0 w-full h-1/2 pointer-events-none -z-10 opacity-20">
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-tertiary/10 rounded-full blur-[100px]" />
      </div>
    </AppShell>
  );
}