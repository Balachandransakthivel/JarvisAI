import { Cpu, Database, Battery, BatteryCharging, Wifi, WifiOff, Thermometer } from 'lucide-react';
import type { SystemStats } from '@/types';

interface SystemBarProps {
  stats: SystemStats;
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-14 h-1 bg-[#0d1f35] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${Math.round(value)}%`, background: color, boxShadow: `0 0 3px ${color}` }}
      />
    </div>
  );
}

export function SystemBar({ stats }: SystemBarProps) {
  const BatIcon = stats.batteryCharging ? BatteryCharging : Battery;
  const cpuC = stats.cpu > 80 ? '#ff4444' : stats.cpu > 60 ? '#ffcc00' : '#00d4ff';
  const ramC = stats.ram > 80 ? '#ff4444' : stats.ram > 60 ? '#ffcc00' : '#00d4ff';
  const batC = stats.battery < 20 ? '#ff4444' : stats.battery < 40 ? '#ffcc00' : '#00ff88';
  const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-9 bg-[#080c18] border-t border-[#0d1f35] flex items-center px-4 gap-4 text-[10px] font-mono text-[#3a6a7a] flex-shrink-0">
      {/* CPU */}
      <div className="flex items-center gap-1.5">
        <Cpu className="w-3 h-3" style={{ color: cpuC }} />
        <span style={{ color: cpuC }}>{Math.round(stats.cpu)}%</span>
        <MiniBar value={stats.cpu} color={cpuC} />
      </div>

      {/* RAM */}
      <div className="flex items-center gap-1.5">
        <Database className="w-3 h-3" style={{ color: ramC }} />
        <span style={{ color: ramC }}>{Math.round(stats.ram)}%</span>
        <MiniBar value={stats.ram} color={ramC} />
      </div>

      {/* Battery */}
      <div className="flex items-center gap-1">
        <BatIcon className="w-3 h-3" style={{ color: batC }} />
        <span style={{ color: batC }}>{stats.battery}%</span>
      </div>

      {/* Temp */}
      <div className="flex items-center gap-1">
        <Thermometer className="w-3 h-3 text-[#ffcc00]" />
        <span className="text-[#ffcc00]">{Math.round(stats.temperature)}°C</span>
      </div>

      {/* Network */}
      <div className="flex items-center gap-1">
        {stats.network ? (
          <><Wifi className="w-3 h-3 text-[#00ff88]" /><span className="text-[#00ff88]">ONLINE</span></>
        ) : (
          <><WifiOff className="w-3 h-3 text-[#ff4444]" /><span className="text-[#ff4444]">OFFLINE</span></>
        )}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        <span className="hidden sm:inline text-[#1a3a4a]">UPTIME: {stats.uptime}</span>
        <div className="flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00ff88]" style={{ boxShadow: '0 0 4px #00ff88' }} />
          </span>
          <span className="text-[#3a7a5a]">JARVIS ONLINE</span>
        </div>
        <span className="text-[#1a3a4a]">{now}</span>
      </div>
    </div>
  );
}
