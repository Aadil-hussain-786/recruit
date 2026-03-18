"use client";

import React, { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text, Float, Line, Sphere, MeshDistortMaterial, Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

const SKILLS = [
  { name: "React", power: 0.95, color: "#61dafb" },
  { name: "Go", power: 0.88, color: "#00add8" },
  { name: "Architecture", power: 0.92, color: "#a855f7" },
  { name: "Security", power: 0.85, color: "#ef4444" },
  { name: "Leadership", power: 0.80, color: "#10b981" }
];

function DataPacket({ start, end, color, delay, onComplete }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!meshRef.current) return;
    
    const tl = gsap.timeline({ 
      repeat: -1, 
      delay,
      onRepeat: () => {
        if (onCompleteRef.current) onCompleteRef.current();
      }
    });

    tl.fromTo(meshRef.current.position, 
      { x: start.x, y: start.y, z: start.z },
      { x: end.x, y: end.y, z: end.z, duration: 1.5, ease: "power2.inOut" }
    );
    
    tl.fromTo(meshRef.current.scale,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1, duration: 0.3 }, 0
    );

    tl.to(meshRef.current.scale,
      { x: 0, y: 0, z: 0, duration: 0.3 }, 1.2
    );

    return () => {
      tl.kill();
    };
  }, [start, end, delay]);

  return (
    <Sphere ref={meshRef} args={[0.06, 16, 16]}>
      <meshBasicMaterial color={color} transparent opacity={1} />
    </Sphere>
  );
}

function Neuron({ position, label, bias, isActive }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (isActive) {
      meshRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial 
          color={isActive ? "#fff" : "#333"} 
          emissive={isActive ? "#fff" : "#000"}
          emissiveIntensity={isActive ? 2 : 0}
          wireframe 
        />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.12}
        color={isActive ? "white" : "#666"}
      >
        {label}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.1}
        color="#444"
      >
        {`b: +${bias}`}
      </Text>
    </group>
  );
}

