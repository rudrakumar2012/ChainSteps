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

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low shadow-2xl shadow-cyan-900/20 flex flex-col z-50 border-r border-white/5">
      {/* Logo */}
      <div className="px-6 mb-10 mt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary text-xl">
              account_balance_wallet
            </span>
          </div>
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

      {/* Wallet info */}
      <div className="px-6 pt-6 mt-auto border-t border-white/5">
        <button className="flex items-center gap-3 p-3 rounded-xl bg-surface-container w-full hover:bg-surface-container-high transition-colors">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant border border-outline-variant/20">
            0x...
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-xs font-bold text-on-surface truncate">Not Connected</p>
            <p className="text-[10px] text-primary">Connect Wallet</p>
          </div>
        </button>
      </div>
    </aside>
  );
}