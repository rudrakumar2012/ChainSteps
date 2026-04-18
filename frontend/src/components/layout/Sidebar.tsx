"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWalletContext } from "../wallet/WalletProvider";

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
        <WalletConnection />
      </div>
    </aside>
  );
}

function WalletConnection() {
  const { address, isConnected, connect, disconnect } = useWalletContext();

  if (isConnected && address) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container w-full border border-primary/20">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-xs font-bold text-on-primary shadow-lg shadow-primary/20 shrink-0">
            {address.slice(2, 4).toUpperCase()}
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-xs font-bold text-white truncate">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            <p className="text-[10px] text-secondary flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_5px_#4edea3]"></span>
              Connected
            </p>
          </div>
        </div>
        <button
          onClick={disconnect}
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors ml-2 shrink-0"
          title="Disconnect Wallet"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={connect}
      className="flex items-center gap-3 p-3 rounded-xl bg-surface-container w-full hover:bg-surface-container-high hover:border-primary/30 transition-all border border-transparent group"
    >
      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-on-surface-variant border border-outline-variant/20 group-hover:text-primary transition-colors">
        <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
      </div>
      <div className="overflow-hidden text-left">
        <p className="text-xs font-bold text-on-surface truncate group-hover:text-white transition-colors">Not Connected</p>
        <p className="text-[10px] text-primary">Connect Wallet</p>
      </div>
    </button>
  );
}