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
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-amber-200/60 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-stone-500 hover:text-amber-800 hover:bg-amber-50 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block text-xs font-mono text-stone-500">
          <span className="text-amber-800 font-semibold">SECURITY INTEL CONSOLE</span>
          <span className="mx-2 text-amber-200">|</span>
          <span className="text-stone-500">SOC RESEARCH & THREAT ARCHIVE</span>
        </div>
      </div>

      {/* Global Search Button / Trigger */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center px-3 py-1.5 rounded-lg border border-amber-200/70 bg-amber-50/40 hover:bg-amber-50/80 text-xs text-stone-600 hover:text-stone-900 transition-all shadow-sm group"
        >
          <Search className="w-3.5 h-3.5 mr-2 text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline mr-4">Quick search intel, IOCs, CVEs...</span>
          <span className="md:hidden mr-2">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-amber-200 rounded text-amber-700 font-medium">
            Ctrl K
          </kbd>
        </button>

        {/* Database & Engine Status Badge */}
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-amber-50/40 border border-amber-200/70 text-[11px] font-mono">
          <HardDrive className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-stone-500">DB:</span>
          <span className="text-emerald-600 font-semibold">
            {systemStatus?.database === 'connected' ? 'ONLINE (MariaDB)' : 'ACTIVE'}
          </span>
        </div>

        {/* Quick SQL Jump */}
        <button
          onClick={() => onNavigate('sql-explorer')}
          className="flex items-center px-2.5 py-1.5 rounded-lg border border-amber-300 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white text-xs font-mono transition-all shadow-sm shadow-amber-500/20"
          title="Open Sandboxed SQL Explorer"
        >
          <Terminal className="w-3.5 h-3.5 mr-1 text-white" />
          <span className="hidden sm:inline font-bold">SQL</span>
        </button>
      </div>
    </header>
  );
};
