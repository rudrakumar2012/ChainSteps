import { HomeHeader } from "@/components/homepage/HomeHeader";
import { Hero } from "@/components/homepage/Hero";
import { FeatureGrid } from "@/components/homepage/FeatureGrid";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { TrustIndicators } from "@/components/homepage/TrustIndicators";
import { HomepageStatsProvider } from "@/components/homepage/HomepageStatsProvider";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <HomeHeader />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:rounded-lg focus:text-sm focus:font-bold">Skip to content</a>
      <main id="main-content">
        <HomepageStatsProvider>
          <Hero />
          <FeatureGrid />
          <HowItWorks />
          <TrustIndicators />
        </HomepageStatsProvider>
        {/* Footer */}
        <footer className="py-12 bg-surface-container-low">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="ChainSteps" className="w-10 h-10" />
                <div>
                  <h1 className="text-xl font-bold tracking-tighter text-primary headline-font">
                    ChainSteps
                  </h1>
                  <p className="text-[11px] text-on-surface-variant uppercase tracking-[0.2em]">
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