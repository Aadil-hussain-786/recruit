"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import dynamic from 'next/dynamic';
import { 
    ArrowRight,
    Menu,
    X,
    Cpu as CpuIcon, 
    Shield as ShieldIcon, 
    Terminal as TerminalIcon, 
    Zap as ZapIcon
} from "lucide-react";
import { HandwrittenText, ScribbleUnderline, HighlightCircle, SignatureLoader } from "@/components/marketing/HandwrittenText";
import AboutSection from "@/components/marketing/AboutSection";
import ServicesSection from "@/components/marketing/ServicesSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";

const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });

const AdvancedNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [protocol, setProtocol] = useState("IDLE");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 50);
                    const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
                    if (p < 0.15) setProtocol("SYSTEM_INIT");
                    else if (p < 0.35) setProtocol("NEURAL_CORE");
                    else if (p < 0.55) setProtocol("FLOW_SYNC");
                    else if (p < 0.75) setProtocol("GLOBAL_MESH");
                    else if (p < 0.90) setProtocol("SECURE_BIAS");
                    else setProtocol("MATCH_READY");
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Jobs', href: '/jobs' },
        { name: 'Candidates', href: '/candidates' }
    ];

    return (
        <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? "p-4" : "p-4 md:p-8"}`}>
            <div className={`mx-auto max-w-7xl glass-panel flex items-center justify-between px-6 py-4 transition-all duration-500 ${scrolled ? "rounded-full shadow-lg" : "rounded-none md:rounded-2xl shadow-sm"}`}>
                
                {/* Brand */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-black flex items-center justify-center text-white font-bold text-xs transition-transform group-hover:rotate-90 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                        RAI
                    </div>
                    <div>
                        <div className="text-sm font-bold uppercase tracking-widest leading-none text-black">Recruit // <span className="text-neutral-500">AI</span></div>
                        <div className="text-[8px] font-mono text-neutral-400 uppercase tracking-[0.2em] mt-1">v1.1.0_Engine</div>
                    </div>
                </Link>

                {/* System HUD */}
                <div className="hidden lg:flex items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Status:</span>
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.3em] text-black bg-neutral-100 px-2 py-0.5 border border-neutral-200">{protocol}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-neutral-200" />
                    <div className="flex gap-8">
                        {navItems.map(item => (
                            <Link key={item.name} href={item.href} className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-500 hover:text-black transition-colors">
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">
                        Secure_Login
                    </Link>
                    <Link href="/register" className="hidden xs:block">
                        <button className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 hover:bg-neutral-700 transition-all flex items-center gap-2 group">
                            Start <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 hover:bg-neutral-50 rounded-lg transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full p-4 lg:hidden"
                    >
                        <div className="glass-panel p-6 flex flex-col gap-6 rounded-2xl shadow-2xl">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Active_Link</span>
                                <span className="text-[10px] font-mono font-semibold uppercase text-black">{protocol}</span>
                            </div>
                            <div className="h-[1px] bg-neutral-100" />
                            <div className="grid grid-cols-1 gap-4">
                                {navItems.map(item => (
                                    <Link key={item.name} href={item.href} className="text-left text-xs font-bold uppercase tracking-widest text-neutral-600 py-2 hover:text-black">
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="h-[1px] bg-neutral-100" />
                            <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-black">Login</Link>
                            <Link href="/register">
                                <button className="w-full bg-black text-white text-[10px] font-bold uppercase tracking-widest py-4 rounded-xl shadow-lg">
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

/** Hero section with advanced scroll-driven parallax + scale effects */
const HeroSection = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    // Smooth spring-based transforms
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    
    // Parallax: heading moves up faster
    const headingY = useTransform(smoothProgress, [0, 1], [0, -200]);
    // Scale: text scales down slightly on scroll
    const headingScale = useTransform(smoothProgress, [0, 0.5], [1, 0.85]);
    // Opacity: fades out as you scroll
    const headingOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0]);
    // Badge moves up even faster  
    const badgeY = useTransform(smoothProgress, [0, 1], [0, -300]);
    // Subtitle drifts  
    const subtitleY = useTransform(smoothProgress, [0, 1], [0, -100]);
    // CTA drifts slower
    const ctaY = useTransform(smoothProgress, [0, 1], [0, -50]);
    // Background rotation
    const bgRotate = useTransform(smoothProgress, [0, 1], [0, 3]);

    return (
        <section ref={sectionRef} className="min-h-[120vh] flex flex-col items-center justify-center relative px-6">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="text-center max-w-6xl"
                style={{ y: headingY, scale: headingScale, opacity: headingOpacity }}
            >
                <motion.div 
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-50 border border-neutral-200 mb-12 shadow-sm"
                    style={{ y: badgeY }}
                >
                    <CpuIcon className="w-3 h-3 text-black" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Autonomous Talent Layer Powered by AI</span>
                </motion.div>
                
                <motion.h1 
                    className="text-6xl md:text-[10vw] font-semibold tracking-tighter leading-[0.75] mb-12 text-black uppercase"
                    style={{ rotateX: bgRotate }}
                >
                    <HandwrittenText text="Neural" className="text-black normal-case" delay={0.5} duration={2.0} fontWeight={500} /> <br />
                    <span className="relative inline-block">
                        <HandwrittenText text="MATCHING" className="text-black italic" delay={1.8} duration={2.0} fontWeight={500} />
                        <ScribbleUnderline delay={4.0} />
                    </span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.5, duration: 1 }}
                    className="text-sm md:text-xl font-mono max-w-3xl mx-auto mb-20 text-neutral-500 leading-relaxed italic"
                    style={{ y: subtitleY }}
                >
                    The world's most advanced recruitment engine for high-growth teams. 
                    Benchmarking technical merit through 12.4B neural nodes.
                </motion.p>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4, duration: 1 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-12 mt-8"
                    style={{ y: ctaY }}
                >
                    <Link href="/dashboard">
                        <motion.button 
                            className="bg-black text-white text-[12px] font-semibold uppercase tracking-[0.3em] px-14 py-7 hover:bg-neutral-800 transition-all shadow-2xl flex items-center gap-4 group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Launch Protocol <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </motion.button>
                    </Link>
                    <Link href="/dashboard" className="group flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400 hover:text-black transition-colors">
                        <span className="w-10 h-[1px] bg-neutral-200 group-hover:w-16 transition-all" /> SYSTEM_WHITEPAPER
                    </Link>
                </motion.div>
            </motion.div>

            {/* Meta Data HUD */}
            <motion.div 
                className="absolute bottom-10 left-12 hidden lg:flex gap-16"
                style={{ opacity: headingOpacity }}
            >
                <div className="flex flex-col gap-2 border-l border-black/20 pl-6 relative">
                    <span className="text-2xl font-semibold text-black">0.02s</span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Match_Latency</span>
                </div>
            </motion.div>
        </section>
    );
};

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Auto-dismiss loader after signature animation completes (~3.5s)
    const timer = setTimeout(() => {
      setShowLoader(false);
      // Small delay before showing content for smooth transition
      setTimeout(() => setIsReady(true), 100);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Signature Loader */}
      <AnimatePresence mode="wait">
        {showLoader && (
          <SignatureLoader onComplete={() => {}} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      {!showLoader && (
        <motion.div 
          className="bg-white bg-grid text-black min-h-screen font-sans selection:bg-black selection:text-white relative overflow-x-hidden pt-20 lg:pt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: isReady ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
            <AdvancedNavbar />

            <div className="relative z-10">
                {/* Hero Section with Advanced Scroll */}
                <HeroSection />

                {/* Sub-Pages / Content Sections */}
                <AboutSection />
                <ServicesSection />
                <TestimonialsSection />
                
                <Footer />
            </div>
        </motion.div>
      )}
    </>
  );
}
