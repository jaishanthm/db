import React, { useState, useEffect } from 'react';
import { Target, Search, Calendar, Shield, ArrowRight, X } from 'lucide-react';
import { api } from '../services/api';
import { CampaignSummary, CampaignDetail } from '../types/api';
import { Pagination } from '../components/Pagination';

interface Props {
  initialSlug?: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const CampaignsView: React.FC<Props> = ({ initialSlug, onNavigate }) => {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetail | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.listCampaigns({
        q: search || undefined,
        status: statusFilter || undefined,
        page,
        per_page: 12
      });
      setCampaigns(res.data);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [page, statusFilter]);

  useEffect(() => {
    if (initialSlug) {
      loadCampaignDetail(initialSlug);
    }
  }, [initialSlug]);

  const loadCampaignDetail = async (ident: string) => {
    try {
      const res = await api.getCampaignDetail(ident);
      setSelectedCampaign(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <Target className="w-6 h-6 text-purple-400 mr-2.5" />
          Malware Campaign Intelligence Database
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tracking {total} documented cyber campaigns, intrusion waves, and coordinated cyber warfare operations
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaign name or objective..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Concluded">Concluded</option>
        </select>
        <button
          onClick={() => { setPage(1); fetchCampaigns(); }}
          className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-slate-100 text-xs font-semibold"
        >
          Search
        </button>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono">Loading campaign operations telemetry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              onClick={() => loadCampaignDetail(camp.slug)}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-base text-slate-100 group-hover:text-purple-300 transition-colors">
                    {camp.name}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    camp.status === 'Active'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {camp.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{camp.start_date} {camp.end_date ? `to ${camp.end_date}` : '(Ongoing)'}</span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {camp.objective}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{camp.malware_count} Payloads · {camp.actor_count} Actors</span>
                <span className="text-purple-400 font-sans font-semibold group-hover:translate-x-0.5 transition-transform">
                  Inspect →
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

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">{selectedCampaign.name}</h2>
                <div className="text-xs text-purple-400 font-mono mt-1">
                  Active window: {selectedCampaign.start_date} {selectedCampaign.end_date ? `to ${selectedCampaign.end_date}` : '(Ongoing)'}
                </div>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Strategic Objective & Context
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
                {selectedCampaign.description}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Impact & Consequences
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
                {selectedCampaign.impact_summary}
              </p>
            </div>

            {/* Deployed Malware */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Deployed Malware Strains ({selectedCampaign.malware.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCampaign.malware.map((m) => (
                  <div
                    key={m.malware_id}
                    onClick={() => {
                      setSelectedCampaign(null);
                      onNavigate('malware-detail', m.malware_slug);
                    }}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200 hover:text-cyan-300">{m.malware_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {m.primary_type} · Role: <span className="font-mono text-cyan-400">{m.deployment_role}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Attributed Actors */}
            {selectedCampaign.actors.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Attributed Threat Actors ({selectedCampaign.actors.length})
                </h3>
                <div className="space-y-2">
                  {selectedCampaign.actors.map((act) => (
                    <div
                      key={act.actor_id}
                      onClick={() => {
                        setSelectedCampaign(null);
                        onNavigate('actors', act.actor_slug);
                      }}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-200 hover:text-amber-300">{act.actor_name}</div>
                        <div className="text-[10px] text-slate-400">
                          Attribution Confidence: <span className="font-mono text-emerald-400">{act.attribution_confidence}</span>
                        </div>
                      </div>
                      <span className="text-amber-400 font-mono text-[11px]">View Actor →</span>
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
