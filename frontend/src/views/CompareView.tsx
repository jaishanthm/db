import React, { useState, useEffect } from 'react';
import {
  GitCompare, ArrowRight, ArrowLeftRight, Download, AlertCircle,
  RefreshCw, CheckCircle2, XCircle, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
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
  const [familyA, setFamilyA] = useState<string>(initialFamilyA || 'lockbit');
  const [familyB, setFamilyB] = useState<string>(initialFamilyB || 'wannacry');
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync props if changed
  useEffect(() => {
    if (initialFamilyA) {
      setFamilyA(initialFamilyA);
      if (initialFamilyA === familyB) {
        setFamilyB(initialFamilyA === 'wannacry' ? 'lockbit' : 'wannacry');
      }
    }
  }, [initialFamilyA]);

  useEffect(() => {
    if (initialFamilyB) {
      setFamilyB(initialFamilyB);
    }
  }, [initialFamilyB]);

  // Load catalog for selectors
  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await api.listMalware({ per_page: 200, sort_by: 'name', sort_order: 'asc' });
        if (res && res.data) {
          setAllMalware(res.data);
        }
      } catch (err: any) {
        console.error("Failed to load catalog:", err);
      }
    }
    loadCatalog();
  }, []);

  const runComparison = async () => {
    if (!familyA || !familyB) return;
    if (familyA === familyB) {
      setError("Please select two distinct malware families to compare.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.compareMalware(familyA, familyB);
      setComparison(data);
    } catch (err: any) {
      console.error("Comparison error:", err);
      setError(err.message || "Failed to execute differential malware comparison.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (familyA && familyB && familyA !== familyB) {
      runComparison();
    }
  }, [familyA, familyB]);

  const handleSwap = () => {
    const temp = familyA;
    setFamilyA(familyB);
    setFamilyB(temp);
  };

  const setPreset = (slugA: string, slugB: string) => {
    setFamilyA(slugA);
    setFamilyB(slugB);
  };

  const exportMarkdown = () => {
    if (!comparison) return;
    const a = comparison.family_a;
    const b = comparison.family_b;
    const overlap = comparison.overlap;

    const uniqueCapsA = a.capabilities.filter((c: string) => !b.capabilities.includes(c));
    const uniqueCapsB = b.capabilities.filter((c: string) => !a.capabilities.includes(c));
    const uniqueTechsA = a.techniques.filter((t: string) => !b.techniques.includes(t));
    const uniqueTechsB = b.techniques.filter((t: string) => !a.techniques.includes(t));

    const md = `# Malware Comparative Differential Analysis
**Generated:** ${new Date().toISOString()}
**Comparison:** ${a.name} (${a.primary_type}) vs ${b.name} (${b.primary_type})

---

## 1. High-Level Summary
| Attribute | ${a.name} | ${b.name} |
| :--- | :--- | :--- |
| **Classification** | ${a.primary_type} | ${b.primary_type} |
| **Severity** | ${a.severity} | ${b.severity} |
| **Status** | ${a.status} | ${b.status} |
| **First Observed** | ${a.first_seen} | ${b.first_seen} |
| **Last Observed** | ${a.last_seen} | ${b.last_seen} |
| **Target Platforms** | ${a.platforms.join(', ')} | ${b.platforms.join(', ')} |
| **Operators** | ${a.actors.join(', ') || 'Unattributed'} | ${b.actors.join(', ') || 'Unattributed'} |

---

## 2. Capabilities Comparison
### Shared Capabilities (${overlap.capabilities.length})
${overlap.capabilities.map((c: string) => `- [x] ${c}`).join('\n') || '- None'}

### Unique to ${a.name} (${uniqueCapsA.length})
${uniqueCapsA.map((c: string) => `- ${c}`).join('\n') || '- None'}

### Unique to ${b.name} (${uniqueCapsB.length})
${uniqueCapsB.map((c: string) => `- ${c}`).join('\n') || '- None'}

---

## 3. MITRE ATT&CK Techniques
### Shared ATT&CK Techniques (${overlap.techniques.length})
${overlap.techniques.map((t: string) => `- [x] ${t}`).join('\n') || '- None'}

### Unique to ${a.name} (${uniqueTechsA.length})
${uniqueTechsA.map((t: string) => `- ${t}`).join('\n') || '- None'}

### Unique to ${b.name} (${uniqueTechsB.length})
${uniqueTechsB.map((t: string) => `- ${t}`).join('\n') || '- None'}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `malware-comparison-${a.slug}-vs-${b.slug}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Derive unique sets if comparison exists
  const uniqueCapsA = comparison
    ? comparison.family_a.capabilities.filter((c: string) => !comparison.family_b.capabilities.includes(c))
    : [];
  const uniqueCapsB = comparison
    ? comparison.family_b.capabilities.filter((c: string) => !comparison.family_a.capabilities.includes(c))
    : [];
  const uniqueTechsA = comparison
    ? comparison.family_a.techniques.filter((t: string) => !comparison.family_b.techniques.includes(t))
    : [];
  const uniqueTechsB = comparison
    ? comparison.family_b.techniques.filter((t: string) => !comparison.family_a.techniques.includes(t))
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <GitCompare className="w-3.5 h-3.5" /> DIFFERENTIAL ANALYSIS
            </span>
            <span className="text-xs text-slate-500 font-mono">SIDE-BY-SIDE INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            Malware Family Comparison Tool
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Perform differential threat intelligence analysis across tactical capabilities, MITRE ATT&CK techniques, targeting profiles, and attributed operators.
          </p>
        </div>

        {comparison && (
          <button
            onClick={exportMarkdown}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors shadow-sm self-start md:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export Differential Report
          </button>
        )}
      </div>

      {/* Preset Pairs Shortcuts */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-500 font-mono">Featured Comparisons:</span>
        {[
          { label: 'LockBit vs WannaCry', a: 'lockbit', b: 'wannacry' },
          { label: 'NotPetya vs HermeticWiper', a: 'notpetya', b: 'hermeticwiper' },
          { label: 'Cobalt Strike vs Remcos RAT', a: 'cobalt-strike-beacon', b: 'remcos-rat' },
          { label: 'Emotet vs QakBot', a: 'emotet', b: 'qakbot' },
          { label: 'BlackCat vs REvil', a: 'blackcat-alphv', b: 'revil' },
        ].map(p => (
          <button
            key={p.label}
            onClick={() => setPreset(p.a, p.b)}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-[11px] transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Selector Card with Swap Button */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Family A */}
          <div className="md:col-span-5">
            <label className="block text-xs font-mono text-cyan-400 uppercase font-semibold mb-2">
              Primary Malware Strain (Family A)
            </label>
            <select
              value={familyA}
              onChange={(e) => setFamilyA(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {allMalware.length === 0 ? (
                <>
                  <option value="lockbit">LockBit (Ransomware)</option>
                  <option value="wannacry">WannaCry (Ransomware)</option>
                  <option value="notpetya">NotPetya (Wiper)</option>
                  <option value="blackcat-alphv">BlackCat (ALPHV)</option>
                </>
              ) : (
                allMalware.map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.name} ({m.primary_type})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <button
              onClick={handleSwap}
              title="Swap malware strains"
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-all hover:scale-105"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Family B */}
          <div className="md:col-span-5">
            <label className="block text-xs font-mono text-blue-400 uppercase font-semibold mb-2">
              Comparative Malware Strain (Family B)
            </label>
            <select
              value={familyB}
              onChange={(e) => setFamilyB(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {allMalware.length === 0 ? (
                <>
                  <option value="wannacry">WannaCry (Ransomware)</option>
                  <option value="lockbit">LockBit (Ransomware)</option>
                  <option value="notpetya">NotPetya (Wiper)</option>
                  <option value="blackcat-alphv">BlackCat (ALPHV)</option>
                </>
              ) : (
                allMalware.map((m) => (
                  <option key={m.id} value={m.slug}>
                    {m.name} ({m.primary_type})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/60 flex items-center justify-between text-rose-200 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={runComparison}
            className="px-3 py-1 bg-rose-900/40 hover:bg-rose-900/60 rounded border border-rose-800 text-[11px] font-mono"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono">Running side-by-side capability differential query...</p>
        </div>
      )}

      {/* Comparison Results */}
      {!loading && !error && comparison && (
        <div className="space-y-6">
          {/* Comparison Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 w-1/4">Attribute</th>
                  <th className="py-3.5 px-4 w-3/8 text-cyan-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      {comparison.family_a.name}
                    </span>
                  </th>
                  <th className="py-3.5 px-4 w-3/8 text-blue-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      {comparison.family_b.name}
                    </span>
                  </th>
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
                  <td className="py-3 px-4 font-mono text-slate-400">Activity Window</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{comparison.family_a.first_seen} → {comparison.family_a.last_seen}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{comparison.family_b.first_seen} → {comparison.family_b.last_seen}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Operational Status</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px]">
                      {comparison.family_a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px]">
                      {comparison.family_b.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Target Platforms</td>
                  <td className="py-3 px-4 text-slate-300">{comparison.family_a.platforms.join(', ') || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-300">{comparison.family_b.platforms.join(', ') || 'N/A'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Target Industries</td>
                  <td className="py-3 px-4 text-slate-300">{comparison.family_a.industries.join(', ') || 'Global'}</td>
                  <td className="py-3 px-4 text-slate-300">{comparison.family_b.industries.join(', ') || 'Global'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Attributed Operators</td>
                  <td className="py-3 px-4 text-slate-300">{comparison.family_a.actors.join(', ') || 'Various Affiliates'}</td>
                  <td className="py-3 px-4 text-slate-300">{comparison.family_b.actors.join(', ') || 'Various Affiliates'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400">Profile Actions</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onNavigate('malware-detail', comparison.family_a.slug)}
                        className="text-cyan-400 hover:underline flex items-center font-mono text-[11px]"
                      >
                        Profile <ArrowRight className="w-3 h-3 ml-0.5" />
                      </button>
                      <button
                        onClick={() => onNavigate('research-mode', comparison.family_a.slug)}
                        className="text-cyan-400 hover:underline flex items-center font-mono text-[11px]"
                      >
                        <Sparkles className="w-3 h-3 mr-0.5" /> Dossier
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onNavigate('malware-detail', comparison.family_b.slug)}
                        className="text-blue-400 hover:underline flex items-center font-mono text-[11px]"
                      >
                        Profile <ArrowRight className="w-3 h-3 ml-0.5" />
                      </button>
                      <button
                        onClick={() => onNavigate('research-mode', comparison.family_b.slug)}
                        className="text-blue-400 hover:underline flex items-center font-mono text-[11px]"
                      >
                        <Sparkles className="w-3 h-3 mr-0.5" /> Dossier
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Differential Tactical Capabilities */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Capability Matrix & Differentiation</span>
              <span className="text-xs text-emerald-400 font-normal">
                {comparison.overlap.capabilities.length} Overlapping Capabilities
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Shared Overlap */}
              <div className="p-4 rounded-lg bg-slate-950 border border-emerald-900/50">
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold mb-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Shared Across Both ({comparison.overlap.capabilities.length})
                </div>
                {comparison.overlap.capabilities.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No shared capabilities.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.overlap.capabilities.map((c: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 text-xs font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Unique to Family A */}
              <div className="p-4 rounded-lg bg-slate-950 border border-cyan-900/50">
                <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-semibold mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Unique to {comparison.family_a.name} ({uniqueCapsA.length})
                </div>
                {uniqueCapsA.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No unique capabilities.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueCapsA.map((c: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 text-xs font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Unique to Family B */}
              <div className="p-4 rounded-lg bg-slate-950 border border-blue-900/50">
                <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400 font-semibold mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> Unique to {comparison.family_b.name} ({uniqueCapsB.length})
                </div>
                {uniqueCapsB.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No unique capabilities.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueCapsB.map((c: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/50 text-blue-300 text-xs font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MITRE ATT&CK Techniques Differential */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>MITRE ATT&CK Behavioral Technique Overlap</span>
              <span className="text-xs text-amber-400 font-normal">
                {comparison.overlap.techniques.length} Shared Techniques
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Shared Overlap */}
              <div className="p-4 rounded-lg bg-slate-950 border border-amber-900/50">
                <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold mb-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Shared Techniques ({comparison.overlap.techniques.length})
                </div>
                {comparison.overlap.techniques.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No overlapping techniques.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {comparison.overlap.techniques.map((t: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/50 text-amber-300 text-xs font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Unique to Family A */}
              <div className="p-4 rounded-lg bg-slate-950 border border-cyan-900/50">
                <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 font-semibold mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Unique to {comparison.family_a.name} ({uniqueTechsA.length})
                </div>
                {uniqueTechsA.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No unique techniques.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueTechsA.map((t: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-300 text-xs font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Unique to Family B */}
              <div className="p-4 rounded-lg bg-slate-950 border border-blue-900/50">
                <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400 font-semibold mb-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> Unique to {comparison.family_b.name} ({uniqueTechsB.length})
                </div>
                {uniqueTechsB.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No unique techniques.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueTechsB.map((t: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/50 text-blue-300 text-xs font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
