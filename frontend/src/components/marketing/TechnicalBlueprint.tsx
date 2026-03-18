"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function TechnicalBlueprint() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 1 });
  
  const yParallax = useTransform(springProgress, [0, 1], ["0%", "-15%"]);
  const rotateParallax = useTransform(springProgress, [0, 1], [0, 3]);
  const scaleParallax = useTransform(springProgress, [0, 0.5, 1], [1, 1.05, 1]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Base Dark Gradient */}
      <div className="absolute inset-0 bg-[#0A0A0A]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(40,40,40,0.4),transparent)]" />
      
      {/* Grid Pattern */}
      <motion.div 
        style={{ 
          y: yParallax, 
          scale: scaleParallax,
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
        className="absolute inset-0 opacity-[0.03] will-change-transform" 
      />

      {/* Blueprint SVG Elements */}
      <motion.svg 
        style={{ y: yParallax, rotate: rotateParallax, scale: 1.1 }}
        className="absolute inset-0 w-full h-full opacity-[0.07]" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Large Concentric Circles (Top Left) */}
        <circle cx="15%" cy="15%" r="300" fill="none" stroke="#fff" strokeWidth="0.5" strokeDasharray="5,5" />
        <circle cx="15%" cy="15%" r="450" fill="none" stroke="#fff" strokeWidth="0.5" strokeDasharray="10,10" />
        <circle cx="15%" cy="15%" r="600" fill="none" stroke="#fff" strokeWidth="0.5" />
        
        {/* Bottom Right Schematic */}
        <circle cx="85%" cy="85%" r="200" fill="none" stroke="#fff" strokeWidth="0.5" />
        <line x1="85%" y1="85%" x2="100%" y2="85%" stroke="#fff" strokeWidth="0.5" strokeDasharray="4,4" />
        <line x1="85%" y1="85%" x2="85%" y2="100%" stroke="#fff" strokeWidth="0.5" strokeDasharray="4,4" />
        
        {/* Random Technical Lines */}
        <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
      </motion.svg>
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
    </div>
  );
}
