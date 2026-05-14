"use client";

import { useEffect, useState } from 'react';
import { Terminal, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityItem {
    timestamp: string;
    action: string;
    details: string;
}

export default function ActivityFeed({ organizationId }: { organizationId: string }) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        if (!organizationId) return;
        
        // Ably has been removed. 
        // This component currently displays static/empty state or can be wired to a new realtime service.
        console.log('[ActivityFeed] Realtime connection offline (Ably removed).');
        
    }, [organizationId]);

    return (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <Activity size={18} className="text-emerald-500" />
                    Live Protocol Stream
                </h2>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live</span>
                </div>
            </div>
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                <AnimatePresence initial={false}>
                    {activities.length > 0 ? (
                        activities.map((activity, idx) => (
                            <motion.div
                                key={`${activity.timestamp}-${idx}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
                            >
                                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100">
                                    <Terminal size={12} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{activity.action}</span>
                                        <span className="text-[8px] text-zinc-500 uppercase tracking-tighter">{new Date(activity.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono italic">
                                        {activity.details || 'No data protocol recorded.'}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-12 text-center text-zinc-400 flex flex-col items-center gap-3">
                            <Zap size={24} className="opacity-20" />
                            <p className="text-[10px] uppercase font-black tracking-widest">Awaiting neural activity...</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    <span>Agent Gemini Status: Operational</span>
                    <span>Buffer: {activities.length}/10</span>
                </div>
            </div>
        </div>
    );
}
