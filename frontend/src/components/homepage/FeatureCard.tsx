import { ReactNode } from "react";
import { GlassCard } from "../ui/GlassCard";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  glowIntensity?: "sm" | "md" | "lg";
  children?: ReactNode;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  glowIntensity = "md",
  children,
  className = "",
}: FeatureCardProps) {
  return (
    <GlassCard glowIntensity={glowIntensity} className={`h-full ${className}`}>
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <span className="material-symbols-outlined text-on-primary text-xl">
              {icon}
            </span>
          </div>
          <h3 className="headline-font text-xl font-bold text-white mb-2">
            {title}
          </h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {description}
          </p>
        </div>
        {children && <div className="mt-auto">{children}</div>}
      </div>
    </GlassCard>
  );
}