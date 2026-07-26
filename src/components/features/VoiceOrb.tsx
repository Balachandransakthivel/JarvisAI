import { Mic, MicOff, Loader2 } from 'lucide-react';
import type { ListeningState } from '@/types';

interface VoiceOrbProps {
  state: ListeningState;
  onActivate: () => void;
  onDeactivate: () => void;
  isSupported: boolean;
}

const BAR_HEIGHTS = [10, 16, 22, 18, 28, 22, 18, 16, 10];

const RADIAL_POSITIONS = Array.from({ length: 16 }, (_, i) => ({
  angle: i * (360 / 16),
  height: [10, 14, 10, 18, 10, 22, 10, 14, 10, 18, 10, 22, 10, 14, 10, 18][i],
  delay: i * 0.075,
}));

export function VoiceOrb({ state, onActivate, onDeactivate, isSupported }: VoiceOrbProps) {
  const isIdle = state === 'idle';
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isSpeaking = state === 'speaking';
  const isActive = !isIdle;

  const orbColor = isListening
    ? '#00d4ff'
    : isProcessing
    ? '#ffcc00'
    : isSpeaking
    ? '#00ff88'
    : '#00d4ff';

  const statusText = isListening
    ? '● LISTENING...'
    : isProcessing
    ? '◎ PROCESSING...'
    : isSpeaking
    ? '◉ SPEAKING...'
    : '○ STANDBY';

  const statusColor = isListening
    ? 'text-[#00d4ff] text-glow-sm'
    : isProcessing
    ? 'text-[#ffcc00] text-glow-yellow'
    : isSpeaking
    ? 'text-[#00ff88] text-glow-green'
    : 'text-[#3a6a7a]';

  return (
    <div className="flex flex-col items-center justify-center gap-6 select-none">
      {/* Orb container */}
      <div className="relative w-72 h-72 flex items-center justify-center">

        {/* Outer decorative ring - rotating */}
        <div
          className="absolute w-72 h-72 rounded-full ring-cw pointer-events-none"
          style={{
            border: '1px dashed rgba(0,212,255,0.15)',
          }}
        />

        {/* Middle ring - counter-rotating */}
        <div
          className="absolute w-56 h-56 rounded-full ring-ccw pointer-events-none"
          style={{
            border: '1px dashed rgba(0,212,255,0.1)',
          }}
        />

        {/* Active pulse rings */}
        {isListening && (
          <>
            <div
              className="absolute w-64 h-64 rounded-full pointer-events-none"
              style={{
                border: '1px solid rgba(0,212,255,0.4)',
                animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
              }}
            />
            <div
              className="absolute w-52 h-52 rounded-full pointer-events-none"
              style={{
                border: '1px solid rgba(0,212,255,0.25)',
                animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
                animationDelay: '0.3s',
              }}
            />
          </>
        )}

        {/* Radial voice bars (listening/speaking) */}
        {(isListening || isSpeaking) && (
          <div className="absolute w-72 h-72 pointer-events-none">
            {RADIAL_POSITIONS.map((bar, i) => (
              <div
                key={i}
                className="absolute voice-bar"
                style={{
                  left: '50%',
                  top: '50%',
                  width: '2px',
                  height: `${bar.height}px`,
                  background: isListening
                    ? 'linear-gradient(to top, transparent, rgba(0,212,255,0.6))'
                    : 'linear-gradient(to top, transparent, rgba(0,255,136,0.6))',
                  borderRadius: '1px',
                  transformOrigin: '50% 100%',
                  transform: `rotate(${bar.angle}deg) translateX(-50%) translateY(-130px)`,
                  animationDelay: `${bar.delay}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Inner ring */}
        <div
          className="absolute w-40 h-40 rounded-full transition-all duration-500 pointer-events-none"
          style={{
            border: `1px solid ${isActive ? orbColor : 'rgba(0,212,255,0.3)'}`,
            boxShadow: isActive
              ? `0 0 16px ${orbColor}40, inset 0 0 16px ${orbColor}10`
              : 'none',
          }}
        />

        {/* Main orb button */}
        <button
          onClick={() => (isActive ? onDeactivate() : onActivate())}
          disabled={!isSupported}
          className={[
            'relative w-28 h-28 rounded-full flex flex-col items-center justify-center',
            'border-2 transition-all duration-300 cursor-pointer z-10',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff]',
            !isSupported ? 'opacity-40 cursor-not-allowed' : '',
            isListening ? 'orb-listening' : isIdle ? 'orb-idle' : '',
          ].join(' ')}
          style={{
            borderColor: isActive ? orbColor : 'rgba(0,212,255,0.4)',
            background: isActive ? `${orbColor}10` : 'rgba(0,212,255,0.05)',
          }}
          title={isActive ? 'Click to stop' : 'Click to activate JARVIS'}
        >
          {/* Core glow */}
          <div
            className="absolute inset-4 rounded-full"
            style={{ background: `radial-gradient(circle, ${orbColor}15, transparent)` }}
          />

          {/* Icon */}
          {isProcessing ? (
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#ffcc00' }} />
          ) : isSpeaking ? (
            <div className="flex items-end gap-0.5 h-7">
              {BAR_HEIGHTS.map((h, i) => (
                <div
                  key={i}
                  className="voice-bar w-1 rounded-full"
                  style={{
                    height: `${h}px`,
                    background: '#00ff88',
                    boxShadow: '0 0 4px rgba(0,255,136,0.5)',
                    animationDelay: `${(i / BAR_HEIGHTS.length) * 1.2}s`,
                  }}
                />
              ))}
            </div>
          ) : isListening ? (
            <Mic
              className="w-7 h-7"
              style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 8px #00d4ff)' }}
            />
          ) : !isSupported ? (
            <MicOff className="w-7 h-7 text-[#3a6a7a]" />
          ) : (
            <Mic className="w-7 h-7 text-[#00d4ff]" />
          )}

          {/* Label */}
          <span
            className="text-[8px] font-display font-bold mt-1 tracking-[0.15em]"
            style={{ color: isActive ? orbColor : 'rgba(0,212,255,0.5)' }}
          >
            {isListening ? 'LISTEN' : isProcessing ? 'THINK' : isSpeaking ? 'SPEAK' : 'JARVIS'}
          </span>
        </button>
      </div>

      {/* Status text */}
      <div className="text-center space-y-1">
        <div className={`text-xs font-mono tracking-widest ${statusColor}`}>
          {statusText}
        </div>
        <div className="text-[10px] font-mono text-[#2a4a5a]">
          {isSupported
            ? 'Say "Hey Jarvis" or click the orb'
            : 'Voice not supported — use Chrome/Edge'}
        </div>
      </div>
    </div>
  );
}
