"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import DNAScene from "./DNAScene";
import Tilt from "../ui/Tilt";


const springConfig = {
  type: "spring" as const,
  stiffness: 100,
  damping: 30,
  mass: 1
};

const fadeInUp = {
  initial: { y: 60, opacity: 0, skewY: 2 },
  animate: { y: 0, opacity: 1, skewY: 0 },
  transition: { ...springConfig, duration: 0.8 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function FoundersProtocol() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const cardScale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);
  const cardRotate = useTransform(scrollYProgress, [0, 1], [2, -2]);

  return (
    <section 
      ref={containerRef}
      className="bg-black py-32 border-b border-zinc-900 overflow-hidden relative"
    >
      {/* Background kinetic grid - very lightweight.info style */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }} />
      </div>
      <DNAScene />


      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-12 flex items-center gap-6"
        >
          <div className="h-[1px] w-12 bg-zinc-900" />
          Foundation_Protocol
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-end">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="overflow-hidden mb-12">
              <motion.h3 
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-black uppercase tracking-tighter font-display leading-[0.9]"
              >
                We are not a 
                <br />
                <span className="italic text-zinc-800">Sourcing Tool.</span>
              </motion.h3>
            </div>

            <motion.p 
              variants={fadeInUp}
              className="text-zinc-500 leading-relaxed font-medium mb-12 max-w-md"
            >
              Recruit was built by engineers who were tired of the "Keyword Matching" era. We believe talent is multi-dimensional. Our mission is to build the autonomous extraction layer that understands the sub-text of engineering excellence.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex gap-12">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 mb-2">Build_ID</div>
                <div className="text-sm font-bold font-mono">0x44F9A2</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 mb-2">Location</div>
                <div className="text-sm font-bold font-mono">REMOTE_CORE</div>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            style={{ y: parallaxY, scale: cardScale, rotate: cardRotate }}
            className="relative group"
          >
            <Tilt>
              <div className="absolute -inset-4 bg-white/[0.02] blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="aspect-[4/5] bg-zinc-900 border border-zinc-800 p-12 flex flex-col justify-between overflow-hidden relative shadow-2xl">
                <div className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-700">Vision_Statement_v1</div>
                
                <motion.p 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, ...springConfig }}
                  className="text-xl md:text-2xl italic font-display font-black text-white leading-tight"
                >
                  "The future of engineering recruitment isn't finding people—it's understanding their technical DNA before the first interview."
                </motion.p>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Chief_Architect</div>
                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Protocol_Safety_Division</div>
                  </div>
                </div>
                
                {/* Decorative scan animation */}
                <motion.div 
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 w-full h-[150px] bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"
                />
              </div>
            </Tilt>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
