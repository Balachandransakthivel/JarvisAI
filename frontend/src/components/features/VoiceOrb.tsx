import { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as THREE from 'three';
import type { ListeningState } from '@/types';

interface VoiceOrbProps {
  state: ListeningState;
  onActivate: () => void;
  onDeactivate: () => void;
  isSupported: boolean;
}

// ─── 3D Orb Scene Component (Stark Orange) ──────────────────────────────────
function OrbScene({ state }: { state: ListeningState }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const gyroXRef = useRef<THREE.Mesh>(null);
  const gyroYRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Define state variables
  const isIdle = state === 'idle';
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isSpeaking = state === 'speaking';

  // Target values based on state
  const targetScale = useMemo(() => {
    if (isListening) return new THREE.Vector3(1.2, 1.2, 1.2);
    if (isSpeaking) return new THREE.Vector3(1.15, 1.15, 1.15);
    if (isProcessing) return new THREE.Vector3(1.05, 1.05, 1.05);
    return new THREE.Vector3(1.0, 1.0, 1.0);
  }, [state]);

  const targetColor = useMemo(() => {
    if (isListening) return new THREE.Color('#ff8000'); // Glowing orange
    if (isSpeaking) return new THREE.Color('#ffd200');  // Glowing gold/yellow
    if (isProcessing) return new THREE.Color('#ff5500'); // Rapid hot red-orange
    return new THREE.Color('#ff3c00'); // Warm copper-red (Standby)
  }, [state]);

  const targetDistort = useMemo(() => {
    if (isListening) return 0.45;
    if (isSpeaking) return 0.35;
    if (isProcessing) return 0.15;
    return 0.22; // Idle breathing
  }, [state]);

  const targetSpeed = useMemo(() => {
    if (isListening) return 4.0;
    if (isSpeaking) return 2.5;
    if (isProcessing) return 5.0; // Rapid pulse
    return 1.2; // Slow breathing
  }, [state]);

  // Generate random particles floating around the sphere
  const particleCount = 200;
  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const sz = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      // Position on a sphere shell
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.0 + Math.random() * 0.8; // Radius between 2.0 and 2.8

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      sz[i] = 0.05 + Math.random() * 0.08;
    }
    return [pos, sz];
  }, []);

  useFrame((clockState, delta) => {
    const t = clockState.clock.getElapsedTime();

    // 1. Lerp Sphere Size and Material Color/Distortion
    if (sphereRef.current) {
      sphereRef.current.scale.lerp(targetScale, 6 * delta);
    }
    if (materialRef.current) {
      materialRef.current.color.lerp(targetColor, 6 * delta);
      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 6 * delta);
      materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, 6 * delta);
    }

    // 2. Gyroscope rings rotation
    if (gyroXRef.current) {
      gyroXRef.current.rotation.x = t * 0.45;
      gyroXRef.current.rotation.y = t * 0.2;
    }
    if (gyroYRef.current) {
      gyroYRef.current.rotation.y = -t * 0.35;
      gyroXRef.current.rotation.z = t * 0.15;
    }

    // 3. Particles orbital rotation
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.08;
      particlesRef.current.rotation.x = Math.sin(t * 0.05) * 0.1;
      
      // Gentle breathing scale for particles
      const scaleVal = 1.0 + Math.sin(t * 1.5) * 0.04;
      particlesRef.current.scale.set(scaleVal, scaleVal, scaleVal);
    }

    // 4. Mesh scaling for speaking frequency mock-up
    if (isSpeaking && sphereRef.current) {
      const pulse = 1.0 + Math.sin(t * 22) * 0.08 * Math.cos(t * 5);
      sphereRef.current.scale.multiplyScalar(pulse);
    }
  });

  return (
    <group>
      {/* Dynamic distorting sphere */}
      <mesh ref={sphereRef} castShadow>
        <sphereGeometry args={[1.2, 64, 64]} />
        <MeshDistortMaterial
          ref={materialRef}
          color="#ff3c00"
          roughness={0.15}
          metalness={0.9}
          distort={0.22}
          speed={1.2}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          emissive="#000000"
        />
      </mesh>

      {/* Futuristic wireframe gyro ring 1 */}
      <mesh ref={gyroXRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.9, 0.02, 8, 64]} />
        <meshBasicMaterial
          color={targetColor}
          wireframe
          transparent
          opacity={isListening || isSpeaking ? 0.6 : 0.35}
        />
      </mesh>

      {/* Futuristic wireframe gyro ring 2 */}
      <mesh ref={gyroYRef} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[2.1, 0.015, 8, 64]} />
        <meshBasicMaterial
          color={targetColor}
          wireframe
          transparent
          opacity={isListening || isSpeaking ? 0.5 : 0.25}
        />
      </mesh>

      {/* Tech alignment marks */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.65, 1.7, 4]} />
        <meshBasicMaterial
          color={targetColor}
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Floating orbital particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <PointMaterial
          transparent
          color={targetColor}
          size={0.06}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={isListening ? 0.95 : 0.6}
        />
      </points>
    </group>
  );
}

