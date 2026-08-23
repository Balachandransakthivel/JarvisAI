import { useState, useRef, MouseEvent } from 'react';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // Default cyan
}

export function Card3D({ children, className = '', glowColor = '#ff7300' }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Distance from center
    const xPct = (mouseX - width / 2) / (width / 2);
    const yPct = (mouseY - height / 2) / (height / 2);

    // Max tilt angles: 12 degrees
    const maxTilt = 10;
    
    // Invert X because moving mouse vertically tilts around X-axis
    // and moving mouse horizontally tilts around Y-axis
    setRotate({
      x: -yPct * maxTilt,
      y: xPct * maxTilt
    });

    setGlowPos({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100
    });
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`perspective-1000 select-none ${className}`}
    >
      <div
        className="preserve-3d relative w-full h-full glass-hud rounded-lg p-5 hud-panel transition-all duration-200 ease-out cursor-pointer"
        style={{
          transform: hovered
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          boxShadow: hovered
            ? `0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px ${glowColor}22`
            : 'none',
        }}
      >
        {/* Glow spotlight background */}
        {hovered && (
          <div
            className="pointer-events-none absolute -inset-[1px] rounded-lg transition duration-300 opacity-100"
            style={{
              background: `radial-gradient(120px circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}15, transparent 80%)`,
            }}
          />
        )}

        {/* Secondary hud panel details */}
        <div className="absolute top-0 right-0 bottom-0 left-0 rounded-lg pointer-events-none hud-corners-secondary" />

        {/* Content */}
        <div style={{ transform: 'translateZ(20px)' }} className="w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
