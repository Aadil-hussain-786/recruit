"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import {
    Loader2,
    X,
    Cpu,
    ArrowRight,
    MousePointer2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { cn, sanitizeUrl } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TalentUniverse from "@/components/talent-discovery/TalentUniverse";
import DNAHelix from "@/components/talent-discovery/DNAHelix";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

function TalentDiscoveryContent() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [discoveryResults, setDiscoveryResults] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [scrollProgress, setScrollProgress] = useState(0);
    
    // UI State
    const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;
            try {
                const res = await api.get("/jobs");
                setJobs(res.data.data || []);
                const urlJobId = searchParams.get('jobId');
                if (urlJobId) setSelectedJobId(urlJobId);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            }
        };
        fetchJobs();
    }, [user, searchParams]);

    useEffect(() => {
        if (discoveryResults.length === 0) return;

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                onUpdate: (self) => {
                    setScrollProgress(self.progress);
                }
            });
        });

        return () => ctx.revert();
    }, [discoveryResults]);

    const handleDiscovery = async () => {
        if (!selectedJobId) return;
        setLoading(true);
        setError("");
        setSelectedCandidate(null);
        try {
            const res = await api.post("/analysis/discover-talent", {
                jobId: selectedJobId,
                modelId: "llama-3-70b"
            });
            const results = (res.data.data || []).map((c: any) => ({
                ...c,
                id: c.socialUrl || c.firstName + c.lastName
            }));
            setDiscoveryResults(results);
        } catch (err: any) {
            setError("Failed to discover talent.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToPool = async (candidate: any) => {
        setSavingId(candidate.id);
        try {
            await api.post("/candidates", { ...candidate, status: 'applied', source: 'Discovery' });
            setSavedIds(prev => new Set(prev).add(candidate.id));
        } finally {
            setSavingId(null);
        }
    };

    return (
        <div ref={containerRef} className="bg-white text-black min-h-[400vh] relative font-sans">
            {/* Fixed 3D Universe Background */}
            <div className="fixed inset-0 z-0 opacity-90 pointer-events-auto">
                <TalentUniverse 
                    candidates={discoveryResults} 
                    onSelect={setSelectedCandidate} 
                    selectedId={selectedCandidate?.id}
                    scrollProgress={scrollProgress}
                />
            </div>

            {/* Fixed Header */}
            <div className="fixed top-0 left-0 w-full z-50 p-8 flex justify-between items-center pointer-events-none">
                <div className="pointer-events-auto">
                    <h1 className="text-sm font-black tracking-[0.3em] uppercase mb-1">Recruit // AI</h1>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-black/40 tracking-widest uppercase">
                        <span>Neural Discovery Protocol</span>
                        <span className="w-1 h-1 rounded-full bg-black/20" />
                        <span>{discoveryResults.length} Dimensions Mapped</span>
                    </div>
                </div>

                <div className="pointer-events-auto flex gap-4">
                    <div className="bg-white border border-black/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-sm hover:border-black/30 transition-all group">
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer pr-4"
                        >
                            <option value="">Target Parameter</option>
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleDiscovery}
                            disabled={loading || !selectedJobId}
                            className="text-black hover:text-indigo-600 transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Narrative Chapters */}
            <div className="relative z-10">
                {/* Chapter 1: Introduction */}
                <section className="h-screen flex items-center px-20 pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="max-w-xl"
                    >
                        <h2 className="text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                            The Talent <br />Singularity
                        </h2>
                        <p className="text-xs font-mono uppercase tracking-[0.3em] text-black/40">
                            Scrolling initiates deep space talent mining
                        </p>
                    </motion.div>
                </section>

                {/* Chapter 2: OSINT Intelligence */}
                <section className="h-screen flex items-center justify-end px-20 pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="max-w-md text-right"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-4 block">Phase 02 // OSINT</span>
                        <h2 className="text-4xl font-black uppercase tracking-tight mb-4">Real-Time Intelligence</h2>
                        <p className="text-sm font-medium leading-relaxed text-black/60">
                            Our neural engine scours the open web, identifying non-obvious patterns in GitHub commits, LinkedIn interactions, and portfolio architectures.
                        </p>
                    </motion.div>
                </section>

                {/* Chapter 3: DNA Matching */}
                <section className="h-screen flex items-center px-20 pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="max-w-md"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-4 block">Phase 03 // DNA</span>
                        <h2 className="text-4xl font-black uppercase tracking-tight mb-4">Genetic Alignment</h2>
                        <p className="text-sm font-medium leading-relaxed text-black/60">
                            Every node in the universe is scored against your specific DNA requirements. We don't just find candidates; we find extensions of your team's core logic.
                        </p>
                    </motion.div>
                </section>

                {/* Chapter 4: Discovery Grid */}
                <section className="h-screen flex items-end justify-center pb-20 pointer-events-none">
                    <div className="text-center">
                        <div className="flex flex-col items-center gap-4">
                            <MousePointer2 className="w-6 h-6 animate-bounce opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black/30">
                                Click any node to inspect intelligence
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Sidebar Detail (Stays Fixed) */}
            <AnimatePresence>
                {selectedCandidate && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        className="fixed top-0 right-0 h-full w-[400px] bg-white/95 backdrop-blur-2xl border-l border-black/5 z-[60] p-10 flex flex-col justify-between shadow-2xl"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-12">
                                <div className="h-12 w-12 grayscale opacity-50">
                                    <DNAHelix score={selectedCandidate.matchScore} />
                                </div>
                                <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-2xl font-black uppercase tracking-tight">{selectedCandidate.firstName} {selectedCandidate.lastName}</h2>
                                <p className="text-xs font-mono text-black/50 uppercase tracking-widest">{selectedCandidate.currentTitle}</p>
                            </div>

                            <div className="mt-12 space-y-8">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>Match Accuracy</span>
                                        <span>{selectedCandidate.matchScore}%</span>
                                    </div>
                                    <div className="h-[2px] w-full bg-black/5">
                                        <div className="h-full bg-black" style={{ width: `${selectedCandidate.matchScore}%` }} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">AI Analysis</h3>
                                    <p className="text-sm leading-relaxed text-black/80 font-medium italic">
                                        "{selectedCandidate.dnaReasoning || selectedCandidate.reasoning}"
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selectedCandidate.skills?.map((skill: string) => (
                                        <span key={skill} className="px-3 py-1 bg-black/5 text-[9px] font-bold uppercase tracking-widest border border-transparent hover:border-black/10 transition-colors">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-auto">
                            <Button
                                onClick={() => handleSaveToPool(selectedCandidate)}
                                disabled={savedIds.has(selectedCandidate.id)}
                                className="bg-black text-white hover:bg-black/80 text-[10px] font-black uppercase h-12 rounded-none tracking-widest"
                            >
                                {savedIds.has(selectedCandidate.id) ? "Verified" : "Save Node"}
                            </Button>
                            <a 
                                href={sanitizeUrl(selectedCandidate.socialUrl)}
                                target="_blank"
                                className="flex items-center justify-center border border-black/10 hover:bg-black/5 text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                External Link
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!loading && discoveryResults.length === 0 && (
                <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="text-center space-y-6 opacity-20">
                        <Cpu className="w-12 h-12 mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">System Idle // Select Target to Begin</p>
                    </div>
                </div>
            )}
            
            {loading && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Scanning Multiverse...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TalentDiscoveryPage() {
    return (
        <Suspense fallback={<div className="h-screen w-screen bg-white flex items-center justify-center font-mono text-[10px] tracking-[0.5em] uppercase">Initialising...</div>}>
            <TalentDiscoveryContent />
        </Suspense>
    );
}
