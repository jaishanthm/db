import React, { useState, useEffect } from 'react';
import {
  Search, ShieldAlert, Users, Target, GitBranch, Crosshair,
  FileCode, Bug, BookOpen, ShieldCheck, Download, ExternalLink,
  ChevronRight, ArrowDown, Activity, Sparkles, Filter, AlertTriangle,
  Lock, Terminal, CheckCircle2, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchDossier, MalwareSummary } from '../types/api';
import { SeverityBadge } from '../components/SeverityBadge';

interface Props {
  initialSlug?: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const ResearchModeView: React.FC<Props> = ({ initialSlug, onNavigate }) => {
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug || 'lockbit');
  const [malwareList, setMalwareList] = useState<MalwareSummary[]>([]);
  const [dossier, setDossier] = useState<ResearchDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTier, setActiveTier] = useState<string>('all');

  useEffect(() => {
    // Load catalogue for selector
    api.listMalware({ per_page: 150 })
      .then(res => setMalwareList(res.data))
      .catch(err => console.error("Failed to load malware catalogue:", err));
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    setLoading(true);
    setError(null);
    api.getResearchDossier(selectedSlug)
      .then(data => {
        setDossier(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load research dossier.");
        setLoading(false);
      });
  }, [selectedSlug]);

  const filteredFamilies = malwareList.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.primary_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportMarkdown = () => {
    if (!dossier) return;
    const m = dossier.malware;
    const kg = dossier.knowledge_graph;

    const md = `# Threat Intelligence Research Dossier: ${m.name}
**Generated:** ${new Date().toISOString()}
**Primary Type:** ${m.primary_type} | **Severity:** ${m.severity} | **Status:** ${m.status}
**First Observed:** ${m.first_seen} | **Last Observed:** ${m.last_seen}
**Source:** ${m.source || 'Intelligence Feed'} (${m.confidence})

---

## 1. Executive Summary
${m.description}

### Technical Analysis
${m.technical_analysis || 'No detailed technical analysis recorded.'}

### Architectures & Target Platforms
- **Architectures:** ${m.architecture}
- **Platforms:** ${m.platforms.join(', ')}
- **Industries:** ${m.target_industries.join(', ')}

---

## 2. Associated Threat Actors (${kg.actors.length})
${kg.actors.map(a => `- **${a.name}** (${a.origin_country || 'Unknown'}) - Role: ${a.role || 'Operator'} | Motivation: ${a.motivation || 'N/A'}`).join('\n')}

---

## 3. Campaigns (${kg.campaigns.length})
${kg.campaigns.map(c => `- **${c.name}** [${c.start_date || 'N/A'}] - Role: ${c.role || 'Primary'} (${c.status})`).join('\n')}

---

## 4. Variants & Evolution (${kg.variants.length})
${kg.variants.map(v => `- **${v.name}** (v${v.version}) - C2: ${v.c2_protocol}\n  ${v.differences || 'Standard build variant'}`).join('\n')}

---

## 5. MITRE ATT&CK Techniques (${kg.techniques.length})
${kg.techniques.map(t => `- [${t.id}] **${t.name}** (${t.tactic}) - ${t.use_case}`).join('\n')}

---

## 6. Publicly Documented Indicators (${kg.iocs.length})
${kg.iocs.slice(0, 30).map(i => `- **[${i.type}]** \`${i.value}\` (${i.severity} | ${i.confidence})`).join('\n')}

---

## 7. Known Exploited Vulnerabilities (${kg.vulnerabilities.length})
${kg.vulnerabilities.map(v => `- **${v.cve_id}** (${v.severity} - CVSS ${v.cvss_score}): ${v.title} [Stage: ${v.exploitation_stage}]`).join('\n')}

---

## 8. Incident Case Studies (${kg.case_studies.length})
${kg.case_studies.map(cs => `### ${cs.title}\n- **Date:** ${cs.incident_date} | **Target:** ${cs.target} (${cs.industry})\n- ${cs.summary}`).join('\n\n')}

---

## 9. Detection Engineering Rules (${kg.detection_rules.length})
${kg.detection_rules.map(r => `### ${r.name} (${r.rule_type} - ${r.severity})\n\`\`\`\n${r.rule_content}\n\`\`\``).join('\n\n')}

---

