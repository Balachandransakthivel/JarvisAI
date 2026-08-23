import { useState, useEffect, useRef } from 'react';
import type { SystemStats } from '@/types';

export function useSystemStats(): SystemStats {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 15,
    ram: 40,
    battery: 100,
    batteryCharging: true,
    network: navigator.onLine,
    temperature: 42,
    uptime: '0:00:00',
  });

  const startRef = useRef(Date.now());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // ── WebSocket Telemetry ──────────────────────────────────────────────────
    let connectTimeout: number;
    
    function connectWS() {
      const ws = new WebSocket('ws://localhost:8000/api/ws');
      wsRef.current = ws;
      
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'telemetry') {
            const telemetry = msg.data;
            setStats(prev => ({
              ...prev,
              cpu: Math.round(telemetry.cpu),
              ram: Math.round(telemetry.ram),
              battery: telemetry.battery.percent,
              batteryCharging: telemetry.battery.plugged,
              network: telemetry.internet,
            }));
          }
        } catch (e) {
          // Parse error
        }
      };
      
      ws.onclose = () => {
        // Retry connection after 5 seconds if closed
        connectTimeout = window.setTimeout(connectWS, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }
    
    connectWS();

    // ── Local fallbacks for browser APIs ─────────────────────────────────────
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        setStats(p => ({ ...p, battery: Math.round(bat.level * 100), batteryCharging: bat.charging }));
      }).catch(() => {});
    }

    // ── Uptime & Temperature Simulation ──────────────────────────────────────
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const h = Math.floor(elapsed / 3600);
      const m = Math.floor((elapsed % 3600) / 60);
      const s = elapsed % 60;
      const uptime = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      setStats(prev => {
        // If WS is not connected, simulate CPU/RAM slightly so UI is active
        const wsConnected = wsRef.current && wsRef.current.readyState === WebSocket.OPEN;
        const cpu = wsConnected ? prev.cpu : Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.48) * 8));
        const ram = wsConnected ? prev.ram : Math.max(20, Math.min(90, prev.ram + (Math.random() - 0.48) * 4));
        
        return {
          ...prev,
          cpu,
          ram,
          temperature: Math.max(35, Math.min(75, prev.temperature + (Math.random() - 0.5) * 1.5)),
          uptime,
        };
      });
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(connectTimeout);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnection
        wsRef.current.close();
      }
    };
  }, []);

  return stats;
}
