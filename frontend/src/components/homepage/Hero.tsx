"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWalletContext } from "../wallet/WalletProvider";

export function Hero() {
  const [gradientIndex, setGradientIndex] = useState(0);
  const { isConnected, connect } = useWalletContext();
  const router = useRouter();
  const [wantsToLaunch, setWantsToLaunch] = useState(false);

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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface">
      {/* Floating Orbs Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-3/4 left-3/4 w-48 h-48 rounded-full bg-tertiary/10 blur-3xl"
          animate={{
            x: [0, 15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Gradient Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="headline-font text-5xl md:text-7xl font-bold tracking-tighter mb-6">
              <span
                className="bg-clip-text text-transparent bg-gradient-to-br from-primary to-secondary animate-gradient"
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
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto mb-10">
              Secure milestone-based contracts with decentralized verification,
              transparent funding, and built-in dispute resolution.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button variant="primary" size="lg" onClick={handleLaunch}>
              <span className="material-symbols-outlined">rocket_launch</span>
              Launch App
            </Button>
            <Button variant="ghost" size="lg">
              <span className="material-symbols-outlined">play_circle</span>
              View Demo
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                42.5K
              </div>
              <div className="text-sm text-on-surface-variant">ETH Locked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                1,200+
              </div>
              <div className="text-sm text-on-surface-variant">Active Contracts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                98.2%
              </div>
              <div className="text-sm text-on-surface-variant">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                $0.10
              </div>
              <div className="text-sm text-on-surface-variant">Per Milestone</div>
            </div>
          </motion.div>
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