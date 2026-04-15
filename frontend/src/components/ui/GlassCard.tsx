import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowIntensity?: "sm" | "md" | "lg";
}

export function GlassCard({
  children,
  className = "",
  glowIntensity = "sm",
}: GlassCardProps) {
  const glowClasses = {
    sm: "",
    md: "hover:shadow-lg hover:shadow-primary/5",
    lg: "hover:shadow-2xl hover:shadow-primary/10",
  };

  return (
    <div
      className={`
        glass-card rounded-2xl p-6
        transition-all duration-300 ease-in-out
        ${glowClasses[glowIntensity]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}