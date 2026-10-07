import React, { useState, useEffect, useRef } from 'react';
import { Search, ShieldAlert, Users, Target, Crosshair, FileCode, BookOpen, X, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const CommandPalette: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(query.trim());
        setResults(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (type: string, item: any) => {
    onClose();
    if (type === 'malware') onNavigate('malware-detail', item.slug);
    else if (type === 'actor') onNavigate('actors', item.slug);
    else if (type === 'campaign') onNavigate('campaigns', item.slug);
    else if (type === 'technique') onNavigate('attack', item.slug);
    else if (type === 'indicator') onNavigate('ioc', item.title);
    else if (type === 'case_study') onNavigate('case-studies', item.slug);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-5 h-5 text-cyan-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search malware, actors, campaigns, techniques, IOCs, case studies... (Esc to close)"
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mr-2" />
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-3 space-y-4 max-h-[60vh]">
          {!query.trim() && (
            <div className="py-8 text-center text-slate-500 text-xs">
              Type at least 2 characters to search across 105+ malware families, 50+ threat actors, 1,200+ indicators, and MITRE techniques.
            </div>
          )}

          {results && Object.values(results).every((arr: any) => arr.length === 0) && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No intelligence records found matching "{query}".
            </div>
          )}

          {results?.malware?.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 mr-1.5" /> Malware Families
              </div>
              <div className="space-y-1">
                {results.malware.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('malware', item)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 group-hover:text-cyan-300">{item.title}</span>
                      <span className="text-slate-400 ml-2">({item.subtitle})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.actors?.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <Users className="w-3.5 h-3.5 text-amber-400 mr-1.5" /> Threat Actors
              </div>
              <div className="space-y-1">
                {results.actors.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('actor', item)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 group-hover:text-amber-300">{item.title}</span>
                      <span className="text-slate-400 ml-2">· {item.subtitle}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.campaigns?.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <Target className="w-3.5 h-3.5 text-purple-400 mr-1.5" /> Campaigns
              </div>
              <div className="space-y-1">
                {results.campaigns.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('campaign', item)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 group-hover:text-purple-300">{item.title}</span>
                      <span className="text-slate-400 ml-2">· {item.subtitle}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.techniques?.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400 mr-1.5" /> MITRE ATT&CK
              </div>
              <div className="space-y-1">
                {results.techniques.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('technique', item)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <span className="font-mono text-cyan-300 font-semibold">{item.title}</span>
                      <span className="text-slate-400 ml-2">· {item.subtitle}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.indicators?.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <FileCode className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Indicators of Compromise
              </div>
              <div className="space-y-1">
                {results.indicators.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('indicator', item)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div className="font-mono text-slate-300 text-[11px] truncate max-w-lg">
                      {item.title} <span className="text-slate-500 ml-2 font-sans">({item.subtitle})</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results?.case_studies?.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <BookOpen className="w-3.5 h-3.5 text-blue-400 mr-1.5" /> Case Studies
              </div>
              <div className="space-y-1">
                {results.case_studies.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect('case_study', item)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800/60 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 group-hover:text-blue-300">{item.title}</span>
                      <span className="text-slate-400 ml-2">· {item.subtitle}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or Tab • Press Esc to close</span>
          <span className="font-mono text-slate-400">Ctrl + K</span>
        </div>
      </div>
    </div>
  );
};
