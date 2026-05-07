"use client";

import { Milestone } from "@/types";
import { Button } from "../ui/Button";

interface MilestoneTimelineProps {
  milestones: Milestone[];
  currentIndex: number;
  onApprove?: (index: number) => void;
  onComplete?: (index: number) => void;
  onDispute?: (index: number) => void;
  isClient?: boolean;
  isFreelancer?: boolean;
}

type MilestoneState = "unfunded" | "funded" | "in_review" | "completed";

function getMilestoneState(milestone: Milestone): MilestoneState {
  if (milestone.isApproved) return "completed";
  if (milestone.isCompleted) return "in_review";
  if (parseFloat(milestone.amount) > 0) return "funded";
  return "unfunded";
}

function getStateIcon(state: MilestoneState) {
  switch (state) {
    case "completed":
      return "check_circle";
    case "in_review":
      return "hourglass_top";
    case "funded":
      return "lock";
    case "unfunded":
      return "radio_button_unchecked";
  }
}

function getStateColor(state: MilestoneState) {
  switch (state) {
    case "completed":
      return "bg-secondary text-on-secondary";
    case "in_review":
      return "bg-tertiary text-on-tertiary";
    case "funded":
      return "bg-primary/30 text-primary";
    case "unfunded":
      return "bg-surface-container text-on-surface-variant";
  }
}

function getConnectorColor(from: MilestoneState, to: MilestoneState) {
  if (from === "completed") return "bg-secondary";
  if (from === "in_review" || to === "in_review" || to === "completed") return "bg-tertiary";
  return "bg-surface-container-highest";
}

export function MilestoneTimeline({
  milestones,
  currentIndex,
  onApprove,
  onComplete,
  onDispute,
  isClient,
  isFreelancer,
}: MilestoneTimelineProps) {
  return (
    <div className="space-y-0">
      {milestones.map((milestone, index) => {
        const state = getMilestoneState(milestone);
        const isCurrentMilestone = index === currentIndex;
        const isPastMilestone = index < currentIndex;

        return (
          <div key={index} className="relative">
            {/* Timeline connector (vertical line) */}
            {index < milestones.length - 1 && (
              <div
                className={`absolute left-4 top-14 w-0.5 h-16 ${getConnectorColor(
                  state,
                  getMilestoneState(milestones[index + 1])
                )}`}
              />
            )}

            <div className="flex gap-4">
              {/* Status indicator */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
                  border-2 ${isCurrentMilestone ? "border-primary" : "border-transparent"}
                  ${getStateColor(state)}
                  ${isCurrentMilestone ? "shadow-[0_0_12px_rgba(76,215,246,0.4)]" : ""}
                `}
              >
                <span className="material-symbols-outlined text-sm">
                  {getStateIcon(state)}
                </span>
              </div>

              {/* Content Card */}
              <div
                className={`
                  flex-1 bg-surface-container-low rounded-xl p-4 mb-4
                  ${isCurrentMilestone ? "border border-primary/30" : ""}
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        Milestone {index + 1}
                      </span>
                      {isCurrentMilestone && (
                        <span className="text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-base font-medium text-white">{milestone.description}</p>
                  </div>
                  <p className="text-xl font-bold text-primary headline-font">{milestone.amount} ETH</p>
                </div>

                {/* State indicator */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`
                      material-symbols-outlined text-sm
                      ${
                        state === "completed"
                          ? "text-secondary"
                          : state === "in_review"
                          ? "text-tertiary"
                          : "text-on-surface-variant"
                      }
                    `}
                  >
                    {state === "completed" && "check_circle"}
                    {state === "in_review" && "hourglass_top"}
                    {state === "funded" && "lock"}
                    {state === "unfunded" && "radio_button_unchecked"}
                  </span>
                  <span
                    className={`
                      text-xs font-bold
                      ${
                        state === "completed"
                          ? "text-secondary"
                          : state === "in_review"
                          ? "text-tertiary"
                          : "text-on-surface-variant"
                      }
                    `}
                  >
                    {state === "completed" && "Verified"}
                    {state === "in_review" && "In Review - Awaiting Approval"}
                    {state === "funded" && "Funded - Awaiting Work"}
                    {state === "unfunded" && "Not Yet Funded"}
                  </span>
                </div>

                {/* Action buttons for current milestone */}
                {isCurrentMilestone && state !== "completed" && (
                  <div className="flex flex-wrap gap-2 pt-3 mt-3 bg-surface-container-low/30 -mx-4 -mb-4 px-4 pb-4 rounded-b-xl">
                    {isFreelancer && state !== "in_review" && (
                      <Button variant="secondary" size="sm" onClick={() => onComplete?.(index)}>
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Mark Complete
                      </Button>
                    )}
                    {isClient && state === "in_review" && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onApprove?.(index)}
                        >
                          <span className="material-symbols-outlined text-sm">thumb_up</span>
                          Approve & Release
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => onDispute?.(index)}>
                          <span className="material-symbols-outlined text-sm">gavel</span>
                          Dispute
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}