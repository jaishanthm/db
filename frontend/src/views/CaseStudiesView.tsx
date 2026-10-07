import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Calendar, Shield, ArrowRight, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { CaseStudyDetail } from '../types/api';

interface Props {
  initialSlug?: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const CaseStudiesView: React.FC<Props> = ({ initialSlug, onNavigate }) => {
  const [studies, setStudies] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState<CaseStudyDetail | null>(null);
  const [studyLoading, setStudyLoading] = useState(false);

  useEffect(() => {
    async function loadStudies() {
      try {
        const res = await api.listCaseStudies();
        setStudies(res.data);
        setTotal(res.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStudies();
  }, []);

  useEffect(() => {
    if (initialSlug) {
      loadStudyDetail(initialSlug);
    }
  }, [initialSlug]);

  const loadStudyDetail = async (slug: string) => {
    setStudyLoading(true);
    try {
      const res = await api.getCaseStudyDetail(slug);
      setSelectedStudy(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStudyLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <BookOpen className="w-6 h-6 text-blue-400 mr-2.5" />
          Technical Incident Case Studies
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed forensic analysis of historic cyber intrusions, kill-chain phases, containment operations, and lessons learned
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono">Loading technical incident dossiers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studies.map((cs) => (
            <div
              key={cs.id}
              onClick={() => loadStudyDetail(cs.slug)}
              className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                  <span>{cs.incident_date}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    {cs.industry}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2">
                  {cs.title}
                </h3>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Target: <span className="text-slate-200">{cs.target_entity}</span> ({cs.region})
                </div>

                <p className="mt-3 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {cs.executive_summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                {cs.malware_name ? (
                  <span className="font-mono text-cyan-400 text-[11px]">Payload: {cs.malware_name}</span>
                ) : (
                  <span className="text-slate-500 text-[11px]">Multi-stage</span>
                )}
                <span className="text-blue-400 font-semibold flex items-center group-hover:translate-x-0.5 transition-transform">
                  Read Case Study <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Case Study Full Detail Modal */}
      {selectedStudy && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono text-blue-400 font-semibold mb-1">
                  INCIDENT INVESTIGATION REPORT · {selectedStudy.incident_date}
                </div>
                <h2 className="text-2xl font-bold text-slate-100">{selectedStudy.title}</h2>
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  {selectedStudy.subtitle}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudy(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Incident Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Target Entity</span>
                <div className="text-slate-200 font-bold">{selectedStudy.target_entity}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Industry</span>
                <div className="text-slate-200">{selectedStudy.industry}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Region</span>
                <div className="text-slate-200">{selectedStudy.region}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase text-[10px]">Attributed Payload</span>
                <div className="text-cyan-400 font-bold">{selectedStudy.malware_name || 'Multi-Payload'}</div>
              </div>
            </div>

            {/* Detailed Sections */}
            <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
              <section className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider font-mono">
                  1. Executive Incident Summary
                </h3>
                <p>{selectedStudy.executive_summary}</p>
              </section>

              <section className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  2. Threat Context & Attribution
                </h3>
                <p>{selectedStudy.threat_context}</p>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <section className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">
                    3. Initial Access & Foothold
                  </h3>
                  <p>{selectedStudy.initial_access}</p>
                </section>

                <section className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">
                    4. Execution Flow
                  </h3>
                  <p>{selectedStudy.execution_flow}</p>
                </section>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <section className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    5. Persistence & Privilege Escalation
                  </h3>
                  <p>{selectedStudy.persistence_mechanism} {selectedStudy.privilege_escalation}</p>
                </section>

                <section className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    6. Defense Evasion & Lateral Movement
                  </h3>
                  <p>{selectedStudy.defense_evasion} {selectedStudy.lateral_movement}</p>
                </section>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <section className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                    7. Command & Control (C2)
                  </h3>
                  <p>{selectedStudy.command_and_control}</p>
                </section>

                <section className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
                    8. Exfiltration & Operational Impact
                  </h3>
                  <p>{selectedStudy.exfiltration_impact}</p>
                </section>
              </div>

              <section className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-2">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1.5" /> 9. Detection Opportunities & Incident Containment
                </h3>
                <p><span className="font-semibold text-slate-200">Detection:</span> {selectedStudy.detection_opportunities}</p>
                <p><span className="font-semibold text-slate-200">Containment:</span> {selectedStudy.containment_actions}</p>
              </section>

              <section className="p-4 rounded-xl bg-slate-950 border border-cyan-900/40 space-y-2">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                  10. Strategic Lessons Learned & Prevention
                </h3>
                <p>{selectedStudy.lessons_learned}</p>
              </section>
            </div>

            {/* Mapped ATT&CK Techniques in Study */}
            {selectedStudy.mitre_attack?.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">
                  Observed MITRE ATT&CK Techniques
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudy.mitre_attack.map((tech, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-400">
                      {tech.id}: {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
