import React from 'react';
import { Severity } from '../types/api';

interface Props {
  severity: Severity | string;
  className?: string;
}

export const SeverityBadge: React.FC<Props> = ({ severity, className = '' }) => {
  const norm = severity.toLowerCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  if (norm.includes('critical')) {
    colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-800/80';
  } else if (norm.includes('high')) {
    colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-800/80';
  } else if (norm.includes('medium')) {
    colorClasses = 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
  } else if (norm.includes('low')) {
    colorClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
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
