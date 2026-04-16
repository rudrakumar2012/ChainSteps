import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = "",
}: StatsCardProps) {
  return (
    <div
      className={`glass-card p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/10">
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              trend.positive
                ? "bg-secondary/10 text-secondary"
                : "bg-error/10 text-error"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {trend.positive ? "trending_up" : "trending_down"}
            </span>
            {trend.value}
          </div>
        )}
      </div>
      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">
        {title}
      </p>
      <p className="text-3xl font-bold text-white headline-font tracking-tight mb-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-on-surface-variant">{subtitle}</p>
      )}
    </div>
  );
}