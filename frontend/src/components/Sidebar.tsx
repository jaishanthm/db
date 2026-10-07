import React from 'react';
import {
  ShieldAlert, Database, Network, BarChart3, Crosshair,
  GitCompare, Users, Target, FileCode, BookOpen, Terminal,
  Layers, HardDriveDownload, FolderTree, Sparkles
} from 'lucide-react';

interface Props {
  currentView: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<Props> = ({ currentView, onNavigate, isOpen, onClose }) => {
  const navSections = [
    {
      title: 'CORE',
      items: [
        { id: 'overview', label: 'Overview', icon: Database },
      ]
    },
    {
      title: 'MALWARE INTEL',
      items: [
        { id: 'research-mode', label: 'Research Mode', icon: Sparkles },
        { id: 'taxonomy', label: 'Taxonomy Tree', icon: FolderTree },
        { id: 'malware-list', label: 'Malware Families', icon: ShieldAlert },
        { id: 'compare', label: 'Malware Compare', icon: GitCompare },
      ]
    },
    {
      title: 'THREAT INTELLIGENCE',
      items: [
        { id: 'actors', label: 'Threat Actors', icon: Users },
        { id: 'campaigns', label: 'Campaigns', icon: Target },
        { id: 'ioc', label: 'Indicators (IOCs)', icon: FileCode },
      ]
    },
    {
      title: 'ANALYSIS & CORRELATION',
      items: [
        { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
        { id: 'attack', label: 'MITRE ATT&CK Matrix', icon: Crosshair },
        { id: 'graph', label: 'Relationship Graph', icon: Network },
      ]
    },
    {
      title: 'KNOWLEDGE & DATABASE',
      items: [
        { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
        { id: 'case-studies', label: 'Case Studies', icon: FileCode },
        { id: 'schema', label: 'Schema Explorer', icon: Layers },
        { id: 'sql-explorer', label: 'Safe SQL Explorer', icon: Terminal },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#131b2e]/90 backdrop-blur-xl border-r border-slate-700/50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-700/50 bg-[#131b2e]/95">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-cyan-500/20 mr-3">
            M
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-slate-100 flex items-center gap-1.5">
              MALWARE DB
              <span className="text-[10px] bg-cyan-500/15 text-cyan-300 font-mono px-1.5 py-0.2 rounded border border-cyan-500/30">PRO</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wider">THREAT INTEL PLATFORM</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="text-[10px] font-semibold font-mono tracking-wider text-slate-400 px-3 mb-2 uppercase">
                {section.title}
              </div>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id || (item.id === 'malware-list' && currentView === 'malware-detail');
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all group ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm shadow-cyan-500/10'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 mr-3 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Status */}
        <div className="p-3 border-t border-slate-800 bg-[#0f1626]/80 text-[11px] font-mono text-slate-400">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
              SYSTEM ACTIVE
            </span>
            <span className="text-[10px] text-slate-500">v1.0.0</span>
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            FastAPI · MariaDB (Case-Study)
          </div>
        </div>
      </aside>
    </>
  );
};
