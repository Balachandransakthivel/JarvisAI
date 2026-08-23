import { useMemo, useRef, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import * as THREE from 'three';
import { Sidebar } from '@/components/layout/Sidebar';
import Dashboard from '@/pages/Dashboard';
import { DevicePanel } from '@/components/panels/DevicePanel';
import { VisionPanel } from '@/components/panels/VisionPanel';
import MemoryPage from '@/pages/MemoryPage';
import HistoryPage from '@/pages/HistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from '@/pages/NotFound';
import { JarvisProvider } from '@/hooks/useJarvis';
import { CommandFeed } from '@/components/layout/CommandFeed';


// ─── 3D Space Background Particles Component ──────────────────────────────────
function BackgroundParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 280;

  // Generate dispersed 3D coordinates
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;      // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;  // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2; // Z (depth offset)
    }
    return pos;
  }, []);

  // Parallax tracking of mouse movement
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 0.25;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 0.25;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((clockState, delta) => {
    const t = clockState.clock.getElapsedTime();
    if (pointsRef.current) {
      // Rotation drift
      pointsRef.current.rotation.y = t * 0.012;
      // Interpolate towards mouse coordinates (parallax)
      pointsRef.current.rotation.x = THREE.MathUtils.lerp(pointsRef.current.rotation.x, mouse.current.y, 2.5 * delta);
      pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, mouse.current.x + t * 0.012, 2.5 * delta);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        color="#ff7300"
        size={0.038}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.16}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Smooth Transition Page Wrapper ───────────────────────────────────────────
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.99 }}
      transition={{ type: 'spring', duration: 0.45, bounce: 0.12 }}
      className="w-full h-full flex flex-col overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

// ─── Main Content Shell ───────────────────────────────────────────────────────
function AppContent() {
  const location = useLocation();
  const [isFeedOpen, setIsFeedOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#03060f] relative">
      {/* Fixed Fullscreen 3D Canvas Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]} style={{ pointerEvents: 'none' }}>
          <BackgroundParticles />
        </Canvas>
      </div>

      {/* Main layout UI */}
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/devices" element={<PageTransition><div className="p-6 h-full"><DevicePanel /></div></PageTransition>} />
            <Route path="/vision" element={<PageTransition><div className="p-6 h-full"><VisionPanel /></div></PageTransition>} />
            <Route path="/memory" element={<PageTransition><MemoryPage /></PageTransition>} />
            <Route path="/history" element={<PageTransition><HistoryPage /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>

        </AnimatePresence>
      </main>

      <AnimatePresence initial={false}>
        {isFeedOpen ? (
          <motion.div
            key="command-feed"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '20rem', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="flex-shrink-0 border-l border-[#ff730020] h-full overflow-hidden relative z-10"
          >
            <CommandFeed onClose={() => setIsFeedOpen(false)} />
          </motion.div>
        ) : (
          <motion.button
            key="feed-toggle-btn"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            onClick={() => setIsFeedOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-28 rounded-l-md flex flex-col items-center justify-center bg-[rgba(10,8,6,0.85)] border border-r-0 border-[#ff730040] text-[#ff7300] hover:text-[#ffb700] hover:bg-[rgba(16,10,5,0.95)] shadow-[0_0_15px_rgba(255,115,0,0.15)] hover:border-[#ff730070] transition-all duration-300 z-20 group cursor-pointer"
            title="Open Command Feed"
          >
            <ChevronLeft className="w-4 h-4 mb-2.5 group-hover:-translate-x-0.5 transition-transform" />
            <div className="rotate-90 origin-center whitespace-nowrap text-[8.5px] font-display font-extrabold tracking-[0.25em] uppercase select-none text-glow-orange mt-1">
              FEED
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── App Root Wrapper ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <JarvisProvider>
        <AppContent />
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(8, 16, 32, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 212, 255, 0.18)',
              color: '#a8d8e8',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '11px',
              boxShadow: '0 0 15px rgba(0, 212, 255, 0.1)',
            },
          }}
        />
      </JarvisProvider>
    </BrowserRouter>
  );
}
