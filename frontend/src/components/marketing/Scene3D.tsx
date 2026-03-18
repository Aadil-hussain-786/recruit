"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Float, MeshDistortMaterial, Line } from "@react-three/drei";
import * as THREE from "three";
import { useScroll, useSpring } from "framer-motion";

function TechShards({ count = 8, scrollProgress }: { count?: number; scrollProgress: any }) {
  const shards = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5] as [number, number, number],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
      scale: 0.2 + Math.random() * 0.5,
      speed: 0.1 + Math.random() * 0.3,
      geometry: Math.random() > 0.5 ? new THREE.OctahedronGeometry(1) : new THREE.TorusGeometry(0.8, 0.2, 8, 20)
    }));
  }, [count]);

  return (
    <>
      {shards.map((shard, i) => (
        <Float key={i} speed={shard.speed * 4} rotationIntensity={2} floatIntensity={2}>
          <mesh position={shard.position} rotation={shard.rotation} scale={shard.scale}>
            <primitive object={shard.geometry} />
            <meshStandardMaterial 
              color="#444444" 
              wireframe 
              transparent 
              opacity={0.15} 
              emissive="#ffffff" 
              emissiveIntensity={0.05} 
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function NeuralConnectors({ scrollProgress }: { scrollProgress: any }) {
  const linesRef = useRef<THREE.Group>(null);
  
  const linePositions = useMemo(() => {
    const points = [];
    for (let i = 0; i < 15; i++) {
      const start = [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10];
      const end = [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10];
      points.push({ start, end });
    }
    return points;
  }, []);

  useFrame((state, delta) => {
    if (!linesRef.current) return;
    const progress = scrollProgress.get();
    linesRef.current.rotation.y += delta * 0.05;
    linesRef.current.rotation.z = progress * 0.5;
  });

  return (
    <group ref={linesRef}>
      {linePositions.map((line, i) => (
        <Line
          key={i}
          points={[line.start as any, line.end as any]}
          color="#ffffff"
          lineWidth={0.5}
          transparent
          opacity={0.05}
        />
      ))}
    </group>
  );
}

function NeuralCore({ scrollProgress }: { scrollProgress: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const distortRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const progress = scrollProgress.get();
    
    // Mouse Parallax
    const mouseX = state.mouse.x * 0.5;
    const mouseY = state.mouse.y * 0.5;

    meshRef.current.rotation.y += delta * (0.2 + progress * 0.5) + mouseX * 0.05;
    meshRef.current.rotation.x += delta * (0.1 + progress * 0.2) + mouseY * 0.05;
    
    // Transform based on scroll
    const scale = 1 + Math.sin(progress * Math.PI) * 1.5;
    meshRef.current.scale.setScalar(scale);
    
    // Move slightly
    meshRef.current.position.y = Math.sin(progress * Math.PI * 2) * 2 - mouseY;
    meshRef.current.position.x = mouseX;
    meshRef.current.position.z = progress * -8;

    if (distortRef.current) {
      distortRef.current.distort = 0.3 + progress * 0.5;
      distortRef.current.speed = 2 + progress * 3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial 
          ref={distortRef}
          color="#ffffff" 
          wireframe 
          transparent
          opacity={0.2}
          distort={0.4}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function DataParticles({ count = 800, scrollProgress }: { count?: number; scrollProgress: any }) {
  const points = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20;
      temp.set([x, y, z], i * 3);
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    const progress = scrollProgress.get();
    points.current.rotation.y += delta * 0.03;
    points.current.rotation.z = progress * Math.PI;
    points.current.scale.setScalar(1 + progress * 2);
  });

  return (
    <Points ref={points} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.3}
      />
    </Points>
  );
}

export default function Scene3D() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-80 z-10" />
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 75 }} 
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          
          <NeuralCore scrollProgress={smoothProgress} />
          <DataParticles scrollProgress={smoothProgress} />
          <TechShards scrollProgress={smoothProgress} />
          <NeuralConnectors scrollProgress={smoothProgress} />
          
          <fog attach="fog" args={["#000000", 5, 25]} />
        </Suspense>
      </Canvas>
    </div>
  );
}


