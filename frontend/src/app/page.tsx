"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';
import { 
    ArrowRight,
    Menu,
    X,
    Cpu as CpuIcon, 
    Shield as ShieldIcon, 
    Terminal as TerminalIcon, 
    Zap as ZapIcon, 
    Globe as GlobeIcon 
} from "lucide-react";
import Footer from "@/components/layout/Footer";
const RecruitSuite3D = dynamic(() => import('@/components/marketing/RecruitSuite3D'), { ssr: false });

// --- Writing Style Component ---
const TypingEffect = ({ text, delay = 0 }: { text: string, delay?: number }) => {
    const [displayedText, setDisplayedText] = useState("");
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedText(text.slice(0, i));
                i++;
                if (i > text.length) clearInterval(interval);
            }, 50);
            return () => clearInterval(interval);
        }, delay * 1000);
        return () => clearTimeout(timeout);
    }, [text, delay]);

    return (
        <span className="relative">
            {displayedText}
            <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-[2px] h-[0.8em] bg-accent-cyan ml-1 align-middle"
            />
        </span>
    );
};

const AdvancedNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [protocol, setProtocol] = useState("IDLE");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            const p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            if (p < 0.15) setProtocol("SYSTEM_INIT");
            else if (p < 0.35) setProtocol("NEURAL_CORE");
            else if (p < 0.55) setProtocol("FLOW_SYNC");
            else if (p < 0.75) setProtocol("GLOBAL_MESH");
            else if (p < 0.90) setProtocol("SECURE_BIAS");
            else setProtocol("MATCH_READY");
        };
        window.addEventListener("scroll", handleScroll);
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
                    <div className="w-10 h-10 bg-accent-cyan flex items-center justify-center text-white font-black text-xs transition-transform group-hover:rotate-90 shadow-[0_4px_12px_rgba(14,165,233,0.3)]">
                        RAI
                    </div>
                    <div>
                        <div className="text-sm font-black uppercase tracking-widest leading-none text-slate-900">Recruit // <span className="text-accent-cyan">AI</span></div>
                        <div className="text-[8px] font-mono text-slate-400 uppercase tracking-[0.2em] mt-1">v1.1.0_Engine</div>
                    </div>
                </Link>

                {/* System HUD */}
                <div className="hidden lg:flex items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status:</span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-accent-cyan bg-sky-50 px-2 py-0.5 border border-sky-100">{protocol}</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-200" />
                    <div className="flex gap-8">
                        {navItems.map(item => (
                            <Link key={item.name} href={item.href} className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-accent-cyan transition-colors">
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
                        Secure_Login
                    </Link>
                    <Link href="/register" className="hidden xs:block">
                        <button className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 hover:bg-accent-cyan transition-all flex items-center gap-2 group">
                            Start <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
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
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Active_Link</span>
                                <span className="text-[10px] font-mono font-bold uppercase text-accent-cyan">{protocol}</span>
                            </div>
                            <div className="h-[1px] bg-slate-100" />
                            <div className="grid grid-cols-1 gap-4">
                                {navItems.map(item => (
                                    <Link key={item.name} href={item.href} className="text-left text-xs font-black uppercase tracking-widest text-slate-600 py-2 hover:text-accent-cyan">
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="h-[1px] bg-slate-100" />
                            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-900">Login</Link>
                            <Link href="/register">
                                <button className="w-full bg-accent-cyan text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl shadow-lg">
                                    Initialize Protocol
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default function Home() {
    return (
        <div className="bg-transparent text-slate-900 min-h-screen font-sans selection:bg-accent-cyan selection:text-white relative overflow-x-hidden pt-20 lg:pt-32">
            <AdvancedNavbar />

            {/* Hero Section */}
            <section className="min-h-[85vh] flex flex-col items-center justify-center relative z-20 px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-center max-w-5xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-8 shadow-sm">
                        <CpuIcon className="w-3 h-3 text-accent-cyan" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Autonomous Talent Layer Powered by AI</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-12 text-slate-900">
                        <TypingEffect text="REVOLUTIONIZE" delay={0.5} /> <br />
                        <span className="cyan-gradient">
                            <TypingEffect text="YOUR HIRING" delay={1.5} />
                        </span>
                    </h1>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.5, duration: 1 }}
                        className="text-sm md:text-lg font-mono max-w-3xl mx-auto mb-16 text-slate-500 leading-relaxed italic"
                    >
                        The world's most advanced recruitment engine for high-growth teams. 
                        Neural matching, automated screening, and merit-based talent discovery.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 3, duration: 1 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-8"
                    >
                        <Link href="/register">
                            <motion.button 
                                className="bg-slate-900 text-white text-[12px] font-black uppercase tracking-[0.2em] px-12 py-6 hover:bg-accent-cyan hover:scale-105 active:scale-95 transition-all shadow-[0_10px_25px_-5px_rgba(15,23,42,0.15)] flex items-center gap-4"
                                whileHover={{ 
                                    scale: 1.05, 
                                    boxShadow: "0 20px 40px -10px rgba(15,23,42,0.3)",
                                    transition: { duration: 0.2 }
                                }}
                                whileTap={{ scale: 0.98 }}
                            >
                                LAUNCH ENGINE <ArrowRight size={18} />
                            </motion.button>
                        </Link>
                        <Link href="/about" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">
                            <span className="w-8 h-[1px] bg-slate-200 group-hover:w-12 transition-all" /> SYSTEM_OVERVIEW
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Data HUD */}
                <div className="absolute bottom-10 left-12 hidden lg:flex gap-12">
                    <div className="flex flex-col gap-1 border-l border-sky-100 pl-4">
                        <span className="text-xs font-black text-slate-900">12.4B</span>
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Neural_Nodes</span>
                    </div>
                    <div className="flex flex-col gap-1 border-l border-indigo-100 pl-4">
                        <span className="text-xs font-black text-slate-900">99.8%</span>
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Match_Score</span>
                    </div>
                </div>

                <div className="absolute bottom-10 right-12 hidden lg:flex items-center gap-4">
                    <ShieldIcon className="w-4 h-4 text-slate-200" />
                    <span className="text-[8px] font-mono text-slate-300 uppercase tracking-[0.4em]">Safe_Protocol_Active_v1.1</span>
                </div>
            </section>

            {/* Immersive 3D Experience */}
            <Suspense fallback={<div className="h-[50vh]" />}>
                <RecruitSuite3D />
            </Suspense>

            {/* Big Background Text - Kept for footer transition */}
            <section className="h-[50vh] flex items-center justify-center pointer-events-none">
                <div className="text-center opacity-[0.03]">
                    <h2 className="text-[25vw] font-black uppercase tracking-tighter leading-none select-none italic text-slate-900">RECRUIT_AI</h2>
                </div>
            </section>

            <Footer />
        </div>
    );
}
