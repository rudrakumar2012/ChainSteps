"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { ConnectButton } from "../wallet/ConnectButton";
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

export function HomeHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected } = useWalletContext();

  const handleConnected = useCallback(() => {
    if (pathname === "/") {
      router.push("/dashboard");
    }
  }, [pathname, router]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          {isConnected && (
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg
                    text-sm tracking-tight transition-all duration-200
                    ${
                      isActive(item.href)
                        ? "text-white bg-surface-container"
                        : "text-on-surface-variant hover:text-primary hover:bg-white/5"
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-lg">
                    {item.icon}
                  </span>
                  <span className="headline-font">{item.label}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Wallet Connection */}
          <div className="flex items-center gap-4">
            <ConnectButton location="homepage" onConnected={handleConnected} />
          </div>
        </div>

        {/* Mobile Navigation (simplified) */}
        {isConnected && (
          <div className="md:hidden mt-4">
            <div className="flex items-center justify-between">
              <nav className="flex items-center gap-1 overflow-x-auto pb-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap
                      text-xs tracking-tight transition-colors
                      ${
                        isActive(item.href)
                          ? "text-white bg-surface-container"
                          : "text-on-surface-variant hover:text-primary hover:bg-white/5"
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-base">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}