import React from 'react';
import { Tree, TreeItem } from './ui/Tree';
import {
    Mail,
    Phone,
    FileText,
    User,
    Briefcase,
    Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdentityCoreTreeProps {
    candidate: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        resumeUrl?: string;
        currentCompany?: string;
    };
    className?: string;
}

export const IdentityCoreTree: React.FC<IdentityCoreTreeProps> = ({ candidate, className }) => {
    const isEmbedded = className?.includes("bg-transparent");

    return (
        <div className={cn(
            "p-6 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl",
            className
        )}>
            {!isEmbedded && (
                <div className="mb-6 flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <Fingerprint size={18} className="text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Identity Core</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Profile Architecture</p>
                        </div>
                    </div>
                </div>
            )}

            <Tree className={cn("space-y-1", isEmbedded && "space-y-0.5")}>
                <TreeItem
                    label={<span className="text-zinc-900 dark:text-zinc-100 font-bold">{candidate.firstName || "Unknown"} {candidate.lastName || "Candidate"}</span>}
                    icon={User}
                    defaultExpanded
                >
                    <TreeItem
                        label={<span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{candidate.email}</span>}
                        icon={Mail}
                    />
                    <TreeItem
                        label={<span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{candidate.phone || "No contact"}</span>}
                        icon={Phone}
                    />
                    <TreeItem
                        label={
                            candidate.resumeUrl ? (
                                <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold underline transition-colors">
                                    View Resume
                                </a>
                            ) : (
                                <span className="text-xs text-zinc-400 italic">No resume</span>
                            )
                        }
                        icon={FileText}
                    />
                    <TreeItem
                        label={<span className="text-xs text-zinc-500 font-mono">FN: {candidate.firstName || "---"}</span>}
                    />
                    <TreeItem
                        label={<span className="text-xs text-zinc-500 font-mono">LN: {candidate.lastName || "---"}</span>}
                    />
                    <TreeItem
                        label={<span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{candidate.currentCompany || "No company data"}</span>}
                        icon={Briefcase}
                    />
                </TreeItem>
            </Tree>
        </div>
    );
};
