"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Zap,
    Sparkles,
    Users,
    BarChart3,
    Cpu,
    ShieldCheck,
    ArrowRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Brain,
    ChevronRight,
    Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ResumeFetcherPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [status, setStatus] = useState<"idle" | "scanning" | "completed">("idle");
    const [progress, setProgress] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const fetchCandidates = async () => {
        try {
            const res = await api.get("/candidates");
            setCandidates(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchCandidates();
    }, [user]);

    const handleSelectAll = () => {
        if (selectedIds.length === candidates.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(candidates.map(c => c._id));
        }
    };

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const runFetcher = async () => {
        if (selectedIds.length === 0) return;

        setIsFetching(true);
        setStatus("scanning");
        setProgress(0);

        try {
            // Simulate progress for better UX
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            const res = await api.post("/candidates/fetcher", { candidateIds: selectedIds });

            clearInterval(interval);
            setProgress(100);

            setTimeout(() => {
                setStatus("completed");
                setCandidates(prev => {
                    const updated = [...prev];
                    res.data.data.forEach((newCand: any) => {
                        const idx = updated.findIndex(c => c._id === newCand._id);
                        if (idx !== -1) updated[idx] = newCand;
                    });
                    return updated;
                });
                setIsFetching(false);
            }, 500);

        } catch (err) {
            console.error(err);
            setIsFetching(false);
            setStatus("idle");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-white dark:bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 pb-20">
            {/* Neural Background Effect */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07] z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#000_1px,transparent_1px)] bg-[length:32px_32px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                            <Brain size={12} className="text-zinc-900 dark:text-white" />
                            Neural Pattern Fetching
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none italic">
                            Resume <br />
                            <span className="text-zinc-400 not-italic">Fetcher</span>
                        </h1>
                        <p className="max-w-xl text-zinc-500 dark:text-zinc-400 font-medium">
                            Synthesize deep excellence patterns from your candidate pool. Our neural engine identifies top student talent by analyzing technical aptitude, leadership, and creativity.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="rounded-none border-zinc-200 dark:border-zinc-800 font-black uppercase text-xs tracking-widest h-14 px-8"
                            onClick={() => router.push('/candidates')}
                        >
                            Back to Pool
                        </Button>
                        <Button
                            variant="premium"
                            className="rounded-none font-black uppercase text-xs tracking-[0.2em] h-14 px-10 shadow-2xl transition-all hover:scale-105 disabled:opacity-50"
                            onClick={runFetcher}
                            disabled={selectedIds.length === 0 || isFetching}
                        >
                            {isFetching ? "Processing..." : "Run Neural Scan"}
                            <Zap size={16} className="ml-2 fill-current" />
                        </Button>
                    </div>
                </div>

                {/* Progress Bar Layer */}
                <AnimatePresence>
                    {status === "scanning" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-12 p-8 bg-zinc-900 text-white rounded-[32px] border border-white/10 shadow-3xl overflow-hidden relative"
                        >
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250px_250px] animate-[shimmer_2s_infinite_linear]" />
                            <div className="relative z-10 flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Cpu className="animate-spin-slow" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase tracking-widest text-sm">Scanning {selectedIds.length} Resumes</h3>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Neural Weights are being calculated...</p>
                                    </div>
                                </div>
                                <div className="text-4xl font-black italic">{progress}%</div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar Stats */}
                    <div className="lg:col-span-3 space-y-8">
                        <section className="p-6 border border-zinc-100 dark:border-zinc-900 rounded-3xl space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Pool Metrics</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Total Candidates', val: candidates.length, icon: Users },
                                    { label: 'High Potential', val: candidates.filter(c => (c.patterns?.technicalAptitude || 0) > 80).length, icon: Target },
                                    { label: 'Scanned', val: candidates.filter(c => c.patterns).length, icon: ShieldCheck },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <stat.icon size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                                            <span className="text-xs font-bold text-zinc-500">{stat.label}</span>
                                        </div>
                                        <span className="text-sm font-black italic">{stat.val}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={16} className="text-zinc-900 dark:text-white" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white">Pattern Logic</h3>
                            </div>
                            <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                                Excellent students are identified by "Difficulty Vectors"—we look beyond grades to identify real-world implementation depth and founding-stage mindset.
                            </p>
                        </section>
                    </div>

                    {/* Candidate List */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <button
                                onClick={handleSelectAll}
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2"
                            >
                                <div className={cn(
                                    "h-3 w-3 border rounded-sm flex items-center justify-center transition-colors",
                                    selectedIds.length === candidates.length ? "bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white" : "border-zinc-300 dark:border-zinc-700"
                                )}>
                                    {selectedIds.length === candidates.length && <div className="h-1 w-1 bg-white dark:bg-black rounded-full" />}
                                </div>
                                Select All for Processing
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{selectedIds.length} Selected</span>
                        </div>

                        <div className="space-y-3">
                            {candidates.length > 0 ? candidates.map((candidate) => (
                                <motion.div
                                    layout
                                    key={candidate._id}
                                    className={cn(
                                        "group relative border rounded-[2rem] transition-all duration-500 overflow-hidden",
                                        selectedIds.includes(candidate._id)
                                            ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-xl"
                                            : "bg-white dark:bg-black border-zinc-100 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                                    )}
                                >
                                    <div
                                        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 cursor-pointer"
                                        onClick={() => toggleSelect(candidate._id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-colors",
                                                selectedIds.includes(candidate._id) ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400"
                                            )}>
                                                {candidate.firstName[0]}{candidate.lastName[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-black uppercase tracking-tight text-lg italic">
                                                    {candidate.firstName} {candidate.lastName}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 underline-offset-4">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{candidate.currentTitle || 'Graduate'}</span>
                                                    <span className="h-1 w-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{candidate.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {candidate.patterns ? (
                                            <div className="flex items-center gap-8">
                                                <div className="flex items-center gap-4">
                                                    {[
                                                        { label: 'T', val: candidate.patterns.technicalAptitude, color: 'bg-zinc-900 dark:bg-white' },
                                                        { label: 'L', val: candidate.patterns.leadershipPotential, color: 'bg-zinc-400' },
                                                        { label: 'C', val: candidate.patterns.creativity, color: 'border border-zinc-200 dark:border-white' }
                                                    ].map((p, i) => (
                                                        <div key={i} className="flex flex-col items-center gap-1">
                                                            <div className="h-1 w-8 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    className={cn("h-full", p.color)}
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${p.val}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">{p.label} {p.val}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="h-12 w-[1px] bg-zinc-100 dark:bg-zinc-900 hidden md:block" />
                                                <div className="flex flex-col items-end">
                                                    <div className="text-[10px] font-black italic opacity-50">EXCELLENCE SCORE</div>
                                                    <div className="text-3xl font-black">{Math.round((candidate.patterns.technicalAptitude + candidate.patterns.leadershipPotential + candidate.patterns.creativity) / 3)}%</div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExpandedId(expandedId === candidate._id ? null : candidate._id);
                                                    }}
                                                    className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                                >
                                                    <ChevronRight className={cn("transition-transform", expandedId === candidate._id && "rotate-90")} size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-zinc-300 dark:text-zinc-700">
                                                <Sparkles size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Analysis</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedId === candidate._id && candidate.patterns && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 overflow-hidden"
                                            >
                                                <div className="p-8 space-y-12">
                                                    {candidate.patterns.hiddenBriefing && (
                                                        <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 border border-white/10 shadow-3xl overflow-hidden relative group">
                                                            <div className="relative z-10">
                                                                <div className="flex items-center gap-2 mb-8">
                                                                    <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Neural Intelligence Briefing</h3>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                                                    <div className="space-y-6">
                                                                        <div>
                                                                            <p className="text-[9px] font-black uppercase tracking-widest text-black mb-2">Energy & Vibe</p>
                                                                            <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">{candidate.patterns.hiddenBriefing.vibe}</p>
                                                                        </div>
                                                                        {candidate.patterns.hiddenBriefing.redFlags && candidate.patterns.hiddenBriefing.redFlags.length > 0 && (
                                                                            <div className="flex flex-wrap gap-2 pt-2">
                                                                                {candidate.patterns.hiddenBriefing.redFlags.map((flag: string, i: number) => (
                                                                                    <span key={i} className="text-[8px] font-black italic text-rose-500 bg-rose-500/10 px-2 py-1 rounded-sm border border-rose-500/20 uppercase">
                                                                                        {flag}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-3">Core Insight</p>
                                                                            <p className="text-xs font-medium text-zinc-300 leading-relaxed italic border-l-2 border-indigo-500/30 pl-4">
                                                                                "{candidate.patterns.hiddenBriefing.theOneThing}"
                                                                            </p>
                                                                        </div>
                                                                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                                                            <p className="text-[9px] font-black uppercase tracking-widest text-rose-400 mb-3">The Critical Probe</p>
                                                                            <p className="text-xs font-bold text-zinc-100 leading-relaxed italic">
                                                                                {candidate.patterns.hiddenBriefing.probe}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                        <div className="space-y-6">
                                                            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Behavioral Audit</h5>
                                                            <div className="space-y-4">
                                                                {candidate.patterns.notes?.map((note: string, i: number) => (
                                                                    <div key={i} className="flex gap-4">
                                                                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-white mt-1.5 flex-shrink-0" />
                                                                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed italic">"{note}"</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-6">
                                                            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Interview Guide</h5>
                                                            <div className="space-y-4">
                                                                {candidate.patterns.interviewScript?.map((item: any, i: number) => (
                                                                    <div key={i} className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3 shadow-sm">
                                                                        <div className="flex gap-2">
                                                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter mt-0.5">Q:</span>
                                                                            <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{item.question}</p>
                                                                        </div>
                                                                        <div className="flex gap-2 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50">
                                                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter mt-0.5">A:</span>
                                                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed italic">{item.answer}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Selection Glow */}
                                    {selectedIds.includes(candidate._id) && !expandedId && (
                                        <div className="absolute top-0 right-0 p-4">
                                            <CheckCircle2 size={24} className="text-zinc-900 dark:text-white" />
                                        </div>
                                    )}
                                </motion.div>
                            )) : (
                                <div className="py-20 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[3rem]">
                                    <Users size={48} className="mx-auto text-zinc-200 mb-4" />
                                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No candidates in the pool</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