// ─── VoiceOrb Main Component ─────────────────────────────────────────────────
export function VoiceOrb({ state, onActivate, onDeactivate, isSupported }: VoiceOrbProps) {
  const isIdle = state === 'idle';
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isSpeaking = state === 'speaking';
  const isActive = !isIdle;

  const orbColor = isListening
    ? '#ff8000'
    : isProcessing
    ? '#ff5500'
    : isSpeaking
    ? '#ffd200'
    : '#ff4d00';

  const statusText = isListening
    ? '● LISTENING'
    : isProcessing
    ? '◎ CORE MATRIX SEARCHING...'
    : isSpeaking
    ? '◉ CORE BROADCASTING'
    : '○ SYSTEM STANDBY';

  const statusClass = isListening
    ? 'text-[#ff8000] text-glow-orange'
    : isProcessing
    ? 'text-[#ff5500] text-glow-red animate-pulse'
    : isSpeaking
    ? 'text-[#ffd200] text-glow-amber'
    : 'text-[#8a4a22]';

  const glowBoxClass = isListening
    ? 'orb-glow-listening'
    : isProcessing
    ? 'orb-glow-processing'
    : isSpeaking
    ? 'orb-glow-speaking'
    : 'orb-glow-idle';

  const handleOrbClick = () => {
    if (!isSupported) {
      toast.error('Voice synthesis / recognition is unavailable in this client. Please use Google Chrome or Microsoft Edge, or type your query in the terminal input box below.', {
        duration: 5000,
        style: {
          border: '1px solid rgba(255, 51, 51, 0.4)',
          background: 'rgba(16, 6, 6, 0.95)',
          color: '#ffaaaa',
        }
      });
      return;
    }
    if (isActive) {
      onDeactivate();
    } else {
      onActivate();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 select-none">
      {/* 3D Orb Canvas Panel */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        
        {/* Glowing holographic back-panel ring */}
        <div
          className={`absolute w-72 h-72 rounded-full border border-dashed pointer-events-none transition-all duration-700 ${
            isActive ? 'opacity-40 scale-105' : 'opacity-10 scale-100'
          }`}
          style={{
            borderColor: orbColor,
            animation: isActive ? 'spin-cw 12s linear infinite' : 'none',
          }}
        />

        {/* Ambient Back Glow */}
        <div
          className="absolute w-60 h-60 rounded-full filter blur-[40px] pointer-events-none opacity-25 transition-all duration-500"
          style={{
            background: `radial-gradient(circle, ${orbColor} 0%, transparent 70%)`
          }}
        />

        {/* Real-time 3D Canvas Layer (pointer-events disabled to prevent event blocking) */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 4.8], fov: 60 }} dpr={[1, 1.5]} style={{ pointerEvents: 'none' }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color={orbColor} />
            <OrbScene state={state} />
          </Canvas>
        </div>

        {/* Interactive center click trigger button */}
        <button
          onClick={handleOrbClick}
          className={[
            'absolute w-24 h-24 rounded-full flex flex-col items-center justify-center',
            'border transition-all duration-500 cursor-pointer z-10',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7300]',
            glowBoxClass,
          ].join(' ')}
          style={{
            borderColor: isActive ? `${orbColor}70` : 'rgba(255,115,0,0.25)',
            background: isActive ? 'rgba(16, 10, 5, 0.75)' : 'rgba(8, 6, 4, 0.55)',
            backdropFilter: 'blur(8px)',
          }}
          title={isActive ? 'Deactivate JARVIS Core' : 'Activate JARVIS Core'}
        >
          {/* Micro-glow center dot */}
          <div
            className="absolute w-12 h-12 rounded-full pointer-events-none opacity-20 filter blur-sm"
            style={{ background: orbColor }}
          />

          {/* Dynamic state icon */}
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin text-[#ff5500]" />
          ) : isListening ? (
            <Mic className="w-6 h-6 text-[#ff8000] animate-bounce" />
          ) : !isSupported ? (
            <MicOff className="w-6 h-6 text-[#8a4a22]" />
          ) : (
            <Mic className="w-6 h-6 text-[#ff8000] hover:scale-110 transition-transform duration-200" />
          )}

          {/* Trigger State Label */}
          <span
            className="text-[7.5px] font-display font-extrabold mt-1.5 tracking-[0.25em]"
            style={{ color: isActive ? orbColor : 'rgba(255,140,0,0.45)' }}
          >
            {isListening ? 'OPEN' : isProcessing ? 'SYSTEM' : isSpeaking ? 'VOICE' : 'JARVIS'}
          </span>
        </button>
      </div>

      {/* Dynamic status feedback */}
      <div className="text-center space-y-1.5 z-10">
        <div className={`text-[11px] font-display font-bold tracking-[0.2em] uppercase ${statusClass}`}>
          {statusText}
        </div>
        <div className="text-[10px] font-mono text-[#8a4a22] tracking-wider opacity-85">
          {isSupported
            ? 'Vocalize "Hey Jarvis" or click orb to begin'
            : 'Vocal subsystem unavailable - use terminal command below'}
        </div>
      </div>
    </div>
  );
}
