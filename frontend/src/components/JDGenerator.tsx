"use client";

import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface JDGeneratorProps {
    onGenerated: (jd: string) => void;
}

export default function JDGenerator({ onGenerated }: JDGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    // Inputs
    const [role, setRole] = useState("");
    const [seniority, setSeniority] = useState("Mid-level");
    const [keySkills, setKeySkills] = useState("");
    const [tone, setTone] = useState("formal");

    const handleGenerate = async () => {
        if (!role || !keySkills) {
            setError("Please provide role and key skills.");
            return;
        }

        setIsGenerating(true);
        setError("");

        try {
            const res = await api.post('/jobs/generate-jd', {
                role,
                seniority,
                keySkills: keySkills.split(',').map(s => s.trim()),
                tone
            });

            if (res.data.success) {
                onGenerated(res.data.data);
            } else {
                throw new Error("Generation failed");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to generate JD. Check your OpenAI key.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Job Role</label>
                    <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm transition-all focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Seniority</label>
                    <select
                        value={seniority}
                        onChange={(e) => setSeniority(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm transition-all focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option>Junior</option>
                        <option>Mid-level</option>
                        <option>Senior</option>
                        <option>Lead / Principal</option>
                        <option>Manager / Director</option>
                    </select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Key Skills (comma separated)</label>
                    <input
                        type="text"
                        value={keySkills}
                        onChange={(e) => setKeySkills(e.target.value)}
                        placeholder="e.g. React, Node.js, AWS, TypeScript"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm transition-all focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Tone</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['formal', 'casual', 'innovative'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTone(t)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize",
                                    tone === t ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Button
                onClick={handleGenerate}
                disabled={isGenerating || !role || !keySkills}
                className="w-full gap-2 py-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-none shadow-lg shadow-indigo-500/20"
            >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                {isGenerating ? "AI is writing Compelling JD..." : "Generate Magic JD"}
            </Button>

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex gap-2 items-start">
                    <AlertCircle size={14} className="text-red-500 mt-0.5" />
                    <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
}
