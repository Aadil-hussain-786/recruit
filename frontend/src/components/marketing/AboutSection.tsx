"use client";

import React from "react";
import { motion } from "framer-motion";
import { HandwrittenText, ScribbleUnderline } from "./HandwrittenText";

export default function AboutSection() {
    return (
        <section id="about" className="relative py-24 md:py-40 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-8 text-slate-900">
                            The Genesis of <br />
                            <span className="text-accent-cyan italic">Intelligent</span> <br />
                            Recruitment
                        </h2>
                        <p className="text-lg text-slate-500 font-mono leading-relaxed mb-8">
                            Recruit AI wasn't built to just "find" candidates. It was engineered to understand the underlying neural patterns of success. 
                            By moving beyond traditional keyword matching, we've created an autonomous talent layer that identifies merit where others see only data.
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-slate-900">2026</span>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Founded</span>
                            </div>
                            <div className="w-[1px] h-12 bg-slate-200" />
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-slate-900">12.4B</span>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Parameters</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="glass-panel p-8 rounded-3xl relative z-10 overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-8xl font-black text-slate-900">RAI</span>
                            </div>
                            <h3 className="text-xl font-bold mb-4 uppercase tracking-widest text-slate-900">Our Protocol</h3>
                            <ul className="space-y-6">
                                {[
                                    { title: "Neutral Matching", desc: "Removing human bias through geometric talent mapping." },
                                    { title: "Global Mesh", desc: "Connecting decentralized talent nodes into a unified hive." },
                                    { title: "Merit First", desc: "Prioritizing actual skill signatures over resume formatting." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="w-6 h-6 rounded-full bg-accent-cyan flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 leading-none mb-1">{item.title}</h4>
                                            <p className="text-xs text-slate-500 font-mono">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-purple/10 rounded-full blur-3xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
