"use client";

import React, { useRef, useMemo, Suspense, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float, Line } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const springConfig = {
  stiffness: 100,
  damping: 30,
  mass: 1
};

function TechNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 60;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4.5) {
          lines.push([
            [positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]],
            [positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]]
          ]);
        }
      }
    }
    return lines;
  }, [positions]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.03; // Slower rotation
    groupRef.current.rotation.x += delta * 0.005;
  });

  return (
    <group ref={groupRef}>
      <Points positions={positions} stride={3}>
        <PointMaterial
          transparent
          color="#000"
          size={0.12}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
        />
      </Points>
      {connections.map((points, i) => (
        <Line
          key={i}
          points={points as any}
          color="#000"
          lineWidth={1}
          transparent
          opacity={0.05}
        />
      ))}
      
      {Array.from({ length: 10 }).map((_, i) => (
        <Float key={i} speed={1.5} rotationIntensity={0.8} floatIntensity={0.8}>
          <mesh position={[(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#000" wireframe transparent opacity={0.08} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function NeuralNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 2, // Slower scrub for more weight
      }
    });

    // Content reveal animation (now just opacity and slower movement)
    tl.fromTo(contentRef.current, 
      { opacity: 0, scale: 0.95, y: 50 },
      { opacity: 1, scale: 1, y: 0, ease: "slow(0.7, 0.7, false)", duration: 2 }
    );

    // Individual word reveal with slower stagger
    if (titleRef.current) {
        const words = titleRef.current.textContent?.split(" ") || [];
        titleRef.current.innerHTML = words.map(word => 
            `<span class="inline-block overflow-hidden"><span class="word-reveal inline-block translate-y-full opacity-0">${word}</span></span>`
        ).join(" ");
        
        tl.to(".word-reveal", {
            y: 0,
            opacity: 1,
            stagger: 0.15, // Significantly slower stagger
            ease: "expo.out",
            duration: 1.5
        }, "-=1.5");
    }

    return () => {
        ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[850px] overflow-hidden bg-white"
    >
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none" 
          style={{ 
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '120px 120px'
          }} 
      />

      <div ref={contentRef} className="absolute inset-0 z-10 pointer-events-none">
        {/* 3D Visuals */}
        <div className="absolute inset-0 z-10 opacity-60">
            <Canvas 
                camera={{ position: [0, 0, 12], fov: 45 }}
                gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
                dpr={[1, 1.5]}
            >
            <Suspense fallback={null}>
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <TechNodes />
                <fog attach="fog" args={["#ffffff", 5, 22]} />
            </Suspense>
            </Canvas>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-20">
            <div className="max-w-6xl">
                <div className="text-[11px] font-black tracking-[0.8em] uppercase text-zinc-300 mb-14 flex items-center justify-center gap-10">
                    <div className="h-[1px] w-20 bg-zinc-100" />
                    Neural Sourcing Lab
                    <div className="h-[1px] w-20 bg-zinc-100" />
                </div>
                
                <h3 
                    ref={titleRef}
                    className="text-7xl md:text-9xl font-black uppercase tracking-tighter font-display text-black leading-[0.8] mb-20"
                >
                    Autonomous Talent Synthesis
                </h3>
                
                <p className="text-zinc-400 leading-relaxed text-2xl font-medium max-w-4xl mx-auto italic tracking-tight opacity-70">
                    Precision engineering DNA validation through our persistent 3D neural mesh.
                </p>
            </div>
        </div>
        
        {/* HUD UI Elements */}
        <div className="absolute top-24 left-24 text-[10px] font-mono text-zinc-300 uppercase tracking-[0.5em] z-20">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                Capture.Active
            </div>
            Node_Ref: Cluster_09X
        </div>
        
        <div className="absolute bottom-24 right-24 text-[10px] font-mono text-zinc-300 uppercase tracking-[0.5em] text-right z-20">
            Density: 2.1k/layer<br />
            Integrity: 100% VALIDATED
        </div>

        {/* Framing Accents */}
        <div className="absolute top-16 left-16 w-16 h-16 border-t border-l border-zinc-100 z-20" />
        <div className="absolute bottom-16 right-16 w-16 h-16 border-b border-r border-zinc-100 z-20" />
      </div>
    </div>
  );
}
