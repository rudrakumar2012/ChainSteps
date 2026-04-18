"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Create & Define",
    description:
      "Client calls createEscrow() with the freelancer's address and an arbitrator, then adds milestones via addMilestone() with descriptions and ETH amounts.",
    icon: "add_circle",
    color: "primary",
  },
  {
    number: "02",
    title: "Fund & Activate",
    description:
      "Client sends ETH to fundEscrow(). The contract verifies the total matches all milestone amounts, then activates the escrow. Funds are locked until milestone rules are met.",
    icon: "account_balance",
    color: "secondary",
  },
  {
    number: "03",
    title: "Submit Work",
    description:
      "Freelancer completes deliverables and calls completeMilestone(). A 7-day approval countdown starts. Evidence can be uploaded to IPFS for verification.",
    icon: "work",
    color: "tertiary",
  },
  {
    number: "04",
    title: "Approve & Release",
    description:
      "Client reviews and calls approveMilestone() to release ETH to the freelancer. If the client is unresponsive, the freelancer claims via claimMilestone() after timeout.",
    icon: "verified",
    color: "primary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const shadowClasses: Record<string, string> = {
  primary: "shadow-primary/20",
  secondary: "shadow-secondary/20",
  tertiary: "shadow-tertiary/20",
};

export function HowItWorks() {
  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="headline-font text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Four simple steps from agreement to payment, secured by smart
            contracts.
          </p>
        </motion.div>

        {/* Desktop: Horizontal Stepper */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-8 h-0.5 bg-outline-variant/20" />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-4 gap-8 relative"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={stepVariants}
                  className="flex flex-col items-center text-center"
                >
                  {/* Step Number & Icon */}
                  <div className="relative mb-6">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center
                      ${
                        step.color === "primary"
                          ? "bg-gradient-to-br from-primary to-primary-container"
                          : step.color === "secondary"
                          ? "bg-gradient-to-br from-secondary to-secondary-container"
                          : "bg-gradient-to-br from-tertiary to-tertiary-container"
                      }
                      shadow-lg ${shadowClasses[step.color]}`}
                    >
                      <span className="material-symbols-outlined text-on-primary text-2xl">
                        {step.icon}
                      </span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border-2 border-surface">
                      <span className="text-xs font-bold text-on-surface">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="headline-font text-xl font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Mobile: Vertical Stepper */}
        <div className="lg:hidden">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative pl-8"
          >
            {/* Vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-outline-variant/20" />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={stepVariants}
                className="relative mb-12 last:mb-0"
              >
                {/* Step node */}
                <div
                  className={`absolute -left-8 top-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${
                    step.color === "primary"
                      ? "bg-gradient-to-br from-primary to-primary-container"
                      : step.color === "secondary"
                      ? "bg-gradient-to-br from-secondary to-secondary-container"
                      : "bg-gradient-to-br from-tertiary to-tertiary-container"
                  }
                  shadow-lg ${shadowClasses[step.color]}`}
                >
                  <span className="material-symbols-outlined text-on-primary text-sm">
                    {step.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="ml-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                      {step.number}
                    </span>
                    <h3 className="headline-font text-lg font-bold text-white">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-on-surface-variant text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}