function NeuralProcess() {
  const { viewport } = useThree();
  const [activeNeurons, setActiveNeurons] = useState<number[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const layers = useMemo(() => {
    const inputX = -viewport.width / 3.5;
    const hiddenX = 0;
    const outputX = viewport.width / 3.5;

    const inputs = SKILLS.map((skill, i) => ({
      pos: new THREE.Vector3(inputX, (i - 2) * 1.3, 0),
      ...skill
    }));

    const neurons = [
      { pos: new THREE.Vector3(hiddenX, 1.8, 0), bias: 0.12, label: "LOGIC_CORE" },
      { pos: new THREE.Vector3(hiddenX, 0, 0), bias: 0.45, label: "VECTOR_HUB" },
      { pos: new THREE.Vector3(hiddenX, -1.8, 0), bias: 0.28, label: "PATTERN_GEN" }
    ];

    const output = { pos: new THREE.Vector3(outputX, 0, 0), label: "HIRE_SIGNAL" };

    // Stabilize weights
    const connectionWeights = inputs.map(() => 
      neurons.map(() => (0.5 + Math.random() * 0.5).toFixed(2))
    );

    return { inputs, neurons, output, connectionWeights };
  }, [viewport]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 8));
  };

  return (
    <group>
      {/* Inputs */}
      {layers.inputs.map((input, i) => (
        <group key={input.name} position={input.pos}>
          <Sphere args={[0.15, 32, 32]}>
            <meshStandardMaterial color={input.color} emissive={input.color} emissiveIntensity={1} />
          </Sphere>
          <Text
            position={[-0.4, 0, 0]}
            fontSize={0.22}
            color="white"
            anchorX="right"
          >
            {input.name}
          </Text>
        </group>
      ))}

      {/* Neurons & Connections */}
      {layers.neurons.map((neuron, nIdx) => (
        <group key={nIdx}>
          <Neuron 
            position={neuron.pos} 
            label={neuron.label} 
            bias={neuron.bias} 
            isActive={activeNeurons.includes(nIdx)} 
          />
          
          {layers.inputs.map((input, iIdx) => {
            const weight = layers.connectionWeights[iIdx][nIdx];
            return (
              <React.Fragment key={`${nIdx}-${iIdx}`}>
                <Line
                  points={[input.pos, neuron.pos]}
                  color={input.color}
                  lineWidth={0.5}
                  transparent
                  opacity={0.1}
                />
                <DataPacket 
                  start={input.pos} 
                  end={neuron.pos} 
                  color={input.color} 
                  delay={iIdx * 0.3 + nIdx * 0.5}
                  onComplete={() => {
                    setActiveNeurons(prev => [...prev, nIdx]);
                    setTimeout(() => setActiveNeurons(prev => prev.filter(id => id !== nIdx)), 300);
                    if (nIdx === 1) addLog(`${input.name} * ${weight} -> Node_0${nIdx}`);
                  }}
                />
                {/* Weight Text on path */}
                <Text
                  position={new THREE.Vector3().addVectors(input.pos, neuron.pos).multiplyScalar(0.6)}
                  fontSize={0.08}
                  color={input.color}
                  fillOpacity={0.4}
                >
                  {`w:${weight}`}
                </Text>
              </React.Fragment>
            );
          })}

          {/* Hidden to Output */}
          <Line
            points={[neuron.pos, layers.output.pos]}
            color="white"
            lineWidth={1}
            transparent
            opacity={0.12}
          />
          <DataPacket 
            start={neuron.pos} 
            end={layers.output.pos} 
            color="white" 
            delay={nIdx * 0.8 + 2} 
            onComplete={() => addLog(`Node_0${nIdx} -> Sigmoid() -> Result`)}
          />
        </group>
      ))}

      {/* Output Node */}
      <group position={layers.output.pos}>
        <mesh>
          <icosahedronGeometry args={[0.7, 5]} />
          <MeshDistortMaterial color="#fff" speed={3} distort={0.4} />
        </mesh>
        <Text position={[0, -1.2, 0]} fontSize={0.3} color="white">
          {layers.output.label}
        </Text>
      </group>

      {/* Math Feed Overlay */}
      <Html position={[viewport.width / 4, 2, 0]}>
        <div className="w-64 p-4 bg-black/80 backdrop-blur-md border border-zinc-800 rounded-xl space-y-2 pointer-events-none">
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 font-mono">Realtime_Math_Feed</div>
          {logs.map((log, i) => (
            <div key={i} className="text-[10px] font-mono text-zinc-400 border-l border-zinc-800 pl-3 py-1 opacity-0 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-forwards" style={{ opacity: 1 - i * 0.12 }}>
              {`> ${log}`}
            </div>
          ))}
          {logs.length === 0 && <div className="text-[10px] italic text-zinc-700 font-mono">Waiting for signal...</div>}
        </div>
      </Html>
    </group>
  );
}

export default function SkillNeuralAnimation() {
  return (
    <div className="w-full h-[700px] bg-[#050505] rounded-[2rem] overflow-hidden border border-white/5 relative shadow-2xl">
      {/* HUD Accents */}
      <div className="absolute top-10 left-10 z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-indigo-500/50" />
          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400">Neural Synthesis Engine</span>
        </div>
        <h3 className="text-3xl font-display font-medium text-white uppercase tracking-tighter italic">
          Weight <span className="text-zinc-500 text-2xl not-italic">&</span> Calibration
        </h3>
      </div>

      <div className="absolute bottom-10 left-10 z-10 group">
        <div className="p-4 border border-zinc-800 bg-black/40 backdrop-blur-sm rounded-lg">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">Equation_Parameters</div>
          <div className="text-xs font-mono text-zinc-400">
            Activation = σ( Σ(Skill<span className="text-[8px] align-top">i</span> * Weight<span className="text-[8px] align-top">i</span>) + Bias )
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <NeuralProcess />
          <fog attach="fog" args={["#050505", 8, 18]} />
        </Suspense>
      </Canvas>
      
      {/* Background Tech Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" 
           style={{ 
             backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }} 
      />
    </div>
  );
}
