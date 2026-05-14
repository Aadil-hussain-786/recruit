"use client";

import { useEffect, useState, Suspense, Fragment } from "react";
import {
    Loader2,
    Search,
    Download,
    Cpu,
    Github,
    Twitter,
    Mail,
    Phone,
    MapPin,
    Database,
    CheckCircle2,
    AlertCircle,
    FileText,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { cn, sanitizeUrl } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";

function TalentDiscoveryContent() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [discoveryResults, setDiscoveryResults] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [savingId, setSavingId] = useState<string | null>(null);
    const [isCached, setIsCached] = useState(false);
    const [customSearch, setCustomSearch] = useState<string>("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [enrichingIds, setEnrichingIds] = useState<Set<string>>(new Set());

    const suggestions = [
        "Google",
        "Meta",
        "Microsoft",
        "Amazon",
        "Apple",
        "Netflix",
        "Tesla",
        "OpenAI",
        "NVIDIA",
        "Stripe",
        "Uber",
        "Airbnb",
        "Infosys",
        "TCS",
        "Wipro",
        "IIT Bombay",
        "IIT Delhi",
        "SSIPMT Raipur",
        "Stanford",
        "MIT",
        "Bangalore",
        "Hyderabad",
        "San Francisco",
        "New York",
        "London",
        "Remote",
        "Worldwide"
    ];

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!user) return;
            try {
                const res = await api.get("/jobs");
                setJobs(res.data.data || []);
                const urlJobId = searchParams.get('jobId');
                if (urlJobId) setSelectedJobId(urlJobId);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
            }
        };
        fetchJobs();
    }, [user, searchParams]);

    const handleDiscovery = async () => {
        if (!selectedJobId) return;
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/analysis/discover-talent", {
                jobId: selectedJobId,
                customSearch: customSearch || undefined
            });
            const results = (res.data.data || []).map((c: any) => ({
                ...c,
                id: c.socialUrl || c.firstName + c.lastName
            }));

            setDiscoveryResults(results);
            setIsCached(results.some((c: any) => c.isCached));
        } catch (err: any) {
            setError("Failed to discover talent. OSINT Pipeline compromised.");
            setIsCached(false);
        } finally {
            setLoading(false);
        }
    };

    const handleRecursiveScan = async (candidate: any) => {
        setEnrichingIds(prev => new Set(prev).add(candidate.id));
        try {
            const res = await api.post("/analysis/enrich-candidate", { candidate });
            if (res.data.success) {
                const enriched = res.data.data;
                setDiscoveryResults(prev => prev.map(c => 
                    c.id === candidate.id ? { ...c, ...enriched } : c
                ));
            }
        } catch (err) {
            console.error("Recursive scan failed", err);
        } finally {
            setEnrichingIds(prev => {
                const next = new Set(prev);
                next.delete(candidate.id);
                return next;
            });
        }
    };

    const handleSaveToPool = async (candidate: any) => {
        setSavingId(candidate.id);
        const candidatePayload = {
            firstName: candidate.firstName || candidate.name?.split(' ')[0] || 'Unknown',
            lastName: candidate.lastName || candidate.name?.split(' ').slice(1).join(' ') || 'Unknown',
            email: candidate.email !== "Pending Recursive Scan" ? candidate.email : `pending-${candidate.id}@osint.local`,
            phone: candidate.phone !== "Pending Recursive Scan" ? candidate.phone : undefined,
            skills: candidate.skills || [],
            source: candidate.source || 'Discovery',
            isOpenToWork: candidate.isOpenToWork || false,
            willingToRelocate: candidate.willingToRelocate || false,
            interestedInCompany: candidate.interestedInCompany || false,
            archetype: candidate.archetype || 'Standard Candidate',
            tenureType: candidate.tenureType || 'Unknown',
            marketCalibration: candidate.marketCalibration || 'Unknown',
            interviewQuestions: candidate.interviewQuestions || [],
            status: 'new'
        };

        try {
            await api.post("/candidates", candidatePayload);
            setSavedIds(prev => new Set(prev).add(candidate.id));
        } catch (error) {
            console.error(error);
        } finally {
            setSavingId(null);
        }
    };

    const exportToCSV = () => {
        if (discoveryResults.length === 0) return;

        const headers = ["Name", "Email", "Contact_No_OSINT", "X_Account", "Open_To_Work", "Relocation_Status", "Interested_In_Company", "Location", "Expertise", "Discovery_Source", "GitHub_Link"];
        const rows = discoveryResults.map(c => [
            `${c.firstName || ''} ${c.lastName || ''}`.trim(),
            c.email || "Pending Recursive Scan",
            c.phone || "Pending Recursive Scan",
            typeof c.xAccount === 'string' ? c.xAccount : (c.xAccount ? Object.values(c.xAccount).join(' / ') : "null"),
            c.isOpenToWork ? "Open to Work" : "Not Specified",
            c.willingToRelocate ? "Willing to Relocate" : "Not Specified",
            c.interestedInCompany ? "Interested" : "Not Specified",
            typeof c.location === "string" ? c.location : (c.location ? `${c.location.city || ''} ${c.location.country || ''}`.trim() : "International"),
            (c.skills || []).join(", "),
            c.source || "OSINT Deep Scan",
            c.github || c.socials?.github || c.socialUrl || "null",
            c.archetype || "Standard",
            c.marketCalibration || "Unknown"
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(item => `"${item}"`).join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "RecruitAI_Master_Discovery_Full.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadTranscript = (candidate: any) => {
        try {
            const header = `RECRUIT-AI // INTERVIEW TRANSCRIPT\n` +
                           `Candidate: ${candidate.firstName} ${candidate.lastName}\n` +
                           `Date: ${new Date().toLocaleDateString()}\n` +
                           `Status: AI-Generated Simulation\n` +
                           `--------------------------------------------------\n\n`;

            const questions = candidate.interviewQuestions || [];
            const content = questions.map((q: any, i: number) => {
                const questionText = typeof q === 'string' ? q : q.question;
                const answerText = typeof q === 'string' ? 'Implicit analysis' : q.idealAnswer;
                return `[RECRUITER] Q${i + 1}: ${questionText}\n` +
                       `[IDEAL_RESPONSE]: ${answerText}\n\n`;
            }).join('');

            const footer = `--------------------------------------------------\n` +
                           `End of Transcript protocol.`;

            const transcript = header + content + footer;

            const url = window.URL.createObjectURL(new Blob([transcript], { type: 'text/plain' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transcript_${candidate.firstName}_${candidate.lastName}.txt`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download transcript", err);
        }
    };

    return (
        <div className="bg-white bg-grid text-slate-900 min-h-screen pt-24 pb-12 selection:bg-accent-cyan selection:text-white font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">

                {/* Header Section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white shadow-md">
                                <Database size={16} />
                            </div>
                            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 m-0">
                                Talent Discovery Intelligence
                            </h1>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Active Candidate Sourcing // <span className="text-accent-cyan">Data Pipeline</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-sm relative z-50">
                        <select
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            className="bg-transparent text-xs font-bold uppercase tracking-widest outline-none cursor-pointer px-4 py-2 border-r border-slate-200"
                        >
                            {jobs.map(job => (
                                <option key={job._id} value={job._id}>{job.title}</option>
                            ))}
                        </select>
                        <div className="relative flex items-center border-r border-slate-200 group">
                            <Search className="absolute left-3 text-slate-400" size={12} />
                            <input
                                type="text"
                                placeholder="e.g. 'Google', 'Bangalore', 'IIT Bombay'"
                                value={customSearch}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onChange={(e) => setCustomSearch(e.target.value)}
                                className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none px-10 py-2 w-64"
                            />
                            {showSuggestions && (
                                <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] p-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="text-[8px] font-black uppercase text-slate-400 px-3 py-1 border-b border-slate-50 mb-1">Quick Parameters</div>
                                    {suggestions.filter(s => s.toLowerCase().includes(customSearch.toLowerCase())).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                setCustomSearch(s);
                                                setShowSuggestions(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 text-slate-600 hover:text-accent-cyan"
                                        >
                                            <MapPin size={10} />
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={handleDiscovery}
                            disabled={loading || !selectedJobId}
                            className="bg-slate-900 text-white hover:bg-accent-cyan text-[10px] font-black uppercase tracking-widest h-10 px-6 shrink-0 transition-all rounded-lg"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Source Candidates"}
                        </Button>
                        <Button
                            onClick={exportToCSV}
                            disabled={discoveryResults.length === 0}
                            variant="outline"
                            className="text-[10px] font-black uppercase tracking-widest h-10 px-4 shrink-0 hover:bg-slate-100 rounded-lg border-slate-200"
                            title="Export Results to CSV"
                        >
                            <Download size={16} />
                        </Button>
                    </div>
                </div>

                {(error || isCached) && (
                    <div className={cn(
                        "rounded-xl p-6 border mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6 shadow-sm animate-in font-sans relative overflow-hidden",
                        isCached 
                            ? "bg-amber-50 border-amber-200" 
                            : "bg-red-50 border-red-200"
                    )}>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                isCached ? "bg-amber-100 text-amber-600" : "bg-red-100 text-red-600"
                            )}>
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div className="space-y-2 mt-0.5">
                                <p className={cn(
                                    "text-sm font-semibold tracking-tight",
                                    isCached ? "text-amber-800" : "text-red-800"
                                )}>
                                    {isCached ? "Displaying Cached Results" : "Discovery Error"}
                                </p>
                                
                                <p className={cn(
                                    "text-xs leading-relaxed max-w-2xl",
                                    isCached ? "text-amber-700" : "text-red-700"
                                )}>
                                    {isCached 
                                       ? "Real-time discovery is currently pending. Showing recently cached talent profiles for continuity."
                                       : "Failed to discover talent from professional networks. Please try again or refine your search parameters."}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 shrink-0 relative z-10">
                            {!isCached && (
                                <Button 
                                    onClick={handleDiscovery}
                                    className="bg-red-600 text-white hover:bg-red-700 text-xs font-semibold h-9 px-4 rounded-lg shadow-sm transition-all"
                                >
                                    Try Again
                                </Button>
                            )}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => { setError(""); setIsCached(false); }}
                                className={cn(
                                    "text-xs font-semibold h-9 px-4 rounded-lg",
                                    isCached ? "text-amber-700 hover:bg-amber-100/50" : "text-red-700 hover:bg-red-100/50"
                                )}
                            >
                                Dismiss
                            </Button>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="glass-panel border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white/80">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50/80 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Contact_No_OSINT</th>
                                    <th className="px-6 py-4">X_Account</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Expertise</th>
                                    <th className="px-6 py-4">Discovery_Source</th>
                                    <th className="px-6 py-4">GitHub_Link</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {!loading && discoveryResults.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4 opacity-50">
                                                <Search className="w-12 h-12 text-slate-300" />
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                                                    Select a job to find active talent
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : loading ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                                                    Searching LinkedIn, GitHub & Networks for candidates...
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    discoveryResults.map((c, i) => (
                                        <Fragment key={c.id || i}>
                                            <tr className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900">{c.firstName} {c.lastName}</div>
                                                {c.matchScore && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="text-[10px] font-black text-accent-cyan uppercase tracking-widest">
                                                            Match: {c.matchScore}%
                                                        </div>
                                                        {c.archetype && (
                                                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                                                                {c.archetype}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">
                                                <span className={cn(c.email?.includes('Pending') ? "italic text-slate-400" : "")}>
                                                    {c.email && !c.email.includes('Pending') && c.email !== 'null' ? (
                                                        c.email
                                                    ) : (
                                                        <span className="text-[10px] uppercase tracking-tighter text-slate-400">Not Available</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                                <span className={cn(c.phone?.includes('Pending') ? "italic text-slate-400 font-sans" : "")}>
                                                    {c.phone && !c.phone.includes('Pending') && c.phone !== 'null' ? (
                                                        c.phone
                                                    ) : (
                                                        <span className="text-[10px] uppercase tracking-widest leading-none text-slate-400 font-sans">
                                                            Not Available
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">
                                                {(() => {
                                                    const x = c.xAccount || c.twitter || c.socials?.twitter || c.socials?.x;
                                                    if (typeof x === 'string' && x !== 'null' && x.trim() !== '') return x;
                                                    if (x && typeof x === 'object' && Object.keys(x).length > 0) {
                                                        return Object.entries(x).map(([k, v]) => `${k}: ${v}`).join(', ');
                                                    }
                                                    return <span className="text-[10px] uppercase tracking-tighter text-slate-400">Not Available</span>;
                                                })()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border",
                                                            c.isOpenToWork ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-100"
                                                        )}>
                                                            {c.isOpenToWork ? "Open To Work" : "Passive"}
                                                        </span>
                                                        <span className={cn(
                                                            "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border",
                                                            c.willingToRelocate ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-400 border-slate-100"
                                                        )}>
                                                            {c.willingToRelocate ? "Relocatable" : "Static"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border",
                                                            c.interestedInCompany ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-400 border-slate-100"
                                                        )}>
                                                            {c.interestedInCompany ? "Interested" : "Unknown Interest"}
                                                        </span>
                                                        {c.marketCalibration === 'Premium' && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter bg-amber-100 text-amber-700 border border-amber-200">
                                                                PREMIUM
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-200">
                                                    {typeof c.location === "string" ? c.location : (c.location ? `${c.location.city || ''} ${c.location.country || ''}`.trim() : "International")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-[200px] truncate text-slate-600">
                                                {(c.skills || []).join(", ") || "Analysis Pending"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-700 bg-white border border-slate-200">
                                                    {c.source || "OSINT Deep Scan"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={sanitizeUrl(typeof c.github === 'string' ? c.github : (typeof c.socials?.github === 'string' ? c.socials.github : `https://github.com/${c.firstName}`))}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 text-accent-cyan font-semibold hover:underline"
                                                >
                                                    <Github size={14} />
                                                    {typeof c.github === 'string' ? c.github : (c.socials?.github || `github.com/${c.firstName}`)}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        onClick={() => handleSaveToPool(c)}
                                                        disabled={savedIds.has(c.id) || savingId === c.id}
                                                        className={cn(
                                                            "h-8 px-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg w-full",
                                                            savedIds.has(c.id)
                                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-50 opacity-100"
                                                                : "bg-slate-900 text-white hover:bg-accent-cyan"
                                                        )}
                                                    >
                                                        {savingId === c.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                                                        ) : savedIds.has(c.id) ? (
                                                            <span className="flex items-center justify-center gap-1">
                                                                <CheckCircle2 size={12} /> Saved
                                                            </span>
                                                        ) : (
                                                            "Import"
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleRecursiveScan(c)}
                                                        disabled={enrichingIds.has(c.id)}
                                                        className="h-7 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-accent-cyan"
                                                        title="Perform deep web scan to find email and contact info"
                                                    >
                                                        {enrichingIds.has(c.id) ? (
                                                            <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                                                        ) : (
                                                            <><Search size={10} className="mr-1" /> Enrich</>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleDownloadTranscript(c)}
                                                        className="h-7 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500"
                                                        title="Export Interview Audit as .txt"
                                                    >
                                                        <FileText size={10} className="mr-1" /> Transcript
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        {c.interviewQuestions && c.interviewQuestions.length > 0 && (
                                            <tr className="bg-slate-50/30 border-b border-slate-100">
                                                <td colSpan={10} className="px-6 py-3">
                                                    <div className="flex gap-4 overflow-x-auto pb-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1 shrink-0">Behavioral Audit :</span>
                                                        {c.interviewQuestions.map((q: any, i: number) => (
                                                            <div key={i} className="bg-white p-2 rounded border border-slate-200 min-w-[200px] max-w-[300px] shadow-sm">
                                                                <div className="text-[9px] font-bold text-accent-cyan mb-1 leading-tight">
                                                                    Q: {typeof q === 'string' ? q : q.question}
                                                                </div>
                                                                <div className="text-[9px] text-slate-500 italic line-clamp-2">
                                                                    A: {typeof q === 'string' ? 'Implicit analysis' : q.idealAnswer}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        </Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Guidance Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sourcing Verification</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            <strong className="text-slate-800">Dynamic Contact Fetching:</strong> This tool utilizes a real-time crawl of LinkedIn, GitHub, and professional networks to bypass outdated database entries.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Talent Pool Management</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            <strong className="text-slate-800">Direct Import:</strong> High-scoring candidates can be imported directly into your candidate pool with their extracted skills and contact metadata.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Export Protocol</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            <strong className="text-slate-800">Spreadsheet Integration:</strong> Export your sourced lists to CSV for seamless integration with your existing ATS or CRM systems.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TalentDiscoveryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-xs font-black uppercase tracking-widest text-slate-400">Loading Protocol...</div>}>
            <TalentDiscoveryContent />
        </Suspense>
    );
}
