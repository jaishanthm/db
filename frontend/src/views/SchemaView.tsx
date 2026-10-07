import React, { useState, useEffect } from 'react';
import { Layers, Database, Key, Search, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { SchemaTable } from '../types/api';

export const SchemaView: React.FC = () => {
  const [schemaData, setSchemaData] = useState<{
    total_tables: number;
    total_relationships: number;
    tables: SchemaTable[];
    relationships: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterTable, setFilterTable] = useState('');
  const [selectedTable, setSelectedTable] = useState<SchemaTable | null>(null);

  useEffect(() => {
    async function loadSchema() {
      try {
        const res = await api.getSchema();
        setSchemaData(res);
        if (res.tables.length > 0) {
          setSelectedTable(res.tables.find(t => t.name === 'malware_families') || res.tables[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSchema();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-slate-400">Introspecting database metadata & relationships...</p>
      </div>
    );
  }

  if (!schemaData) return null;

  const filteredTables = schemaData.tables.filter(t =>
    t.name.toLowerCase().includes(filterTable.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center">
          <Layers className="w-6 h-6 text-cyan-400 mr-2.5" />
          Relational Database Schema & Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {schemaData.total_tables} normalized relational tables connected via {schemaData.total_relationships} foreign key constraints
        </p>
      </div>

      {/* Main Architecture Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Table Selector Column */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              placeholder="Search table names..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden max-h-[600px] overflow-y-auto divide-y divide-slate-800/60">
            {filteredTables.map((table) => {
              const isSelected = selectedTable?.name === table.name;
              return (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full text-left p-3 text-xs transition-colors flex items-center justify-between font-mono cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/40 text-cyan-300 border-l-2 border-cyan-400'
                      : 'text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="font-semibold">{table.name}</span>
                  <span className="text-[10px] text-slate-500">{table.column_count} cols</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Details & Columns Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTable && (
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold font-mono text-slate-100">{selectedTable.name}</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {selectedTable.columns.length} Defined Columns
                </span>
              </div>

              {/* Columns Table */}
              <div className="rounded-lg border border-slate-800 overflow-hidden bg-slate-950">
                <table className="w-full text-left text-xs font-mono text-slate-300">
                  <thead className="bg-slate-900 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Column Name</th>
                      <th className="py-2.5 px-3">Data Type</th>
                      <th className="py-2.5 px-3">Key / Constraint</th>
                      <th className="py-2.5 px-3">Foreign Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    {selectedTable.columns.map((col, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {col.name}
                        </td>
                        <td className="py-2.5 px-3 text-cyan-400">
                          {col.type}
                        </td>
                        <td className="py-2.5 px-3">
                          {col.primary_key && (
                            <span className="inline-flex items-center text-amber-400 font-bold">
                              <Key className="w-3 h-3 mr-1" /> PK
                            </span>
                          )}
                          {!col.primary_key && !col.nullable && (
                            <span className="text-slate-500">NOT NULL</span>
                          )}
                          {col.nullable && (
                            <span className="text-slate-600">NULLABLE</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-purple-400">
                          {col.foreign_key || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Database Relations Graph List */}
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase font-mono tracking-wider text-slate-200">
              Active Relational Foreign Key Graph ({schemaData.relationships.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto font-mono text-[11px]">
              {schemaData.relationships.map((rel, i) => (
                <div key={i} className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">{rel.from_table}.{rel.from_column}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 mx-2 flex-shrink-0" />
                  <span className="text-cyan-400 truncate">{rel.to_table}.{rel.to_column}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
