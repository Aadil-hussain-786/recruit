"use client";

import React, { useEffect, useRef } from 'react';
import Head from 'next/head';

export default function ComingSoonPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We can't easily run the raw HTML Three.js logic here without refactoring, 
    // but we can redirect to the physical HTML file OR just iframe it if they want EXACTLY that.
    // However, I will implement a clean React version of it here for a better experience.
    const loadScripts = async () => {
      // Load GSAP and Three from CDN (or they are already in package.json)
      // Since it's Next.js, we use the ones from node_modules
    };
    
    // For now, let's just make it a clean landing if they visit this route.
    // Actually, I'll redirect them to the /coming-soon.html file which is what I just built
    window.location.href = "/register";
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-black tracking-[0.5em] uppercase text-xs animate-pulse">
        Initializing_Protocol...
      </div>
    </div>
  );
}
