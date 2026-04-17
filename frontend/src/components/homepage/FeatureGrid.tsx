"use client";

import { motion } from "framer-motion";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: "lock",
    title: "Non-Custodial Escrow",
    description:
      "Funds are locked in smart contracts, not held by intermediaries. You maintain control throughout the entire milestone process.",
  },
  {
    icon: "timeline",
    title: "Milestone-Based Releases",
    description:
      "Release funds incrementally as work is completed and verified. Each milestone requires explicit approval from both parties.",
  },
  {
    icon: "balance",
    title: "Built-In Dispute Resolution",
    description:
      "Neutral arbitration for contested milestones with timeout-based automatic release to prevent funds being locked indefinitely.",
  },
  {
    icon: "cloud_upload",
    title: "IPFS Evidence Storage",
    description:
      "Store work proofs, deliverables, and communication on decentralized storage linked to each milestone for transparent verification.",
  },
  {
    icon: "bolt",
    title: "Low-Cost Execution",
    description:
      "Designed for minimal gas consumption. Each milestone operation costs less than $0.10 on Ethereum Sepolia testnet.",
  },
  {
    icon: "group",
    title: "Role-Based Permissions",
    description:
      "Clear client/freelancer roles with distinct permissions. Clients fund milestones, freelancers submit deliverables for approval.",
  },
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

export function FeatureGrid() {
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
            Why Choose ChainSteps?
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            A decentralized escrow protocol built for trustless collaboration
            between clients and freelancers.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                glowIntensity={index % 3 === 0 ? "lg" : "md"}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}