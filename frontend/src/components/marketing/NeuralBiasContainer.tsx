"use client";

import { motion } from "framer-motion";
import { Brain, Target, Zap, Waves, Cpu, Workflow } from "lucide-react";
import Tilt from "@/components/ui/Tilt";

export default function NeuralBiasContainer() {
  return (
    <section className="bg-black py-32 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
      
      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <div className="text-center mb-24">
          <div className="text-[10px] font-black tracking-[0.4em] uppercase text-zinc-500 mb-6 flex items-center justify-center gap-4">
            <div className="h-[1px] w-8 bg-zinc-800" />
            Neural Foundation
            <div className="h-[1px] w-8 bg-zinc-800" />
          </div>
          <h2 className="text-5xl md:text-7xl font-medium tracking-tight text-white uppercase font-display">
            The <span className="italic text-zinc-700">Weight & Bias</span> Protocol
          </h2>
        </div>

        {/* Live Animation Section */}
        <div className="mb-24">
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Weights Section */}
          <Tilt>
            <div className="h-full p-10 border border-zinc-800 bg-zinc-900/30 backdrop-blur-xl relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                <Cpu size={120} />
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white text-black">
                  <Workflow size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">Dynamic Weights</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Signal_Matrix_V2</p>
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-zinc-400 leading-relaxed font-medium">
                  In our recruitment mesh, <span className="text-white">Weights</span> represent the dynamically adjusted importance of raw attributes. They aren't static; they adapt to the specific "stiffness" of your existing engineering culture.
                </p>
                
                <div className="space-y-6">
                  {[
                    { label: "Technical Velocity", weight: "w_01 = 0.85", color: "bg-blue-500", desc: "Measures contribution speed vs complexity." },
                    { label: "Systemic Depth", weight: "w_02 = 0.92", color: "bg-purple-500", desc: "Ability to navigate abstract architecture." },
                    { label: "Cultural Resonance", weight: "w_03 = 0.45", color: "bg-emerald-500", desc: "Alignment with team communication protocols." },
                  ].map((item, i) => (
                    <div key={i} className="relative">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-black uppercase text-zinc-300">{item.label}</span>
                        <span className="text-[10px] font-mono text-zinc-500 tracking-tighter">{item.weight}</span>
                      </div>
                      <div className="h-1 bg-zinc-800 w-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: "100%" }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease: "circOut", delay: i * 0.2 }}
                          className={`h-full ${item.color}`}
                        />
                      </div>
                      <p className="mt-2 text-[10px] text-zinc-600 font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tilt>

          {/* Bias Section */}
          <Tilt>
            <div className="h-full p-10 border border-zinc-800 bg-zinc-900/30 backdrop-blur-xl relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                <Waves size={120} />
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white text-black">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">Cultural Bias</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Foundational_Anchor</p>
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-zinc-400 leading-relaxed font-medium">
                  The <span className="text-white">Neural Bias</span> is the baseline threshold of your organization. It's the "Anchor Point" that shifts the entire evaluation function toward your proprietary hiring philosophy.
                </p>

                <div className="p-8 border border-zinc-800 bg-black/50 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-32 bg-gradient-to-b from-white to-transparent" />
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-black uppercase text-white mb-1">Bias Shift +1.2</h4>
                        <p className="text-[10px] text-zinc-500 leading-normal">Optimizing for extreme innovation. Reduces safety margin to increase breakthrough potential.</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-white mb-1">Bias Shift -0.8</h4>
                        <p className="text-[10px] text-zinc-500 leading-normal">Optimizing for systemic reliability. Increases the "Cultural Barrier" to ensure long-term stability.</p>
                      </div>
                      <div className="pt-4 border-t border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-400">f(x) = σ(Σ w_i * x_i + bias)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 h-12 border border-zinc-800 flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Calibration.Active</span>
                  </div>
                  <div className="flex-1 h-12 border border-zinc-800 flex items-center justify-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Anchor.Locked</span>
                  </div>
                </div>
              </div>
            </div>
          </Tilt>
        </div>

        {/* Neural Formula Centerpiece */}
        <div className="mt-32 p-12 border border-zinc-800 bg-zinc-900/10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
               style={{ backgroundImage: `radial-gradient(circle_at_center, #fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
          
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8">Proprietary Extraction Equation</h4>
          <div className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter opacity-80 mb-6">
            Talent_<span className="italic">Mesh</span> = Σ (Skill * <span className="text-indigo-500">Weight</span>) + <span className="text-emerald-500">Bias</span>
          </div>
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">Validated across 4.2M technical nodes within the global developer pool</p>
        </div>
      </div>
    </section>
  );
}
