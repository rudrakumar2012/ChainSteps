"use client";

import { useEffect, useRef } from "react";
import { useWalletContext } from "./WalletProvider";
import type { EIP6963ProviderDetail } from "@/lib/eip6963";

interface WalletChooserModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletChooserModal({ open, onClose }: WalletChooserModalProps) {
  const { providers, selectProvider, connect } = useWalletContext();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (!open) return;

    const container = modalRef.current;
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    first?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = async (detail: EIP6963ProviderDetail) => {
    selectProvider(detail.info.rdns);
    onClose();
    connect(detail.provider);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a wallet to connect"
    >
      <div
        ref={modalRef}
        className="glass-card rounded-2xl p-6 w-full max-w-sm mx-4 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white headline-font">Connect Wallet</h3>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close wallet chooser"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant mb-4">
          Choose a wallet to connect to ChainSteps
        </p>

        {providers.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">
              account_balance_wallet_off
            </span>
            <p className="text-sm text-on-surface-variant">No wallets detected</p>
            <p className="text-xs text-on-surface-variant/60 mt-1">
              Install MetaMask or another Ethereum wallet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {providers.map((detail) => (
              <button
                key={detail.info.rdns}
                onClick={() => handleSelect(detail)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary/30 transition-all group"
              >
                {detail.info.icon ? (
                  <img
                    src={detail.info.icon}
                    alt={detail.info.name}
                    className="w-8 h-8 rounded-lg"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                  </div>
                )}
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                    {detail.info.name}
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}