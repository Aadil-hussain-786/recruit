"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
    Users,
    Plus,
    MoreVertical,
    Filter,
    Loader2,
    AlertCircle,
    Search,
    Mail,
    Phone,
    X,
    MessageSquare,
    Calendar,
    Trash2,
    Sparkles,
    BarChart3,
    Brain,
    Fingerprint
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ResumeUpload from "@/components/ResumeUpload";
import CandidateCommunication from "@/components/CandidateCommunication";
import InterviewScheduler from "@/components/InterviewScheduler";
import { IdentityCoreTree } from "@/components/IdentityCoreTree";
import { NeuralPatternBox } from '@/components/NeuralPatternBox';

export default function CandidatesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showConnectDrawer, setShowConnectDrawer] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [showInsightsModal, setShowInsightsModal] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // New Candidate Form State
    const [newCandidate, setNewCandidate] = useState<any>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        currentCompany: "",
        currentTitle: "",
        totalExperience: "",
        skills: [],
        status: "new",
        location: { city: "", country: "" },
        expectedSalary: "",
        salaryCurrency: "USD",
        noticePeriod: "",
        linkedInUrl: "",
        workPreference: "flexible",
        education: [],
        certifications: [],
        languages: []
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const fetchCandidates = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get("/candidates");
            setCandidates(res.data.data);
        } catch (err: any) {
            setError("Failed to fetch candidates.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [user]);

    const handleResumeParsed = (data: any) => {
        setNewCandidate({
            ...newCandidate,
            ...data,
            skills: data.skills || []
        });
    };

    const handleCreateCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/candidates', newCandidate);
            if (res.data.success) {
                setShowAddModal(false);
                fetchCandidates();
            }
        } catch (err: any) {
            console.error(err);
            setError("Failed to create candidate profile.");
        }
    };

    const handleDeleteCandidate = async (candidateId: string) => {
        if (!confirm('Delete this candidate?')) return;
        try {
            await api.delete(`/candidates/${candidateId}`);
            fetchCandidates();
        } catch (err: any) {
            console.error(err);
            setError('Failed to delete candidate.');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Candidates Pool</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">View and manage your entire talent pool with AI-powered insights.</p>
                    </div>
                    <Button variant="premium" className="gap-2 self-start" onClick={() => setShowAddModal(true)}>
                        <Plus size={16} />
                        Add Candidate
                    </Button>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <p className="ml-3 text-sm text-red-800 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* MODAL / SLIDE OVER for Adding Candidate */}
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm">
                        <div className="h-full w-full max-w-xl bg-white dark:bg-zinc-950 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Add New Candidate</h2>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Step 1: AI Resume Parsing</h3>
                                    <ResumeUpload onParsed={handleResumeParsed} />
                                </section>

                                <form onSubmit={handleCreateCandidate} className="space-y-6">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Step 2: Verify Profile</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">First Name</label>
                                            <input required type="text" value={newCandidate.firstName} onChange={(e) => setNewCandidate({ ...newCandidate, firstName: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Last Name</label>
                                            <input required type="text" value={newCandidate.lastName} onChange={(e) => setNewCandidate({ ...newCandidate, lastName: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Email Address</label>
                                            <input required type="email" value={newCandidate.email} onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Phone</label>
                                            <input type="text" value={newCandidate.phone} onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Current Title</label>
                                            <input type="text" value={newCandidate.currentTitle} onChange={(e) => setNewCandidate({ ...newCandidate, currentTitle: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Current Company</label>
                                            <input type="text" value={newCandidate.currentCompany} onChange={(e) => setNewCandidate({ ...newCandidate, currentCompany: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Experience (months)</label>
                                            <input type="number" value={newCandidate.totalExperience} onChange={(e) => setNewCandidate({ ...newCandidate, totalExperience: Number(e.target.value) })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" placeholder="e.g. 36" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Notice Period</label>
                                            <input type="text" value={newCandidate.noticePeriod} onChange={(e) => setNewCandidate({ ...newCandidate, noticePeriod: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" placeholder="e.g. 30 days" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">City</label>
                                            <input type="text" value={newCandidate.location?.city || ''} onChange={(e) => setNewCandidate({ ...newCandidate, location: { ...newCandidate.location, city: e.target.value } })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Country</label>
                                            <input type="text" value={newCandidate.location?.country || ''} onChange={(e) => setNewCandidate({ ...newCandidate, location: { ...newCandidate.location, country: e.target.value } })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Expected Salary</label>
                                            <input type="number" value={newCandidate.expectedSalary} onChange={(e) => setNewCandidate({ ...newCandidate, expectedSalary: Number(e.target.value) })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Work Preference</label>
                                            <select value={newCandidate.workPreference} onChange={(e) => setNewCandidate({ ...newCandidate, workPreference: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm">
                                                <option value="flexible">Flexible</option>
                                                <option value="remote">Remote</option>
                                                <option value="hybrid">Hybrid</option>
                                                <option value="onsite">Onsite</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 space-y-1.5 text-left">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">LinkedIn URL</label>
                                            <input type="url" value={newCandidate.linkedInUrl} onChange={(e) => setNewCandidate({ ...newCandidate, linkedInUrl: e.target.value })} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm" placeholder="https://linkedin.com/in/..." />
                                        </div>
                                    </div>

                                    <Button type="submit" variant="premium" className="w-full py-6">Create AI-Indexed Profile</Button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, skills, or email..."
                            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-indigo-200 text-indigo-700 dark:border-indigo-900/50 dark:text-indigo-400"
                            onClick={() => router.push('/resume-fetcher')}
                        >
                            <Brain size={16} />
                            Resume Fetcher
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter size={16} />
                            Advanced Filter
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Candidate</th>
                                <th className="px-6 py-4 font-semibold text-center">Identity Architecture</th>
                                <th className="px-6 py-4 font-semibold text-center">Status</th>
                                <th className="px-6 py-4 font-semibold">AI Patterns</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {candidates.length > 0 ? candidates.map((candidate) => (
                                <tr key={candidate._id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold uppercase">
                                                {candidate.firstName?.[0] || '?'}{candidate.lastName?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-50">{candidate.firstName} {candidate.lastName}</p>
                                                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-zinc-500">
                                                    <span className="flex items-center gap-1"><Mail size={10} /> {candidate.email}</span>
                                                    <span className="font-bold text-zinc-300 dark:text-zinc-700">|</span>
                                                    <span>{candidate.currentTitle} @ {candidate.currentCompany}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 min-w-[280px]">
                                        <IdentityCoreTree
                                            candidate={candidate}
                                            className="p-0 bg-transparent backdrop-blur-none border-none shadow-none rounded-none"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                            candidate.status === "new" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" :
                                                candidate.status === "hired" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" :
                                                    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                                        )}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {candidate.patterns ? (
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1">
                                                    {[
                                                        { label: 'T', color: 'bg-blue-500', val: candidate.patterns.technicalAptitude },
                                                        { label: 'L', color: 'bg-purple-500', val: candidate.patterns.leadershipPotential },
                                                        { label: 'C', color: 'bg-emerald-500', val: candidate.patterns.culturalAlignment }
                                                    ].map((p, i) => (
                                                        <div
                                                            key={i}
                                                            className={cn("h-4 w-4 rounded-full border border-white dark:border-zinc-900", p.color)}
                                                            title={`${p.label}: ${p.val}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-400">
                                                    {Math.round((candidate.patterns.technicalAptitude + candidate.patterns.leadershipPotential + candidate.patterns.culturalAlignment) / 3)}%
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-zinc-400 italic">No patterns yet</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCandidate(candidate);
                                                    setShowInsightsModal(true);
                                                }}
                                                className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                                            >
                                                <Sparkles size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedCandidate(candidate);
                                                    setShowConnectDrawer(true);
                                                }}
                                                className="p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setMenuOpenId(menuOpenId === candidate._id ? null : candidate._id)}
                                                    className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {menuOpenId === candidate._id && (
                                                    <div className="absolute right-0 top-8 z-50 w-44 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                                        <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => { setMenuOpenId(null); setSelectedCandidate(candidate); setShowInsightsModal(true); }}>
                                                            <Sparkles size={14} /> AI Insights
                                                        </button>
                                                        <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => { setMenuOpenId(null); setSelectedCandidate(candidate); setShowConnectDrawer(true); }}>
                                                            <MessageSquare size={14} /> Message
                                                        </button>
                                                        <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => { setMenuOpenId(null); handleDeleteCandidate(candidate._id); }}>
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                                        No candidates found. Start by adding your first candidate!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* AI INSIGHTS MODAL */}
                {showInsightsModal && selectedCandidate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                                        {selectedCandidate.firstName[0]}{selectedCandidate.lastName[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{selectedCandidate.firstName} {selectedCandidate.lastName}</h2>
                                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Neural Pattern Analysis</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowInsightsModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {!selectedCandidate.patterns ? (
                                <div className="py-20 text-center space-y-4">
                                    <BarChart3 size={48} className="mx-auto text-zinc-200" />
                                    <p className="text-zinc-500">No AI data available for this candidate yet. Try processing their resume or conducting an AI interview.</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {/* CANDIDATE PROFILE DATA */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Experience', value: selectedCandidate.totalExperience ? `${Math.round(selectedCandidate.totalExperience / 12)}y ${selectedCandidate.totalExperience % 12}m` : '—' },
                                            { label: 'Location', value: selectedCandidate.location?.city ? `${selectedCandidate.location.city}, ${selectedCandidate.location.country || ''}` : '—' },
                                            { label: 'Salary', value: selectedCandidate.expectedSalary ? `${selectedCandidate.salaryCurrency || 'USD'} ${selectedCandidate.expectedSalary.toLocaleString()}` : '—' },
                                            { label: 'Notice', value: selectedCandidate.noticePeriod || '—' },
                                            { label: 'Work Pref', value: selectedCandidate.workPreference || '—' },
                                            { label: 'LinkedIn', value: selectedCandidate.linkedInUrl ? 'Connected' : '—' },
                                            { label: 'Languages', value: selectedCandidate.languages?.length ? selectedCandidate.languages.join(', ') : '—' },
                                            { label: 'Certifications', value: selectedCandidate.certifications?.length || 0 },
                                        ].map((item, i) => (
                                            <div key={i} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">{item.label}</p>
                                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* PRE-INTERVIEW INTELLIGENCE (HIDDEN BRIEFING) */}
                                    {selectedCandidate.patterns.hiddenBriefing && (
                                        <div className="bg-zinc-950 text-white rounded-[2rem] p-8 border border-white/10 shadow-3xl overflow-hidden relative group">
                                            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity"><Fingerprint size={48} className="text-indigo-500" /></div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-6"><div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /><h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Pre-Interview Intelligence</h3></div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <div><p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Candidate Vibe</p><p className="text-2xl font-black italic uppercase tracking-tight">{selectedCandidate.patterns.hiddenBriefing.vibe}</p></div>
                                                        <div><p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">The "One Thing"</p><p className="text-sm font-medium text-zinc-300 leading-relaxed italic border-l-2 border-indigo-500/30 pl-4">"{selectedCandidate.patterns.hiddenBriefing.theOneThing}"</p></div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl"><p className="text-[9px] font-black uppercase tracking-widest text-rose-400 mb-2">The Probe (Ask This)</p><p className="text-xs font-bold text-zinc-100 leading-relaxed italic">{selectedCandidate.patterns.hiddenBriefing.probe}</p></div>
                                                        {selectedCandidate.patterns.hiddenBriefing.redFlags?.length > 0 && (
                                                            <div><p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Neural Red Flags</p><div className="flex flex-wrap gap-2">{selectedCandidate.patterns.hiddenBriefing.redFlags.map((flag: string, i: number) => (<span key={i} className="text-[9px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20 uppercase">{flag}</span>))}</div></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ALL 12 INTELLIGENCE METRICS */}
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2"><Brain size={14} className="text-indigo-500" />Intelligence Matrix — 12 Dimensions</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {[
                                                { label: 'Technical', key: 'technicalAptitude', color: 'bg-blue-500' },
                                                { label: 'Leadership', key: 'leadershipPotential', color: 'bg-purple-500' },
                                                { label: 'Culture Fit', key: 'culturalAlignment', color: 'bg-emerald-500' },
                                                { label: 'Creativity', key: 'creativity', color: 'bg-amber-500' },
                                                { label: 'Confidence', key: 'confidence', color: 'bg-rose-500' },
                                                { label: 'Communication', key: 'communicationSkill', color: 'bg-cyan-500' },
                                                { label: 'Problem Solving', key: 'problemSolvingAbility', color: 'bg-indigo-500' },
                                                { label: 'Adaptability', key: 'adaptability', color: 'bg-teal-500' },
                                                { label: 'Domain Depth', key: 'domainExpertise', color: 'bg-orange-500' },
                                                { label: 'Teamwork', key: 'teamworkOrientation', color: 'bg-pink-500' },
                                                { label: 'Self-Awareness', key: 'selfAwareness', color: 'bg-violet-500' },
                                                { label: 'Growth Mindset', key: 'growthMindset', color: 'bg-lime-500' },
                                            ].map((metric) => {
                                                const val = (selectedCandidate.patterns as any)[metric.key] || 0;
                                                return (
                                                    <div key={metric.key} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{metric.label}</span>
                                                            <span className={cn("text-sm font-black", val >= 70 ? 'text-emerald-600' : val >= 40 ? 'text-amber-500' : 'text-zinc-400')}>{val}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                            <div className={cn('h-full rounded-full transition-all duration-700', metric.color)} style={{ width: `${val}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* HIRE RECOMMENDATION */}
                                    {selectedCandidate.patterns.hireRecommendation?.decision && (
                                        <div className={cn('p-6 rounded-2xl border', selectedCandidate.patterns.hireRecommendation.decision.includes('yes') ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' : selectedCandidate.patterns.hireRecommendation.decision === 'maybe' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900')}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">AI Hire Recommendation</p>
                                            <p className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100">{selectedCandidate.patterns.hireRecommendation.decision.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-zinc-500 mt-1">Confidence: {selectedCandidate.patterns.hireRecommendation.confidence}%</p>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">{selectedCandidate.patterns.hireRecommendation.reasoning}</p>
                                            {selectedCandidate.patterns.hireRecommendation.idealRole && <p className="text-xs text-indigo-500 mt-2 font-bold">Ideal Role: {selectedCandidate.patterns.hireRecommendation.idealRole}</p>}
                                        </div>
                                    )}

                                    {/* STRENGTHS / WEAKNESSES / BLIND SPOTS */}
                                    {selectedCandidate.patterns.strengthsAndWeaknesses && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[{ label: 'Strengths', data: selectedCandidate.patterns.strengthsAndWeaknesses.strengths, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' }, { label: 'Weaknesses', data: selectedCandidate.patterns.strengthsAndWeaknesses.weaknesses, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' }, { label: 'Blind Spots', data: selectedCandidate.patterns.strengthsAndWeaknesses.blindSpots, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' }].map((section) => (
                                                <div key={section.label} className={cn('p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800', section.bg)}>
                                                    <p className={cn('text-[10px] font-black uppercase tracking-widest mb-3', section.color)}>{section.label}</p>
                                                    <ul className="space-y-2">{(section.data || []).map((item: string, i: number) => (<li key={i} className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed flex gap-2"><span className={section.color}>•</span>{item}</li>))}</ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <NeuralPatternBox patterns={selectedCandidate.patterns} />
                                            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2"><Brain size={14} className="text-indigo-500" />Skill Archetype</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedCandidate.skills?.length > 0 ? selectedCandidate.skills.map((skill: string, i: number) => (<span key={i} className="px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-xs font-medium">{skill}</span>)) : (<p className="text-xs text-zinc-400 italic">No skills extracted.</p>)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800 h-fit">
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2"><Sparkles size={14} className="text-indigo-500" />Behavioral Verdict</h3>
                                            {(() => {
                                                const p = selectedCandidate.patterns;
                                                const allScores = [p.technicalAptitude, p.leadershipPotential, p.culturalAlignment, p.creativity, p.confidence, p.communicationSkill, p.problemSolvingAbility, p.adaptability, p.domainExpertise, p.teamworkOrientation, p.selfAwareness, p.growthMindset].map(v => v || 0);
                                                const validScores = allScores.filter(v => v > 0);
                                                const avg = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
                                                const verdict = avg >= 70 ? { label: 'Strong Candidate', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' } : avg >= 45 ? { label: 'Moderate Fit', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' } : { label: 'Needs Development', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' };
                                                return (<div className="flex items-center gap-2 mb-4"><span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${verdict.color}`}>{verdict.label}</span><span className="text-[10px] text-zinc-400 font-medium">Avg: {avg}% ({validScores.length} metrics)</span></div>);
                                            })()}
                                            <div className="space-y-3">
                                                {selectedCandidate.patterns.notes?.length > 0
                                                    ? selectedCandidate.patterns.notes.map((note: string, i: number) => (<div key={i} className="flex items-start gap-2.5"><span className="shrink-0 mt-1 h-4 w-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[8px] font-black text-indigo-600 dark:text-indigo-400">{i + 1}</span><p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{note}</p></div>))
                                                    : (<p className="text-sm text-zinc-500 italic">No behavioral notes yet. Complete an AI interview to generate insights.</p>)
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {selectedCandidate.patterns.interviewScript && selectedCandidate.patterns.interviewScript.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                                    <MessageSquare size={14} className="text-indigo-500" />
                                                    Interview Q&amp;A — Manual Review
                                                </h3>
                                                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                                                    {selectedCandidate.patterns.interviewScript.length} Questions
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-400 italic">
                                                Exact questions asked by the AI and verbatim answers from the candidate. Easy to manually verify.
                                            </p>
                                            <div className="space-y-3">
                                                {selectedCandidate.patterns.interviewScript.map((item: any, i: number) => (
                                                    <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                                        {/* Question row */}
                                                        <div className="flex items-start gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-950/40">
                                                            <span className="shrink-0 h-5 w-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center mt-0.5">
                                                                {i + 1}
                                                            </span>
                                                            <div className="flex-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-0.5">AI Question</p>
                                                                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 leading-relaxed">{item.question}</p>
                                                            </div>
                                                        </div>
                                                        {/* Answer row */}
                                                        <div className="flex items-start gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                                                            <span className="shrink-0 h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[9px] font-black flex items-center justify-center mt-0.5">
                                                                A
                                                            </span>
                                                            <div className="flex-1">
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Candidate Response</p>
                                                                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                                                    {item.answer || <span className="italic text-zinc-400">No answer recorded</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4">
                                        <Button variant="outline" onClick={() => setShowInsightsModal(false)}>Close</Button>
                                        <Button variant="premium" onClick={() => {
                                            setShowInsightsModal(false);
                                            setShowConnectDrawer(true);
                                        }}>Schedule Interview</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* CONNECT DRAWER */}
                {showConnectDrawer && selectedCandidate && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/40 backdrop-blur-sm">
                        <div className="h-full w-full max-w-lg bg-white dark:bg-zinc-950 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg">
                                        {selectedCandidate.firstName[0]}{selectedCandidate.lastName[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Connect with {selectedCandidate.firstName}</h2>
                                        <p className="text-xs text-zinc-500">{selectedCandidate.currentTitle} • {selectedCandidate.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowConnectDrawer(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">AI Interview Scheduling</h3>
                                    <InterviewScheduler
                                        applicationId={selectedCandidate._id}
                                        candidateName={`${selectedCandidate.firstName} ${selectedCandidate.lastName}`}
                                    />
                                </section>

                                <section>
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Direct Messaging</h3>
                                    <CandidateCommunication candidate={selectedCandidate} />
                                </section>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
