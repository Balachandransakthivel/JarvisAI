import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, BatteryCharging, Radio, Monitor, Play, RefreshCw, Send, CheckCircle } from 'lucide-react';
import { listDevices, sendDeviceCommand } from '@/lib/api';
import type { DeviceInfo } from '@/types';
import { toast } from 'sonner';

export const DevicePanel: React.FC = () => {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [cmdInput, setCmdInput] = useState('');

  const fetchDevices = async () => {
    setLoading(true);
    const data = await listDevices();
    setDevices(data);
    if (data.length > 0 && !selectedDevice) {
      setSelectedDevice(data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice || !cmdInput.trim()) return;
    toast.info(`Transmitting payload to ${selectedDevice.name}...`);
    const res = await sendDeviceCommand(selectedDevice.id, cmdInput, {});
    toast.success(res.message || 'Command executed on remote device');
    setCmdInput('');
  };

  const executeQuickAction = async (command: string, params: Record<string, any> = {}) => {
    if (!selectedDevice) return;
    toast.info(`Executing ${command} on ${selectedDevice.name}`);
    const res = await sendDeviceCommand(selectedDevice.id, command, params);
    toast.success(res.message || 'Action completed');
  };

  return (
    <div className="w-full h-full flex flex-col glass-hud rounded-xl border border-[#ff7300]/25 p-5 relative overflow-hidden">
      {/* HUD Bar Header */}
      <div className="flex items-center justify-between border-b border-[#ff7300]/20 pb-3 mb-4">
        <div className="flex items-center gap-2 text-[#ff7300] font-display font-bold uppercase text-xs tracking-widest">
          <Smartphone className="w-4 h-4 text-glow-orange" />
          <span>JARVIS DEVICE HUB & GATEWAY</span>
        </div>
        <button
          onClick={fetchDevices}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono text-[#ffb700] border border-[#ffb700]/30 rounded hover:bg-[#ffb700]/10 transition"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          SCAN NETWORK
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Left: Device List */}
        <div className="space-y-3 overflow-y-auto pr-1">
          <span className="text-[10px] font-mono text-[#ff8c00] uppercase tracking-wider block font-bold">
            CONNECTED NODES ({devices.length})
          </span>
          {devices.map((device) => (
            <div
              key={device.id}
              onClick={() => setSelectedDevice(device)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                selectedDevice?.id === device.id
                  ? 'bg-[#ff7300]/15 border-[#ff7300] shadow-[0_0_15px_rgba(255,115,0,0.2)]'
                  : 'bg-[rgba(10,8,6,0.6)] border-[#ff7300]/20 hover:border-[#ff7300]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-[#ff7300]/10 border border-[#ff7300]/30 text-[#ff7300]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#ffd8b8]">{device.name}</h4>
                  <p className="text-[9px] font-mono text-gray-400">{device.type} • {device.ip_address}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono uppercase bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
                  {device.status}
                </span>
                <p className="text-[9px] font-mono text-[#ffb700] mt-1">{device.battery}% BAT</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Selected Device Detailed Control Center */}
        {selectedDevice ? (
          <div className="lg:col-span-2 flex flex-col justify-between glass-panel p-4 border border-[#ff7300]/30 rounded-lg">
            <div>
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-[#ff7300]/20 pb-3 mb-4">
                <div>
                  <h3 className="text-sm font-display font-bold text-[#ffd8b8] uppercase tracking-wide">
                    {selectedDevice.name}
                  </h3>
                  <p className="text-[10px] font-mono text-[#ff8c00]">NODE ID: {selectedDevice.id}</p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-gray-300">
                  <div className="flex items-center gap-1 text-[#00d4ff]">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{selectedDevice.network}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#a8ff00]">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>{selectedDevice.battery}%</span>
                  </div>
                </div>
              </div>

              {/* Quick Directive Action Matrix */}
              <div className="space-y-2 mb-4">
                <span className="text-[10px] font-mono text-[#ff8c00] uppercase tracking-wider block font-bold">
                  DIRECTIVE CAPABILITIES
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => executeQuickAction('screenshot')}
                    className="p-2 text-[10px] font-mono text-[#ffd8b8] border border-[#ff7300]/30 bg-[#ff7300]/10 rounded hover:border-[#ff7300] hover:text-[#ff7300] transition flex flex-col items-center gap-1"
                  >
                    <Monitor className="w-4 h-4" />
                    [Take Screenshot]
                  </button>
                  <button
                    onClick={() => executeQuickAction('open_app', { package: 'com.google.android.youtube' })}
                    className="p-2 text-[10px] font-mono text-[#ffd8b8] border border-[#ff7300]/30 bg-[#ff7300]/10 rounded hover:border-[#ff7300] hover:text-[#ff7300] transition flex flex-col items-center gap-1"
                  >
                    <Play className="w-4 h-4" />
                    [Open YouTube]
                  </button>
                  <button
                    onClick={() => executeQuickAction('view_screen')}
                    className="p-2 text-[10px] font-mono text-[#ffd8b8] border border-[#ff7300]/30 bg-[#ff7300]/10 rounded hover:border-[#ff7300] hover:text-[#ff7300] transition flex flex-col items-center gap-1"
                  >
                    <Radio className="w-4 h-4 text-[#00d4ff]" />
                    [View Screen]
                  </button>
                  <button
                    onClick={() => executeQuickAction('ping')}
                    className="p-2 text-[10px] font-mono text-[#ffd8b8] border border-[#ff7300]/30 bg-[#ff7300]/10 rounded hover:border-[#ff7300] hover:text-[#ff7300] transition flex flex-col items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4 text-[#a8ff00]" />
                    [Ping Device]
                  </button>
                </div>
              </div>

              {/* Simulated Device Screen Stream Frame */}
              <div className="relative h-40 rounded-lg border border-[#ff7300]/30 bg-[#03060f] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#00d4ff]/10 via-transparent to-transparent pointer-events-none" />
                <div className="text-center space-y-1 z-10">
                  <Monitor className="w-8 h-8 text-[#00d4ff] mx-auto animate-pulse" />
                  <p className="text-[10px] font-mono text-[#00d4ff] uppercase tracking-widest font-bold">
                    LIVE DEVICE STREAM ACTIVE
                  </p>
                  <p className="text-[8px] font-mono text-gray-400">RESOLUTION 1080x2400 • ADB SYNC READY</p>
                </div>
              </div>
            </div>

            {/* Custom Command Console Input */}
            <form onSubmit={handleCommandSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                placeholder={`Dispatch direct ADB payload to ${selectedDevice.name}...`}
                className="flex-1 bg-[#050404] border border-[#ff7300]/30 px-3 py-2 text-xs font-mono text-[#ffd8b8] rounded focus:outline-none focus:border-[#ff7300]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#ff7300]/20 border border-[#ff7300]/40 text-[#ff7300] hover:bg-[#ff7300]/30 rounded font-mono text-xs flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                SEND
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center text-gray-500 font-mono text-xs">
            Select a connected device to inspect telemetry and send commands.
          </div>
        )}
      </div>
    </div>
  );
};
