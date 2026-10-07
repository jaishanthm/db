import React, { useState, useEffect, useRef } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Filter, ArrowRight, X } from 'lucide-react';
import { api } from '../services/api';
import { GraphData } from '../types/api';

interface Props {
  initialFocus?: string;
  onNavigate: (view: string, idOrSlug?: string) => void;
}

export const GraphView: React.FC<Props> = ({ initialFocus, onNavigate }) => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    async function loadGraph() {
      setLoading(true);
      try {
        const data = await api.getGraph(initialFocus);
        setGraphData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, [initialFocus]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Simple Force-directed deterministic layout
  const computeNodePositions = (nodes: any[], width = 900, height = 550) => {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = width / 2;
    const centerY = height / 2;

    const malwareNodes = nodes.filter(n => n.group === 'malware');
    const actorNodes = nodes.filter(n => n.group === 'actor');
    const techNodes = nodes.filter(n => n.group === 'technique');
    const campNodes = nodes.filter(n => n.group === 'campaign');
    const otherNodes = nodes.filter(n => !['malware', 'actor', 'technique', 'campaign'].includes(n.group));

    // Arrange Malware in inner circle
    malwareNodes.forEach((node, i) => {
      const angle = (i / malwareNodes.length) * 2 * Math.PI;
      const radius = 140;
      positions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    // Arrange Actors top ring
    actorNodes.forEach((node, i) => {
      const angle = (i / (actorNodes.length || 1)) * Math.PI + Math.PI;
      const radius = 280;
      positions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle) * 0.7
      };
    });

    // Arrange Techniques bottom ring
    techNodes.forEach((node, i) => {
      const angle = (i / (techNodes.length || 1)) * Math.PI;
      const radius = 280;
      positions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle) * 0.7
      };
    });

    // Campaigns & others
    [...campNodes, ...otherNodes].forEach((node, i) => {
      const angle = (i / (campNodes.length + otherNodes.length || 1)) * 2 * Math.PI + 0.5;
      const radius = 340;
      positions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });

    return positions;
  };

  const nodePositions = graphData ? computeNodePositions(graphData.nodes) : {};

  const getNodeColor = (group: string) => {
    switch (group) {
      case 'malware': return '#f43f5e'; // Rose
      case 'actor': return '#f59e0b';   // Amber
      case 'campaign': return '#a855f7';// Purple
      case 'technique': return '#06b6d4';// Cyan
      case 'vulnerability': return '#ef4444'; // Red
      default: return '#3b82f6';        // Blue
    }
  };

  const filteredNodes = graphData?.nodes.filter(
    n => groupFilter === 'all' || n.group === groupFilter
  ) || [];

  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

  const filteredLinks = graphData?.links.filter(
    l => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target)
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <Network className="w-6 h-6 text-purple-400 mr-2.5" />
            Threat Correlation & Relationship Topology
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing multi-entity linkages: Threat Actors → Operations → Malware Families → ATT&CK Techniques
          </p>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.4, z - 0.2))}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-500 mr-1 flex items-center">
          <Filter className="w-3.5 h-3.5 mr-1" /> Filter Nodes:
        </span>
        {[
          { id: 'all', label: 'All Entities' },
          { id: 'malware', label: 'Malware Families' },
          { id: 'actor', label: 'Threat Actors' },
          { id: 'campaign', label: 'Campaigns' },
          { id: 'technique', label: 'MITRE Techniques' },
          { id: 'vulnerability', label: 'CVEs' },
        ].map(chip => (
          <button
            key={chip.id}
            onClick={() => setGroupFilter(chip.id)}
            className={`px-2.5 py-1 rounded transition-colors ${
              groupFilter === chip.id
                ? 'bg-slate-800 text-cyan-400 border border-cyan-800'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-900'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* SVG Canvas Area */}
      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono">Calculating relationship topology...</p>
        </div>
      ) : (
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-2xl h-[620px] select-none cyber-grid-bg">
          <svg
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Links */}
              {filteredLinks.map((link, i) => {
                const s = nodePositions[link.source];
                const t = nodePositions[link.target];
                if (!s || !t) return null;
                return (
                  <line
                    key={i}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke="#1e293b"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="hover:stroke-cyan-500 transition-colors"
                  />
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;
                const isSelected = selectedNode?.id === node.id;
                const color = getNodeColor(node.group);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(node);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={node.group === 'malware' ? 12 : 9}
                      fill="#0f172a"
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 2}
                      className="group-hover:scale-125 transition-all"
                    />
                    <circle
                      r={4}
                      fill={color}
                    />
                    <text
                      y={node.group === 'malware' ? 22 : 18}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="10"
                      fontFamily="monospace"
                      className="group-hover:fill-cyan-300 font-medium pointer-events-none drop-shadow"
                    >
                      {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Selected Node Inspector Drawer */}
          {selectedNode && (
            <div className="absolute right-4 top-4 bottom-4 w-80 bg-slate-900/95 border border-slate-700/80 rounded-xl p-5 shadow-2xl backdrop-blur-md flex flex-col justify-between animate-in slide-in-from-right duration-150">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider" style={{ color: getNodeColor(selectedNode.group) }}>
                      {selectedNode.group}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 mt-1">{selectedNode.label}</h3>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-300 space-y-2 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500">Subtype:</span> {selectedNode.subtype || 'N/A'}
                  </div>
                  {selectedNode.extra?.severity && (
                    <div><span className="text-slate-500">Severity:</span> {selectedNode.extra.severity}</div>
                  )}
                  {selectedNode.extra?.cvss && (
                    <div><span className="text-slate-500">CVSS:</span> {selectedNode.extra.cvss}</div>
                  )}
                </div>
              </div>

              <div>
                {selectedNode.extra?.slug && (
                  <button
                    onClick={() => {
                      if (selectedNode.group === 'malware') onNavigate('malware-detail', selectedNode.extra.slug);
                      else if (selectedNode.group === 'actor') onNavigate('actors', selectedNode.extra.slug);
                      else if (selectedNode.group === 'campaign') onNavigate('campaigns', selectedNode.extra.slug);
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center justify-center transition-colors"
                  >
                    Open Intelligence Dossier <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
