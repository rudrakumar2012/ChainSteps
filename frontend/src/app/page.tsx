import { HomeHeader } from "@/components/homepage/HomeHeader";
import { Hero } from "@/components/homepage/Hero";
import { FeatureGrid } from "@/components/homepage/FeatureGrid";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { TrustIndicators } from "@/components/homepage/TrustIndicators";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <HomeHeader />
      <main>
        <Hero />
        <FeatureGrid />
        <HowItWorks />
        <TrustIndicators />
        {/* Footer */}
        <footer className="py-12 border-t border-white/5 bg-surface-container-low">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
              <div className="text-center md:text-right">
                <p className="text-sm text-on-surface-variant">
                  © {new Date().getFullYear()} ChainSteps Protocol
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Decentralized milestone escrow on Ethereum
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}