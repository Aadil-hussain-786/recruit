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

function ParticleField({ scrollProgress, isMobile }: { scrollProgress: React.MutableRefObject<number>, isMobile: boolean }) {
  const count = isMobile ? 50 : 150; // Much fewer particles on mobile
  const mesh = useRef<THREE.Points>(null);
  const hoverTarget = useRef(new THREE.Vector3());
  
  const [positions, initialPositions] = useMemo(() => {
    const temp = new Float32Array(count * 3);
    const initial = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        // Create a more structured globe-like distribution
        const r = 15; // Fixed radius for globe shape
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
    
    // Skip updates on mobile for performance
    if (isMobile && Math.floor(time * 60) % 4 !== 0) return; // Update every 4th frame on mobile
    if (!isMobile && Math.floor(time * 60) % 2 !== 0) return; // Update every 2nd frame on desktop
    
    const positionsAttr = mesh.current.geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;
        
        let x = initialPositions[ix];
        let y = initialPositions[iy];
        let z = initialPositions[iz];
        
        // Gentle rotation for globe effect
        const rotatedX = x * Math.cos(time * (isMobile ? 0.01 : 0.03)) - z * Math.sin(time * (isMobile ? 0.01 : 0.03));
        const rotatedZ = x * Math.sin(time * (isMobile ? 0.01 : 0.03)) + z * Math.cos(time * (isMobile ? 0.01 : 0.03));
        
        positionsAttr.setXYZ(i, rotatedX, y, rotatedZ);
    }
    positionsAttr.needsUpdate = true;
    
    mesh.current.rotation.y = time * (isMobile ? 0.005 : 0.015) + p * (isMobile ? 0.1 : 0.3);
  });

  return (
    <Points ref={mesh} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#0ea5e9"
        size={isMobile ? 0.04 : 0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={isMobile ? 0.5 : 0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function GlobeLines({ scrollProgress, isMobile }: { scrollProgress: React.MutableRefObject<number>, isMobile: boolean }) {
  const linesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.elapsedTime;
    linesRef.current.rotation.y = time * (isMobile ? 0.005 : 0.01); // Very slow rotation for performance
  });

  const radius = 15;
  const lines = [];

  // Meridians (longitude lines) - reduced on mobile
  const meridianCount = isMobile ? 12 : 24;
  for (let i = 0; i < meridianCount; i++) {
    const phi = (i / meridianCount) * Math.PI * 2;
    const points = [];
    const pointCount = isMobile ? 20 : 30; // Fewer points on mobile
    for (let j = 0; j <= pointCount; j++) {
      const theta = (j / pointCount) * Math.PI;
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
      points.push(new THREE.Vector3(x, y, z));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    lines.push(
      <line key={`meridian-${i}`}>
        <bufferGeometry attach="geometry" {...geometry} />
        <lineBasicMaterial attach="material" color="#0ea5e9" opacity={isMobile ? 0.4 : 0.6} transparent />
      </line>
    );
  }

  // Parallels (latitude lines) - reduced on mobile
  const parallelCount = isMobile ? 6 : 12;
  for (let i = 1; i < parallelCount; i++) {
    const theta = (i / parallelCount) * Math.PI;
    const points = [];
    const pointCount = isMobile ? 30 : 60; // Fewer points on mobile
    for (let j = 0; j <= pointCount; j++) {
      const phi = (j / pointCount) * Math.PI * 2;
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);
      points.push(new THREE.Vector3(x, y, z));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    lines.push(
      <line key={`parallel-${i}`}>
        <bufferGeometry attach="geometry" {...geometry} />
        <lineBasicMaterial attach="material" color="#0ea5e9" opacity={isMobile ? 0.3 : 0.4} transparent />
      </line>
    );
  }

  return (
    <group ref={linesRef}>
      {lines}
    </group>
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
        
        // Performance optimization: only update camera every few frames
        if (Math.floor(state.clock.elapsedTime * 30) % 2 !== 0) return;
        
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

        // Mouse Parallax Effect - reduced frequency
        const mouseX = (state.mouse.x * state.viewport.width) / 100;
        const mouseY = (state.mouse.y * state.viewport.height) / 100;
        targetPos.x += mouseX;
        targetPos.y += mouseY;

        camera.position.lerp(targetPos, 0.03); // Slower lerp for smoother performance

        // Update target looking vector: starts at core (0,-2,0) and ends moving with the core (0, 13, 0)
        const targetY = -2 + p * 15; 
        lookAtTarget.current.lerp(new THREE.Vector3(0, targetY, 0), 0.03);
        camera.lookAt(lookAtTarget.current);
    });
    return null;
}

function AdvancedScene({ scrollProgress, isMobile }: { scrollProgress: React.MutableRefObject<number>, isMobile: boolean }) {
    return (
        <>
            <CameraController scrollProgress={scrollProgress} />
            <ParticleField scrollProgress={scrollProgress} isMobile={isMobile} />
            <GlobeLines scrollProgress={scrollProgress} isMobile={isMobile} />
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

// Simplified mobile version with reduced complexity
function MobileGlobe({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const mesh = useRef<THREE.Points>(null);
  
  const [positions] = useMemo(() => {
    const count = 50; // Very reduced for mobile
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      temp[i * 3] = x; temp[i * 3 + 1] = y; temp[i * 3 + 2] = z;
    }
    return [temp];
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    // Very minimal updates on mobile - only every 10th frame
    if (Math.floor(time * 60) % 10 !== 0) return;
    
    mesh.current.rotation.y = time * 0.005;
  });

  return (
    <Points ref={mesh} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#0ea5e9"
        size={0.03}
        sizeAttenuation={false}
        depthWrite={false}
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function MobileScene({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  return (
    <>
      <MobileGlobe scrollProgress={scrollProgress} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
    </>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="text-cyan-400 text-lg font-mono animate-pulse">
          Initializing Neural Network...
        </div>
      </div>
    </Html>
  );
}

export default function RecruitSuite3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Mobile detection
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Progressive loading - delay 3D loading on mobile
    const delay = isMobile ? 500 : 100;
    const timer = setTimeout(() => setIsLoaded(true), delay);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isLoaded) return;

    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: isMobile ? 0.5 : 1, // Reduced scrub on mobile
      pin: !isMobile, // Disable pinning on mobile for performance
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      }
    });

    return () => {
      st.kill();
    };
  }, [isLoaded, isMobile]);

  return (
    <div ref={containerRef} className="relative w-full h-[800vh] bg-black">
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
            {isLoaded ? (
              <Canvas 
                camera={{ position: [0, 0, 20], fov: 45 }} 
                dpr={isMobile ? [1, 1] : [1, 1.5]} // Even lower DPR on mobile
                gl={{ 
                  antialias: !isMobile, // Disable antialiasing on mobile
                  alpha: false,
                  powerPreference: "high-performance",
                  stencil: false,
                  depth: true
                }}
                frameloop={isMobile ? "demand" : "always"} // Demand mode on mobile
              >
                  <Suspense fallback={<LoadingFallback />}>
                      {isMobile ? (
                        <MobileScene scrollProgress={scrollProgress} />
                      ) : (
                        <AdvancedScene scrollProgress={scrollProgress} isMobile={isMobile} />
                      )}
                  </Suspense>
              </Canvas>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="text-cyan-400 text-xl font-mono animate-pulse">
                  Loading 3D Interface...
                </div>
              </div>
            )}
            
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
