"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Send,
    CheckCircle2,
    ArrowRight,
    Briefcase,
    MapPin,
    Building2,
    Loader2,
    FileText,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function JobApplyPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id;

    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [resData, setResData] = useState<any>(null);
    const [error, setError] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        currentTitle: "",
        currentCompany: "",
        skills: "",
        expectedSalary: "",
        noticePeriod: "",
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                // Public endpoint
                const res = await api.get(`/public/jobs/${jobId}`);
                setJob(res.data.data);
            } catch (err) {
                console.error(err);
                setError("Job not found or no longer active.");
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            if (file) {
                data.append('resume', file);
            }

            const res = await api.post(`/public/jobs/${jobId}/apply`, data);

            if (res.data.success) {
                setResData(res.data.data);
                setSubmitted(true);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={40} />
            </div>
        );
    }

    if (error && !job) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">{error}</h1>
                <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
            {/* Header / Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <main className="relative z-10 max-w-5xl mx-auto px-6 py-20">
                <AnimatePresence mode="wait">
                    {!submitted ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="flex flex-col md:flex-row gap-16">
                                {/* Left Side: Job Info */}
                                <div className="md:w-1/3 space-y-8">
                                    <div className="space-y-4">
                                        <div className="inline-flex px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                            Hiring Now
                                        </div>
                                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
                                            {job.title}
                                        </h1>
                                        <div className="flex flex-wrap gap-4 text-sm text-zinc-400 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 size={16} />
                                                {job.department}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={16} />
                                                {job.location}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                            <Sparkles size={14} className="text-indigo-400" />
                                            AI Selection Process
                                        </h3>
                                        <p className="text-xs leading-relaxed text-zinc-400">
                                            Our neural matching system will analyze your resume for technical patterns and behavioral signals. Top candidates are automatically invited to an AI voice interview.
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">About the Role</h3>
                                        <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                            {job.description}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Application Form */}
                                <div className="flex-1">
                                    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 space-y-10">
                                        <section className="space-y-6">
                                            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                                                <div className="h-6 w-1 bg-white rounded-full" />
                                                Identity Core
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">First Name</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.firstName}
                                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                                        placeholder="Jane"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Last Name</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.lastName}
                                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                                        placeholder="Doe"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                                                    <input
                                                        required
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                                        placeholder="jane@example.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                                        placeholder="+1 234 567 890"
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-6">
                                            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                                                <div className="h-6 w-1 bg-white rounded-full" />
                                                Professional Graph
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Current Title</label>
                                                    <input
                                                        type="text"
                                                        value={formData.currentTitle}
                                                        onChange={(e) => setFormData({ ...formData, currentTitle: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                                        placeholder="Senior Software Engineer"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Current Company</label>
                                                    <input
                                                        type="text"
                                                        value={formData.currentCompany}
                                                        onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                                        placeholder="Acme Corp"
                                                    />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-6">
                                            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-3">
                                                <div className="h-6 w-1 bg-white rounded-full" />
                                                Artifact Upload
                                            </h2>
                                            <div className="relative group">
                                                <input
                                                    required
                                                    type="file"
                                                    accept=".pdf,.docx"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                                />
                                                <div className={`border-2 border-dashed ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 group-hover:border-white/20 bg-white/[0.02]'} rounded-3xl p-10 flex flex-col items-center justify-center transition-all`}>
                                                    {file ? (
                                                        <>
                                                            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
                                                                <FileText size={24} />
                                                            </div>
                                                            <p className="text-sm font-bold text-emerald-400">{file.name}</p>
                                                            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-black uppercase tracking-widest">Selected artifact ready for analysis</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="h-12 w-12 rounded-2xl bg-white/5 text-zinc-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                                <Upload size={24} />
                                                            </div>
                                                            <p className="text-sm font-bold uppercase tracking-tight">Drop your resume</p>
                                                            <p className="text-[10px] text-zinc-500 mt-1 uppercase font-black uppercase tracking-widest">PDF or DOCX (Max 10MB)</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </section>

                                        {error && (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center">
                                                {error}
                                            </div>
                                        )}

                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-8 bg-white text-black hover:bg-zinc-200 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            {submitting ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Neural Syncing...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    Broadcast Application
                                                    <ArrowRight size={18} />
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-xl mx-auto text-center space-y-8 py-20"
                        >
                            <div className="inline-flex h-24 w-24 items-center justify-center rounded-[32px] bg-emerald-500 text-black mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                <CheckCircle2 size={48} />
                            </div>
                            <h1 className="text-5xl font-black uppercase tracking-tight leading-none">
                                Transmission <br /> <span className="text-zinc-500">Confirmed</span>
                            </h1>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                Your profile is now being processed by our AI recruitment engines. If there is a pattern match, you will receive an invitation to the voice interview stage within minutes.
                            </p>
                            <div className="pt-8 flex flex-col items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 animate-pulse">Scanning Profile...</span>
                                <Button
                                    onClick={() => router.push(`/interview/${jobId}?appId=${resData?.applicationId}&candId=${resData?.candidateId}`)}
                                    variant="premium"
                                    className="bg-white text-black hover:bg-zinc-200 rounded-none px-12 py-8 text-sm font-black tracking-[0.3em] uppercase transition-all hover:scale-105"
                                >
                                    Proceed to AI Interview
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
