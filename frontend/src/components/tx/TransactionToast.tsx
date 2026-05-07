"use client";

import { motion } from "framer-motion";
import type { TransactionState } from "@/types";

const ETHERSCAN_BASE = "https://sepolia.etherscan.io/tx";

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export function TransactionToast({
  tx,
  onDismiss,
  onRetry,
}: {
  tx: TransactionState;
  onDismiss: () => void;
  onRetry: () => void;
}) {
  const isPending = tx.status === "pending";
  const isConfirmed = tx.status === "confirmed";
  const isFailed = tx.status === "failed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl backdrop-blur-xl border border-white/10 shadow-xl"
      style={{ background: "rgba(23, 31, 51, 0.85)" }}
    >
      {/* Accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] ${
          isPending
            ? "bg-gradient-to-b from-primary/80 to-primary/20"
            : isConfirmed
            ? "bg-gradient-to-b from-secondary/80 to-secondary/20"
            : "bg-gradient-to-b from-error/80 to-error/20"
        }`}
      />

      <div className="pl-4 pr-3 py-3 flex items-start gap-3">
        {/* Status icon */}
        <div className="mt-0.5 shrink-0">
          {isPending && (
            <span className="material-symbols-outlined text-primary text-xl animate-spin">
              progress_activity
            </span>
          )}
          {isConfirmed && (
            <span
              className="material-symbols-outlined text-secondary text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          )}
          {isFailed && (
            <span className="material-symbols-outlined text-error text-xl">error</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0" role="status" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-white truncate">{tx.label}</p>
            <button
              onClick={onDismiss}
              className="shrink-0 w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          {tx.hash && (
            <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">
              {truncateHash(tx.hash)}
            </p>
          )}

          {isPending && (
            <p className="text-[11px] text-primary/80 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] animate-pulse">hourglass_top</span>
              Awaiting confirmation...
            </p>
          )}

          {isConfirmed && tx.hash && (
            <a
              href={`${ETHERSCAN_BASE}/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-primary hover:underline mt-1 inline-flex items-center gap-1"
            >
              View on Etherscan
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </a>
          )}

          {isFailed && (
            <div className="mt-1">
              <p className="text-[11px] text-error">{tx.error}</p>
              {tx.retry && (
                <button
                  onClick={onRetry}
                  className="mt-1.5 text-[11px] font-bold text-primary hover:text-primary-container transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}