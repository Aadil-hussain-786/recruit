"use client";

import React from "react";
import { motion } from "framer-motion";

interface HandwrittenTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const HandwrittenText: React.FC<HandwrittenTextProps> = ({ 
  text, 
  className = "", 
  delay = 0 
}) => {
  // Animate by words instead of individual characters for performance
  const words = text.split(" ");

  return (
    <span 
      className={`inline-block ${className}`}
      style={{ fontFamily: "var(--font-caveat), cursive" }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.08,
            ease: "easeOut",
          }}
          style={{ 
            display: "inline-block",
            marginRight: "0.25em",
            textShadow: "0 0 1px currentColor" 
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

export const ScribbleUnderline = ({ delay = 1 }: { delay?: number }) => {
  return (
    <motion.svg
      viewBox="0 0 300 20"
      className="absolute -bottom-4 left-0 w-full h-4 text-accent-cyan opacity-70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay }}
    >
      <motion.path
        d="M5 15 Q 50 5, 150 12 Q 250 18, 295 8"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

export const HighlightCircle = ({ delay = 1.5 }: { delay?: number }) => {
  return (
    <motion.svg
      viewBox="0 0 100 40"
      className="absolute -inset-2 w-[110%] h-[120%] text-accent-cyan opacity-40 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay }}
    >
      <motion.path
        d="M 5,20 C 5,5 95,5 95,20 C 95,35 5,35 8,22"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};
