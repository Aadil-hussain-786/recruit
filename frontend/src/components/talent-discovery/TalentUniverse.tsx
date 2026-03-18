"use client";

import React, { useRef, useMemo, forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    currentTitle: string;
    currentCompany: string;
    matchScore: number;
    socialUrl?: string;
    skills: string[];
}

interface TalentUniverseProps {
    candidates: Candidate[];
    onSelect: (candidate: Candidate) => void;
    selectedId?: string;
    scrollProgress?: number;
}

const Node = ({ candidate, position, isSelected, onClick }: { candidate: Candidate; position: [number, number, number]; isSelected: boolean; onClick: () => void }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            // Add subtle floating physics
            meshRef.current.position.y += Math.sin(state.clock.elapsedTime + candidate.matchScore) * 0.005;
        }
        if (ringRef.current) {
            ringRef.current.rotation.z += 0.005;
            ringRef.current.rotation.x += 0.003;
        }
    });

    const size = 0.4 + (candidate.matchScore / 100) * 0.4;

    return (
        <group position={position}>
            <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onClick(); }}>
                <sphereGeometry args={[size, 4, 4]} />
                <meshStandardMaterial 
                    color={isSelected ? "#000" : "#fff"} 
                    wireframe={!isSelected}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>
            
            <mesh ref={ringRef}>
                <torusGeometry args={[size * 1.8, 0.02, 16, 100]} />
                <meshBasicMaterial color={isSelected ? "#000" : "#e5e5e5"} transparent opacity={isSelected ? 1 : 0.3} />
            </mesh>

            {isSelected && (
                <Text
                    position={[0, size + 1.2, 0]}
                    fontSize={0.4}
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="white"
                >
                    {candidate.firstName} {candidate.lastName}
                </Text>
            )}
        </group>
    );
};

const Scene = ({ candidates, onSelect, selectedId, scrollProgress = 0 }: TalentUniverseProps) => {
    const { camera } = useThree();
    
    // Create a spiral/helix layout for storytelling
    const positions = useMemo(() => {
        return candidates.map((_, i) => {
            const angle = i * 0.5;
            const radius = 10 + i * 2;
            const y = (i - candidates.length / 2) * 4;
            return [
                Math.cos(angle) * radius,
                y,
                Math.sin(angle) * radius
            ] as [number, number, number];
        });
    }, [candidates]);

    // Update camera based on scroll progress
    useFrame(() => {
        if (candidates.length === 0) return;
        
        // Circular path based on scroll
        const angle = scrollProgress * Math.PI * 2;
        const radius = 30;
        const targetX = Math.cos(angle) * radius;
        const targetZ = Math.sin(angle) * radius;
        const targetY = 10 - scrollProgress * 30;

        // Use lerp for smoother movement and to satisfy linter if it objects to +=
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
        
        camera.lookAt(0, 0, 0);
    });

    return (
        <>
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
            
            <gridHelper args={[200, 100, "#f0f0f0", "#f9f9f9"]} position={[0, -20, 0]} />

            {candidates.map((candidate, i) => (
                <Node
                    key={candidate.id || i}
                    candidate={candidate}
                    position={positions[i]}
                    isSelected={selectedId === candidate.id}
                    onClick={() => onSelect(candidate)}
                />
            ))}
        </>
    );
};

const TalentUniverse = forwardRef<HTMLDivElement, TalentUniverseProps>((props, _ref) => {
    return (
        <div className="w-full h-full bg-white relative">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 10, 40]} fov={50} />
                <color attach="background" args={["#ffffff"]} />
                <Scene {...props} />
            </Canvas>
            <div className="absolute bottom-8 left-8 text-black/30 text-[10px] font-mono tracking-widest uppercase pointer-events-none">
                Quantum Discovery Engine // Narrative Mode
            </div>
        </div>
    );
});

TalentUniverse.displayName = "TalentUniverse";
export default TalentUniverse;
