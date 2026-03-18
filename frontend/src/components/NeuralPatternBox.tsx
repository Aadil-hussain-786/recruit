"use client";

import { cn } from "@/lib/utils";
import { Brain, Sparkles, Shield, Target, Heart, MessageCircle, Puzzle, Zap, BookOpen, UsersRound, Eye, TrendingUp, Code2, Rocket } from "lucide-react";

interface NeuralPatternBoxProps {
    patterns: any;
}

const METRIC_CONFIG = [
    { key: 'technicalAptitude', label: 'Technical', icon: Brain, gradient: 'from-blue-500 to-cyan-500' },
    { key: 'skillScore', label: 'Skill Mastery', icon: Code2, gradient: 'from-indigo-400 to-blue-500' },
    { key: 'projectScore', label: 'Project Impact', icon: Rocket, gradient: 'from-amber-400 to-orange-500' },
    { key: 'leadershipPotential', label: 'Leadership', icon: Target, gradient: 'from-purple-500 to-indigo-500' },
    { key: 'culturalAlignment', label: 'Culture Fit', icon: Heart, gradient: 'from-emerald-500 to-teal-500' },
    { key: 'creativity', label: 'Creativity', icon: Sparkles, gradient: 'from-amber-500 to-orange-500' },
    { key: 'confidence', label: 'Confidence', icon: Shield, gradient: 'from-rose-500 to-pink-500' },
    { key: 'communicationSkill', label: 'Communication', icon: MessageCircle, gradient: 'from-cyan-500 to-blue-400' },
    { key: 'problemSolvingAbility', label: 'Problem Solving', icon: Puzzle, gradient: 'from-indigo-500 to-violet-500' },
    { key: 'adaptability', label: 'Adaptability', icon: Zap, gradient: 'from-teal-500 to-green-500' },
    { key: 'domainExpertise', label: 'Domain Depth', icon: BookOpen, gradient: 'from-orange-500 to-red-500' },
    { key: 'teamworkOrientation', label: 'Teamwork', icon: UsersRound, gradient: 'from-pink-500 to-fuchsia-500' },
    { key: 'selfAwareness', label: 'Self-Awareness', icon: Eye, gradient: 'from-violet-500 to-purple-400' },
    { key: 'growthMindset', label: 'Growth Mindset', icon: TrendingUp, gradient: 'from-lime-500 to-emerald-500' },
];

export function NeuralPatternBox({ patterns }: NeuralPatternBoxProps) {
    if (!patterns) return null;

    // Determine which metrics have data
    const activeMetrics = METRIC_CONFIG.filter(m => (patterns[m.key] || 0) > 0);
    const metricsToShow = activeMetrics.length > 0 ? activeMetrics : METRIC_CONFIG.slice(0, 5);

    return (
        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
                <Brain size={14} className="text-indigo-500" />
                Neural Pattern Matrix
                <span className="text-[9px] text-zinc-500 font-medium normal-case tracking-normal ml-auto">
                    {activeMetrics.length} / {METRIC_CONFIG.length} active
                </span>
            </h3>

            <div className="space-y-3">
                {metricsToShow.map((metric) => {
                    const value = patterns[metric.key] || 0;
                    const Icon = metric.icon;

                    return (
                        <div key={metric.key} className="group">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <Icon size={12} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                                        {metric.label}
                                    </span>
                                </div>
                                <span className={cn(
                                    "text-xs font-black tabular-nums",
                                    value >= 70 ? "text-emerald-600 dark:text-emerald-400" :
                                        value >= 40 ? "text-amber-600 dark:text-amber-400" :
                                            value > 0 ? "text-zinc-500" : "text-zinc-300 dark:text-zinc-700"
                                )}>
                                    {value > 0 ? `${value}%` : '—'}
                                </span>
                            </div>
                            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r", metric.gradient)}
                                    style={{ width: `${value}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Hidden Briefing Vibe (compact) */}
            {patterns.hiddenBriefing?.vibe && (
                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-1">Neural Vibe</p>
                    <p className="text-sm font-black italic text-zinc-700 dark:text-zinc-300 uppercase tracking-tight">
                        {patterns.hiddenBriefing.vibe}
                    </p>
                </div>
            )}
        </div>
    );
}
