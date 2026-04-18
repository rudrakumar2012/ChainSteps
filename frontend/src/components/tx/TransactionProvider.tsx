"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import type { TransactionState, TransactionStatus } from "@/types";
import type { TxHandle } from "@/lib/contract";

interface TransactionContextValue {
  transactions: TransactionState[];
  pendingCount: number;
  trackTx: (label: string, txFn: () => Promise<TxHandle>) => Promise<TxHandle>;
  dismiss: (id: string) => void;
  retryTx: (id: string) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

const MAX_TOASTS = 10;
const AUTO_DISMISS_MS = 5000;

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<TransactionState[]>([]);
  const idCounter = useRef(0);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const pendingCount = transactions.filter((t) => t.status === "pending").length;

  const scheduleAutoDismiss = useCallback((id: string) => {
    const timer = setTimeout(() => {
      dismiss(id);
    }, AUTO_DISMISS_MS);
    timers.current.set(id, timer);
  }, []);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const trackTx = useCallback(
    (label: string, txFn: () => Promise<TxHandle>): Promise<TxHandle> => {
      const id = String(++idCounter.current);

      return txFn()
        .then((handle) => {
          const entry: TransactionState = {
            id,
            status: "pending",
            hash: handle.hash,
            error: null,
            label,
            createdAt: Date.now(),
          };

          setTransactions((prev) => {
            const next = [...prev, entry];
            return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
          });

          handle
            .wait()
            .then(() => {
              setTransactions((prev) =>
                prev.map((t) =>
                  t.id === id ? { ...t, status: "confirmed" as TransactionStatus } : t
                )
              );
              scheduleAutoDismiss(id);
            })
            .catch((err: any) => {
              setTransactions((prev) =>
                prev.map((t) =>
                  t.id === id
                    ? {
                        ...t,
                        status: "failed" as TransactionStatus,
                        error: err?.reason || err?.message || "Transaction failed",
                        retry: async () => { await trackTx(label, txFn); },
                      }
                    : t
                )
              );
            });

          return handle;
        })
        .catch((err) => {
          // MetaMask rejection before tx is sent — no toast, just re-throw
          throw err;
        });
    },
    [scheduleAutoDismiss]
  );

  const retryTx = useCallback(
    async (id: string) => {
      const tx = transactions.find((t) => t.id === id);
      if (!tx?.retry) return;
      dismiss(id);
      await tx.retry();
    },
    [transactions, dismiss]
  );

  return (
    <TransactionContext.Provider value={{ transactions, pendingCount, trackTx, dismiss, retryTx }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (!context) throw new Error("useTransactionContext must be used within TransactionProvider");
  return context;
}