"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere } from "@react-three/drei";
import * as THREE from "three";

function Helix() {
  const groupRef = useRef<THREE.Group>(null);
  const count = 40;

  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < count; i++) {
      const y = (i / count) * 10 - 5;
      const angle = (i / count) * Math.PI * 4;
      const x = Math.cos(angle) * 2;
      const z = Math.sin(angle) * 2;
      p.push({ pos: [-x, y, -z] as [number, number, number], color: "#444444" });
    }
    return p;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* Connectors */}
      {Array.from({ length: count }).map((_, i) => {
        const y = (i / count) * 10 - 5;
        const angle = (i / count) * Math.PI * 4;
        const x = Math.cos(angle) * 2;
        const z = Math.sin(angle) * 2;
        return (
          <mesh key={`line-${i}`} position={[0, y, 0]} rotation={[0, 0, Math.atan2(x * 2, 0) + Math.PI / 2]}>
            <boxGeometry args={[x * 4, 0.02, 0.02]} />
            <meshStandardMaterial color="#333" transparent opacity={0.3} />
          </mesh>
        )
      })}
    </group>
  );
}

export default function DNAScene() {
  return (
    <div className="absolute inset-0 z-0 opacity-40">
      <Canvas camera={{ position: [0, 0, 12], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Helix />
        </Float>
      </Canvas>
    </div>
  );
}
