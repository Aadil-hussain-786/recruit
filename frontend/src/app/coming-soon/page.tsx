"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Rocket, Sparkles, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ComingSoonPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            // Priority: Environment Variable > Relative Route (Vercel) > Localhost
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                           (typeof window !== 'undefined' ? `${window.location.origin}/api/public/early-access` : 'http://localhost:5000/api/public/early-access');
            
            const response = await fetch(apiUrl.includes('localhost:3000') ? 'http://localhost:5000/api/public/early-access' : apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMsg(data.message || 'Verification failed. Protocol rejected.');
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg('Neural link unstable. Connection failed.');
        }
    };

    return (
        <div className="min-h-screen bg-white bg-grid flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full glass-panel p-8 md:p-12 text-center rounded-[2.5rem] relative z-10 shadow-2xl border border-slate-100"
            >
                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-emerald-500 shadow-sm border border-emerald-100">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Neural_Waitlist_Synced</h2>
                            <p className="text-slate-500 font-mono text-sm leading-relaxed mb-8">
                                Your clearance request has been processed. <br />
                                Checking the encrypted node for updates...
                            </p>
                            <Link href="/">
                                <Button className="bg-slate-900 text-white hover:bg-accent-cyan px-12 py-6 rounded-2xl flex items-center gap-2 mx-auto">
                                    Return to Home
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3 group hover:rotate-0 transition-transform duration-500">
                                <Clock className="text-accent-cyan w-8 h-8 animate-spin-slow" />
                            </div>

                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 mb-6">
                                <Sparkles className="w-3 h-3 text-accent-cyan" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-cyan">Neural_Engine_Syncing</span>
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">
                                Protocol <span className="text-accent-cyan italic">Coming Soon</span>
                            </h1>
                            
                            <p className="text-slate-500 font-mono text-xs leading-relaxed mb-10 max-w-sm mx-auto">
                                Architecture calibration in progress. Secure your node in the waitlist for priority neural access.
                            </p>

                            <form onSubmit={handleSubmit} className="text-left space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Entity Name</label>
                                        <input 
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full h-12 bg-slate-50/50 border border-slate-100 rounded-xl px-4 text-sm font-mono focus:ring-2 focus:ring-accent-cyan/20 focus:border-accent-cyan transition-all outline-none"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Email</label>
                                        <input 
                                            required
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full h-12 bg-slate-50/50 border border-slate-100 rounded-xl px-4 text-sm font-mono focus:ring-2 focus:ring-accent-cyan/20 focus:border-accent-cyan transition-all outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Organization (Optional)</label>
                                    <input 
                                        type="text"
                                        placeholder="Cyberdyne Systems"
                                        className="w-full h-12 bg-slate-50/50 border border-slate-100 rounded-xl px-4 text-sm font-mono focus:ring-2 focus:ring-accent-cyan/20 focus:border-accent-cyan transition-all outline-none"
                                        value={formData.company}
                                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    />
                                </div>

                                {status === 'error' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3 text-red-600 text-xs font-mono"
                                    >
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {errorMsg}
                                    </motion.div>
                                )}

                                <Button 
                                    disabled={status === 'loading'}
                                    type="submit"
                                    className="w-full h-14 bg-slate-900 text-white hover:bg-accent-cyan flex items-center justify-center gap-3 shadow-lg rounded-2xl transition-all disabled:opacity-70 group"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Initializing Sync...
                                        </>
                                    ) : (
                                        <>
                                            Request Neural Access <Rocket className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-8">
                                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">
                                    <ArrowLeft className="w-3 h-3" /> Back to Core Node
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Footer Metadata */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                    Latency: 0.02ms
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-slate-100 bg-slate-50/50">
                    System_v1.1.0_Engine
                </div>
            </div>
        </div>
    );
}
