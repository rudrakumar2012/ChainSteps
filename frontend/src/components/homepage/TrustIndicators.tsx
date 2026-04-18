"use client";

import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";

const indicators = [
  {
    title: "Total Value Locked",
    value: "42.50 ETH",
    description: "Secured across all active escrows",
    icon: "lock",
    color: "primary",
  },
  {
    title: "Active Contracts",
    value: "1,200+",
    description: "Ongoing milestone‑based agreements",
    icon: "description",
    color: "secondary",
  },
  {
    title: "Success Rate",
    value: "98.2%",
    description: "Of milestones completed without dispute",
    icon: "verified",
    color: "tertiary",
  },
  {
    title: "Avg. Cost",
    value: "$0.10",
    description: "Per milestone operation on Sepolia",
    icon: "savings",
    color: "primary",
  },
];

const badges = [
  { label: "Non‑Custodial", icon: "shield" },
  { label: "Fully Audited", icon: "security" },
  { label: "Open Source", icon: "code" },
  { label: "Decentralized", icon: "language" },
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

export function TrustIndicators() {
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
            Built on Ethereum with verifiable security and real‑time metrics.
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
                      {indicator.value}
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
            Security & Compliance
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