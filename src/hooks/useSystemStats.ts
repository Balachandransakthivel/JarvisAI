import { useState, useEffect, useRef } from 'react';
import type { SystemStats } from '@/types';

export function useSystemStats(): SystemStats {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 18,
    ram: 42,
    battery: 87,
    batteryCharging: false,
    network: navigator.onLine,
    temperature: 41,
    uptime: '0:00:00',
  });

  const startRef = useRef(Date.now());

  useEffect(() => {
    // Real battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        setStats(p => ({ ...p, battery: Math.round(bat.level * 100), batteryCharging: bat.charging }));
        bat.addEventListener('levelchange', () => {
          setStats(p => ({ ...p, battery: Math.round(bat.level * 100) }));
        });
        bat.addEventListener('chargingchange', () => {
          setStats(p => ({ ...p, batteryCharging: bat.charging }));
        });
      }).catch(() => {});
    }

    // Network
    const onOnline = () => setStats(p => ({ ...p, network: true }));
    const onOffline = () => setStats(p => ({ ...p, network: false }));
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Simulated live stats
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const h = Math.floor(elapsed / 3600);
      const m = Math.floor((elapsed % 3600) / 60);
      const s = elapsed % 60;
      const uptime = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

      setStats(prev => ({
        ...prev,
        cpu: Math.max(4, Math.min(92, prev.cpu + (Math.random() - 0.48) * 8)),
        ram: Math.max(20, Math.min(88, prev.ram + (Math.random() - 0.48) * 4)),
        temperature: Math.max(32, Math.min(72, prev.temperature + (Math.random() - 0.5) * 2)),
        uptime,
      }));
    }, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return stats;
}
