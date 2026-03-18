"use client";

import React from "react";

interface PrecisionAnchorProps {
  label?: string;
  className?: string;
}

export default function PrecisionAnchor({ label, className = "" }: PrecisionAnchorProps) {
  return (
    <div className={`absolute flex items-center justify-center pointer-events-none select-none ${className}`}>
      {/* The Crosshair */}
      <div className="relative h-4 w-4">
        <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-zinc-600 -translate-y-1/2" />
        <div className="absolute left-1/2 top-0 h-full w-[0.5px] bg-zinc-600 -translate-x-1/2" />
      </div>
      
      {/* Optional Label */}
      {label && (
        <span className="absolute left-6 text-[8px] font-black tracking-[0.2em] uppercase text-zinc-500 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}
