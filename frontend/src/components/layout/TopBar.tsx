"use client";

import { useWalletContext } from "../wallet/WalletProvider";
import { ConnectButton } from "../wallet/ConnectButton";

export function TopBar() {
  const { chainId } = useWalletContext();
  const isSepolia = chainId === 11155111;

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 bg-surface/80 backdrop-blur-md z-40 flex justify-between items-center px-8 border-b border-white/5">
      {/* Network Status */}
      <div className="flex items-center gap-4">
        <div className="bg-surface-container-high/50 px-4 py-1.5 rounded-full flex items-center gap-2 border border-outline-variant/20">
          <span
            className={`w-2 h-2 rounded-full ${
              isSepolia ? "bg-secondary shadow-[0_0_8px_#4edea3]" : "bg-error shadow-[0_0_8px_#ffb4ab]"
            }`}
          />
          <span className="font-body text-sm font-medium text-on-surface-variant">
            {isSepolia ? "Sepolia Network" : "Wrong Network"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-on-surface-variant">
          <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">
            notifications
          </span>
          <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">
            settings
          </span>
        </div>
        <ConnectButton location="dashboard" />
      </div>
    </header>
  );
}