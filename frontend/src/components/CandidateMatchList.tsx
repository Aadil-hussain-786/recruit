"use client";

import React from 'react';
import { Target, TrendingUp, AlertCircle, CheckCircle2, User, Zap, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface CandidateMatchListProps {
    candidates: any[];
    biasAnalysis: any;
    onViewProfile: (id: string) => void;
}

function ScoreBar({ score }: { score: number }) {
    const color =
        score >= 70 ? 'bg-emerald-500' :
            score >= 45 ? 'bg-amber-400' :
                'bg-rose-400';

    return (
        <div className="mt-1 h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
                className={cn('h-full rounded-full transition-all duration-700', color)}
                style={{ width: `${Math.min(score, 100)}%` }}
            />
        </div>
    );
}

function ScoreLabel({ score, isDeepAnalyzed }: { score: number; isDeepAnalyzed?: boolean }) {
    if (score === 0) return <span className="text-[10px] text-zinc-400 italic">No match data</span>;
    const quality = score >= 70 ? 'Strong' : score >= 45 ? 'Moderate' : 'Weak';
    const method = isDeepAnalyzed ? 'AI + Skills' : 'Skills';
    return (
        <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">
            {quality} · {method}
        </span>
    );
}

export default function CandidateMatchList({ candidates, biasAnalysis, onViewProfile }: CandidateMatchListProps) {
    return (
        <div className="space-y-6">
            {biasAnalysis && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="text-amber-600 dark:text-amber-500" size={18} />
                        <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-400">AI Bias &amp; DEI Analysis</h3>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-500/80 mb-3">
                        Our AI has analyzed the top matches for potential bias. Score: <span className="font-bold">{biasAnalysis.score}/100</span>
                    </p>
                    <ul className="space-y-1">
                        {Array.isArray(biasAnalysis.findings) && biasAnalysis.findings.map((finding: string, i: number) => (
                            <li key={i} className="text-[10px] flex gap-2 text-amber-700 dark:text-amber-500/70">
                                <span>•</span> {finding}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Scoring method legend */}
            <div className="flex items-center gap-4 text-[10px] text-zinc-400 px-1">
                <span className="flex items-center gap-1"><Brain size={10} className="text-indigo-400" /> AI + Skills = deep analyzed</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-zinc-400" /> Skills = keyword match only</span>
            </div>

            <div className="space-y-3">
                {candidates.length > 0 ? candidates.map((candidate, index) => {
                    const score: number = candidate.matchScore ?? 0;
                    const scoreColor =
                        score >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
                            score >= 45 ? 'text-amber-500 dark:text-amber-400' :
                                'text-rose-500 dark:text-rose-400';

                    return (
                        <div
                            key={candidate._id}
                            className={cn(
                                "group p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all hover:shadow-md",
                                index === 0 && score > 30 && "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                        <User className="text-zinc-500" size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">
                                                {candidate.firstName} {candidate.lastName}
                                            </h4>
                                            {index === 0 && score > 30 && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                                                    Best Match
                                                </span>
                                            )}
                                            {candidate.isDeepAnalyzed && (
                                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Brain size={9} />
                                                    AI Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {candidate.currentTitle || 'No title'} {candidate.currentCompany ? `• ${candidate.currentCompany}` : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Score badge */}
                                <div className="text-right min-w-[60px]">
                                    <div className={cn("flex items-center gap-1 justify-end", scoreColor)}>
                                        <Target size={14} />
                                        <span className="text-lg font-bold">{score}%</span>
                                    </div>
                                    <ScoreLabel score={score} isDeepAnalyzed={candidate.isDeepAnalyzed} />
                                    <ScoreBar score={score} />
                                </div>
                            </div>

                            {/* Skills chips */}
                            {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                    {candidate.skills.slice(0, 6).map((skill: string) => (
                                        <span key={skill} className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px]">
                                            {skill}
                                        </span>
                                    ))}
                                    {candidate.skills.length > 6 && (
                                        <span className="text-[10px] text-zinc-400 self-center">+{candidate.skills.length - 6} more</span>
                                    )}
                                </div>
                            )}

                            {/* Neural Summary (Latest Insight) */}
                            {candidate.patterns?.notes && candidate.patterns.notes.length > 0 && (
                                <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-lg border-l-4 border-l-indigo-500">
                                    <div className="flex items-start gap-2">
                                        <Zap size={12} className="text-indigo-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                {candidate.patterns.notes[candidate.patterns.notes.length - 1]?.toLowerCase().includes('archetype')
                                                    ? 'Neural Summary — Post Interview'
                                                    : 'Neural Overview — Resume Scan'}
                                            </p>
                                            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 italic font-medium">
                                                "{candidate.patterns.notes[candidate.patterns.notes.length - 1]}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI reasoning */}
                            {candidate.reasoning && (
                                <div className="mt-3 p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <Brain size={12} className="text-indigo-500 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-0.5">
                                                AI Match Reasoning
                                            </p>
                                            <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                                                {candidate.reasoning}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No/low match info note */}
                            {score < 20 && (
                                <div className="mt-3 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-[10px] text-zinc-400 flex items-center gap-1.5">
                                    <AlertCircle size={10} />
                                    Limited profile data — AI estimated score based on available information.
                                </div>
                            )}

                            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {score > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <CheckCircle2 size={11} className="text-emerald-500" />
                                            {candidate.skills?.length || 0} Skills on file
                                        </div>
                                    )}
                                    {candidate.totalExperience && (
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                            <TrendingUp size={11} className="text-blue-500" />
                                            {Math.round(candidate.totalExperience / 12)}y experience
                                        </div>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => onViewProfile(candidate._id)} className="h-8 text-xs">
                                    View Profile
                                </Button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="p-10 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <p className="text-sm text-zinc-500">No candidates matched this job description yet.</p>
                        <p className="text-xs text-zinc-400 mt-1">Add candidates with skill data to see AI match scores.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
