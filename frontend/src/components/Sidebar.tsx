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
          className="fixed inset-0 z-30 bg-stone-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-md border-r border-amber-200/60 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-amber-200/60 bg-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-amber-400/30 mr-3">
            M
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-stone-900 flex items-center gap-1.5">
              MALWARE DB
              <span className="text-[10px] bg-amber-50 text-amber-800 font-mono px-1.5 py-0.2 rounded border border-amber-200">PRO</span>
            </div>
            <div className="text-[10px] text-stone-400 font-mono tracking-wider">THREAT INTEL PLATFORM</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <div className="text-[10px] font-semibold font-mono tracking-wider text-amber-700/80 px-3 mb-2 uppercase">
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
                          ? 'bg-amber-50 text-amber-900 border border-amber-200/80 font-semibold shadow-sm'
                          : 'text-stone-600 hover:text-amber-900 hover:bg-amber-50/50 border border-transparent'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 mr-3 transition-colors ${
                          isActive ? 'text-amber-600' : 'text-stone-400 group-hover:text-amber-600'
                        }`}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Status */}
        <div className="p-3 border-t border-amber-200/50 bg-amber-50/30 text-[11px] font-mono text-stone-500">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
              SYSTEM ACTIVE
            </span>
            <span className="text-[10px] text-stone-400">v1.0.0</span>
          </div>
          <div className="text-[10px] text-stone-400 truncate">
            FastAPI · MariaDB (Case-Study)
          </div>
        </div>
      </aside>
    </>
  );
};
