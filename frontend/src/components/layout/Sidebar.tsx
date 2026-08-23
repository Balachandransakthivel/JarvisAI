import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Brain, History, Settings, Zap, Smartphone, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/devices', icon: Smartphone, label: 'Devices' },
  { to: '/vision', icon: Eye, label: 'Vision AI' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];


export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-16 lg:w-56 flex flex-col bg-[rgba(10,8,6,0.85)] border-r border-[#ff730020] h-full flex-shrink-0 relative z-10">
      
      {/* Decorative vertical hologram lines */}
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#ff730015] to-transparent" />

      {/* Logo Area */}
      <div className="p-4 border-b border-[#ff730020] bg-[rgba(16,10,5,0.2)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#ff730010] border border-[#ff730035] shadow-[0_0_12px_rgba(255,115,0,0.15)] hover:border-[#ffb70040] transition-colors duration-300">
            <Zap className="w-4.5 h-4.5 text-[#ff7300] hover:text-[#ffb700] transition-colors duration-300" style={{ filter: 'drop-shadow(0 0 5px #ff7300)' }} />
          </div>
          <div className="hidden lg:block">
            <div className="font-display font-extrabold text-[#ff7300] text-[13px] tracking-[0.25em] text-glow">
              JARVIS
            </div>
            <div className="text-[9px] text-[#ff8c00] font-mono tracking-widest font-semibold mt-0.5 opacity-80">
              SYS.INTEG_v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Connection Indicator */}
      <div className="hidden lg:flex items-center gap-2.5 px-5 py-2.5 border-b border-[#ff730020] bg-[rgba(16,10,5,0.4)]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb700] opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ffb700]" style={{ boxShadow: '0 0 4px #ffb700' }} />
        </span>
        <span className="text-[9px] text-[#ffb700] font-mono uppercase tracking-[0.18em] font-medium text-glow-amber">
          GRID ONLINE
        </span>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 py-4 space-y-1.5 px-3">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'group flex items-center gap-3.5 px-2.5 lg:px-4 py-3 rounded-md transition-all duration-300 relative border border-transparent',
                active
                  ? 'bg-[#ff730010] text-[#ff7300] border-[#ff730025] shadow-[0_0_15px_rgba(255,115,0,0.05)]'
                  : 'text-[#ff8c00] opacity-70 hover:opacity-100 hover:text-[#ff7300] hover:bg-[#ff730007]'
              )}
            >
              {/* Highlight background lines */}
              {active && (
                <div className="absolute left-0 w-[2px] h-6 bg-[#ff7300] rounded-r-full shadow-[0_0_8px_#ff7300]" />
              )}
              
              <Icon
                className="w-4.5 h-4.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                style={active ? { filter: 'drop-shadow(0 0 5px #ff7300)' } : {}}
              />
              
              <span className="hidden lg:block text-[10.5px] font-display font-semibold tracking-[0.15em] uppercase transition-colors duration-300">
                {label}
              </span>

              {/* End pointer */}
              {active && (
                <div
                  className="hidden lg:block ml-auto w-1 h-1 bg-[#ff7300] rounded-full"
                  style={{ boxShadow: '0 0 6px #ff7300' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#ff730020] bg-[rgba(16,10,5,0.2)]">
        <div className="hidden lg:block text-[8.5px] text-[#ff7300] opacity-60 font-mono text-center tracking-widest font-semibold uppercase">
          SECURE SECTOR
        </div>
      </div>
    </aside>
  );
}
