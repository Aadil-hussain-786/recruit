"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line as DreiLine } from "@react-three/drei";

interface DNAHelixProps {
    score: number; // 0 to 100
}

const Strand = () => {
    const groupRef = useRef<THREE.Group>(null);
    
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.015;
            groupRef.current.rotation.x += 0.005;
        }
    });

    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i < 20; i++) {
            const y = (i - 10) * 0.4;
            const angle = i * 0.5;
            const x = Math.sin(angle) * 1;
            const z = Math.cos(angle) * 1;
            p.push({ pos: [x, y, z] as [number, number, number], type: 'A' });
            p.push({ pos: [-x, y, -z] as [number, number, number], type: 'B' });
        }
        return p;
    }, []);

    return (
        <group ref={groupRef}>
            {points.map((point, i) => (
                <mesh key={i} position={point.pos}>
                    <sphereGeometry args={[0.08, 16, 16]} />
                    <meshBasicMaterial color="#000000" />
                </mesh>
            ))}
            {Array.from({ length: 20 }).map((_, i) => {
                 const point1 = points[i * 2];
                 const point2 = points[i * 2 + 1];
                 if (!point1 || !point2) return null;
                 return (
                    <DreiLine
                        key={`line-${i}`}
                        points={[point1.pos, point2.pos]}
                        color="#000000"
                        lineWidth={1}
                        transparent
                        opacity={0.1}
                    />
                 )
            })}
        </group>
    );
};

export default function DNAHelix({ score }: DNAHelixProps) {
    return (
        <div className="w-full h-full bg-transparent">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <Strand />
            </Canvas>
        </div>
    );
}
