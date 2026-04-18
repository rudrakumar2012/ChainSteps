interface StatusBadgeProps {
  status: "active" | "completed" | "pending" | "disputed" | "cancelled" | "funded" | "unfunded";
  label?: string;
}

const statusConfig = {
  active: {
    bg: "bg-primary/10",
    text: "text-primary",
    dot: "bg-primary",
    border: "border-primary/20",
    shadow: "shadow-[0_0_5px_#4cd7f6]",
    label: "Active",
  },
  completed: {
    bg: "bg-secondary/10",
    text: "text-secondary",
    dot: "bg-secondary",
    border: "border-secondary/20",
    shadow: "shadow-[0_0_5px_#4edea3]",
    label: "Completed",
  },
  pending: {
    bg: "bg-tertiary/10",
    text: "text-tertiary",
    dot: "bg-tertiary",
    border: "border-tertiary/20",
    shadow: "shadow-[0_0_5px_#7bd0ff]",
    label: "Pending",
  },
  disputed: {
    bg: "bg-error/10",
    text: "text-error",
    dot: "bg-error",
    border: "border-error/20",
    shadow: "shadow-[0_0_5px_#ffb4ab]",
    label: "Disputed",
  },
  cancelled: {
    bg: "bg-on-surface-variant/10",
    text: "text-on-surface-variant",
    dot: "bg-on-surface-variant",
    border: "border-on-surface-variant/20",
    shadow: "",
    label: "Cancelled",
  },
  funded: {
    bg: "bg-outline-variant/10",
    text: "text-on-surface-variant",
    dot: "bg-outline-variant",
    border: "border-outline-variant/20",
    shadow: "",
    label: "Funded",
  },
  unfunded: {
    bg: "bg-outline-variant/5",
    text: "text-on-surface-variant/60",
    dot: "bg-outline-variant/60",
    border: "border-outline-variant/10",
    shadow: "",
    label: "Unfunded",
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center gap-2 ${config.bg} ${config.border} px-3 py-1 rounded-full`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} ${config.shadow}`} />
      <span className={`text-[10px] font-bold ${config.text} uppercase tracking-tight`}>
        {label || config.label}
      </span>
    </div>
  );
}