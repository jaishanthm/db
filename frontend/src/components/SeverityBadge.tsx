import React from 'react';
import { Severity } from '../types/api';

interface Props {
  severity: Severity | string;
  className?: string;
}

export const SeverityBadge: React.FC<Props> = ({ severity, className = '' }) => {
  const norm = severity.toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  if (norm.includes('critical')) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (norm.includes('high')) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (norm.includes('medium')) {
    colorClasses = 'bg-cyan-50 text-cyan-800 border-cyan-200';
  } else if (norm.includes('low')) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide uppercase border ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {severity}
    </span>
  );
};
