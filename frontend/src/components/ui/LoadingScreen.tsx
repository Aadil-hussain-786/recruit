"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HandwrittenLogo = () => {
    return (
        <svg viewBox="0 0 400 100" className="w-full max-w-lg h-auto">
            <motion.path
                d="M30,70 L30,30 L50,30 Q60,30 60,40 L60,40 Q60,50 50,50 L30,50 L60,70 M70,70 L70,30 L90,30 L90,40 L70,40 L90,50 L70,50 L90,70 M130,30 Q110,30 110,50 Q110,70 130,70 L140,70 Q150,70 150,60 L150,60 L140,60 M160,70 L160,30 L180,30 Q190,30 190,40 L190,40 Q190,50 180,50 L160,50 L190,70 M200,30 L200,60 Q200,70 215,70 Q230,70 230,60 L230,30 M240,30 L240,70 M250,30 L290,30 M270,30 L270,70 M310,30 L330,70 L350,30 M360,70 L360,30 L380,30 L380,70 L360,70"
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.text
                x="50%"
                y="90"
                textAnchor="middle"
                className="text-[10px] font-black uppercase tracking-[0.8em] fill-slate-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                Recruit AI
            </motion.text>
        </svg>
    );
};

export default function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        let currentProgress = 0;
        const start = Date.now();
        
        const update = () => {
            const now = Date.now();
            const elapsed = now - start;

            if (elapsed < 2000) {
                // Fast to 99% in 2 seconds
                currentProgress = Math.min((elapsed / 2000) * 99, 99);
                setProgress(currentProgress);
                requestAnimationFrame(update);
            } else if (elapsed < 12000) {
                // Halt at 99% for 10 seconds (10000ms)
                setProgress(99);
                requestAnimationFrame(update);
            } else {
                // Finish to 100%
                setProgress(100);
                setTimeout(() => {
                    setIsVisible(false);
                    if (onComplete) onComplete();
                }, 800);
            }
        };

        requestAnimationFrame(update);
    }, [onComplete]);

    return (
        <motion.div 
            initial={{ y: 0 }}
            exit={{ 
                y: "-100%",
                transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } 
            }}
            className="fixed inset-0 z-[2000] bg-white flex flex-col items-center justify-center overflow-hidden"
        >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="relative z-10 flex flex-col items-center gap-16 w-full max-w-md px-12">
                <HandwrittenLogo />

                <div className="w-full max-w-[280px] space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Neural_Link_Sync</span>
                            <span className="text-[8px] font-mono text-slate-400 mt-1 italic">
                                {progress < 99 ? "Optimizing_Channels..." : "Calibrating_Deep_Match_Core [10s Halt]"}
                            </span>
                        </div>
                        <span className="text-xl font-black text-slate-900 tabular-nums">{Math.round(progress)}%</span>
                    </div>
                    
                    <div className="h-[2px] w-full bg-slate-100 relative overflow-hidden">
                        <motion.div 
                            className="absolute top-0 left-0 h-full bg-accent-cyan shadow-[0_0_10px_#0ea5e9]"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
