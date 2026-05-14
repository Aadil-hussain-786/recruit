"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Target, Zap, AlertCircle } from 'lucide-react';

interface Node {
    id: string;
    label: string;
    type: 'skill' | 'experience' | 'trait' | 'probe';
    details?: string;
}

interface Edge {
    from: string;
    to: string;
    label?: string;
}

interface MindMapData {
    nodes: Node[];
    edges: Edge[];
}

interface IntelligenceMindMapProps {
    data: MindMapData | null;
    className?: string;
}

const IntelligenceMindMap: React.FC<IntelligenceMindMapProps> = ({ data, className }) => {
    if (!data || !data.nodes || data.nodes.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 border border-white/5 bg-black/20 rounded-3xl ${className}`}>
                <Brain className="text-zinc-800 mb-4 animate-pulse" size={48} />
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-600">No Intelligence Map Found</p>
                <p className="text-[8px] text-zinc-700 mt-2">Resume parsing may be required</p>
            </div>
        );
    }

    // Simple layout calculation
    const layouts = useMemo(() => {
        const nodes = data.nodes;
        const centerX = 400;
        const centerY = 300;
        const radius = 200;

        return nodes.map((node, i) => {
            if (i === 0) return { ...node, x: centerX, y: centerY };
            
            const angle = (i / (nodes.length - 1)) * Math.PI * 2;
            return {
                ...node,
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            };
        });
    }, [data]);

    const findNodePosition = (id: string) => {
        const node = layouts.find(n => n.id === id);
        return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'skill': return <Zap size={14} />;
            case 'experience': return <Cpu size={14} />;
            case 'trait': return <Brain size={14} />;
            case 'probe': return <Target size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'skill': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
            case 'experience': return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5';
            case 'trait': return 'text-white border-white/20 bg-white/5';
            case 'probe': return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
            default: return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/5';
        }
    };

    return (
        <div className={`relative w-full aspect-[4/3] bg-zinc-950/50 border border-white/5 rounded-[40px] overflow-hidden ${className}`}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                        <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                    </linearGradient>
                </defs>
                {data.edges.map((edge, i) => {
                    const start = findNodePosition(edge.from);
                    const end = findNodePosition(edge.to);
                    return (
                        <motion.line
                            key={i}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, delay: i * 0.1 }}
                            x1={start.x}
                            y1={start.y}
                            x2={end.x}
                            y2={end.y}
                            stroke="url(#edgeGradient)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    );
                })}
            </svg>

            {layouts.map((node, i) => (
                <motion.div
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, delay: i * 0.1 }}
                    style={{ left: node.x, top: node.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-2xl border backdrop-blur-md flex flex-col items-center gap-2 group cursor-help transition-all hover:scale-110 hover:z-20 ${getTypeColor(node.type)}`}
                >
                    <div className="flex items-center gap-2">
                        {getTypeIcon(node.type)}
                        <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                            {node.label}
                        </span>
                    </div>
                    {node.details && (
                        <div className="absolute top-full mt-2 w-48 p-3 bg-black/90 border border-white/10 rounded-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all pointer-events-none shadow-2xl z-30">
                            <p className="text-[9px] text-zinc-400 normal-case leading-relaxed">
                                {node.details}
                            </p>
                        </div>
                    )}
                </motion.div>
            ))}

            <div className="absolute top-6 left-6 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Neural Mind Map // v1.0</span>
            </div>
            
            <div className="absolute bottom-6 left-6 right-6 flex justify-between">
                <div className="flex gap-4">
                    {['skill', 'experience', 'probe'].map(type => (
                        <div key={type} className="flex items-center gap-1.5">
                            <div className={`h-1 w-1 rounded-full ${getTypeColor(type as any).split(' ')[0]}`} />
                            <span className="text-[7px] uppercase font-bold text-zinc-600 tracking-widest">{type}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IntelligenceMindMap;
