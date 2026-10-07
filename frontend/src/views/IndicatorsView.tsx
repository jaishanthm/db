import React, { useState, useEffect } from 'react';
import { FileCode, Search, Copy, Check, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { IndicatorItem } from '../types/api';
import { Pagination } from '../components/Pagination';

interface Props {
  initialSearch?: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const IndicatorsView: React.FC<Props> = ({ initialSearch, onNavigate }) => {
  const [indicators, setIndicators] = useState<IndicatorItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState(initialSearch || '');
  const [typeFilter, setTypeFilter] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchIndicators = async () => {
    setLoading(true);
    try {
      const res = await api.listIndicators({
        q: query || undefined,
        type: typeFilter || undefined,
        page,
        per_page: 20
      });
      setIndicators(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndicators();
  }, [page, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchIndicators();
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <FileCode className="w-6 h-6 text-emerald-400 mr-2.5" />
          Indicators of Compromise (IOC) Explorer
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Query {total.toLocaleString()} SHA256 hashes, MD5s, IPv4 C2 endpoints, domains, and mutexes with malware attribution
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hash (SHA256, MD5), IP address, C2 domain, or mutex string..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold"
          >
            Lookup IOC
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          {['', 'SHA256', 'MD5', 'IPv4', 'Domain', 'Mutex', 'RegistryKey'].map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                typeFilter === t
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-900'
              }`}
            >
              {t || 'All IOC Types'}
            </button>
          ))}
        </div>
      </div>

      {/* Indicators Table */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono">Querying indicator signatures...</p>
        </div>
      ) : indicators.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/40 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-sm">No indicators match query "{query}".</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Indicator Value</th>
                  <th className="py-3 px-4">Associated Malware</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {indicators.map((ioc) => (
                  <tr key={ioc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-semibold">{ioc.indicator_type}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 break-all max-w-md">
                      {ioc.value}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-100">
                      <button
                        onClick={() => ioc.malware_slug && onNavigate('malware-detail', ioc.malware_slug)}
                        className="text-cyan-400 hover:underline flex items-center"
                      >
                        {ioc.malware_name} <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{ioc.confidence}</td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {ioc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard(ioc.value, `ioc-table-${ioc.id}`)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors inline-flex items-center"
                      >
                        {copiedKey === `ioc-table-${ioc.id}` ? (
                          <><Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" /> Copy</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={Math.ceil(total / 20) || 1}
        totalItems={total}
        perPage={20}
        onPageChange={setPage}
      />
    </div>
  );
};
