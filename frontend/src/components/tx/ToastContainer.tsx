"use client";

import { AnimatePresence } from "framer-motion";
import { useTransactionContext } from "./TransactionProvider";
import { TransactionToast } from "./TransactionToast";

export function ToastContainer() {
  const { transactions, dismiss, retryTx } = useTransactionContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {transactions.map((tx) => (
          <div key={tx.id} className="pointer-events-auto">
            <TransactionToast tx={tx} onDismiss={() => dismiss(tx.id)} onRetry={() => retryTx(tx.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}