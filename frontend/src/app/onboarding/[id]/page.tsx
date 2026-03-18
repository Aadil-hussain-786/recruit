"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Zap, 
    Cpu, 
    Dna, 
    ShieldCheck, 
    ArrowRight, 
    Sparkles, 
    Binary, 
    Terminal,
    UserCircle,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

export default function NeuralOnboardingPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const jobId = params.id as string;
    const [candidateData, setCandidateData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOnboarding, setIsOnboarding] = useState(false);

    useEffect(() => {
        const rawData = searchParams.get("data");
        if (rawData) {
            try {
                const decoded = JSON.parse(atob(rawData));
                setCandidateData(decoded);
            } catch (err) {
                console.error("Failed to decode candidate JSON", err);
            }
        }
        setLoading(false);
    }, [searchParams]);

    const handleOnboard = async () => {
        if (!candidateData) return;
        setIsOnboarding(true);
        try {
            const res = await api.post("/public/pulse/onboard", {
                jobId,
                ...candidateData
            });
            
            if (res.data.success) {
                const { applicationId, candidateId } = res.data.data;
                // Redirect to the interview room with the new IDs and personality context
                router.push(`/interview/${jobId}?appId=${applicationId}&candId=${candidateId}&name=${candidateData.firstName}`);
            }
        } catch (err) {
            console.error("Onboarding failed", err);
            setIsOnboarding(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <Zap className="w-8 h-8 text-indigo-500 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-emerald-600/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
            </div>

            <main className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center">
                {/* Intro Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
                        <Sparkles className="w-3 h-3" />
                        Neural Pulse Invitation Received
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-6">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-100">{candidateData?.firstName || "Candidate"}</span>
                    </h1>
                    <p className="text-zinc-400 text-xl max-w-2xl mx-auto leading-relaxed">
                        Our OSINT engine matched your DNA with our <span className="text-white font-bold">Engineering Hub</span>. 
                        We don't do boring applications—we do direct connections.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
                    {/* Left: Candidate Profile Analysis */}
                    <motion.div 
                         initial={{ opacity: 0, x: -30 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.2 }}
                         className="lg:col-span-5 space-y-6"
                    >
                        <div className="bg-zinc-900/50 border border-white/5 backdrop-blur-xl rounded-[40px] p-8 relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Binary className="w-32 h-32" />
                           </div>
                           
                           <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <UserCircle className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{candidateData?.firstName} {candidateData?.lastName}</h3>
                                    <p className="text-xs text-zinc-500 uppercase tracking-widest">{candidateData?.currentTitle}</p>
                                </div>
                           </div>

                           <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3">
                                        <Dna className="w-3 h-3" /> AI MATCH REASONING
                                    </div>
                                    <p className="text-sm text-zinc-300 italic leading-relaxed">
                                        "{candidateData?.reasoning || "Analyzing skills against job DNA..."}"
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {candidateData?.skills?.slice(0, 8).map((skill: string) => (
                                        <span key={skill} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                           </div>
                        </div>

                        <div className="flex items-center justify-between p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold">Neural Verification</h4>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">End-to-End Encrypted</p>
                                </div>
                            </div>
                            <Globe className="w-5 h-5 text-zinc-700" />
                        </div>
                    </motion.div>

                    {/* Right: Protocol Access */}
                    <motion.div 
                         initial={{ opacity: 0, x: 30 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.3 }}
                         className="lg:col-span-7"
                    >
                        <div className="bg-white text-black rounded-[40px] p-10 h-full flex flex-col justify-between items-start shadow-[0_0_100px_rgba(255,255,255,0.05)]">
                            <div>
                                <div className="h-2 w-20 bg-indigo-600 mb-8" />
                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8">
                                    Initiate Your <br />
                                    <span className="text-zinc-400 font-normal italic">Interview Protocol</span>
                                </h2>
                                <p className="text-zinc-600 text-lg mb-12">
                                    Click below to enter the live interview environment. You'll meet our Neural Recruiter for a 15-minute technical deep-dive. No resume upload required—we already know you're talented.
                                </p>

                                <div className="space-y-4 mb-12">
                                    <div className="flex items-start gap-4">
                                        <Terminal className="w-5 h-5 mt-1 text-indigo-600" />
                                        <div>
                                            <h4 className="font-bold uppercase tracking-widest text-xs">Real-time Engineering Focus</h4>
                                            <p className="text-sm text-zinc-500 leading-snug">Discuss trade-offs, architectures, and system design.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Cpu className="w-5 h-5 mt-1 text-indigo-600" />
                                        <div>
                                            <h4 className="font-bold uppercase tracking-widest text-xs">Adaptive Difficulty</h4>
                                            <p className="text-sm text-zinc-500 leading-snug">The AI scales to your seniority level in real-time.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleOnboard}
                                disabled={isOnboarding}
                                className="w-full bg-black text-white hover:bg-zinc-800 h-20 rounded-2xl flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.2em] transition-all group overflow-hidden"
                            >
                                {isOnboarding ? (
                                    <Zap className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Establish Neural Link
                                        <ArrowRight className="w-5 h-5 animate-pulse" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-white/10 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Detail */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 flex gap-12 border-t border-white/5 pt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600"
                >
                    <div className="flex gap-2 items-center"><Binary className="w-3 h-3" /> PROTOCOL 0x4A2BC</div>
                    <div className="flex gap-2 items-center"><ShieldCheck className="w-3 h-3" /> SOC-2 COMPLIANT</div>
                    <div className="flex gap-2 items-center"><Cpu className="w-3 h-3" /> AI-LED DIVERSITY-FIRST</div>
                </motion.div>
            </main>
        </div>
    );
}
