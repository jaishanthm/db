import React, { useState, useEffect } from 'react';
import {
  BookOpen, Binary, ShieldCheck, Terminal, Search, ExternalLink,
  Code, Cpu, ShieldAlert, CheckCircle, FileText, Sparkles, Filter,
  Layers, HardDrive, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import {
  GlossaryTermItem, MitigationGuidelineItem,
  AnalysisConceptItem, TelemetrySourceItem
} from '../types/api';

interface Props {
  initialTab?: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const KnowledgeBaseView: React.FC<Props> = ({ initialTab = 'glossary', onNavigate }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTermItem[]>([]);
  const [mitigations, setMitigations] = useState<MitigationGuidelineItem[]>([]);
  const [concepts, setConcepts] = useState<AnalysisConceptItem[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetrySourceItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getGlossary(),
      api.getMitigations(),
      api.getAnalysisConcepts(),
      api.getTelemetryHub()
    ])
      .then(([gRes, mRes, cRes, tRes]) => {
        setGlossaryTerms(gRes.terms);
        setMitigations(mRes.guidelines);
        setConcepts(cRes.concepts);
        setTelemetry(tRes.sources);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load knowledge base:", err);
        setLoading(false);
      });
  }, []);

  const filteredGlossary = glossaryTerms.filter(t =>
    t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMitigations = mitigations.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phase.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.technical_controls.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConcepts = concepts.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.technical_overview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTelemetry = telemetry.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.source_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.event_id && t.event_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <BookOpen className="w-3.5 h-3.5" /> SECURITY KNOWLEDGE BASE
            </span>
            <span className="text-xs text-slate-500 font-mono">TECHNICAL REFERENCE & DEFENSIVE PLAYBOOKS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Cybersecurity Knowledge & Analysis Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Authoritative reference covering malware reverse-engineering concepts (PE/ELF, anti-analysis, packing), CISA/NIST defensive mitigations, telemetry & event logs (Sysmon, Security Events), and core terminology.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setActiveTab('glossary')}
            className={`px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'glossary'
                ? 'bg-slate-900 text-cyan-400 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Cybersecurity Glossary ({glossaryTerms.length})
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'analysis'
                ? 'bg-slate-900 text-cyan-400 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Binary className="w-4 h-4" />
            Malware Analysis Concepts ({concepts.length})
          </button>

          <button
            onClick={() => setActiveTab('mitigations')}
            className={`px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'mitigations'
                ? 'bg-slate-900 text-cyan-400 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Mitigation Playbooks ({mitigations.length})
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2.5 text-xs font-mono font-medium rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${
              activeTab === 'telemetry'
                ? 'bg-slate-900 text-cyan-400 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900/40'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Telemetry & Log Hub ({telemetry.length})
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-xs w-full pb-2 sm:pb-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-400">Loading knowledge base records...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: GLOSSARY */}
          {activeTab === 'glossary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGlossary.map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                          {item.category}
                        </span>
                        {item.related_mitre && (
                          <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                            ATT&CK: {item.related_mitre}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{item.term}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.definition}</p>

                      {item.example && (
                        <div className="p-2.5 bg-slate-950 rounded border border-slate-800/80 mb-2">
                          <span className="text-[10px] font-mono text-slate-500 block uppercase">Technical Example / Observation</span>
                          <span className="text-xs font-mono text-cyan-300/90">{item.example}</span>
                        </div>
                      )}
                    </div>

                    {item.references && item.references.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Verified Research Ref</span>
                        <a
                          href={item.references[0]}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                        >
                          Source <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MALWARE ANALYSIS CONCEPTS */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {filteredConcepts.map((c) => (
                  <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">Category: {c.category}</span>
                        <h3 className="text-lg font-bold text-white mt-0.5">{c.title}</h3>
                      </div>
                      <div className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                        Tools: {c.investigation_tooling}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono text-slate-400 uppercase mb-1">Technical Architecture & Mechanics</h4>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                        {c.technical_overview}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono text-slate-400 uppercase mb-1">Forensic Indicators & Triage Signals</h4>
                      <pre className="text-xs font-mono text-emerald-300/90 bg-slate-950 p-3.5 rounded-lg border border-slate-800 whitespace-pre-line leading-relaxed">
                        {c.forensic_indicators}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MITIGATION PLAYBOOKS */}
          {activeTab === 'mitigations' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMitigations.map((m) => (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                          Phase: {m.phase}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">CISA Cross-Sector CPGs</span>
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{m.title}</h3>
                      <p className="text-xs text-slate-400 mb-4">{m.objective}</p>

                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed">
                        {m.technical_controls}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                      <span>Target: {m.target_environment}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TELEMETRY & EVENT LOG HUB */}
          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTelemetry.map((t) => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                          {t.source_type}
                        </span>
                        {t.event_id && (
                          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                            {t.event_id}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mb-1.5">{t.name}</h3>
                      <p className="text-xs text-slate-400 mb-3">{t.description}</p>

                      <div className="p-3 bg-slate-950 rounded border border-slate-800 mb-3">
                        <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Detection & Hunting Value</span>
                        <p className="text-xs text-emerald-300/90 leading-relaxed">{t.detection_value}</p>
                      </div>

                      {t.sample_log && (
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Sample Raw Log Line</span>
                          <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre">
                            {t.sample_log}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
