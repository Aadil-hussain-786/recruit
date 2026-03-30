"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
    Zap, 
    Shield, 
    Cpu, 
    Network, 
    Database, 
    Trophy
} from "lucide-react";

export default function ServicesSection() {
    return (
        <section id="services" className="relative py-24 md:py-40 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-cyan mb-4 block">System Capabilities</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-8 text-slate-900 uppercase">
                            Autonomous <br className="md:hidden" />
                            Talent <span className="text-accent-cyan italic px-2">Layer</span>
                        </h2>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[800px]">
                    {/* Neural Matching - Large Card */}
                    <div className="md:col-span-2 md:row-span-2 glass-panel p-10 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-accent-cyan opacity-20 group-hover:scale-110 transition-transform duration-500">
                            <Cpu size={120} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-end">
                            <Zap className="w-12 h-12 text-accent-cyan mb-6" />
                            <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Neural Talent Matching</h3>
                            <p className="text-slate-500 font-mono text-sm max-w-sm">
                                Our core engine benchmarks skills across 12.4B parameters to identify the perfect cultural and technical alignment. 
                                Beyond keywords, we look at actual skill signatures.
                            </p>
                        </div>
                    </div>

                    {/* Automated Screening - Tall Card */}
                    <div className="md:col-span-2 md:row-span-1 glass-panel p-10 rounded-3xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 text-indigo-400 opacity-20 group-hover:rotate-12 transition-transform duration-500">
                            <Shield size={80} />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Automated Screening</h3>
                            <p className="text-slate-500 font-mono text-xs max-w-xs">
                                Scalable candidate vetting without the human bottleneck. 
                                AI-driven initial interviews and technical assessment orchestration.
                            </p>
                        </div>
                    </div>

                    {/* Global Mesh - Small Card */}
                    <div className="md:col-span-1 md:row-span-1 glass-panel p-8 rounded-3xl relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col h-full items-start justify-center">
                            <Network className="w-8 h-8 text-accent-purple mb-4" />
                            <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Global Mesh</h3>
                            <p className="text-slate-400 font-mono text-[10px]">
                                Decentralized talent discovery across international nodes.
                            </p>
                        </div>
                    </div>

                    {/* Bias Filtration - Small Card */}
                    <div className="md:col-span-1 md:row-span-1 bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group border border-slate-800">
                        <div className="absolute top-0 left-0 w-full h-full bg-accent-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col h-full items-start justify-center">
                            <Trophy className="w-8 h-8 text-accent-cyan mb-4" />
                            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Bias-Free filtration</h3>
                            <p className="text-slate-400 font-mono text-[10px]">
                                Blind merit-based scoring protocol for maximum diversity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
