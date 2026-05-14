"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Jobs", href: "/jobs" },
    { name: "Candidates", href: "/candidates" },
    { name: "Discovery", href: "/talent-discovery" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    
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

    if (pathname === "/") return null;

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
        router.push("/");
    };

    return (
        <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? "p-4" : "p-4 md:p-8"}`}>
            <div className={`mx-auto max-w-7xl glass-panel flex items-center justify-between px-6 py-4 transition-all duration-500 ${scrolled ? "rounded-full shadow-lg" : "rounded-none md:rounded-2xl shadow-sm"} bg-white/70 backdrop-blur-md border border-slate-200`}>
                
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
                            <Link key={item.name} href={item.href} className={cn("text-[9px] font-black uppercase tracking-[0.3em] transition-colors", pathname === item.href ? "text-accent-cyan" : "text-slate-500 hover:text-accent-cyan")}>
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {!user ? (
                        <>
                            <Link href="/login" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
                                Secure_Login
                            </Link>
                            <Link href="/register" className="hidden xs:block">
                                <button className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 hover:bg-accent-cyan transition-all flex items-center gap-2 group">
                                    Start <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </>
                    ) : (
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex items-center gap-3 px-4 py-2 border border-slate-200 bg-slate-50">
                                <div className="h-1.5 w-1.5 rounded-full bg-accent-cyan animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                                    {user.firstName || "User"}
                                </span>
                            </div>
                            <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-500 transition-colors">
                                Shutdown
                            </button>
                        </div>
                    )}
                    
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
                        <div className="glass-panel p-6 flex flex-col gap-6 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-md border border-slate-200">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Active_Link</span>
                                <span className="text-[10px] font-mono font-bold uppercase text-accent-cyan">{protocol}</span>
                            </div>
                            <div className="h-[1px] bg-slate-100" />
                            <div className="grid grid-cols-1 gap-4">
                                {navItems.map(item => (
                                    <Link onClick={() => setMobileMenuOpen(false)} key={item.name} href={item.href} className="text-left text-xs font-black uppercase tracking-widest text-slate-600 py-2 hover:text-accent-cyan">
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            <div className="h-[1px] bg-slate-100" />
                            {!user ? (
                                <>
                                    <Link onClick={() => setMobileMenuOpen(false)} href="/login" className="text-xs font-black uppercase tracking-widest text-slate-900">Secure_Login</Link>
                                    <Link onClick={() => setMobileMenuOpen(false)} href="/register">
                                        <button className="w-full bg-accent-cyan text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl shadow-lg">
                                            Start
                                        </button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-accent-cyan animate-pulse" />
                                        {user.firstName || "User"}
                                    </div>
                                    <button onClick={handleLogout} className="w-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-red-500 transition-colors">
                                        Shutdown
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
