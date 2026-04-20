"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "My Contracts", icon: "description", href: "/contracts" },
  { label: "Create New Escrow", icon: "add_circle", href: "/create" },
  { label: "Dispute Resolution", icon: "gavel", href: "/disputes" },
];

export function Sidebar({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="h-screen w-64 bg-surface-container-low shadow-2xl shadow-cyan-900/20 flex flex-col border-r border-white/5">
      {/* Logo */}
      <div className="px-6 mb-10 mt-6">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="ChainSteps" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-primary headline-font">
              ChainSteps
            </h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">
              Decentralized Escrow
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={`
              flex items-center gap-4 px-6 py-3
              text-sm tracking-tight
              transition-all duration-200 ease-in-out
              ${
                isActive(item.href)
                  ? "text-white border-l-4 border-primary bg-gradient-to-r from-primary/10 to-transparent"
                  : "text-on-surface-variant hover:text-primary hover:bg-white/5"
              }
            `}
          >
            <span className="material-symbols-outlined text-lg">{item.icon}</span>
            <span className="headline-font">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Network info */}
      <div className="px-4 pt-6 mt-auto">
        <div className="p-3 rounded-xl bg-surface-container border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Network</span>
            <span className="text-[10px] text-secondary font-medium">Sepolia</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Contract</span>
            <span className="text-[10px] text-on-surface-variant font-mono">0xb690...0E</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Chain</span>
            <span className="text-[10px] text-on-surface-variant font-mono">11155111</span>
          </div>
        </div>
        <p className="text-[9px] text-on-surface-variant/50 text-center mt-3 mb-2">
          v1.0.0 &middot; ChainSteps
        </p>
      </div>
    </aside>
  );
}