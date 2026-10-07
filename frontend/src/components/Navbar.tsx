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
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-rose-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50/60 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block text-xs font-mono text-slate-500">
          <span className="text-rose-600 font-semibold">SECURITY INTEL CONSOLE</span>
          <span className="mx-2 text-rose-200">|</span>
          <span className="text-slate-500">SOC RESEARCH & THREAT ARCHIVE</span>
        </div>
      </div>

      {/* Global Search Button / Trigger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center px-3 py-1.5 rounded-lg border border-rose-100 bg-rose-50/40 hover:bg-rose-50/80 text-xs text-slate-600 hover:text-slate-900 transition-colors shadow-sm group"
        >
          <Search className="w-3.5 h-3.5 mr-2 text-rose-500 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline mr-4">Quick search intel, IOCs, CVEs...</span>
          <span className="md:hidden mr-2">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-rose-100 rounded text-rose-500 font-medium">
            Ctrl K
          </kbd>
        </button>

        {/* Database & Engine Status Badge */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-rose-50/40 border border-rose-100 text-[11px] font-mono">
          <HardDrive className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-slate-500">DB:</span>
          <span className="text-emerald-600 font-semibold">
            {systemStatus?.database === 'connected' ? 'ONLINE (MariaDB)' : 'ACTIVE'}
          </span>
        </div>

        {/* Quick SQL Jump */}
        <button
          onClick={() => onNavigate('sql-explorer')}
          className="flex items-center px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-mono transition-colors"
          title="Open Sandboxed SQL Explorer"
        >
          <Terminal className="w-3.5 h-3.5 mr-1 text-rose-600" />
          <span className="hidden sm:inline font-semibold">SQL</span>
        </button>
      </div>
    </header>
  );
};
