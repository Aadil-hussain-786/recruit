"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Loader2,
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
    Brain,
    Sparkles,
    CheckCircle,
    X,
    MessageSquare,
    Target
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { IdentityCoreTree } from "@/components/IdentityCoreTree";
import { NeuralPatternBox } from "@/components/NeuralPatternBox";

export default function CandidateProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    const [candidate, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCandidate = async () => {
            if (!id) return;
            try {
                const res = await api.get(`/candidates/${id}`);
                setCandidate(res.data.data);
            } catch (err: any) {
                console.error("Failed to fetch candidate:", err);
                setError("Candidate profile not found or could not be loaded.");
            } finally {
                setLoading(false);
            }
        };
        fetchCandidate();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !candidate) {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-4">
                <div className="p-4 bg-rose-50 rounded-full">
                    <X className="h-10 w-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-bold">Profile Not Found</h1>
                <p className="text-zinc-500 max-w-md text-center">{error || "The candidate you are looking for does not exist in our database."}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pb-20">
            {/* Header / Nav */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Back to Pool
                    </button>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Mail size={14} /> Email
                        </Button>
                        <Button variant="premium" size="sm" className="gap-2">
                            <MessageSquare size={14} /> Schedule Interview
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Basic Info & DNA Tree */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="h-24 w-24 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-4xl mb-6 shadow-xl shadow-indigo-500/20">
                                    {candidate.firstName[0]}{candidate.lastName[0]}
                                </div>
                                <h1 className="text-2xl font-black">{candidate.firstName} {candidate.lastName}</h1>
                                <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest mt-1">{candidate.currentTitle}</p>
                                <p className="text-zinc-500 text-sm mt-1">@{candidate.currentCompany}</p>

                                <div className="w-full mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4 text-left">
                                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        <Mail size={16} className="text-indigo-500" />
                                        {candidate.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        <MapPin size={16} className="text-indigo-500" />
                                        {candidate.location?.city}, {candidate.location?.country}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        <Briefcase size={16} className="text-indigo-500" />
                                        {Math.round(candidate.totalExperience / 12)} Years Experience
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        <Calendar size={16} className="text-indigo-500" />
                                        Notice: {candidate.noticePeriod}
                                    </div>
                                    {candidate.resumeLink && (
                                        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                            <a href={candidate.resumeLink} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                                                View Resume
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                                <Target size={14} className="text-indigo-500" />
                                Talent Identity Tree
                            </h3>
                            <IdentityCoreTree candidate={candidate} className="shadow-none border-none p-0 bg-transparent" />
                        </div>
                    </div>

                    {/* Right Column: AI Insights & Patterns */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Match Analysis Hero (if available in context, else generic) */}
                        <div className="bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent blur-3xl" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                                        <Brain size={12} />
                                        Neural Synthesis Verdict
                                    </div>
                                    <h2 className="text-3xl font-black mb-2">High-Potential <br />Archetype</h2>
                                    <p className="text-zinc-400 max-w-sm text-sm">
                                        This candidate exhibits elite-level technical aptitude with a strong tilt towards architecture and leadership.
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="text-6xl font-black text-indigo-500">
                                        {candidate.patterns ? Math.round(
                                            (candidate.patterns.technicalAptitude + 
                                             candidate.patterns.leadershipPotential + 
                                             (candidate.patterns.projectScore || 0) + 
                                             (candidate.patterns.skillScore || 0)) / 
                                            (2 + (candidate.patterns.projectScore ? 1 : 0) + (candidate.patterns.skillScore ? 1 : 0))
                                        ) : 88}%
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Overall DNA Score</div>
                                </div>
                            </div>
                        </div>

                        {/* AI Pattern Explorer */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-2">
                                <Sparkles size={14} className="text-indigo-500" />
                                Behavioral Intelligence Explorer
                            </h3>
                            {candidate.patterns ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <NeuralPatternBox patterns={candidate.patterns} />
                                    <div className="space-y-6">
                                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-xs font-black uppercase text-indigo-500 mb-4">Top Strengths</h4>
                                            <ul className="space-y-3">
                                                {candidate.patterns.strengthsAndWeaknesses?.strengths?.map((s: string, i: number) => (
                                                    <li key={i} className="text-sm flex gap-3 text-zinc-600 dark:text-zinc-300">
                                                        <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-xs font-black uppercase text-rose-500 mb-4">Key Risk Factors</h4>
                                            <ul className="space-y-3">
                                                {candidate.patterns.strengthsAndWeaknesses?.blindSpots?.map((s: string, i: number) => (
                                                    <li key={i} className="text-sm flex gap-3 text-zinc-600 dark:text-zinc-300">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-center opacity-50 italic">
                                    No AI pattern analysis available for this profile.
                                </div>
                            )}
                        </div>

                        {/* Full Skill List */}
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6">Verified Skillset</h3>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills?.map((skill: string) => (
                                    <span key={skill} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-sm font-bold border border-indigo-100 dark:border-indigo-900/30">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Recruiter Recommendation */}
                        {candidate.patterns?.hireRecommendation && (
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-8 rounded-3xl">
                                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4">Automated Recommendation</h3>
                                <p className="text-xl font-black uppercase mb-4 text-zinc-900 dark:text-zinc-100">
                                    Verdict: {candidate.patterns.hireRecommendation.decision}
                                </p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                                    "{candidate.patterns.hireRecommendation.reasoning}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
