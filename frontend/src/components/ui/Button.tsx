import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
}: ButtonProps) {
  const baseClasses =
    "font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 hover:brightness-110",
    secondary:
      "bg-secondary text-on-secondary hover:brightness-110",
    ghost:
      "text-on-surface hover:bg-surface-variant/50",
    danger:
      "border border-error/50 text-error hover:bg-error/10",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs min-h-[44px]",
    md: "px-5 py-2 text-sm min-h-[44px]",
    lg: "px-6 py-3 text-base min-h-[44px]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}