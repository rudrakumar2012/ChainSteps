import { AppShell } from "@/components/layout";

export default function Home() {
  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h2 className="headline-font text-4xl font-bold tracking-tight text-white mb-2">
            Protocol Overview
          </h2>
          <p className="text-on-surface-variant max-w-lg">
            Monitor your decentralized escrow contracts and milestone-based
            liquidity flows across the network.
          </p>
        </div>
      </div>
    </AppShell>
  );
}