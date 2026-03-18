"use client";

import React from 'react';
import { motion } from 'framer-motion';
import TechnicalBlueprint from "@/components/marketing/TechnicalBlueprint";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-white selection:text-black pt-20">
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-zinc-900">
        <TechnicalBlueprint />

        {/* Precision HUD Elements */}
        <div className="absolute top-24 left-12 text-[8px] font-black tracking-[0.4em] uppercase text-zinc-700">Ref_01.About</div>
        <div className="absolute bottom-12 right-12 text-[8px] font-black tracking-[0.4em] uppercase text-zinc-700">Status.Live</div>

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 mb-10 border border-zinc-800 bg-zinc-900/50 text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Organizational Protocol
            </div>

            <h1 className="text-6xl md:text-8xl font-medium tracking-tighter leading-[0.9] font-display uppercase">
              The <span className="italic text-zinc-700">Recruit</span>
              <br />
              Ethos.
            </h1>
          </motion.div>
        </div>
      </div>

      <section className="py-32 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6 flex items-center gap-4">
                <div className="h-[1px] w-8 bg-zinc-800" />
                Chapter_01 // Origin
              </div>
              <h2 className="text-4xl font-bold uppercase tracking-tight font-display mb-8">Engineering the Future of Talent.</h2>
              <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                Recruit was forged in the intersection of data science and human potential.
                We observed a fundamental decay in traditional recruitment architectures
                and engineered a solution that prioritizes high-signal matching over volume.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6 flex items-center gap-4">
                <div className="h-[1px] w-8 bg-zinc-800" />
                Chapter_02 // Mission
              </div>
              <p className="text-zinc-500 leading-relaxed">
                Our mission is to build the world's most sophisticated talent extraction engine.
                By leveraging neural-weighted algorithms, we identify the top 1% of technical
                assets and connect them with organizations that demand excellence.
              </p>
            </motion.div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-white/[0.02] border border-zinc-800 rounded-none p-12 overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="text-[8px] font-black tracking-[0.4em] text-zinc-800 uppercase">System_Metrics v1.0</div>
              </div>

              <div className="space-y-10 mt-8">
                {[
                  { label: "Extraction_Accuracy", value: "99.8%" },
                  { label: "Signal_Retention", value: "94.2%" },
                  { label: "Latency_Reduction", value: "-84%" },
                  { label: "Neural_Complexity", value: "High" }
                ].map((stat, i) => (
                  <div key={i} className="border-b border-zinc-900 pb-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 mb-2">{stat.label}</div>
                    <div className="text-2xl font-bold font-display text-white">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-4 bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Core_System_Operational
                </div>
              </div>
            </div>
            <div className="h-[600px] w-full" />
          </div>
        </div>
      </section>

      {/* Footer Lab Info */}
      <section className="bg-black py-16 border-t border-zinc-900">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-10">
            {["Lab_01", "Lab_02", "Lab_03", "Lab_04"].map((lab) => (
              <span key={lab} className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-700">
                {lab} // Recruit_Core
              </span>
            ))}
          </div>
          <div className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">
            © 2026 RECRUIT_ENGINEERING_WORKS
          </div>
        </div>
      </section>
    </div>
  );
}
