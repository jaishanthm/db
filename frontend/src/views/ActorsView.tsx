import React, { useState, useEffect } from 'react';
import { Users, Search, Globe, Shield, ArrowRight, X } from 'lucide-react';
import { api } from '../services/api';
import { ThreatActorSummary, ThreatActorDetail } from '../types/api';
import { Pagination } from '../components/Pagination';

interface Props {
  initialSlug?: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const ActorsView: React.FC<Props> = ({ initialSlug, onNavigate }) => {
  const [actors, setActors] = useState<ThreatActorSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter
  const [search, setSearch] = useState('');
  const [motivationFilter, setMotivationFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  // Selected Detail Modal
  const [selectedActor, setSelectedActor] = useState<ThreatActorDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchActors = async () => {
    setLoading(true);
    try {
      const res = await api.listActors({
        q: search || undefined,
        motivation: motivationFilter || undefined,
        country: countryFilter || undefined,
        page,
        per_page: 12
      });
      setActors(res.data);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActors();
  }, [page, motivationFilter, countryFilter]);

  useEffect(() => {
    if (initialSlug) {
      loadActorDetail(initialSlug);
    }
  }, [initialSlug]);

  const loadActorDetail = async (ident: string) => {
    setDetailLoading(true);
    try {
      const res = await api.getActorDetail(ident);
      setSelectedActor(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <Users className="w-6 h-6 text-amber-400 mr-2.5" />
            Threat Actor Intelligence Database
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking {total} state-sponsored APT groups, cybercrime syndicates, and initial access brokers
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actor name, aliases, nation..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select
          value={motivationFilter}
          onChange={(e) => { setMotivationFilter(e.target.value); setPage(1); }}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Motivations</option>
          <option value="Financial">Financial / Cybercrime</option>
          <option value="Espionage">Cyber Espionage</option>
          <option value="Sabotage">Sabotage / Cyber Warfare</option>
        </select>
        <button
          onClick={() => { setPage(1); fetchActors(); }}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold"
        >
          Search
        </button>
      </div>

      {/* Actors Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono">Loading threat actor intelligence records...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actors.map((actor) => (
            <div
              key={actor.id}
              onClick={() => loadActorDetail(actor.slug)}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                    {actor.name}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {actor.sophistication}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-slate-400 font-mono">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>{actor.origin_country}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400">{actor.motivation}</span>
                </div>

                {actor.aliases.length > 0 && (
                  <div className="text-xs text-slate-400 mb-3 line-clamp-1">
                    <span className="text-slate-500">Aliases:</span> {actor.aliases.join(', ')}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{actor.malware_count} Malware · {actor.campaign_count} Campaigns</span>
                <span className="text-amber-400 font-sans font-semibold group-hover:translate-x-0.5 transition-transform">
                  Profile →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={total}
        perPage={12}
        onPageChange={setPage}
      />

      {/* Actor Detail Modal */}
      {selectedActor && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-100">{selectedActor.name}</h2>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-950 text-amber-300 border border-amber-800">
                    {selectedActor.sophistication}
                  </span>
                </div>
                {selectedActor.aliases.length > 0 && (
                  <div className="text-xs text-slate-400 mt-1">
                    Tracked as: {selectedActor.aliases.join(', ')}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedActor(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px]">Origin</span>
                <div className="font-semibold text-slate-200">{selectedActor.origin_country}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px]">Motivation</span>
                <div className="font-semibold text-amber-300">{selectedActor.motivation}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px]">First Observed</span>
                <div className="font-mono text-slate-200">{selectedActor.first_seen}</div>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-mono text-[10px]">Status</span>
                <div className="font-mono text-emerald-400">{selectedActor.status}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Threat Dossier Overview
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                {selectedActor.description}
              </p>
            </div>

            {/* Deployed Malware Strains */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Weaponized Malware Toolset ({selectedActor.malware.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedActor.malware.map((m) => (
                  <div
                    key={m.malware_id}
                    onClick={() => {
                      setSelectedActor(null);
                      onNavigate('malware-detail', m.malware_slug);
                    }}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200 hover:text-cyan-300">{m.malware_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {m.primary_type} · Role: <span className="font-mono text-cyan-400">{m.role}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Associated Campaigns */}
            {selectedActor.campaigns.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Linked Operations & Campaigns ({selectedActor.campaigns.length})
                </h3>
                <div className="space-y-2">
                  {selectedActor.campaigns.map((c) => (
                    <div
                      key={c.campaign_id}
                      onClick={() => {
                        setSelectedActor(null);
                        onNavigate('campaigns', c.campaign_slug);
                      }}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-200 hover:text-purple-300">{c.campaign_name}</div>
                        <div className="text-[10px] text-slate-400">
                          Commenced: {c.start_date} · Attribution: {c.attribution_confidence}
                        </div>
                      </div>
                      <span className="text-purple-400 font-mono text-[11px]">View Campaign →</span>
                    </div>
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
