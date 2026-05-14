"use client";

import React from "react";
import { motion } from "framer-motion";


const testimonials = [
    {
        quote: "Recruit AI transformed our engineering pipeline. We found three lead engineers in half the time it usually takes. The precision is unmatched.",
        name: "Dr Om Prakash Sahu",
        role: "CEO | Founder of Paylift pvt ltd",
        
    }
];

export default function TestimonialsSection() {
    return (
        <section id="testimonials" className="relative py-24 md:py-40 px-6 overflow-hidden">
             {/* Gradient Background */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-black/[0.02] blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                     <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                     >
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-8 text-black uppercase italic">
                            Network <span className="text-neutral-400 not-italic">Validation</span>
                        </h2>
                     </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="glass-panel p-10 rounded-[40px] relative group hover:-translate-y-2 transition-transform duration-500"
                        >
                            <div className="flex flex-col h-full gap-8">
                                <div className="text-black opacity-10 group-hover:opacity-20 transition-opacity">
                                    <svg width="40" height="30" viewBox="0 0 40 30" fill="currentColor">
                                        <path d="M0 30V15C0 6.71573 6.71573 0 15 0V7.5C10.8579 7.5 7.5 10.8579 7.5 15H15V30H0ZM25 30V15C25 6.71573 31.7157 0 40 0V7.5C35.8579 7.5 32.5 10.8579 32.5 15H40V30H25Z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-mono text-neutral-600 leading-relaxed italic">
                                    "{t.quote}"
                                </p>
                                <div className="mt-auto flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black/10 bg-neutral-100 flex items-center justify-center font-bold text-neutral-400">
                                         {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-black leading-none mb-1 uppercase tracking-tight">{t.name}</h4>
                                        <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
