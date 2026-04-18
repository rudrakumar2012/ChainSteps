"use client";

import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { useHomepageStats } from "@/hooks/useHomepageStats";

const badges = [
  { label: "Non-Custodial", icon: "shield" },
  { label: "Reentrancy Guard", icon: "security" },
  { label: "Open Source", icon: "code" },
  { label: "On-Chain Verification", icon: "language" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const shadowClasses: Record<string, string> = {
  primary: "shadow-primary/20",
  secondary: "shadow-secondary/20",
  tertiary: "shadow-tertiary/20",
};

function StatSkeleton() {
  return <span className="inline-block w-20 h-6 bg-surface-container-high rounded animate-pulse" />;
}

export function TrustIndicators() {
  const { stats, loading, error } = useHomepageStats();

  const indicators = [
    {
      title: "Total Value Locked",
      value: loading ? null : error ? "--" : `${stats.totalLocked} ETH`,
      description: "Secured across all active escrows on Sepolia",
      icon: "lock",
      color: "primary",
    },
    {
      title: "Total Escrows",
      value: loading ? null : error ? "--" : String(stats.totalEscrows),
      description: "Escrow contracts deployed since inception",
      icon: "description",
      color: "secondary",
    },
    {
      title: "Milestone Completion",
      value: loading ? null : error ? "--" : `${stats.milestoneCompletionRate}%`,
      description: "Of milestones completed and approved on-chain",
      icon: "verified",
      color: "tertiary",
    },
    {
      title: "Completed Escrows",
      value: loading ? null : error ? "--" : String(stats.completedEscrows),
      description: "Fully settled with all milestones released",
      icon: "handshake",
      color: "primary",
    },
  ];

  return (
    <section className="py-20 bg-surface-container-low">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="headline-font text-4xl md:text-5xl font-bold text-white mb-4">
            Trust & Transparency
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Real metrics from the ChainSteps protocol on Ethereum Sepolia.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {indicators.map((indicator, index) => (
            <motion.div key={index} variants={itemVariants}>
              <GlassCard glowIntensity="md">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center
                    ${
                      indicator.color === "primary"
                        ? "bg-gradient-to-br from-primary to-primary-container"
                        : indicator.color === "secondary"
                        ? "bg-gradient-to-br from-secondary to-secondary-container"
                        : "bg-gradient-to-br from-tertiary to-tertiary-container"
                    }
                    shadow-lg ${shadowClasses[indicator.color]}`}
                  >
                    <span className="material-symbols-outlined text-on-primary text-xl">
                      {indicator.icon}
                    </span>
                  </div>
                  <div>
                    <div className="headline-font text-2xl font-bold text-white mb-1">
                      {indicator.value === null ? <StatSkeleton /> : indicator.value}
                    </div>
                    <h3 className="font-bold text-white mb-1">
                      {indicator.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant">
                      {indicator.description}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Security Badges */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="headline-font text-2xl font-bold text-white text-center mb-8">
            Security & Integrity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
              <motion.div key={index} variants={itemVariants}>
                <GlassCard glowIntensity="sm" className="text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-primary">
                        {badge.icon}
                      </span>
                    </div>
                    <span className="font-bold text-white">{badge.label}</span>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}