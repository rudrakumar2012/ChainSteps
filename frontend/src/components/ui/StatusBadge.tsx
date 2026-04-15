interface StatusBadgeProps {
  status: "active" | "completed" | "pending" | "disputed" | "funded" | "unfunded";
  label?: string;
}

const statusConfig = {
  active: {
    bg: "bg-primary/10",
    text: "text-primary",
    dot: "bg-primary",
    label: "Active",
  },
  completed: {
    bg: "bg-secondary/10",
    text: "text-secondary",
    dot: "bg-secondary",
    label: "Completed",
  },
  pending: {
    bg: "bg-tertiary/10",
    text: "text-tertiary",
    dot: "bg-tertiary",
    label: "Pending",
  },
  disputed: {
    bg: "bg-error/10",
    text: "text-error",
    dot: "bg-error",
    label: "Disputed",
  },
  funded: {
    bg: "bg-slate-800",
    text: "text-slate-400",
    dot: "bg-slate-500",
    label: "Funded",
  },
  unfunded: {
    bg: "bg-slate-800",
    text: "text-slate-500",
    dot: "bg-slate-600",
    label: "Unfunded",
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center gap-2 ${config.bg} border border-${status}/20 px-3 py-1 rounded-full`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} shadow-[0_0_5px_${config.dot.replace("bg-", "")}]`} />
      <span className={`text-[10px] font-bold ${config.text} uppercase tracking-tight`}>
        {label || config.label}
      </span>
    </div>
  );
}