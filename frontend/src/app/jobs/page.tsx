"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/Button";
import {
    Briefcase,
    Plus,
    MoreVertical,
    Filter,
    Loader2,
    AlertCircle,
    Search,
    X,
    Target,
    Sparkles,
    Share,
    Trash2,
    Zap
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import JDGenerator from "@/components/JDGenerator";
import CandidateMatchList from "@/components/CandidateMatchList";

function JobsContent() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [biasAnalysis, setBiasAnalysis] = useState<any>(null);
    const [isMatching, setIsMatching] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    // New Job Form State
    const [newJob, setNewJob] = useState({
        title: "",
        description: "",
        status: "published"
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const fetchJobs = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await api.get("/jobs");
            const fetchedJobs = res.data.data;
            setJobs(fetchedJobs);

            // Handle jobId from URL
            const jobId = searchParams.get('jobId');
            if (jobId && fetchedJobs.length > 0) {
                const jobToSelect = fetchedJobs.find((j: any) => j._id === jobId);
                if (jobToSelect) {
                    handleViewMatches(jobToSelect);
                }
            }
        } catch (err: any) {
            setError("Failed to fetch jobs listings.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [user]);

    const handleJDGenerated = (jd: string) => {
        setNewJob({ ...newJob, description: jd });
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting job:", newJob);
        try {
            const res = await api.post('/jobs', newJob);
            if (res.data.success) {
                setShowCreateModal(false);
                fetchJobs();
                setNewJob({ title: "", description: "", status: "published" });
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Failed to create job listing.");
        }
    };

    const handleViewMatches = async (job: any) => {
        setSelectedJob(job);
        setIsMatching(true);
        try {
            const res = await api.get(`/jobs/${job._id}/match`);
            if (res.data.success) {
                setMatches(res.data.data);
                setBiasAnalysis(res.data.biasAnalysis);
            }
        } catch (err: any) {
            console.error(err);
            setError("Failed to fetch matches.");
        } finally {
            setIsMatching(false);
        }
    };

    const handlePublishJob = async (jobId: string) => {
        try {
            const res = await api.post(`/jobs/${jobId}/publish`);
            if (res.data.success) {
                alert("Successfully published to configured external boards!");
            }
        } catch (err: any) {
            console.error(err);
            setError("Failed to publish to external boards.");
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm('Delete this job?')) return;
        try {
            await api.delete(`/jobs/${jobId}`);
            fetchJobs();
        } catch (err: any) {
            console.error(err);
            setError("Failed to delete job.");
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
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Recruitment Listings</h1>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage your jobs and discover top talent with AI matching.</p>
                    </div>
                    <Button variant="premium" className="gap-2 self-start" onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} />
                        New Job Posting
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

                {/* CREATE JOB MODAL */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                                    <Sparkles className="text-indigo-600" size={20} />
                                    AI-Powered Job Creation
                                </h2>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Step 1: Generate AI Description</h3>
                                    <JDGenerator onGenerated={handleJDGenerated} />
                                </div>

                                <form onSubmit={handleCreateJob} className="space-y-6">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Step 2: Finalize Posting</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Job Title</label>
                                            <input
                                                required
                                                type="text"
                                                value={newJob.title}
                                                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                                placeholder="Enter job title..."
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Description</label>
                                            <textarea
                                                required
                                                rows={10}
                                                value={newJob.description}
                                                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-mono h-[300px]"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" variant="premium" className="w-full py-6">Publish Indexed Listing</Button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* MATCHES MODAL */}
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="w-full max-w-2xl bg-zinc-50 dark:bg-zinc-950 rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Candidate Matches</h2>
                                    <p className="text-xs text-zinc-500 mt-1">Found top matches for: <span className="font-semibold">{selectedJob.title}</span></p>
                                </div>
                                <button onClick={() => {
                                    setSelectedJob(null);
                                    router.replace('/jobs'); // Clear query param
                                }} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            {isMatching ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                    <p className="text-sm font-medium text-zinc-500">AI is calculating semantic match scores...</p>
                                </div>
                            ) : (
                                <CandidateMatchList
                                    candidates={matches}
                                    biasAnalysis={biasAnalysis}
                                    onViewProfile={(id) => router.push(`/candidates/${id}`)}
                                />
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter size={16} />
                            Status
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.length > 0 ? jobs.map((job) => (
                        <div key={job._id} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <Briefcase size={20} />
                                </div>
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                    job.status === "published" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                )}>
                                    {job.status}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 flex-1">{job.description}</p>

                            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
                                    Posted {new Date(job.createdAt).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-2 relative">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-600"
                                        onClick={() => setMenuOpenId(menuOpenId === job._id ? null : job._id)}
                                        title="More"
                                    >
                                        <MoreVertical size={16} />
                                    </Button>
                                    {menuOpenId === job._id && (
                                        <div className="absolute right-0 top-8 z-50 w-44 rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                            <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => { setMenuOpenId(null); handleViewMatches(job); }}>
                                                <Target size={14} /> View AI Matches
                                            </button>
                                            <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => {
                                                const url = `${window.location.origin}/jobs/${job._id}/apply`;
                                                navigator.clipboard.writeText(url);
                                                alert("Link copied to clipboard!");
                                                setMenuOpenId(null);
                                            }}>
                                                <Share size={14} /> Copy Application Link
                                            </button>
                                            <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => { setMenuOpenId(null); handlePublishJob(job._id); }}>
                                                <Share size={14} /> Publish to Boards
                                            </button>
                                            <button
                                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 font-bold"
                                                onClick={() => { setMenuOpenId(null); router.push(`/talent-discovery?jobId=${job._id}`); }}
                                            >
                                                <Zap size={14} className="text-indigo-500 fill-indigo-500" /> Discover Social Talent
                                            </button>
                                            <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => { setMenuOpenId(null); handleDeleteJob(job._id); }}>
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                            <p className="text-zinc-500">No job listings found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={<div className="flex h-[calc(100vh-64px)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
            <JobsContent />
        </Suspense>
    );
}
