import React, { useState, useEffect } from 'react';
import { Terminal, Play, ShieldAlert, Download, Clock, Database, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { SqlResult } from '../types/api';

export const SqlExplorerView: React.FC = () => {
  const [query, setQuery] = useState('SELECT name, primary_type, severity, first_seen, status FROM malware_families WHERE severity = \'Critical\' ORDER BY first_seen DESC LIMIT 15;');
  const [sampleQueries, setSampleQueries] = useState<Array<{ title: string; description: string; sql: string }>>([]);
  const [result, setResult] = useState<SqlResult | null>(null);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    async function loadSamples() {
      try {
        const res = await api.getSampleQueries();
        setSampleQueries(res.samples);
      } catch (err) {
        console.error(err);
      }
    }
    loadSamples();
  }, []);

  const handleRunQuery = async () => {
    if (!query.trim()) return;
    setExecuting(true);
    try {
      const res = await api.executeSql(query.trim());
      setResult(res);
    } catch (err: any) {
      setResult({
        status: 'error',
        error: err.message,
        columns: [],
        rows: [],
        row_count: 0,
        execution_time_ms: 0,
        query
      });
    } finally {
      setExecuting(false);
    }
  };

  const downloadCsv = () => {
    if (!result || result.rows.length === 0) return;
    const header = result.columns.join(',');
    const rows = result.rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'malware_intel_query_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center">
            <Terminal className="w-6 h-6 text-cyan-400 mr-2.5" />
            Sandboxed Safe SQL Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Query live threat intelligence using read-only SQL with multi-layer AST security validation
          </p>
        </div>

        {/* Security Shield Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-xs font-mono text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>AST READ-ONLY GUARD ENFORCED</span>
        </div>
      </div>

      {/* Editor & Samples Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Query Editor (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
            <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">SQL Query Editor (SELECT statements only)</span>
              <button
                onClick={handleRunQuery}
                disabled={executing}
                className="inline-flex items-center px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold font-mono transition-colors cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {executing ? (
                  <>Executing...</>
                ) : (
                  <><Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Execute Query</>
                )}
              </button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={6}
              className="w-full p-4 bg-slate-950 font-mono text-xs text-cyan-300 leading-relaxed focus:outline-none resize-y"
              placeholder="Enter read-only SELECT query..."
            />
          </div>

          {/* Execution Telemetry / Errors */}
          {result && (
            <div>
              {result.status === 'error' ? (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs space-y-1">
                  <div className="flex items-center font-bold">
                    <AlertCircle className="w-4 h-4 mr-2 text-rose-400" /> Query Security or Execution Error
                  </div>
                  <div className="font-mono text-rose-300 pl-6">{result.error}</div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-slate-300">
                      <Clock className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                      Execution Time: <span className="font-bold text-cyan-300 ml-1">{result.execution_time_ms} ms</span>
                    </span>
                    <span className="flex items-center text-slate-300">
                      <Database className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      Rows Returned: <span className="font-bold text-emerald-300 ml-1">{result.row_count}</span>
                    </span>
                  </div>
                  {result.row_count > 0 && (
                    <button
                      onClick={downloadCsv}
                      className="inline-flex items-center px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
                    >
                      <Download className="w-3 h-3 mr-1" /> Export CSV
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results Table */}
          {result && result.status === 'success' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              {result.rows.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-mono">
                  Query executed successfully. 0 rows returned.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs text-slate-300 font-mono">
                    <thead className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 sticky top-0 border-b border-slate-800">
                      <tr>
                        {result.columns.map((col, idx) => (
                          <th key={idx} className="py-2.5 px-3 whitespace-nowrap bg-slate-950">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-[11px]">
                      {result.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 whitespace-nowrap max-w-xs truncate">
                              {cell === null ? (
                                <span className="text-slate-600">NULL</span>
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sample Queries Sidebar (1 col) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">
            Pre-built Intelligence Queries
          </h3>
          <div className="space-y-2">
            {sampleQueries.map((sample, idx) => (
              <div
                key={idx}
                onClick={() => setQuery(sample.sql)}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 cursor-pointer transition-colors group space-y-1"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                  {sample.title}
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  {sample.description}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-400">Security Sandbox Model:</div>
            <div>• Enforces single-statement SELECT / CTEs only</div>
            <div>• All DDL, DML, mutations, and PRAGMAs blocked</div>
            <div>• Result limit clamped to 300 rows maximum</div>
            <div>• Read-only engine URI mode</div>
          </div>
        </div>
      </div>
    </div>
  );
};
