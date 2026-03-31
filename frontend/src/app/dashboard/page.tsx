"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
    Users,
    Briefcase,
    Plus,
    MoreVertical,
    Clock,
    TrendingUp,
    Filter,
    Loader2,
    AlertCircle,
    Search
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            try {
                const [statsRes, jobsRes] = await Promise.all([
                    api.get("/jobs/stats"),
                    api.get("/jobs")
                ]);

                setStats([
                    { name: "Total Candidates", value: statsRes.data.data.totalCandidates, icon: Users, change: "+0%", changeType: "neutral" },
                    { name: "Active Jobs", value: statsRes.data.data.activeJobs, icon: Briefcase, change: "Current", changeType: "neutral" },
                    { name: "Time to Hire", value: statsRes.data.data.timeToHire, icon: Clock, change: "Org Avg", changeType: "neutral" },
                    { name: "Interview Pass Rate", value: statsRes.data.data.interviewPassRate, icon: TrendingUp, change: "Org Avg", changeType: "neutral" },
                ]);

                setJobs(jobsRes.data.data);
                setInsights(statsRes.data.data.recentInsights || []);
            } catch (err: any) {
                setError("Failed to fetch dashboard data. Please ensure the backend is running.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-transparent">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
        );
    }

    return (
        <div className="bg-white bg-grid text-slate-900 min-h-screen pt-20 pb-12 selection:bg-accent-cyan selection:text-white font-sans"><div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-transparent min-h-screen glass-panel rounded-3xl p-8 border border-slate-200">
            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
                            Hello, {user?.firstName}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Welcome back, here's what's happening with your hiring pipeline.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2" onClick={() => router.push('/resume-upload')}>
                            <Plus size={16} />
                            Upload Resume
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Filter size={16} />
                            Filter
                        </Button>
                        <Button className="bg-slate-900 text-white hover:bg-accent-cyan transition-all uppercase tracking-widest text-[10px] font-black gap-2" onClick={() => router.push('/jobs')}>
                            <Plus size={16} />
                            Create Job
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats?.map((stat: any) => (
                        <div key={stat.name} className="overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-black">
                                    <stat.icon size={20} />
                                </div>
                                <span className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-full",
                                    stat.changeType === "increase" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                                )}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                                <p className="mt-1 text-2xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Neural Insights Section */}
                {insights.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <TrendingUp size={20} className="text-black" />
                                Latest Neural Insights
                            </h2>
                            <Button variant="ghost" size="sm" onClick={() => router.push('/candidates')}>Explore all patterns</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {insights.map((insight, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm rounded-2xl hover:border-black/30 transition-all cursor-pointer group"
                                    onClick={() => router.push('/candidates')}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-accent-cyan">{insight.candidateName}</div>
                                        <div className="text-[10px] text-slate-400">{new Date(insight.date).toLocaleDateString()}</div>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-3 italic leading-relaxed group-hover:text-slate-900:text-zinc-200 transition-colors">
                                        "{insight.summary}"
                                    </p>
                                    <div className="mt-4 flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                        {[...Array(5)].map((_, i) => <div key={i} className="h-0.5 w-4 bg-accent-cyan rounded-full" />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Jobs Table */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Recent Jobs Table */}
                        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                                <h2 className="text-lg font-semibold text-slate-900">Recent Job Listings</h2>
                                <Button variant="ghost" size="sm">View all</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Job Title</th>
                                            <th className="px-6 py-3 font-semibold">Department</th>
                                            <th className="px-6 py-3 font-semibold">Status</th>
                                            <th className="px-6 py-3 font-semibold">Openings</th>
                                            <th className="px-6 py-3 font-semibold"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200">
                                        {jobs.length > 0 ? jobs.map((job) => (
                                            <tr
                                                key={job._id}
                                                className="group hover:bg-slate-50:bg-slate-100/50 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/jobs?jobId=${job._id}`)}
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">{job.title}</td>
                                                <td className="whitespace-nowrap px-6 py-4 text-slate-500">{job.department}</td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={cn(
                                                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                                        job.status === "active" || job.status === "published" ? "bg-emerald-50 text-emerald-700" :
                                                            job.status === "closed" ? "bg-red-50 text-red-700" :
                                                                "bg-slate-100 text-slate-700"
                                                    )}>
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-slate-500">{job.numberOfOpenings}</td>
                                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setMenuOpenId(menuOpenId === job._id ? null : job._id)}
                                                            className="text-slate-400 hover:text-slate-500:text-zinc-300 p-1 rounded-md hover:bg-slate-100:bg-slate-100 transition-all"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>
                                                        {menuOpenId === job._id && (
                                                            <div className="absolute right-0 top-8 z-50 w-48 rounded-xl border border-slate-200 bg-white shadow-xl p-1 animate-in fade-in zoom-in duration-200">
                                                                <button
                                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-black:bg-indigo-900/20 text-slate-700  rounded-lg transition-colors"
                                                                    onClick={() => { setMenuOpenId(null); router.push('/jobs'); }}
                                                                >
                                                                    <Briefcase size={14} className="text-slate-400" /> View Details
                                                                </button>
                                                                <button
                                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-black:bg-black/20 text-slate-700  rounded-lg transition-colors"
                                                                    onClick={() => { setMenuOpenId(null); router.push('/candidates'); }}
                                                                >
                                                                    <Users size={14} className="text-slate-400" /> View Candidates
                                                                </button>
                                                                <button
                                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-black:bg-black/20 text-black rounded-lg transition-colors font-black"
                                                                    onClick={() => { setMenuOpenId(null); router.push(`/talent-discovery?jobId=${job._id}`); }}
                                                                >
                                                                    <Search size={14} className="text-black" /> Discover Talent
                                                                </button>
                                                                <div className="h-px bg-slate-100 my-1" />
                                                                <button
                                                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-red-50:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                                                                    onClick={() => { setMenuOpenId(null); /* Handle Delete if needed */ }}
                                                                >
                                                                    <Plus size={14} className="rotate-45" /> Archive Listing
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                    No jobs found. Start by creating your first job listing!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Real-time Feed */}
                    <div className="lg:col-span-1">
                        <ActivityFeed organizationId={user?.organizationId || ''} />
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}
