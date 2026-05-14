"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface SignatureTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  fontWeight?: number;
}

/**
 * SignatureText — draws each letter as if being signed with a pen,
 * using an SVG text element with a stroke-dashoffset animation.
 */
export const HandwrittenText: React.FC<SignatureTextProps> = ({
  text,
  className = "",
  delay = 0,
  duration = 2.0,
  fontWeight = 600,
}) => {
  const textRef = useRef<SVGTextElement>(null);
  const [pathLength, setPathLength] = useState(600);
  const [bbox, setBbox] = useState({ width: 800, height: 120 });

  useEffect(() => {
    if (textRef.current) {
      const len = textRef.current.getComputedTextLength();
      setPathLength(len);
      const box = textRef.current.getBBox();
      setBbox({ width: box.width + 20, height: box.height + 20 });
    }
  }, [text]);

  return (
    <span className={`inline-block align-middle ${className}`}>
      <svg
        viewBox={`0 0 ${bbox.width} ${bbox.height}`}
        className="overflow-visible"
        style={{
          width: "auto",
          height: "0.95em",
          display: "inline-block",
          verticalAlign: "baseline",
        }}
        aria-label={text}
      >
        {/* Invisible text to measure */}
        <text
          ref={textRef}
          x="10"
          y={bbox.height * 0.78}
          style={{
            fontFamily: "var(--font-outfit), var(--font-plus-jakarta), sans-serif",
            fontSize: "90px",
            fontWeight: fontWeight,
            fontStyle: "italic",
            visibility: "hidden",
          }}
        >
          {text}
        </text>

        {/* Signature stroke — draws in like a pen */}
        <motion.text
          x="10"
          y={bbox.height * 0.78}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          initial={{ strokeDashoffset: pathLength }}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            duration: duration,
            delay: delay,
            ease: [0.65, 0, 0.35, 1],
          }}
          style={{
            fontFamily: "var(--font-outfit), var(--font-plus-jakarta), sans-serif",
            fontSize: "90px",
            fontWeight: fontWeight,
            fontStyle: "italic",
          }}
        >
          {text}
        </motion.text>

        {/* Fill fades in after stroke completes */}
        <motion.text
          x="10"
          y={bbox.height * 0.78}
          fill="currentColor"
          stroke="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: delay + duration * 0.85,
            ease: "easeOut",
          }}
          style={{
            fontFamily: "var(--font-outfit), var(--font-plus-jakarta), sans-serif",
            fontSize: "90px",
            fontWeight: fontWeight,
            fontStyle: "italic",
          }}
        >
          {text}
        </motion.text>
      </svg>
    </span>
  );
};

/**
 * SignatureLoader — Full-screen loading animation that writes "Recruit AI"
 * using clean text-based stroke drawing (not hand-drawn paths).
 * Each word draws sequentially like signing a document.
 */
export const SignatureLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const recruitRef = useRef<SVGTextElement>(null);
  const aiRef = useRef<SVGTextElement>(null);
  const [recruitLen, setRecruitLen] = useState(500);
  const [aiLen, setAiLen] = useState(150);

  useEffect(() => {
    if (recruitRef.current) {
      setRecruitLen(recruitRef.current.getComputedTextLength());
    }
    if (aiRef.current) {
      setAiLen(aiRef.current.getComputedTextLength());
    }
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-white flex items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
    >
      <div className="relative">
        <svg
          viewBox="0 0 520 100"
          className="w-[75vw] max-w-[520px] h-auto overflow-visible"
          fill="none"
        >
          {/* Hidden text for measuring */}
          <text
            ref={recruitRef}
            x="0" y="80"
            style={{
              fontFamily: "var(--font-signature), cursive",
              fontSize: "110px",
              fontWeight: 400,
              visibility: "hidden",
            }}
          >
            Recruit
          </text>
          <text
            ref={aiRef}
            x="290" y="80"
            style={{
              fontFamily: "var(--font-signature), cursive",
              fontSize: "110px",
              fontWeight: 400,
              visibility: "hidden",
            }}
          >
            AI
          </text>

          {/* "Recruit" — stroke draws first */}
          <motion.text
            x="0" y="80"
            fill="none"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={recruitLen}
            initial={{ strokeDashoffset: recruitLen }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: 1.8,
              delay: 0.3,
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
            style={{
              fontFamily: "var(--font-signature), cursive",
              fontSize: "110px",
              fontWeight: 400,
            }}
          >
            Recruit
          </motion.text>

          {/* "Recruit" — fill fades in */}
          <motion.text
            x="0" y="80"
            fill="black"
            stroke="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.8, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-signature), cursive",
              fontSize: "110px",
              fontWeight: 400,
            }}
          >
            Recruit
          </motion.text>

          {/* "AI" — stroke draws after Recruit */}
          <motion.text
            x="290" y="80"
            fill="none"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={aiLen}
            initial={{ strokeDashoffset: aiLen }}
            animate={{ strokeDashoffset: 0 }}
            transition={{
              duration: 1.0,
              delay: 1.6,
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
            style={{
              fontFamily: "var(--font-signature), cursive",
              fontSize: "110px",
              fontWeight: 400,
            }}
          >
            AI
          </motion.text>

          {/* "AI" — fill fades in */}
          <motion.text
            x="290" y="80"
            fill="black"
            stroke="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 2.4, ease: "easeOut" }}
            style={{
              fontFamily: "var(--font-signature), cursive",
              fontSize: "110px",
              fontWeight: 400,
            }}
          >
            AI
          </motion.text>

          {/* Underline flourish — drawn last */}
          <motion.path
            d="M -10 95 Q 150 75, 400 95 Q 430 98, 440 90"
            fill="none"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.6,
              delay: 2.6,
              ease: [0.65, 0, 0.35, 1],
            }}
          />
        </svg>
      </div>
    </motion.div>
  );
};

export const ScribbleUnderline = ({ delay = 1 }: { delay?: number }) => {
  return (
    <motion.svg
      viewBox="0 0 300 20"
      className="absolute -bottom-4 left-0 w-full h-4 text-black/60 opacity-70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay }}
    >
      <motion.path
        d="M5 15 Q 50 5, 150 12 Q 250 18, 295 8"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

export const HighlightCircle = ({ delay = 1.5 }: { delay?: number }) => {
  return (
    <motion.svg
      viewBox="0 0 100 40"
      className="absolute -inset-2 w-[110%] h-[120%] text-black/30 opacity-40 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay }}
    >
      <motion.path
        d="M 5,20 C 5,5 95,5 95,20 C 95,35 5,35 8,22"
        fill="transparent"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};
