"use client";

import React from "react";
import { motion } from "framer-motion";

const metrics = [
  { label: "Extraction Accuracy", value: "99.2%", detail: "ISO-27001 Validated" },
  { label: "Search Velocity", value: "0.4s", detail: "Real-time Indexing" },
  { label: "Talent Pool", value: "14M+", detail: "Deep Web Indexed" },
  { label: "Match Integrity", value: "0.98", detail: "Neural Confidence" },
];

const springConfig = {
  type: "spring" as const,
  stiffness: 100,
  damping: 30,
  mass: 1
};

export default function MetricGrid({ dark = true }: { dark?: boolean }) {
  return (
    <motion.div 
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      className={`grid grid-cols-2 md:grid-cols-4 border-l border-t ${dark ? 'border-zinc-900' : 'border-zinc-100'}`}
    >
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          variants={{
            initial: { opacity: 0, y: 40, skewY: 2 },
            animate: { opacity: 1, y: 0, skewY: 0 }
          }}
          transition={{ ...springConfig, delay: i * 0.1 }}
          className={`p-10 border-r border-b group relative overflow-hidden ${dark ? 'border-zinc-900' : 'border-zinc-100'}`}
        >
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.02] transition-opacity ${dark ? 'bg-white' : 'bg-black'}`} />
          <div className="relative z-10">
            <div className={`text-[9px] font-black uppercase tracking-[0.3em] mb-6 ${dark ? 'text-zinc-600' : 'text-zinc-400'}`}>{m.label}</div>
            <motion.div 
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ ...springConfig, delay: i * 0.1 + 0.2 }}
              className={`text-4xl lg:text-5xl font-black font-display tracking-tighter mb-4 ${dark ? 'text-white' : 'text-black'}`}
            >
              {m.value}
            </motion.div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-zinc-800' : 'text-zinc-300'}`}>{m.detail}</div>
          </div>
          
          <div className={`absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-700 ease-in-out ${dark ? 'bg-zinc-700' : 'bg-zinc-300'} group-hover:w-full`} />
        </motion.div>
      ))}
    </motion.div>
  );
}
