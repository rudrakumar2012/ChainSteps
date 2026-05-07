"use client";

import { useWalletContext } from "../wallet/WalletProvider";
import { useTransactionContext } from "../tx/TransactionProvider";
import { ConnectButton } from "../wallet/ConnectButton";
import { useMobileNav } from "./AppShell";

export function TopBar() {
  const { chainId } = useWalletContext();
  const { pendingCount } = useTransactionContext();
  const { toggle } = useMobileNav();
  const isSepolia = chainId === 11155111;

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-14 sm:h-16 bg-surface/80 backdrop-blur-md z-40 flex justify-between items-center px-3 sm:px-6 lg:px-8 border-b border-white/5">
      {/* Left: Hamburger + Network */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={toggle}
          className="lg:hidden w-11 h-11 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="bg-surface-container-high/50 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2 border border-outline-variant/20">
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              isSepolia ? "bg-secondary shadow-[0_0_8px_#4edea3]" : "bg-error shadow-[0_0_8px_#ffb4ab]"
            }`}
          />
          <span className="font-body text-xs sm:text-sm font-medium text-on-surface-variant">
            {isSepolia ? "Sepolia" : "Wrong Network"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        <div className="flex items-center gap-4 text-on-surface-variant">
          <div className="relative cursor-pointer hover:text-primary transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">notifications</span>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error text-on-error text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(255,180,171,0.5)]">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            )}
          </div>
        </div>
        <ConnectButton location="dashboard" />
      </div>
    </header>
  );
}