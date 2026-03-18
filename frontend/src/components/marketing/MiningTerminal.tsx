"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SEQUENCES = [
  "INITIALIZING_NEURAL_MESH...",
  "ACCESSING_DEEP_WEB_INDEX_0x44...",
  "EXTRACTING_SUBTEXTUAL_ROLE_SIGNALS",
  "MAPPING_CANDIDATE_DNA_VECTOR",
  "CROSS_REFERENCING_BEHAVIORAL_PATTERNS",
  "IDENTIFYING_10x_ASSETS...",
  "SIGNAL_STRENGTH_V10_ACTIVE",
  "SYNCING_WITH_CORE_ENGINE",
];

export default function MiningTerminal({ dark = true }: { dark?: boolean }) {
  const [lines, setLines] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLines((prev) => {
        const next = [...prev, SEQUENCES[index]];
        if (next.length > 6) next.shift();
        return next;
      });
      setIndex((prev) => (prev + 1) % SEQUENCES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <div className={`border p-6 font-mono text-[10px] h-[240px] flex flex-col justify-end overflow-hidden relative transition-colors duration-500 ${
      dark ? "bg-zinc-950 border-zinc-900" : "bg-zinc-50 border-zinc-100"
    }`}>
      <div className={`absolute top-0 left-0 w-full h-8 flex items-center px-4 border-b transition-colors duration-500 ${
        dark ? "bg-zinc-900/50 border-zinc-800" : "bg-zinc-100/50 border-zinc-200"
      }`}>
        <div className="flex gap-1.5">
          <div className={`w-2 h-2 rounded-full ${dark ? "bg-zinc-800" : "bg-zinc-200"}`} />
          <div className={`w-2 h-2 rounded-full ${dark ? "bg-zinc-800" : "bg-zinc-200"}`} />
          <div className={`w-2 h-2 rounded-full ${dark ? "bg-zinc-800" : "bg-zinc-200"}`} />
        </div>
        <span className={`ml-4 uppercase tracking-widest text-[8px] font-black transition-colors duration-500 ${
          dark ? "text-zinc-600" : "text-zinc-400"
        }`}>Recruit_Terminal_v1.0.4</span>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {lines.map((line, i) => (
            <motion.div
              key={line + i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4"
            >
              <span className={dark ? "text-zinc-800" : "text-zinc-300"}>[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
              <span className={`transition-colors duration-500 ${
                i === lines.length - 1 
                  ? (dark ? "text-white" : "text-black font-bold uppercase") 
                  : (dark ? "text-zinc-600" : "text-zinc-400")
              }`}>
                {i === lines.length - 1 ? "> " : ""}{line}
              </span>
              {i === lines.length - 1 && (
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className={`w-1.5 h-3 ${dark ? "bg-white" : "bg-black"}`}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Decorative scanning line */}
      <motion.div
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className={`absolute left-0 w-full h-[1px] pointer-events-none ${
          dark ? "bg-white/5" : "bg-black/5"
        }`}
      />
    </div>
  );
}
