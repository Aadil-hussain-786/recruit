"use client";

import React, { useState } from 'react';
import { Mail, Sparkles, Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

interface CandidateCommunicationProps {
    candidate: any;
    jobId?: string;
}

export default function CandidateCommunication({ candidate, jobId }: CandidateCommunicationProps) {
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState(`Next steps for your application - ${candidate.firstName}`);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');

    const handleGetAISuggestion = async () => {
        setIsSuggesting(true);
        setStatus('idle');
        try {
            const res = await api.post('/communication/suggest', {
                candidateId: candidate._id,
                jobId: jobId || "", // Needs a valid jobId for context
                context: "Following up after initial match"
            });
            if (res.data.success) {
                setMessage(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSendMessage = async () => {
        setIsSending(true);
        try {
            const res = await api.post('/communication/email', {
                candidateId: candidate._id,
                subject,
                message
            });
            if (res.data.success) {
                setStatus('sent');
                setMessage("");
            }
        } catch (err) {
            setStatus('error');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Email Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Message Body</label>
                        <button
                            onClick={handleGetAISuggestion}
                            disabled={isSuggesting}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase"
                        >
                            {isSuggesting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            Get AI Suggestion
                        </button>
                    </div>
                    <textarea
                        rows={10}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here or use AI to generate one..."
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm h-[200px]"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                {status === 'sent' && (
                    <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle size={14} />
                        <span className="text-xs font-medium">Message sent!</span>
                    </div>
                )}
                {status === 'error' && (
                    <div className="flex items-center gap-1.5 text-red-600">
                        <AlertCircle size={14} />
                        <span className="text-xs font-medium">Failed to send.</span>
                    </div>
                )}
                <div />
                <Button
                    variant="premium"
                    className="gap-2"
                    onClick={handleSendMessage}
                    disabled={isSending || !message}
                >
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Send Professional Email
                </Button>
            </div>
        </div>
    );
}
