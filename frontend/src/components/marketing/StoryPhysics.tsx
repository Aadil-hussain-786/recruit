"use client";

import React, { useRef, useMemo, useState, Suspense, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    Points,
    PointMaterial,
    PerspectiveCamera,
    Float
} from "@react-three/drei";
import * as THREE from "three";
import { motion, useScroll, useSpring } from "framer-motion";

// --- HOOK: Throttled Scroll Progress ---
const useScrollProgress = () => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const total = document.body.scrollHeight - window.innerHeight;
                if (total > 0) {
                    setProgress(window.scrollY / total);
                }
                ticking = false;
            });
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return progress;
};

// --- RIG: Lightweight Camera Shifting ---
const Rig = ({ p }: { p: number }) => {
    const { camera } = useThree();
    const vec = useMemo(() => new THREE.Vector3(), []);
    
    useFrame(() => {
        const zPos = 20 - p * 10;
        const yOffset = p * 5;
        const xOffset = Math.sin(p * Math.PI) * 2;
        
        camera.position.lerp(
            vec.set(xOffset, -yOffset, zPos), 
            0.03
        );
        camera.lookAt(0, 0, 0);
    });
    return null;
};

// --- LIGHT CRYSTALLINE CORE (no transmission material) ---
const CrystallineCore = ({ p }: { p: number }) => {
    const group = useRef<THREE.Group>(null);
    const mesh = useRef<THREE.Mesh>(null);
    const visible = p < 0.35;
    const fadeOut = p > 0.15 ? Math.max(0, 1 - (p - 0.15) / 0.15) : 1;

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x = state.clock.getElapsedTime() * 0.08;
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.12;
            mesh.current.scale.setScalar(1.2 + p * 1);
        }
        if (group.current) {
            group.current.position.y = p * 10;
            group.current.position.x = Math.cos(p * Math.PI) * 2;
        }
    });

    if (!visible || fadeOut <= 0) return null;

    return (
        <group ref={group}>
            <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.3}>
                <mesh ref={mesh}>
                    <octahedronGeometry args={[5, 0]} />
                    <meshStandardMaterial
                        color="#e0f7fa"
                        transparent
                        opacity={fadeOut * 0.25}
                        roughness={0.1}
                        metalness={0.3}
                    />
                </mesh>
                <mesh scale={1.02}>
                    <octahedronGeometry args={[5, 0]} />
                    <meshStandardMaterial color="#0ea5e9" wireframe transparent opacity={0.05 * fadeOut} />
                </mesh>
            </Float>
        </group>
    );
};

// --- OPTIMIZED PARTICLES (reduced count) ---
const DataDust = ({ p }: { p: number }) => {
    const points = useMemo(() => {
        const pArr = new Float32Array(600 * 3);
        for (let i = 0; i < 600; i++) {
            pArr[i * 3] = (Math.random() - 0.5) * 50;
            pArr[i * 3 + 1] = (Math.random() - 0.5) * 50;
            pArr[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        return pArr;
    }, []);

    const fadeOut = p > 0.15 ? Math.max(0, 1 - (p - 0.15) / 0.2) : 1;

    const pointsRef = useRef<THREE.Points>(null);
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
            pointsRef.current.position.y = p * 15;
        }
    });

    if (fadeOut <= 0) return null;

    return (
        <Points ref={pointsRef} positions={points} stride={3}>
            <PointMaterial 
                transparent 
                color="#0ea5e9" 
                size={0.06} 
                sizeAttenuation={true} 
                depthWrite={false} 
                opacity={0.2 * fadeOut} 
            />
        </Points>
    );
};

// --- SCROLL PROGRESS UI ---
export const ScrollIndicator = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="fixed bottom-12 right-12 z-[100] flex flex-col items-end gap-2">
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-400">
                Data_Flow_Index
            </span>
            <div className="w-32 h-[1px] bg-slate-100 relative overflow-hidden shadow-sm">
                <motion.div 
                    className="absolute top-0 left-0 h-full bg-accent-cyan shadow-[0_0_10px_rgba(14,165,233,0.2)]"
                    style={{ scaleX, transformOrigin: "left" }}
                />
            </div>
        </div>
    );
};

export default function StoryPhysics() {
    const [isMobile, setIsMobile] = useState(false);
    const progress = useScrollProgress();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Basic mobile detection
        const checkMobile = () => {
            const mobile = window.innerWidth < 768 || 
                          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!mounted || isMobile) return null;

    return (
        <>
            <ScrollIndicator />
            <div className="fixed inset-0 z-[-1] bg-white pointer-events-none">
                <Canvas 
                    dpr={[1, 1.5]}
                    gl={{ 
                        antialias: false, 
                        alpha: true, 
                        powerPreference: "high-performance",
                        stencil: false,
                        depth: true
                    }}
                    performance={{ min: 0.5 }}
                >
                    <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={35} />
                    <Suspense fallback={null}>
                        <color attach="background" args={["#ffffff"]} />
                        <ambientLight intensity={1.5} />
                        <directionalLight position={[10, 10, 10]} intensity={1.5} />
                        <CrystallineCore p={progress} />
                        <DataDust p={progress} />
                        <Rig p={progress} />
                    </Suspense>
                </Canvas>
            </div>
        </>
    );
}
