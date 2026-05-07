interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, showLabel = false, className = "" }: ProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-end">
          <span className="text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">
            Progress
          </span>
          <span className="text-[10px] text-secondary font-bold tracking-widest uppercase">
            {value}% Completed
          </span>
        </div>
      )}
      <div
        className="relative h-2 sm:h-3 w-full bg-surface-container-highest rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_12px_rgba(76,215,246,0.3)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}