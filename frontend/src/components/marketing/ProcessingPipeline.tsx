"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  { id: "01", title: "RAW_DATA_INGESTION", detail: "PDF/DOCX/LINK Extraction" },
  { id: "02", title: "SEMANTIC_TOKENIZATION", detail: "Contextual Node Mapping" },
  { id: "03", title: "PSYCHOMETRIC_LAYERING", detail: "Behavioral DNA Synthesis" },
  { id: "04", title: "NEURAL_WEIGHT_CALC", detail: "Probability Score 0.0-1.0" },
];

export default function ProcessingPipeline({ dark = true }: { dark?: boolean }) {
  return (
    <div className={`py-24 transition-colors duration-500 ${dark ? 'bg-[#050505] border-y border-zinc-900' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-4 group"
              >
                <div className={`w-12 h-12 border flex items-center justify-center text-[10px] font-black transition-all ${
                    dark 
                        ? 'border-zinc-800 bg-zinc-900 text-white group-hover:bg-white group-hover:text-black' 
                        : 'border-zinc-200 bg-white text-black group-hover:bg-black group-hover:text-white'
                }`}>
                  {step.id}
                </div>
                <div>
                  <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 transition-colors ${dark ? 'text-white' : 'text-black'}`}>
                    {step.title}
                  </div>
                  <div className={`text-[8px] font-bold uppercase tracking-widest whitespace-nowrap ${dark ? 'text-zinc-600' : 'text-zinc-300'}`}>
                    {step.detail}
                  </div>
                </div>
              </motion.div>
              
              {i < steps.length - 1 && (
                <div className={`hidden md:block w-full h-[1px] relative ${dark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`absolute inset-0 origin-left ${dark ? 'bg-white/20' : 'bg-black/10'}`}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
