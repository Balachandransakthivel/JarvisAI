import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Brain, History, Settings, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-14 lg:w-52 flex flex-col bg-[#080c18] border-r border-[#0d1f35] h-full flex-shrink-0">
      {/* Logo */}
      <div className="p-3 lg:p-4 border-b border-[#0d1f35]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-[#00d4ff12] border border-[#00d4ff30]">
            <Zap className="w-4 h-4 text-[#00d4ff]" style={{ filter: 'drop-shadow(0 0 5px #00d4ff)' }} />
          </div>
          <div className="hidden lg:block">
            <div className="font-display font-bold text-[#00d4ff] text-xs tracking-[0.2em] text-glow">JARVIS</div>
            <div className="text-[9px] text-[#2a5a6a] font-mono tracking-wider">v1.0.0</div>
          </div>
        </div>
      </div>

      {/* Online indicator */}
      <div className="hidden lg:flex items-center gap-2 px-4 py-2 border-b border-[#0d1f35]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]" style={{ boxShadow: '0 0 4px #00ff88' }} />
        </span>
        <span className="text-[9px] text-[#3a7a5a] font-mono uppercase tracking-[0.15em]">All Systems Online</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-2 lg:px-3 py-2.5 rounded transition-all duration-200',
                active
                  ? 'bg-[#00d4ff12] text-[#00d4ff] border border-[#00d4ff25]'
                  : 'text-[#3a6a7a] hover:text-[#00d4ff] hover:bg-[#00d4ff08] border border-transparent'
              )}
            >
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={active ? { filter: 'drop-shadow(0 0 4px #00d4ff)' } : {}}
              />
              <span className="hidden lg:block text-[11px] font-mono tracking-wider uppercase">
                {label}
              </span>
              {active && (
                <div
                  className="hidden lg:block ml-auto w-0.5 h-4 bg-[#00d4ff] rounded-full"
                  style={{ boxShadow: '0 0 6px #00d4ff' }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 lg:p-4 border-t border-[#0d1f35]">
        <div className="hidden lg:block text-[9px] text-[#1a3a4a] font-mono text-center tracking-wider">
          JARVIS AI © 2025
        </div>
      </div>
    </aside>
  );
}
