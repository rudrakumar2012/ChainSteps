"use client";

import { motion } from "framer-motion";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: "lock",
    title: "Non-Custodial Escrow",
    description:
      "Funds are locked in the smart contract at 0x7b2D...9021, not held by any intermediary. The contract enforces release rules \u2014 no one can freeze or redirect your escrow.",
  },
  {
    icon: "timeline",
    title: "Milestone-Based Payments",
    description:
      "Break work into sequential milestones. Each requires explicit approval via approveMilestone(). If the client goes silent, claimMilestone() auto-releases funds after 7 days.",
  },
  {
    icon: "balance",
    title: "Arbitrated Dispute Resolution",
    description:
      "When milestones are contested, a designated arbitrator resolves disputes with an on-chain percentage split via resolveDispute(). Both parties receive their share transparently.",
  },
  {
    icon: "cloud_upload",
    title: "IPFS Evidence Storage",
    description:
      "Submit work proofs and deliverables to IPFS for tamper-resistant, decentralized storage linked to each milestone. Evidence persists independent of any single server.",
  },
  {
    icon: "security",
    title: "Reentrancy-Protected",
    description:
      "All value-transfer functions use OpenZeppelin's ReentrancyGuard. Built on Solidity 0.8.28 with native overflow protection. No unaudited external dependencies.",
  },
  {
    icon: "group",
    title: "Role-Based Access Control",
    description:
      "Contract-enforced roles: only the client can fund and approve, only the freelancer can submit and claim. State transitions are guarded by inState modifiers.",
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