"use client";

import React, { useState } from 'react';
import { Calendar, Link as LinkIcon, Loader2, CheckCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface InterviewSchedulerProps {
    applicationId: string;
    candidateName: string;
}

export default function InterviewScheduler({ applicationId, candidateName }: InterviewSchedulerProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [link, setLink] = useState("");
    const [copied, setCopied] = useState(false);

    const handleGenerateLink = async () => {
        setIsGenerating(true);
        try {
            const res = await api.post('/interviews/schedule-link', { applicationId });
            if (res.data.success) {
                setLink(res.data.data.link);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-6 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                    <Calendar size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">AI Schedule Assistant</h3>
                    <p className="text-[10px] text-zinc-500 uppercase font-medium tracking-wider">Automate interview coordination</p>
                </div>
            </div>

            {link ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
                        <LinkIcon size={14} className="text-zinc-400" />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate flex-1">{link}</span>
                        <button onClick={copyToClipboard} className="text-indigo-600 hover:text-indigo-700">
                            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-zinc-500">
                        Send this link to <span className="font-bold">{candidateName}</span>. They'll be able to pick from your available slots.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Stop the email back-and-forth. Generate a smart scheduling link that syncs with your team's availability.
                    </p>
                    <Button
                        onClick={handleGenerateLink}
                        disabled={isGenerating}
                        className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                        Generate Scheduling Link
                    </Button>
                </div>
            )}
        </div>
    );
}
