import { Cpu, Database, Battery, BatteryCharging, Wifi, WifiOff, Thermometer } from 'lucide-react';
import type { SystemStats } from '@/types';

interface SystemBarProps {
  stats: SystemStats;
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-14 h-1 bg-[rgba(255,115,0,0.15)] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${Math.round(value)}%`, background: color, boxShadow: `0 0 3px ${color}` }}
      />
    </div>
  );
}

export function SystemBar({ stats }: SystemBarProps) {
  const BatIcon = stats.batteryCharging ? BatteryCharging : Battery;
  const cpuC = stats.cpu > 80 ? '#ff3333' : stats.cpu > 60 ? '#ffb700' : '#ff7300';
  const ramC = stats.ram > 80 ? '#ff3333' : stats.ram > 60 ? '#ffb700' : '#ff7300';
  const batC = stats.battery < 20 ? '#ff3333' : stats.battery < 40 ? '#ffb700' : '#00ff66';
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-9 bg-[rgba(8,6,4,0.95)] border-t border-[#ff730020] flex items-center px-5 gap-4 text-[10px] font-mono text-[#ff8c00] opacity-90 flex-shrink-0 relative z-10">
      
      {/* CPU */}
      <div className="flex items-center gap-1.5">
        <Cpu className="w-3.5 h-3.5" style={{ color: cpuC }} />
        <span style={{ color: cpuC }}>CPU: {Math.round(stats.cpu)}%</span>
        <MiniBar value={stats.cpu} color={cpuC} />
      </div>

      {/* RAM */}
      <div className="flex items-center gap-1.5">
        <Database className="w-3.5 h-3.5" style={{ color: ramC }} />
        <span style={{ color: ramC }}>MEM: {Math.round(stats.ram)}%</span>
        <MiniBar value={stats.ram} color={ramC} />
      </div>

      {/* Battery */}
      <div className="flex items-center gap-1.5">
        <BatIcon className="w-3.5 h-3.5" style={{ color: batC }} />
        <span style={{ color: batC }}>BAT: {stats.battery}%</span>
      </div>

      {/* Temp */}
      <div className="flex items-center gap-1.5">
        <Thermometer className="w-3.5 h-3.5 text-[#ffb700]" />
        <span className="text-[#ffb700]">TMP: {Math.round(stats.temperature)}°C</span>
      </div>

      {/* Network */}
      <div className="flex items-center gap-1.5">
        {stats.network ? (
          <><Wifi className="w-3.5 h-3.5 text-[#00ff66]" /><span className="text-[#00ff66] text-glow-green">GRID ONLINE</span></>
        ) : (
          <><WifiOff className="w-3.5 h-3.5 text-[#ff3333]" /><span className="text-[#ff3333] text-glow-red">GRID OFFLINE</span></>
        )}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        <span className="hidden sm:inline text-[#8a4a22] uppercase">U_TIME // {stats.uptime}</span>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb700] opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ffb700]" style={{ boxShadow: '0 0 4px #ffb700' }} />
          </span>
          <span className="text-[#ffb700] font-semibold text-glow-amber">JARVIS BROADCASTING</span>
        </div>
        <span className="text-[#8a4a22] font-semibold">{now}</span>
      </div>
    </div>
  );
}
