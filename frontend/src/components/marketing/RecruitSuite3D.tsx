"use client";

import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Float, Text, Html, Environment, MeshTransmissionMaterial, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const chapters = [
  { id: "01", title: "Terminal Initialization", desc: "Booting engine...", color: "#0ea5e9" },
  { id: "02", title: "Neural Mapping", desc: "12.4B parameters active", color: "#6366f1" },
  { id: "03", title: "Dynamic Workflow", desc: "Pipeline automated", color: "#8b5cf6" },
  { id: "04", title: "Global Mesh", desc: "Nodes connected", color: "#ec4899" },
  { id: "05", title: "Bias Filtration", desc: "Merit-only filter", color: "#14b8a6" },
  { id: "06", title: "Match Sync", desc: "Perfect alignment", color: "#f59e0b" }
];

function ParticleField({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const count = 500;
  const mesh = useRef<THREE.Points>(null);
  const hoverTarget = useRef(new THREE.Vector3());
  
  const [positions, initialPositions] = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const initial = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const r = 10 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        temp[i * 3] = x; temp[i * 3 + 1] = y; temp[i * 3 + 2] = z;
        initial[i * 3] = x; initial[i * 3 + 1] = y; initial[i * 3 + 2] = z;
    }
    return [temp, initial];
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const time = state.clock.elapsedTime;
    const p = scrollProgress.current;
    
    // Mouse hover effect
    hoverTarget.current.x = (state.mouse.x * state.viewport.width) / 2;
    hoverTarget.current.y = (state.mouse.y * state.viewport.height) / 2;
    hoverTarget.current.z = 0;
    
    const positionsAttr = mesh.current.geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;
        
        let x = initialPositions[ix];
        let y = initialPositions[iy];
        let z = initialPositions[iz];
        
        // Add scroll displacement
        const swirlX = Math.sin(time * 0.1 + y * 0.05) * p * 10;
        const swirlZ = Math.cos(time * 0.1 + x * 0.05) * p * 10;
        
        // Add mouse repulsion
        const dx = (x + swirlX) - hoverTarget.current.x;
        const dy = (y) - hoverTarget.current.y;
        const dz = (z + swirlZ) - hoverTarget.current.z;
        const distSq = dx*dx + dy*dy + dz*dz;
        
        let repelX = 0, repelY = 0, repelZ = 0;
        if (distSq < 25) {
            const force = (25 - distSq) / 25;
            repelX = dx * force * 0.5;
            repelY = dy * force * 0.5;
            repelZ = dz * force * 0.5;
        }

        positionsAttr.setXYZ(i, x + swirlX + repelX, y + repelY, z + swirlZ + repelZ);
    }
    positionsAttr.needsUpdate = true;
    
    mesh.current.rotation.y = time * 0.05 + p * 2;
    mesh.current.rotation.x = p * 0.5;
  });

  return (
    <Points ref={mesh} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#88ccff"
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function NeuralCore({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringGroup = useRef<THREE.Group>(null);
  const coreInnerRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = scrollProgress.current;
    
    if (coreRef.current) {
        // Slow constant rotation + scroll rotation
        coreRef.current.rotation.y = t * 0.1 + p * Math.PI;
        coreRef.current.rotation.x = t * 0.05 + p * Math.PI * 0.5;
        
        // Interactive hover distortion - warp towards mouse slightly
        const targetScale = 1 + p * 0.3;
        coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);

        // Morph vertices based on noise... simplified by using rotation and scale for now
        // A custom shader would be ideal but MeshTransmission is great
    }

    if (coreInnerRef.current) {
        coreInnerRef.current.rotation.x = -t * 0.2;
        coreInnerRef.current.rotation.y = -t * 0.1;
    }

    if (ringGroup.current) {
        ringGroup.current.rotation.x = Math.sin(t * 0.2) * 0.2 + p * 0.5;
        ringGroup.current.rotation.y = t * 0.1;
        ringGroup.current.position.y = Math.sin(t) * 0.2 - 2 + (p * 15);
    }
  });

  // Position is manipulated globally, but let's base local transform here
  return (
    <group ref={ringGroup} position={[0, -2, 0]}>
        <Float speed={3} rotationIntensity={1} floatIntensity={2}>
            {/* Outer Premium Glass Shell */}
            <mesh ref={coreRef} castShadow receiveShadow>
                <icosahedronGeometry args={[3.2, 8]} />
                <MeshTransmissionMaterial 
                    backside
                    samples={6}
                    thickness={3}
                    chromaticAberration={0.05}
                    anisotropy={0.2}
                    distortion={0.5}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    color="#e0f2fe"
                    metalness={0.1}
                    roughness={0}
                    transmission={1}
                />
            </mesh>
            {/* Inner energy core */}
            <mesh ref={coreInnerRef}>
                <icosahedronGeometry args={[1.8, 1]} />
                <meshStandardMaterial color="#ffffff" emissive="#0ea5e9" emissiveIntensity={4} wireframe />
            </mesh>
            
            {/* Pulsing Light inside */}
            <pointLight distance={10} intensity={5} color="#0ea5e9" />
        </Float>

        {/* Outer Data Rings */}
        <mesh rotation-x={Math.PI / 2} position={[0,0,0]}>
            <torusGeometry args={[5, 0.01, 16, 100]} />
            <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={2} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} rotation-y={Math.PI / 6} position={[0,0,0]}>
            <torusGeometry args={[6.5, 0.02, 16, 100]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1} transparent opacity={0.6}/>
        </mesh>
    </group>
  );
}

