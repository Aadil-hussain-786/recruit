"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    Video,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { format } from 'date-fns';

export default function SchedulePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const applicationId = searchParams.get('appId');

    const [loading, setLoading] = useState(true);
    const [slots, setSlots] = useState<Date[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
    const [step, setStep] = useState<'pick' | 'confirm' | 'success'>('pick');
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState("");
    const [candidateId, setCandidateId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                // Mocking interviewerId for now since it's a demo
                const res = await api.get('/interviews/slots/mock-interviewer');
                if (res.data.success) {
                    setSlots(res.data.data.map((d: string) => new Date(d)));
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load available slots. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, []);

    const handleConfirm = async () => {
        if (!selectedSlot || !applicationId) return;

        setIsConfirming(true);
        try {
            const res = await api.post('/interviews/confirm', {
                applicationId,
                interviewerId: '65a7f2d5e4b0a12345678901', // Mock user ID
                slot: selectedSlot.toISOString()
            });

            if (res.data.success) {
                setCandidateId(res.data.data.candidate);
                setStep('success');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to confirm interview.");
        } finally {
            setIsConfirming(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 py-20 px-6">
            <div className="max-w-xl mx-auto">
                <AnimatePresence mode="wait">
                    {step === 'pick' && (
                        <motion.div
                            key="pick"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-zinc-100">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg mb-6">
                                    <Calendar size={24} />
                                </div>
                                <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase font-display">
                                    Pick your <span className="text-indigo-600 italic">slot</span>
                                </h1>
                                <p className="mt-2 text-zinc-500">
                                    Select a time that works best for you. All times are shown in your local timezone.
                                </p>
                            </div>

                            <div className="p-8">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                {!applicationId && !loading && (
                                    <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700 text-sm">
                                        <AlertCircle size={18} />
                                        Missing application ID. Please use the original link from your email.
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-3">
                                    {slots.map((slot, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${selectedSlot?.getTime() === slot.getTime()
                                                ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-600'
                                                : 'border-zinc-200 hover:border-indigo-300 hover:bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-xl transition-colors ${selectedSlot?.getTime() === slot.getTime() ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                                                    }`}>
                                                    <Clock size={16} />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-zinc-900">
                                                        {format(slot, 'EEEE, MMMM do')}
                                                    </div>
                                                    <div className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                                                        {format(slot, 'p')}
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={`transition-transform ${selectedSlot?.getTime() === slot.getTime() ? 'text-indigo-600 translate-x-1' : 'text-zinc-300'
                                                }`} />
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8">
                                    <Button
                                        onClick={() => setStep('confirm')}
                                        disabled={!selectedSlot || !applicationId}
                                        className="w-full py-7 text-lg uppercase tracking-[0.2em] font-black rounded-2xl bg-black hover:bg-zinc-800"
                                    >
                                        {!applicationId ? 'Invalid Link' : 'Continue'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'confirm' && selectedSlot && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-zinc-100">
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep('pick')}
                                    className="mb-6 -ml-2 text-zinc-500 hover:text-black"
                                >
                                    ← Back to slots
                                </Button>
                                <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase font-display">
                                    Confirm <span className="text-indigo-600">Details</span>
                                </h1>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-400">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">When</p>
                                            <p className="text-sm font-bold text-zinc-900">
                                                {format(selectedSlot, 'EEEE, MMMM do')} at {format(selectedSlot, 'p')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-400">
                                            <Video size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Where</p>
                                            <p className="text-sm font-bold text-zinc-900">Video Interview (Link provided after booking)</p>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-zinc-500 leading-relaxed text-center">
                                    By confirming, you agree to receive email reminders and calendar invites for this session.
                                </p>

                                <Button
                                    onClick={handleConfirm}
                                    disabled={isConfirming}
                                    className="w-full py-7 text-lg uppercase tracking-[0.2em] font-black rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                >
                                    {isConfirming ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin mr-2" />
                                            Confirming...
                                        </>
                                    ) : (
                                        'Complete Booking'
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl border border-zinc-200 shadow-xl p-12 text-center"
                        >
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-8">
                                <CheckCircle2 size={40} />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase font-display mb-4">
                                You're <span className="text-emerald-600 italic">set!</span>
                            </h1>
                            <p className="text-zinc-500 mb-8 max-w-sm mx-auto">
                                Your interview has been scheduled. You'll receive a confirmation email with all the details shortly.
                            </p>

                            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl mb-8">
                                <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold mb-1">
                                    <Sparkles size={16} />
                                    AI Interview Warp-In
                                </div>
                                <p className="text-xs text-emerald-600">
                                    Ready to fast-track? You can start your AI preliminary interview right now.
                                </p>
                                <div className="mt-6">
                                    <Link href={`/interview/${params.id}?appId=${applicationId}${candidateId ? `&candId=${candidateId}` : ''}`}>
                                        <Button className="w-full bg-black text-white rounded-xl py-6 font-bold tracking-widest uppercase text-xs">
                                            Start AI Interview Now
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => window.close()}
                                className="rounded-2xl px-8 py-5 text-xs font-black tracking-widest uppercase border-zinc-200 hover:bg-zinc-50"
                            >
                                Close Window
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
