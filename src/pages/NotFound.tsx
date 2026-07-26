import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 bg-[#050810] hex-grid">
      <AlertTriangle className="w-12 h-12 text-[#ffcc00]" style={{ filter: 'drop-shadow(0 0 8px #ffcc00)' }} />
      <div className="text-center">
        <div className="text-5xl font-display font-bold text-[#00d4ff] text-glow mb-2">404</div>
        <div className="text-[11px] font-mono text-[#3a7a8a] uppercase tracking-[0.3em]">
          Sector Not Found
        </div>
      </div>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-mono text-[#00d4ff] border border-[#00d4ff40] rounded hover:bg-[#00d4ff12] transition-all"
      >
        <Home className="w-3.5 h-3.5" />
        Return to Base
      </Link>
    </div>
  );
}