function FloatingNodes({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!group.current) return;
        const p = scrollProgress.current;
        group.current.position.y = p * 15; // Moves up as we scroll
        group.current.rotation.y = p * Math.PI; // Rotates
    });

    return (
        <group ref={group}>
            {chapters.map((chap, i) => {
                const angle = (i / chapters.length) * Math.PI * 2;
                const radius = 10;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const y = (i - chapters.length/2) * 3 - 5; // Stacking height

                return (
                    <NodeItem 
                        key={chap.id}
                        index={i}
                        position={[x, y, z]}
                        text={chap.title}
                        subtext={chap.desc}
                        color={chap.color}
                        scrollProgress={scrollProgress}
                        total={chapters.length}
                    />
                );
            })}
        </group>
    );
}

function NodeItem({ position, text, subtext, color, index, scrollProgress, total }: any) {
    const group = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (!group.current) return;
        
        // Active logic: highlight when passing through that section of the scroll
        const p = scrollProgress.current;
        const sectionProgress = p * total;
        const dist = Math.abs(sectionProgress - index);
        const isActive = dist < 1.5;
        
        const targetScale = isActive ? 1 + (hovered ? 0.2 : 0) : 0.01;
        group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        
        group.current.lookAt(state.camera.position);
    });

    return (
        <group ref={group} position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh 
                    onPointerOver={() => setHover(true)} 
                    onPointerOut={() => setHover(false)}
                >
                    <octahedronGeometry args={[0.8, 0]} />
                    <meshStandardMaterial 
                        color={color} 
                        wireframe={!hovered} 
                        emissive={color}
                        emissiveIntensity={hovered ? 2 : 1}
                        transparent
                        opacity={0.9}
                    />
                </mesh>
            </Float>
            <Html
                position={[1.2, 0, 0]}
                center
                distanceFactor={15}
                style={{
                    pointerEvents: 'none',
                    opacity: hovered ? 1 : 0.8,
                    transition: 'all 0.3s'
                }}
            >
                <div className="glass-panel p-3 rounded-lg min-w-[220px] backdrop-blur-md bg-black/40 border-l-4" style={{ borderColor: color }}>
                    <div className="text-[10px] font-mono text-white/60 mb-1">NODE_{index + 1} // {hovered ? 'LOCKED' : 'ACTIVE'}</div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight" style={{ color: color }}>{text}</h3>
                    <p className="text-xs font-mono text-zinc-300 mt-1">{subtext}</p>
                </div>
            </Html>
        </group>
    );
}

function CameraController({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
    const { camera } = useThree();
    const lookAtTarget = useRef(new THREE.Vector3(0, -2, 0));

    useFrame((state, delta) => {
        const p = scrollProgress.current; // 0 to 1
        
        // Intro Camera (p = 0): far away, viewing core
        // Mid Camera (p = 0.5): swooping around the core, looking at nodes
        // End Camera (p = 1): looking straight down on the entire mesh
        
        const introPos = new THREE.Vector3(0, 0, 20);
        const midPos = new THREE.Vector3(
            Math.sin(p * Math.PI * 2) * 15,
            p * 10 - 2,
            Math.cos(p * Math.PI * 2) * 15
        );
        const endPos = new THREE.Vector3(0.1, 25, 0.1); // slightly off center to prevent gimbal lock
        
        let targetPos = new THREE.Vector3();
        if (p < 0.3) {
            // Lerp between intro and mid
            const localP = p / 0.3;
            targetPos.lerpVectors(introPos, midPos, localP);
        } else if (p < 0.8) {
            targetPos.copy(midPos);
        } else {
            const localP = (p - 0.8) / 0.2;
            targetPos.lerpVectors(midPos, endPos, localP);
        }

        // Mouse Parallax Effect
        const mouseX = (state.mouse.x * state.viewport.width) / 100;
        const mouseY = (state.mouse.y * state.viewport.height) / 100;
        targetPos.x += mouseX;
        targetPos.y += mouseY;

        camera.position.lerp(targetPos, 0.05);

        // Update target looking vector: starts at core (0,-2,0) and ends moving with the core (0, 13, 0)
        const targetY = -2 + p * 15; 
        lookAtTarget.current.lerp(new THREE.Vector3(0, targetY, 0), 0.05);
        camera.lookAt(lookAtTarget.current);
    });
    return null;
}

function AdvancedScene({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
    return (
        <>
            <CameraController scrollProgress={scrollProgress} />
            <ParticleField scrollProgress={scrollProgress} />
            <NeuralCore scrollProgress={scrollProgress} />
            <FloatingNodes scrollProgress={scrollProgress} />
            
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} color="#fff" />
            <pointLight position={[-10, 0, -10]} intensity={2} color="#ec4899" />
            <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={40} blur={2} far={10} color="#000" />
        </>
    );
}

export default function RecruitSuite3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      pin: true,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      }
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[800vh] bg-black">
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
            <Canvas camera={{ position: [0, 0, 20], fov: 45 }} dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <AdvancedScene scrollProgress={scrollProgress} />
                </Suspense>
            </Canvas>
            
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-[40px] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] z-10" />
            
            <div className="absolute bottom-12 left-12 pointer-events-none z-20">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-accent-cyan rounded-full animate-pulse shadow-[0_0_15px_#0ea5e9]" />
                        <span className="text-xs font-black text-white uppercase tracking-widest drop-shadow-md">
                            Engine / Sequence Active
                        </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 pl-6 uppercase tracking-[0.2em]">
                        Interact with nodes // Scroll to synchronize
                    </span>
                </div>
            </div>

            {/* Scanning line effect */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-cyan/50 shadow-[0_0_20px_#0ea5e9] z-20 opacity-30 animate-scan pointer-events-none" />
            
        </div>
    </div>
  );
}
