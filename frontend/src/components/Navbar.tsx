import React from 'react';
import { Menu, Search, ShieldCheck, Terminal, HardDrive } from 'lucide-react';

interface Props {
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
  onNavigate: (view: string, idOrSlug?: string) => void;
  systemStatus: { status: string; database: string } | null;
}

export const Navbar: React.FC<Props> = ({
  onToggleSidebar,
  onOpenCommandPalette,
  onNavigate,
  systemStatus
}) => {
  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block text-xs font-mono text-slate-400">
          <span className="text-cyan-400 font-semibold">SECURITY INTEL CONSOLE</span>
          <span className="mx-2 text-slate-700">|</span>
          <span className="text-slate-400">SOC RESEARCH & THREAT ARCHIVE</span>
        </div>
      </div>

      {/* Global Search Button / Trigger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-900 text-xs text-slate-400 hover:text-slate-200 transition-colors shadow-inner group"
        >
          <Search className="w-3.5 h-3.5 mr-2 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline mr-4">Quick search intel, IOCs, CVEs...</span>
          <span className="md:hidden mr-2">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-300">
            Ctrl K
          </kbd>
        </button>

        {/* Database & Engine Status Badge */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-900/60 border border-slate-800 text-[11px] font-mono">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">DB:</span>
          <span className="text-emerald-400 font-semibold">
            {systemStatus?.database === 'connected' ? 'ONLINE' : 'ACTIVE'}
          </span>
        </div>

        {/* Quick SQL Jump */}
        <button
          onClick={() => onNavigate('sql-explorer')}
          className="flex items-center px-2.5 py-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono transition-colors"
          title="Open Sandboxed SQL Explorer"
        >
          <Terminal className="w-3.5 h-3.5 mr-1 text-cyan-400" />
          <span className="hidden sm:inline">SQL</span>
        </button>
      </div>
    </header>
  );
};
