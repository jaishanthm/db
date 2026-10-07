import React, { useState, useEffect } from 'react';
import { Crosshair, ExternalLink, ShieldAlert, ArrowRight, X } from 'lucide-react';
import { api } from '../services/api';
import { MitreTacticItem, MitreTechniqueItem } from '../types/api';

interface Props {
  initialTechId?: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const AttackMatrixView: React.FC<Props> = ({ initialTechId, onNavigate }) => {
  const [tactics, setTactics] = useState<MitreTacticItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const [techLoading, setTechLoading] = useState(false);

  useEffect(() => {
    async function loadMatrix() {
      try {
        const res = await api.getAttackMatrix();
        setTactics(res.tactics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMatrix();
  }, []);

  useEffect(() => {
    if (initialTechId) {
      loadTechniqueDetail(initialTechId);
    }
  }, [initialTechId]);

  const loadTechniqueDetail = async (techId: string) => {
    setTechLoading(true);
    try {
      const res = await api.getTechniqueDetail(techId);
      setSelectedTech(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTechLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <Crosshair className="w-6 h-6 text-cyan-400 mr-2.5" />
          MITRE ATT&CK Enterprise Matrix Navigator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tactical matrix correlating 14 adversary tactics with malware weaponization frequencies
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono">Loading ATT&CK enterprise framework...</p>
        </div>
      ) : (
        /* Matrix Grid */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-[1400px]">
            {tactics.map((tactic) => (
              <div
                key={tactic.id}
                className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col"
              >
                {/* Tactic Header */}
                <div className="p-3 bg-slate-950 border-b border-slate-800 text-center">
                  <div className="text-[10px] font-mono text-cyan-400 font-bold">{tactic.id}</div>
                  <div className="text-xs font-bold text-slate-200 truncate mt-0.5">{tactic.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {tactic.techniques.length} techniques
                  </div>
                </div>

                {/* Techniques List in Tactic Column */}
                <div className="p-2 space-y-1.5 flex-1 overflow-y-auto max-h-[600px]">
                  {tactic.techniques.length === 0 ? (
                    <div className="text-[10px] text-slate-600 text-center py-4 font-mono">
                      No mapped items
                    </div>
                  ) : (
                    tactic.techniques.map((tech) => (
                      <button
                        key={tech.id}
                        onClick={() => loadTechniqueDetail(tech.id)}
                        className="w-full text-left p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 text-xs transition-colors group cursor-pointer"
                      >
                        <div className="font-mono text-[10px] text-slate-500 group-hover:text-cyan-400 font-semibold">
                          {tech.id}
                        </div>
                        <div className="text-slate-300 font-medium line-clamp-2 mt-0.5 group-hover:text-slate-100">
                          {tech.name}
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-500">Malware:</span>
                          <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-bold">
                            {tech.malware_count}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technique Detail Modal */}
      {selectedTech && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono text-cyan-400 font-bold">{selectedTech.id}</div>
                <h2 className="text-xl font-bold text-slate-100 mt-1">{selectedTech.name}</h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Tactic: <span className="text-slate-200">{selectedTech.tactic_name}</span> ({selectedTech.tactic_id})
                </div>
              </div>
              <button
                onClick={() => setSelectedTech(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Technique Description
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
                {selectedTech.description}
              </p>
            </div>

            {selectedTech.url && (
              <a
                href={selectedTech.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs text-cyan-400 hover:underline font-mono"
              >
                Official MITRE ATT&CK Documentation <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            )}

            {/* Malware Families Using This Technique */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center">
                <ShieldAlert className="w-4 h-4 text-rose-400 mr-2" />
                Attributed Malware Families ({selectedTech.malware.length})
              </h3>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedTech.malware.map((m: any) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedTech(null);
                      onNavigate('malware-detail', m.slug);
                    }}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-cyan-300">{m.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.use_case}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
