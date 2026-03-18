"use client";

import React, { useRef, useMemo, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    Line,
    MeshTransmissionMaterial,
    Float,
    Text,
    Environment,
    ContactShadows,
    PerspectiveCamera,
    Points,
    PointMaterial
} from "@react-three/drei";
import * as THREE from "three";
import { motion, useScroll, useSpring } from "framer-motion";

// --- HOOK: Global Scroll Progress ---
const useScrollProgress = () => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const handleScroll = () => {
            const total = document.body.scrollHeight - window.innerHeight;
            if (total <= 0) return;
            setProgress(window.scrollY / total);
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    return progress;
};

// --- RIG: Enhanced Camera Shifting ---
const Rig = ({ p }: { p: number }) => {
    const { camera, mouse } = useThree();
    const vec = new THREE.Vector3();
    
    useFrame((state) => {
        // Shifting camera position based on mouse AND scroll
        const zPos = 20 - p * 10;
        const yOffset = p * 5;
        const xOffset = Math.sin(p * Math.PI) * 2;
        
        camera.position.lerp(
            vec.set(
                mouse.x * 2 + xOffset, 
                mouse.y * 2 - yOffset, 
                zPos
            ), 
            0.05
        );
        camera.lookAt(0, 0, 0);
    });
    return null;
};

// --- LIGHT THEME COMPONENT: CRYSTALLINE CORE ---
const CrystallineCore = ({ p }: { p: number }) => {
    const group = useRef<THREE.Group>(null);
    const mesh = useRef<THREE.Mesh>(null);
    const visible = p < 0.35;
    const fadeOut = p > 0.15 ? Math.max(0, 1 - (p - 0.15) / 0.15) : 1;

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x = state.clock.getElapsedTime() * 0.1;
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.15;
            mesh.current.scale.setScalar(1.2 + p * 1);
        }
        if (group.current) {
            group.current.position.y = p * 10;
            group.current.position.x = Math.cos(p * Math.PI) * 2;
        }
    });

    return (
        <group ref={group} visible={visible && fadeOut > 0}>
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh ref={mesh}>
                    <octahedronGeometry args={[5, 0]} />
                    <MeshTransmissionMaterial
                        backside
                        samples={8}
                        thickness={3}
                        chromaticAberration={0.05}
                        anisotropy={0.1}
                        distortion={0.1}
                        distortionScale={0.1}
                        temporalDistortion={0.05}
                        color="#e0f7fa"
                        transparent
                        opacity={fadeOut * 0.8}
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

// --- DATA DUST PARTICLES ---
const DataDust = ({ p }: { p: number }) => {
    const points = useMemo(() => {
        const pArr = new Float32Array(2000 * 3);
        for (let i = 0; i < 2000; i++) {
            pArr[i * 3] = (Math.random() - 0.5) * 50;
            pArr[i * 3 + 1] = (Math.random() - 0.5) * 50;
            pArr[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }
        return pArr;
    }, []);

    // Particles also fade out completely after the 1st phase
    const fadeOut = p > 0.15 ? Math.max(0, 1 - (p - 0.15) / 0.2) : 1;

    const pointsRef = useRef<THREE.Points>(null);
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
            pointsRef.current.position.y = p * 15;
        }
    });

    return (
        <Points ref={pointsRef} positions={points} stride={3} frustumCulled={false} visible={fadeOut > 0}>
            <PointMaterial 
                transparent 
                color="#0ea5e9" 
                size={0.05} 
                sizeAttenuation={true} 
                depthWrite={false} 
                opacity={0.2 * fadeOut} 
            />
        </Points>
    );
};

// --- SCROLL PROGRESS UI (LIGHT) ---
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
                    style={{ scaleX }}
                />
            </div>
        </div>
    );
};

export default function StoryPhysics() {
    const progress = useScrollProgress();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <>
            <ScrollIndicator />
            <div className="fixed inset-0 z-[-1] bg-white pointer-events-none">
                <Canvas dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={35} />
                    <Suspense fallback={null}>
                        <color attach="background" args={["#ffffff"]} />
                        <ambientLight intensity={1.5} />
                        <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                        <CrystallineCore p={progress} />
                        <DataDust p={progress} />
                        <Rig p={progress} />
                        <Environment preset="studio" />
                        <ContactShadows position={[0, -10, 0]} opacity={0.1} scale={40} blur={2.5} far={15} />
                    </Suspense>
                </Canvas>
            </div>
        </>
    );
}
