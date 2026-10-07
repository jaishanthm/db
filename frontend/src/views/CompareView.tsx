import React, { useState, useEffect } from 'react';
import { GitCompare, Check, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { MalwareSummary } from '../types/api';
import { SeverityBadge } from '../components/SeverityBadge';

interface Props {
  initialFamilyA?: string;
  initialFamilyB?: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const CompareView: React.FC<Props> = ({ initialFamilyA, initialFamilyB, onNavigate }) => {
  const [allMalware, setAllMalware] = useState<MalwareSummary[]>([]);
  const [familyA, setFamilyA] = useState(initialFamilyA || 'lockbit');
  const [familyB, setFamilyB] = useState(initialFamilyB || 'wannacry');
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await api.listMalware({ per_page: 105, sort_by: 'name', sort_order: 'asc' });
        setAllMalware(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadCatalog();
  }, []);

  const runComparison = async () => {
    if (!familyA || !familyB || familyA === familyB) return;
    setLoading(true);
    try {
      const data = await api.compareMalware(familyA, familyB);
      setComparison(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (familyA && familyB && familyA !== familyB) {
      runComparison();
    }
  }, [familyA, familyB]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <GitCompare className="w-6 h-6 text-cyan-400 mr-2.5" />
          Malware Family Comparison Tool
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform side-by-side threat intelligence differential analysis across capabilities, techniques, and targeting
        </p>
      </div>

      {/* Selector Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase mb-2">First Malware Family</label>
          <select
            value={familyA}
            onChange={(e) => setFamilyA(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {allMalware.map((m) => (
              <option key={m.id} value={m.slug} disabled={m.slug === familyB}>
                {m.name} ({m.primary_type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Second Malware Family</label>
          <select
            value={familyB}
            onChange={(e) => setFamilyB(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {allMalware.map((m) => (
              <option key={m.id} value={m.slug} disabled={m.slug === familyA}>
                {m.name} ({m.primary_type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono">Running side-by-side capability differential query...</p>
        </div>
      ) : comparison ? (
        <div className="space-y-6">
          {/* Comparison Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-1/4">Attribute</th>
                  <th className="py-3 px-4 w-3/8 text-cyan-300 font-bold">{comparison.family_a.name}</th>
                  <th className="py-3 px-4 w-3/8 text-blue-300 font-bold">{comparison.family_b.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Classification</td>
                  <td className="py-3 px-4 font-bold text-slate-200">{comparison.family_a.primary_type}</td>
                  <td className="py-3 px-4 font-bold text-slate-200">{comparison.family_b.primary_type}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Severity Rating</td>
                  <td className="py-3 px-4"><SeverityBadge severity={comparison.family_a.severity} /></td>
                  <td className="py-3 px-4"><SeverityBadge severity={comparison.family_b.severity} /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">First Observed</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{comparison.family_a.first_seen}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{comparison.family_b.first_seen}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Operational Status</td>
                  <td className="py-3 px-4">{comparison.family_a.status}</td>
                  <td className="py-3 px-4">{comparison.family_b.status}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Target Platforms</td>
                  <td className="py-3 px-4 text-slate-300">{comparison.family_a.platforms.join(', ')}</td>
                  <td className="py-3 px-4 text-slate-300">{comparison.family_b.platforms.join(', ')}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Attributed Operators</td>
                  <td className="py-3 px-4 text-slate-300">{comparison.family_a.actors.join(', ') || 'Various Affiliates'}</td>
                  <td className="py-3 px-4 text-slate-300">{comparison.family_b.actors.join(', ') || 'Various Affiliates'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Profile Links</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigate('malware-detail', comparison.family_a.slug)}
                      className="text-cyan-400 hover:underline flex items-center"
                    >
                      Inspect Dossier <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onNavigate('malware-detail', comparison.family_b.slug)}
                      className="text-blue-400 hover:underline flex items-center"
                    >
                      Inspect Dossier <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Overlap & Shared Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Shared Tactical Capabilities ({comparison.overlap.capabilities.length})
              </h3>
              {comparison.overlap.capabilities.length === 0 ? (
                <p className="text-xs text-slate-500">No overlapping capabilities detected.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {comparison.overlap.capabilities.map((cap: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-slate-950 border border-emerald-800/40 text-emerald-300 text-xs">
                      {cap}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Shared MITRE ATT&CK Techniques ({comparison.overlap.techniques.length})
              </h3>
              {comparison.overlap.techniques.length === 0 ? (
                <p className="text-xs text-slate-500">No overlapping techniques detected.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {comparison.overlap.techniques.map((tech: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-slate-950 border border-cyan-800/40 text-cyan-300 text-xs font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
