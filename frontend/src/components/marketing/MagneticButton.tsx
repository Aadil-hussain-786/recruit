"use client";

import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  strength?: number; // px the element can move toward the cursor
}

export default function MagneticButton({ children, strength = 20 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.3 });

  function handleMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    const distX = Math.max(-strength, Math.min(strength, relX / 6));
    const distY = Math.max(-strength, Math.min(strength, relY / 6));
    x.set(distX);
    y.set(distY);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="inline-block will-change-transform"
    >
      {children}
    </motion.div>
  );
}
