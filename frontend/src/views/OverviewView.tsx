import React, { useEffect, useState } from 'react';
import {
  ShieldAlert, Users, Target, FileCode, BookOpen, Terminal,
  ArrowRight, Activity, Cpu, Layers, ExternalLink, Flame
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsData, MalwareSummary } from '../types/api';
import { SeverityBadge } from '../components/SeverityBadge';

interface Props {
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const OverviewView: React.FC<Props> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [featuredMalware, setFeaturedMalware] = useState<MalwareSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [anData, malData] = await Promise.all([
          api.getAnalytics(),
          api.listMalware({ per_page: 6, sort_by: 'first_seen', sort_order: 'desc' })
        ]);
        setAnalytics(anData);
        setFeaturedMalware(malData.data);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-10">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 mb-4">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
            THREAT INTELLIGENCE RESEARCH PORTAL
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Malware Intelligence, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Structured for Investigation.
            </span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Explore 100+ malware families, threat actors, campaigns, MITRE ATT&CK techniques,
            IOC indicators, infrastructure, and defensive intelligence through a normalized relational platform and sandboxed SQL engine.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('malware-list')}
              className="inline-flex items-center px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Explore Malware Families <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={() => onNavigate('graph')}
              className="inline-flex items-center px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Open Relationship Graph
            </button>
            <button
              onClick={() => onNavigate('sql-explorer')}
              className="inline-flex items-center px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-mono text-xs border border-cyan-900/60 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Safe SQL Explorer
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Malware Families', count: analytics?.metrics.total_malware ?? '105', icon: ShieldAlert, color: 'text-rose-400', nav: 'malware-list' },
          { label: 'Threat Actors', count: analytics?.metrics.total_threat_actors ?? '50', icon: Users, color: 'text-amber-400', nav: 'actors' },
          { label: 'Campaigns', count: analytics?.metrics.total_campaigns ?? '105', icon: Target, color: 'text-purple-400', nav: 'campaigns' },
          { label: 'Indicators (IOCs)', count: analytics?.metrics.total_indicators ?? '1,194+', icon: FileCode, color: 'text-emerald-400', nav: 'ioc' },
          { label: 'Case Studies', count: analytics?.metrics.total_case_studies ?? '15', icon: BookOpen, color: 'text-blue-400', nav: 'case-studies' },
          { label: 'Detection Rules', count: analytics?.metrics.total_defensive_rules ?? '210', icon: Cpu, color: 'text-cyan-400', nav: 'analytics' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigate(stat.nav)}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group hover:bg-slate-900"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-[11px] truncate">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100 group-hover:text-cyan-300 transition-colors">
                {stat.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Intelligence Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center">
              <Flame className="w-4 h-4 text-rose-400 mr-2" /> Recent High-Threat Malware Families
            </h2>
            <p className="text-xs text-slate-400">Prominent threats tracked across ransomware, stealers, and wipers</p>
          </div>
          <button
            onClick={() => onNavigate('malware-list')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center"
          >
            View all 105+ families <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredMalware.map((malware) => (
            <div
              key={malware.id}
              onClick={() => onNavigate('malware-detail', malware.slug)}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-base text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {malware.name}
                  </div>
                  <SeverityBadge severity={malware.severity} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {malware.primary_type}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    First seen: {malware.first_seen}
                  </span>
                </div>

                {malware.aliases.length > 0 && (
                  <div className="text-xs text-slate-400 mb-3 line-clamp-1">
                    <span className="text-slate-500">Aliases:</span> {malware.aliases.join(', ')}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-[11px]">
                  Platforms: {malware.platforms.slice(0, 2).join(', ') || 'Multi'}
                </span>
                <span className="text-cyan-400 flex items-center font-medium group-hover:translate-x-0.5 transition-transform">
                  View Profile <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Platform Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ATT&CK Matrix Card */}
        <div
          onClick={() => onNavigate('attack')}
          className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800/50 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
            MITRE ATT&CK Matrix Navigator
          </h3>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            14 tactics mapped across 34 weaponized techniques. Filter and inspect exactly which malware families invoke execution, persistence, and defense evasion methods.
          </p>
          <div className="mt-4 text-xs font-semibold text-cyan-400 flex items-center">
            Open Matrix <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Relationship Graph Card */}
        <div
          onClick={() => onNavigate('graph')}
          className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800/50 flex items-center justify-center mb-4">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
            Interactive Relationship Topology
          </h3>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Explore dynamic interconnected nodes linking Threat Actors → Campaigns → Malware Strains → CVE Vulnerabilities → ATT&CK Techniques.
          </p>
          <div className="mt-4 text-xs font-semibold text-purple-400 flex items-center">
            Explore Graph <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Case Studies Card */}
        <div
          onClick={() => onNavigate('case-studies')}
          className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800/50 flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
            15 Deep Incident Case Studies
          </h3>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Step-by-step forensic investigations covering Colonial Pipeline DarkSide, SolarWinds SUNBURST, WannaCry NHS, MOVEit Transfer Clop zero-day, and NotPetya.
          </p>
          <div className="mt-4 text-xs font-semibold text-blue-400 flex items-center">
            Read Case Studies <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};
