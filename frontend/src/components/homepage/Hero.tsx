"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletContext } from "../wallet/WalletProvider";
import { useHomepageStats } from "@/hooks/useHomepageStats";
import { BlockchainCube } from "./BlockchainCube";

function StatValue({ value, suffix, loading, error }: { value: string; suffix?: string; loading: boolean; error: string | null }) {
  if (loading) return <span className="inline-block w-16 h-8 bg-surface-container-high rounded animate-pulse" />;
  if (error) return <span>--</span>;
  return <>{value}{suffix}</>;
}

export function Hero() {
  const [gradientIndex, setGradientIndex] = useState(0);
  const { isConnected, connect } = useWalletContext();
  const router = useRouter();
  const [wantsToLaunch, setWantsToLaunch] = useState(false);
  const { stats, loading, error } = useHomepageStats();

  useEffect(() => {
    if (isConnected && wantsToLaunch) {
      router.push("/dashboard");
    }
  }, [isConnected, wantsToLaunch, router]);

  const handleLaunch = () => {
    if (isConnected) {
      router.push("/dashboard");
    } else {
      setWantsToLaunch(true);
      connect();
    }
  };

  const gradients = [
    "linear-gradient(135deg, #4cd7f6 0%, #06b6d4 50%, #4edea3 100%)",
    "linear-gradient(135deg, #4edea3 0%, #06b6d4 50%, #4cd7f6 100%)",
    "linear-gradient(135deg, #7bd0ff 0%, #23b2ec 50%, #4cd7f6 100%)",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setGradientIndex((prev) => (prev + 1) % gradients.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [gradients.length]);

  const statItems = [
    { value: stats.totalLocked, suffix: " ETH", label: "Value Locked" },
    { value: String(stats.totalEscrows), suffix: "", label: "Total Escrows" },
    { value: stats.milestoneCompletionRate, suffix: "%", label: "Milestone Rate" },
    { value: String(stats.completedEscrows), suffix: "", label: "Completed" },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-surface">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      {/* Hero Content — 2-col on desktop, stacked on mobile */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: 3D Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative h-[300px] sm:h-[360px] lg:h-[420px] order-1 lg:order-1"
          >
            <BlockchainCube />
          </motion.div>

          {/* Right: Text + CTAs + Stats */}
          <div className="text-center lg:text-left order-2 lg:order-2">
            {/* Animated Gradient Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="headline-font text-5xl md:text-7xl font-bold tracking-tighter mb-6">
                <span
                  className="bg-clip-text text-transparent animate-gradient"
                  style={{
                    backgroundImage: gradients[gradientIndex],
                    transition: "background-image 1s ease",
                  }}
                >
                  Trustless Escrow
                </span>
                <br />
                <span className="text-white">for Web3</span>
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto lg:mx-0 mb-10">
                Secure milestone-based contracts with decentralized verification,
                transparent funding, and built-in dispute resolution.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12"
            >
              <Button variant="primary" size="lg" onClick={handleLaunch}>
                <span className="material-symbols-outlined">rocket_launch</span>
                Launch App
              </Button>
              <Button variant="ghost" size="lg" onClick={() => router.push("/contracts")}>
                <span className="material-symbols-outlined">visibility</span>
                View Contracts
              </Button>
            </motion.div>

            {/* Real Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {statItems.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    <StatValue value={stat.value} suffix={stat.suffix} loading={loading} error={error} />
                  </div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="material-symbols-outlined text-on-surface-variant">
          expand_more
        </span>
      </motion.div>
    </section>
  );
}