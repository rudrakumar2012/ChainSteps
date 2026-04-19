"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const FACES = [
  { icon: "shield", label: "Non-Custodial", transform: "translateZ(60px)" },
  { icon: "lock", label: "Smart Contract Secured", transform: "rotateY(180deg) translateZ(60px)" },
  { icon: "gavel", label: "Dispute Resolution", transform: "rotateY(90deg) translateZ(60px)" },
  { icon: "verified", label: "Milestone Verified", transform: "rotateY(-90deg) translateZ(60px)" },
  { icon: "link", label: "On-Chain", transform: "rotateX(90deg) translateZ(60px)" },
  { icon: "code", label: "Open Source", transform: "rotateX(-90deg) translateZ(60px)" },
];

const ORBITAL_NODES = [
  { radius: 110, duration: 12, delay: 0, startAngle: 0 },
  { radius: 120, duration: 15, delay: -3, startAngle: 60 },
  { radius: 105, duration: 10, delay: -5, startAngle: 120 },
  { radius: 115, duration: 13, delay: -8, startAngle: 180 },
  { radius: 100, duration: 11, delay: -2, startAngle: 240 },
  { radius: 125, duration: 14, delay: -6, startAngle: 300 },
];

function orbitPath(radius: number, startAngle: number) {
  const rad = (angle: number) => (angle * Math.PI) / 180;
  const keyframes = [0, 90, 180, 270, 360].map((angle) => ({
    x: +(radius * Math.cos(rad(startAngle + angle))).toFixed(1),
    y: +(radius * Math.sin(rad(startAngle + angle)) * 0.4).toFixed(1),
  }));
  return {
    x: keyframes.map((k) => k.x),
    y: keyframes.map((k) => k.y),
  };
}

export function BlockchainCube() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springX = useSpring(tiltX, { stiffness: 50, damping: 20 });
  const springY = useSpring(tiltY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      tiltX.set(dy * -15);
      tiltY.set(dx * 15);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, tiltX, tiltY]);

  // Reset tilt when mouse leaves
  useEffect(() => {
    if (!isHovering && !isMobile) {
      tiltX.set(0);
      tiltY.set(0);
    }
  }, [isHovering, isMobile, tiltX, tiltY]);

  const cubeSize = isMobile ? 40 : 60;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* SVG connection lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="-150 -80 300 160"
      >
        {ORBITAL_NODES.map((node, i) => {
          const nextNode = ORBITAL_NODES[(i + 1) % ORBITAL_NODES.length];
          const rad = (angle: number) => (angle * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={+(node.radius * Math.cos(rad(node.startAngle))).toFixed(1)}
              y1={+(node.radius * Math.sin(rad(node.startAngle)) * 0.4).toFixed(1)}
              x2={+(nextNode.radius * Math.cos(rad(nextNode.startAngle))).toFixed(1)}
              y2={+(nextNode.radius * Math.sin(rad(nextNode.startAngle)) * 0.4).toFixed(1)}
              stroke="rgba(76, 215, 246, 0.15)"
              strokeWidth="1"
              strokeDasharray="4 4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="8"
                dur="2s"
                repeatCount="indefinite"
              />
            </line>
          );
        })}
      </svg>

      {/* Orbital nodes */}
      {ORBITAL_NODES.map((node, i) => {
        const path = orbitPath(node.radius, node.startAngle);
        return (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-primary/60 orbital-node"
            animate={{ x: path.x, y: path.y }}
            transition={{
              duration: node.duration,
              repeat: Infinity,
              ease: "linear",
              delay: node.delay,
            }}
          />
        );
      })}

      {/* 3D Cube */}
      <div className="perspective-1000">
        <motion.div
          className="preserve-3d relative"
          style={{
            width: cubeSize * 2,
            height: cubeSize * 2,
            rotateX: springX,
            rotateY: springY,
          }}
          animate={!isHovering ? { rotateY: [0, 360] } : undefined}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {FACES.map((face, i) => (
            <div
              key={i}
              className="cube-face absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg"
              style={{
                transform: face.transform.replace("60px", `${cubeSize}px`),
                background: "rgba(23, 31, 51, 0.75)",
                border: "1px solid rgba(76, 215, 246, 0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: isMobile ? "16px" : "22px" }}
              >
                {face.icon}
              </span>
              <span
                className="text-[8px] sm:text-[9px] font-bold text-on-surface-variant uppercase tracking-wider text-center leading-tight"
              >
                {face.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}