import React, { useState, useEffect } from 'react';
import {
  FolderTree, ChevronRight, ChevronDown, ShieldAlert, Sparkles,
  ExternalLink, Search, Layers, ShieldCheck, Database, Filter
} from 'lucide-react';
import { api } from '../services/api';
import { TaxonomyNode, MalwareSummary } from '../types/api';
import { SeverityBadge } from '../components/SeverityBadge';

interface Props {
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const TaxonomyView: React.FC<Props> = ({ onNavigate }) => {
  const [taxonomyData, setTaxonomyData] = useState<TaxonomyNode[]>([]);
  const [totalCatalog, setTotalCatalog] = useState<number>(0);
  const [selectedNode, setSelectedNode] = useState<TaxonomyNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'trojan': true,
  });
  const [nodeMalware, setNodeMalware] = useState<MalwareSummary[]>([]);
  const [loadingNodeMalware, setLoadingNodeMalware] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTaxonomy()
      .then(res => {
        setTaxonomyData(res.taxonomy);
        setTotalCatalog(res.total_catalog);
        if (res.taxonomy.length > 0) {
          setSelectedNode(res.taxonomy[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load taxonomy:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedNode) return;
    setLoadingNodeMalware(true);

    // Fetch malware matching this node's types
    // Query each type in db_types
    const primaryType = selectedNode.db_types[0] || selectedNode.name;
    api.listMalware({ type: primaryType, per_page: 50 })
      .then(res => {
        setNodeMalware(res.data);
        setLoadingNodeMalware(false);
      })
      .catch(err => {
        console.error("Failed to fetch node malware:", err);
        setLoadingNodeMalware(false);
      });
  }, [selectedNode]);

  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const renderTreeItem = (node: TaxonomyNode, depth: number = 0) => {
    const isExpanded = !!expandedNodes[node.id];
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => setSelectedNode(node)}
          style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
          className={`flex items-center justify-between py-2 pr-3 rounded-lg cursor-pointer transition-colors text-sm ${
            isSelected
              ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-800/80 font-medium'
              : 'hover:bg-slate-800/60 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(node.id, e)}
                className="p-0.5 hover:bg-slate-700/60 rounded text-slate-400"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-4 h-4 flex items-center justify-center text-slate-600">•</span>
            )}
            <span className="truncate">{node.name}</span>
          </div>

          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            isSelected
              ? 'bg-cyan-900/90 text-cyan-300'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {node.count}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5 space-y-0.5 border-l border-slate-800/60 ml-4">
            {node.children.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredMalware = nodeMalware.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.architecture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <FolderTree className="w-3.5 h-3.5" /> TAXONOMY HIERARCHY
            </span>
            <span className="text-xs text-slate-500 font-mono">{totalCatalog} TOTAL CATALOGUED FAMILIES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Malware Classification Taxonomy
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Normalized ontological classification hierarchy of malware threat categories: Ransomware, Trojans (Banking, RAT, Downloader), Infostealers, Wipers, Rootkits, Botnets, and Mobile threats.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-sm font-mono text-slate-400">Loading malware classification taxonomy...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Taxonomy Tree View */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[700px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                <Layers className="w-4 h-4" /> Classification Tree
              </div>
              <span className="text-[11px] font-mono text-slate-500">Root: Malware</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              <div className="text-xs font-mono text-slate-400 py-1 px-2 uppercase font-semibold">
                Taxonomic Hierarchy
              </div>
              {taxonomyData.map(node => renderTreeItem(node, 0))}
            </div>

            {/* Total Distribution Summary */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>Catalog Diversity:</span>
              <span className="text-cyan-400 font-bold">{taxonomyData.length} Root Categories</span>
            </div>
          </div>

          {/* RIGHT: Node Details & Matching Families */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[700px]">
            {selectedNode ? (
              <div className="flex flex-col h-full">
                {/* Node Banner */}
                <div className="border-b border-slate-800 pb-5 mb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/50">
                          Class: {selectedNode.id}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          Aliases: {selectedNode.db_types.join(', ')}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
                        {selectedNode.name}
                        <span className="text-xs font-mono text-slate-400 font-normal">
                          ({selectedNode.count} catalogued families)
                        </span>
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate('malware-list')}
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        All Malware Database →
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder={`Search ${selectedNode.name} families...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Showing {filteredMalware.length} families
                  </span>
                </div>

                {/* Malware Family Cards */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {loadingNodeMalware ? (
                    <div className="py-16 text-center">
                      <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs font-mono text-slate-400">Retrieving classification instances...</p>
                    </div>
                  ) : filteredMalware.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-500 font-mono">
                      No malware families found matching criteria in this category.
                    </div>
                  ) : (
                    filteredMalware.map(m => (
                      <div
                        key={m.id}
                        className="p-4 bg-slate-950 border border-slate-800/80 hover:border-slate-700 rounded-lg transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => onNavigate('malware-detail', m.slug)}
                              className="text-sm font-bold text-slate-200 hover:text-cyan-400 cursor-pointer"
                            >
                              {m.name}
                            </span>
                            {m.aliases && m.aliases.length > 0 && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                aka {m.aliases[0]}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <SeverityBadge severity={m.severity} />
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-850 text-slate-300 border border-slate-700/60">
                              {m.status}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {m.description || 'No detailed description available.'}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-[11px]">
                          <div className="flex items-center gap-2 text-slate-500 font-mono">
                            <span>Arch: {m.architecture}</span>
                            <span>•</span>
                            <span>{m.first_seen?.substring(0, 4)} → {m.last_seen?.substring(0, 4)}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => onNavigate('research-mode', m.slug)}
                              className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" /> Dossier
                            </button>
                            <button
                              onClick={() => onNavigate('malware-detail', m.slug)}
                              className="text-slate-400 hover:text-slate-200 font-mono flex items-center gap-1"
                            >
                              Details <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm font-mono">
                Select a taxonomic category from the left tree
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
