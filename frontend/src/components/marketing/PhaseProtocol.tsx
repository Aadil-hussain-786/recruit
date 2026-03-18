"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import MetricGrid from "./MetricGrid";
import { ChevronRight } from "lucide-react";

const PHASES = [
  { step: "01", title: "Atmospheric Parsing", desc: "We extract sub-textual role signals to generate a precise multidimensional candidate vector." },
  { step: "02", title: "Neural Synthesis", desc: "AI synthesizes thousands of profiles, ranking them by behavioral DNA and technical weight." },
  { step: "03", title: "Automated Protocol", desc: "Proprietary outreach flows move high-signal candidates from shortlist to interview." },
];


export default function PhaseProtocol({ dark = false }: { dark?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <div ref={containerRef} className={`relative h-[550vh] transition-colors duration-700 ${dark ? 'bg-black' : 'bg-white'}`}>
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        
        {/* Title */}
        <motion.div 
          style={{ 
            opacity: useTransform(smoothProgress, [0, 0.05, 0.9, 1], [0, 1, 1, 0]),
            y: useTransform(smoothProgress, [0, 0.05], [20, 0])
          }}
          className="text-center mb-12 absolute top-32 z-0"
        >
          <div className={`text-[10px] font-black tracking-[0.4em] uppercase mb-6 flex items-center justify-center gap-4 ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            <div className={`h-[1px] w-8 ${dark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
            Chapter_01
            <div className={`h-[1px] w-8 ${dark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
          </div>
          <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-tight font-display leading-none ${dark ? 'text-white' : 'text-black'}`}>
            Engineering The Pipeline
          </h2>
        </motion.div>

        <div className="relative w-full max-w-6xl h-[60vh] mt-24">
          {PHASES.map((phase, i) => {
            const stepSize = 0.8 / PHASES.length;
            const start = (i * stepSize) + 0.1;
            const end = start + stepSize;
            
            const x = useTransform(smoothProgress, [start, end], [1000, 0]);
            const opacity = useTransform(smoothProgress, [start, start + 0.05, end - 0.05, end], [0, 1, 1, 0]);
            const scale = useTransform(smoothProgress, [start, end], [0.8, 1]);
            const rotateX = useTransform(smoothProgress, [start, end], [10, 0]);


            return (
              <motion.div
                key={phase.step}
                style={{ x, opacity, scale, rotateX, zIndex: 10 + i }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className={`w-full border p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center shadow-2xl relative overflow-hidden group transition-colors duration-500 ${
                  dark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-100'
                }`}>
                  <div className={`text-[12rem] font-black font-display absolute -top-10 -left-6 pointer-events-none select-none leading-none opacity-[0.03] ${dark ? 'text-white' : 'text-black'}`}>
                    {phase.step}
                  </div>
                  
                  <div className={`w-20 h-20 border flex items-center justify-center relative z-10 shrink-0 ${
                    dark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-white'
                  }`}>
                     <span className={`text-[10px] font-black ${dark ? 'text-white' : 'text-black'}`}>{phase.step}</span>
                  </div>

                  <div className="flex-1 relative z-10">
                    <div className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${dark ? 'text-zinc-700' : 'text-zinc-300'}`}>Module_Phase_{phase.step}</div>
                    <h3 className={`text-3xl md:text-5xl font-black uppercase tracking-tight font-display mb-6 leading-none ${dark ? 'text-white' : 'text-black'}`}>{phase.title}</h3>
                    <p className={`text-lg leading-relaxed font-medium max-w-xl ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>{phase.desc}</p>
                    
                    <div className="mt-8 flex items-center gap-3">
                       <div className={`h-[1px] w-8 ${dark ? 'bg-white/20' : 'bg-black/10'}`} />
                       <div className={`text-[8px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${
                         dark ? 'text-zinc-800 group-hover:text-white' : 'text-zinc-300 group-hover:text-black'
                       }`}>
                          Initialize_Sequence <ChevronRight className="h-2 w-2" />
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Metric Grid at the end */}
          <motion.div
            style={{ 
              opacity: useTransform(smoothProgress, [0.85, 0.95], [0, 1]),
              y: useTransform(smoothProgress, [0.85, 0.95], [100, 0]),
              scale: useTransform(smoothProgress, [0.85, 0.95], [0.98, 1])
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full">
              <MetricGrid dark={dark} />
            </div>
          </motion.div>
        </div>
        
        {/* Progress tracks */}
        <div className="absolute bottom-20 left-10 flex flex-col gap-6">
          {PHASES.map((_, i) => (
             <div key={i} className="flex items-center gap-4">
               <motion.div 
                 className="h-[1px] w-8"
                 style={{
                   backgroundColor: useTransform(smoothProgress, [i*0.2 + 0.1, (i+1)*0.2], [dark ? "#18181b" : "#f4f4f5", dark ? "#ffffff" : "#000000"])
                 }}
               />
               <span className={`text-[8px] font-mono uppercase tracking-widest ${dark ? 'text-zinc-900' : 'text-zinc-200'}`}>P_{i+1}</span>
             </div>
          ))}
        </div>

        {/* HUD bottom right */}
        <div className="absolute bottom-10 right-10 text-right">
           <div className={`text-[8px] font-mono uppercase tracking-widest mb-1 ${dark ? 'text-zinc-700' : 'text-zinc-300'}`}>Scroll_Context: Engineering</div>
           <div className={`text-[10px] font-mono font-black uppercase tracking-widest ${dark ? 'text-zinc-500' : 'text-zinc-400'}`}>
             Step_{Math.floor(smoothProgress.get() * 100)}%
           </div>
        </div>
      </div>
    </div>
  );
}