## 10. Mitigation & Hardening Guidance (${kg.mitigations.length})
${kg.mitigations.map(mg => `### [${mg.phase}] ${mg.title}\n**Objective:** ${mg.objective}\n**Technical Controls:**\n${mg.technical_controls}`).join('\n\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threat-dossier-${m.slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Sparkles className="w-3.5 h-3.5" /> RESEARCH MODE
            </span>
            <span className="text-xs text-slate-500 font-mono">INTELLIGENCE KNOWLEDGE GRAPH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Unified Threat Dossier & Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Automatically synthesizes multi-tier intelligence across 10 structured layers: attribution, campaigns, evolution, techniques, IOCs, CVEs, incident case studies, detection rules, and defensive mitigations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportMarkdown}
            disabled={!dossier}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-sm font-medium rounded-lg border border-slate-700/80 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export Markdown Dossier
          </button>
        </div>
      </div>

      {/* Selector & Quick Switcher */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search malware families..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Select Target:</span>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {filteredFamilies.map(m => (
                <option key={m.slug} value={m.slug}>
                  {m.name} ({m.primary_type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Popular Quick-Select Pills */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 font-mono">Quick Dossiers:</span>
          {['lockbit', 'blackcat-alphv', 'wannacry', 'notpetya', 'conti', 'cobalt-strike-beacon', 'emotet', 'mirai'].map(slug => (
            <button
              key={slug}
              onClick={() => setSelectedSlug(slug)}
              className={`px-2.5 py-1 rounded font-mono transition-colors ${
                selectedSlug === slug
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {slug}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-400">Assembling multi-tier intelligence knowledge graph...</p>
        </div>
      )}

      {error && (
        <div className="p-6 bg-rose-950/20 border border-rose-900/50 rounded-xl text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-semibold text-rose-200">Failed to Load Dossier</h3>
          <p className="text-sm text-rose-300/80">{error}</p>
        </div>
      )}

      {!loading && !error && dossier && (
        <div className="space-y-10">
          {/* ARCHITECTURAL FLOW VISUALIZATION */}
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-cyan-900/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Activity className="w-64 h-64 text-cyan-400" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-sm font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                Autonomous Intelligence Graph Traversal
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Click any node in the pipeline below to jump directly to its intelligence tier</p>
            </div>

            {/* Visual ASCII / Flow Architecture matching user diagram */}
            <div className="flex flex-col items-center max-w-4xl mx-auto space-y-3">
              {/* Level 1: Malware Root */}
              <a
                href="#sec-malware"
                className="w-full max-w-md bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-900 border-2 border-cyan-500/60 rounded-xl p-4 text-center hover:scale-[1.02] transition-transform shadow-lg shadow-cyan-950/50 group"
              >
                <div className="text-[11px] font-mono uppercase text-cyan-400 font-semibold tracking-wider">ROOT ENTITY</div>
                <div className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cyan-400" />
                  {dossier.malware.name}
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-2">
                  <span>{dossier.malware.primary_type}</span>
                  <span>•</span>
                  <span>{dossier.malware.status}</span>
                  <span>•</span>
                  <SeverityBadge severity={dossier.malware.severity} />
                </div>
              </a>

              {/* Connector Down */}
              <div className="flex items-center justify-center text-cyan-500/80 font-mono text-sm">
                <ArrowDown className="w-5 h-5 animate-pulse" />
              </div>

              {/* Level 2: Actors | Campaigns | Variants (Parallel Branch) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                <a
                  href="#sec-actors"
                  className="bg-slate-900/80 border border-slate-800 hover:border-blue-500/60 rounded-xl p-3.5 text-center transition-all hover:bg-slate-850"
                >
                  <div className="text-[10px] font-mono text-blue-400 font-semibold">ATTRIBUTION</div>
                  <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5 mt-0.5">
                    <Users className="w-4 h-4 text-blue-400" />
                    Threat Actors
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    {dossier.knowledge_graph.actors.length} Linked Operators
                  </div>
                </a>

                <a
                  href="#sec-campaigns"
                  className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 rounded-xl p-3.5 text-center transition-all hover:bg-slate-850"
                >
                  <div className="text-[10px] font-mono text-indigo-400 font-semibold">OPERATIONS</div>
                  <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5 mt-0.5">
                    <Target className="w-4 h-4 text-indigo-400" />
                    Campaigns
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    {dossier.knowledge_graph.campaigns.length} Documented Ops
                  </div>
                </a>

                <a
                  href="#sec-variants"
                  className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 rounded-xl p-3.5 text-center transition-all hover:bg-slate-850"
                >
                  <div className="text-[10px] font-mono text-purple-400 font-semibold">EVOLUTION</div>
                  <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5 mt-0.5">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    Variants & Stems
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    {dossier.knowledge_graph.variants.length} Iterations
                  </div>
                </a>
              </div>

              {/* Connector Down */}
              <div className="flex items-center justify-center text-cyan-500/80 font-mono text-sm">
                <ArrowDown className="w-5 h-5" />
              </div>

              {/* Level 3: Techniques */}
              <a
                href="#sec-techniques"
                className="w-full max-w-lg bg-slate-900/90 border border-amber-500/50 hover:border-amber-400 rounded-xl p-3 text-center transition-all hover:scale-[1.01]"
              >
                <div className="text-[10px] font-mono text-amber-400 font-semibold">TACTICS & BEHAVIORS</div>
                <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  MITRE ATT&CK Techniques ({dossier.knowledge_graph.techniques.length})
                </div>
              </a>

              {/* Connector Down */}
              <div className="flex items-center justify-center text-cyan-500/80 font-mono text-sm">
                <ArrowDown className="w-5 h-5" />
              </div>

              {/* Level 4: IOCs | Vulnerabilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                <a
                  href="#sec-iocs"
                  className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-3 text-center transition-all"
                >
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">FORENSIC ARTIFACTS</div>
                  <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    Indicators ({dossier.knowledge_graph.iocs.length} IOCs)
                  </div>
                </a>

                <a
                  href="#sec-cves"
                  className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/60 rounded-xl p-3 text-center transition-all"
                >
                  <div className="text-[10px] font-mono text-rose-400 font-semibold">EXPLOITATION</div>
                  <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                    <Bug className="w-4 h-4 text-rose-400" />
                    CVEs ({dossier.knowledge_graph.vulnerabilities.length} Exploited)
                  </div>
                </a>
              </div>

              {/* Connector Down */}
              <div className="flex items-center justify-center text-cyan-500/80 font-mono text-sm">
                <ArrowDown className="w-5 h-5" />
              </div>

              {/* Level 5: Case Studies */}
              <a
                href="#sec-casestudies"
                className="w-full max-w-md bg-slate-900/80 border border-slate-800 hover:border-sky-500/60 rounded-xl p-3 text-center transition-all"
              >
                <div className="text-[10px] font-mono text-sky-400 font-semibold">REAL-WORLD INTRUSIONS</div>
                <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  Incident Case Studies ({dossier.knowledge_graph.case_studies.length})
                </div>
              </a>

              {/* Connector Down */}
              <div className="flex items-center justify-center text-cyan-500/80 font-mono text-sm">
                <ArrowDown className="w-5 h-5" />
              </div>

              {/* Level 6: Detection */}
              <a
                href="#sec-detection"
                className="w-full max-w-md bg-slate-900/80 border border-slate-800 hover:border-teal-500/60 rounded-xl p-3 text-center transition-all"
              >
                <div className="text-[10px] font-mono text-teal-400 font-semibold">DETECTION TELEMETRY</div>
                <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  <Terminal className="w-4 h-4 text-teal-400" />
                  YARA & Sigma Rules ({dossier.knowledge_graph.detection_rules.length})
                </div>
              </a>

              {/* Connector Down */}
              <div className="flex items-center justify-center text-cyan-500/80 font-mono text-sm">
                <ArrowDown className="w-5 h-5" />
              </div>

              {/* Level 7: Mitigation */}
              <a
                href="#sec-mitigation"
                className="w-full max-w-md bg-emerald-950/40 border border-emerald-500/60 hover:border-emerald-400 rounded-xl p-3 text-center transition-all shadow-md shadow-emerald-950/40"
              >
                <div className="text-[10px] font-mono text-emerald-400 font-semibold">DEFENSIVE HARDENING</div>
                <div className="text-sm font-bold text-emerald-200 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  NIST / CISA Mitigations ({dossier.knowledge_graph.mitigations.length})
                </div>
              </a>
            </div>
          </div>

          {/* DETAILED INTELLIGENCE DOSSIER TIERS */}
          <div className="space-y-8">
            {/* TIER 1: Malware Root Profile */}
            <div id="sec-malware" className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                <div>
                  <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">Tier 1: Core Family Dossier</span>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                    {dossier.malware.name}
                    {dossier.malware.aliases && dossier.malware.aliases.length > 0 && (
                      <span className="text-xs text-slate-400 font-normal">
                        aka {dossier.malware.aliases.join(', ')}
                      </span>
                    )}
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('malware-detail', dossier.malware.slug)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                >
                  Full Profile <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-500">TYPE</div>
                  <div className="text-sm font-medium text-slate-200">{dossier.malware.primary_type}</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-500">SEVERITY</div>
                  <div className="mt-0.5"><SeverityBadge severity={dossier.malware.severity} /></div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-500">ACTIVITY WINDOW</div>
                  <div className="text-xs font-mono text-slate-300">{dossier.malware.first_seen} → {dossier.malware.last_seen}</div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-500">CONFIDENCE</div>
                  <div className="text-sm font-medium text-emerald-400">{dossier.malware.confidence}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-mono text-slate-400 uppercase mb-1">Executive Summary</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{dossier.malware.description}</p>
                </div>
                {dossier.malware.technical_analysis && (
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 uppercase mb-1">Technical Execution Analysis</h4>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs">
                      {dossier.malware.technical_analysis}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 uppercase mb-1.5">Target Platforms & Arch</h4>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-slate-800 text-xs font-mono text-slate-300 rounded border border-slate-700">
                        {dossier.malware.architecture}
                      </span>
                      {dossier.malware.platforms.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-cyan-950/60 text-xs font-mono text-cyan-300 rounded border border-cyan-800/50">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-mono text-slate-400 uppercase mb-1.5">Targeted Industries</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {dossier.malware.target_industries.map(ind => (
                        <span key={ind} className="px-2 py-0.5 bg-slate-800/80 text-xs text-slate-300 rounded border border-slate-700/80">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TIER 2: Attribution, Campaigns, Variants */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Actors */}
              <div id="sec-actors" className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white uppercase font-mono">Threat Actors</h4>
                  </div>
                  <span className="text-xs font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800/50">
                    {dossier.knowledge_graph.actors.length}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
                  {dossier.knowledge_graph.actors.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No direct threat actors mapped to this profile yet.</p>
                  ) : (
                    dossier.knowledge_graph.actors.map(act => (
                      <div
                        key={act.id}
                        onClick={() => onNavigate('actors', act.slug)}
                        className="p-3 bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800/80 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-blue-300 hover:underline">{act.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{act.role}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Origin: {act.origin_country || 'Unknown'}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Motivation: {act.motivation}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Campaigns */}
              <div id="sec-campaigns" className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white uppercase font-mono">Campaigns</h4>
                  </div>
                  <span className="text-xs font-mono bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/50">
                    {dossier.knowledge_graph.campaigns.length}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
                  {dossier.knowledge_graph.campaigns.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No campaigns linked to this family.</p>
                  ) : (
                    dossier.knowledge_graph.campaigns.map(cmp => (
                      <div
                        key={cmp.id}
                        onClick={() => onNavigate('campaigns', cmp.slug)}
                        className="p-3 bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800/80 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-indigo-300 hover:underline">{cmp.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{cmp.status}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 line-clamp-2">{cmp.description}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">Started: {cmp.start_date || 'N/A'}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Variants */}
              <div id="sec-variants" className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    <h4 className="text-sm font-bold text-white uppercase font-mono">Variants & Stems</h4>
                  </div>
                  <span className="text-xs font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800/50">
                    {dossier.knowledge_graph.variants.length}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
                  {dossier.knowledge_graph.variants.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No variants catalogued.</p>
                  ) : (
                    dossier.knowledge_graph.variants.map(v => (
                      <div key={v.id} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-purple-300">{v.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">v{v.version}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{v.differences || 'Standard build variant'}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-1">C2: {v.c2_protocol}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* TIER 3: MITRE ATT&CK Techniques */}
            <div id="sec-techniques" className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-base font-bold text-white">MITRE ATT&CK Technique Mappings</h4>
                    <p className="text-xs text-slate-400">Observed execution behaviors, persistence hooks, and defense evasion methods</p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-amber-950 text-amber-400 px-2.5 py-1 rounded border border-amber-800/50 font-semibold">
                  {dossier.knowledge_graph.techniques.length} Techniques
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dossier.knowledge_graph.techniques.map(tech => (
                  <div key={tech.id} className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-400 font-bold">{tech.id}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{tech.tactic}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-1">{tech.name}</div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tech.use_case}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">Confidence: {tech.confidence}</span>
                      <a
                        href={tech.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                      >
                        ATT&CK <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TIER 4: Indicators (IOCs) & CVEs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* IOCs */}
              <div id="sec-iocs" className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white uppercase font-mono">Documented IOCs</h4>
                  </div>
                  <button
                    onClick={() => onNavigate('ioc')}
                    className="text-xs text-emerald-400 hover:underline font-mono"
                  >
                    View All {dossier.knowledge_graph.iocs.length} →
                  </button>
                </div>
                <div className="space-y-2 flex-1 overflow-y-auto max-h-96 pr-1 font-mono text-xs">
                  {dossier.knowledge_graph.iocs.slice(0, 25).map(ioc => (
                    <div key={ioc.id} className="p-2.5 bg-slate-950 border border-slate-800/80 rounded flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-500 block">{ioc.type}</span>
                        <div className="text-slate-200 truncate select-all">{ioc.value}</div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          ioc.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          ioc.severity === 'High' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {ioc.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vulnerabilities (CVEs) */}
              <div id="sec-cves" className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-rose-400" />
                    <h4 className="text-sm font-bold text-white uppercase font-mono">Exploited CVEs</h4>
                  </div>
                  <span className="text-xs font-mono bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800/50">
                    {dossier.knowledge_graph.vulnerabilities.length} CVEs
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
                  {dossier.knowledge_graph.vulnerabilities.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No specific CVEs linked to this family yet.</p>
                  ) : (
                    dossier.knowledge_graph.vulnerabilities.map(v => (
                      <div key={v.cve_id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono font-bold text-rose-300">{v.cve_id}</span>
                          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                            CVSS {v.cvss_score}
                          </span>
                        </div>
                        <div className="text-xs text-slate-200 font-medium mt-1">{v.title}</div>
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">Stage: {v.exploitation_stage}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* TIER 5: Incident Case Studies */}
            <div id="sec-casestudies" className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-400" />
                  <div>
                    <h4 className="text-base font-bold text-white">Forensic Incident Investigations</h4>
                    <p className="text-xs text-slate-400">Deep kill-chain case studies documenting actual enterprise compromises</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('case-studies')}
                  className="text-xs text-sky-400 hover:underline font-mono"
                >
                  All Case Studies →
                </button>
              </div>

              <div className="space-y-4">
                {dossier.knowledge_graph.case_studies.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No case studies recorded for this family.</p>
                ) : (
                  dossier.knowledge_graph.case_studies.map(cs => (
                    <div
                      key={cs.id}
                      onClick={() => onNavigate('case-studies', cs.slug)}
                      className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800/80 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h5 className="text-sm font-bold text-sky-300 hover:underline">{cs.title}</h5>
                        <span className="text-xs font-mono text-slate-400">{cs.incident_date}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        Target: {cs.target} | Industry: {cs.industry}
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{cs.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* TIER 6: Detection Engineering (Rules) */}
            <div id="sec-detection" className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-teal-400" />
                  <div>
                    <h4 className="text-base font-bold text-white">Detection Engineering Rules</h4>
                    <p className="text-xs text-slate-400">Production YARA signatures and Sigma detection rules</p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-teal-950 text-teal-300 px-2.5 py-1 rounded border border-teal-800/50 font-semibold">
                  {dossier.knowledge_graph.detection_rules.length} Rules
                </span>
              </div>

              <div className="space-y-4">
                {dossier.knowledge_graph.detection_rules.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No automated detection rules mapped.</p>
                ) : (
                  dossier.knowledge_graph.detection_rules.map(rule => (
                    <div key={rule.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                            {rule.rule_type}
                          </span>
                          <span className="text-sm font-bold text-slate-200">{rule.name}</span>
                        </div>
                        <SeverityBadge severity={rule.severity} />
                      </div>
                      <div className="text-xs text-slate-400 font-mono mb-2">Target Component: {rule.target}</div>
                      <pre className="p-3 bg-slate-900 rounded border border-slate-800 text-xs font-mono text-teal-300/90 overflow-x-auto whitespace-pre">
                        {rule.rule_content}
                      </pre>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* TIER 7: Defensive Mitigations (NIST / CISA) */}
            <div id="sec-mitigation" className="bg-slate-900 border border-emerald-900/50 rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h4 className="text-base font-bold text-white">Defensive Mitigations & Hardening</h4>
                    <p className="text-xs text-slate-400">Actionable technical controls mapped to CISA Performance Goals</p>
                  </div>
                </div>
                <span className="text-xs font-mono bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded border border-emerald-800/50 font-semibold">
                  {dossier.knowledge_graph.mitigations.length} Guidelines
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dossier.knowledge_graph.mitigations.map((mg, i) => (
                  <div key={i} className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                          {mg.phase}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">CPG Goal</span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-200 mb-1">{mg.title}</h5>
                      <p className="text-xs text-slate-400 mb-3">{mg.objective}</p>
                      <div className="text-xs font-mono text-slate-300 bg-slate-900/90 p-3 rounded border border-slate-800 whitespace-pre-line leading-relaxed">
                        {mg.technical_controls}
                      </div>
                    </div>
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
