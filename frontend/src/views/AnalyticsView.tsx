import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Cpu, Layers, Activity } from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsData } from '../types/api';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-slate-400">Aggregating threat intelligence metrics across database...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <BarChart3 className="w-6 h-6 text-cyan-400 mr-2.5" />
          Threat Intelligence Analytics & Trend Investigations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical evolutions, malware category distributions, platform vulnerabilities, and attack vectors
        </p>
      </div>

      {/* Grid of Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Malware by Classification Type */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <ShieldAlert className="w-4 h-4 text-rose-400 mr-2" /> Malware Volume by Primary Classification
            </h3>
            <span className="text-[11px] font-mono text-slate-500">105 Catalog Strains</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {data.malware_by_type.slice(0, 7).map((item, i) => {
              const maxVal = Math.max(...data.malware_by_type.map(t => t.count)) || 1;
              const pct = Math.round((item.count / maxVal) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.type}</span>
                    <span className="font-mono text-cyan-400">{item.count} families</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Historical Malware Timeline (Yearly Observations) */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <TrendingUp className="w-4 h-4 text-cyan-400 mr-2" /> Historical Emergence by Year
            </h3>
            <span className="text-[11px] font-mono text-slate-500">2010 – 2026 Trend</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-800">
            {data.malware_by_year.map((yr, i) => {
              const maxCount = Math.max(...data.malware_by_year.map(y => y.count)) || 1;
              const heightPct = Math.round((yr.count / maxCount) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {yr.count}
                  </span>
                  <div
                    className="w-full bg-cyan-500/30 group-hover:bg-cyan-400 rounded-t transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-500 rotate-45 mt-2 origin-left">
                    {yr.year.slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Platform Distribution */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <Layers className="w-4 h-4 text-purple-400 mr-2" /> Target Platform Diversity
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Host OS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {data.platforms_distribution.map((plat, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="text-slate-400 text-[11px] font-mono">{plat.platform}</div>
                <div className="text-xl font-bold font-mono text-slate-100 mt-1">{plat.count}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">targeted families</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Top ATT&CK Techniques Weaponized */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <Cpu className="w-4 h-4 text-emerald-400 mr-2" /> Most Weaponized ATT&CK Techniques
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Enterprise Tactics</span>
          </div>

          <div className="space-y-2 pt-1">
            {data.top_techniques.slice(0, 6).map((t, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                <div>
                  <span className="font-mono text-cyan-400 font-bold mr-2">{t.id}</span>
                  <span className="text-slate-200">{t.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold">
                  {t.malware_count} strains
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
