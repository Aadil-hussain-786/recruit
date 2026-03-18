import React, { useState } from 'react';
import { ChevronRight, ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TreeItemProps {
    label: string | React.ReactNode;
    icon?: LucideIcon;
    children?: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
    level?: number;
}

export const TreeItem: React.FC<TreeItemProps> = ({
    label,
    icon: Icon,
    children,
    defaultExpanded = false,
    className,
    level = 0
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const hasChildren = React.Children.count(children) > 0;

    return (
        <div className={cn("select-none", className)}>
            <div
                className={cn(
                    "flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 cursor-pointer transition-all duration-200 group border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700/30",
                    level === 0 && "font-bold text-zinc-900 dark:text-zinc-50 bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-800/50"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ marginLeft: `${level * 1}rem` }}
            >
                {hasChildren ? (
                    isExpanded ? <ChevronDown size={14} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" /> : <ChevronRight size={14} className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                ) : (
                    <div className="w-[14px]" />
                )}
                {Icon && <Icon size={14} className="text-indigo-500" />}
                <span className="text-sm">{label}</span>
            </div>
            {isExpanded && hasChildren && (
                <div className="flex flex-col gap-0.5">
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child as React.ReactElement<any>, { level: level + 1 });
                        }
                        return child;
                    })}
                </div>
            )}
        </div>
    );
};

interface TreeProps {
    children: React.ReactNode;
    className?: string;
}

export const Tree: React.FC<TreeProps> = ({ children, className }) => {
    return (
        <div className={cn("space-y-0.5", className)}>
            {children}
        </div>
    );
};
