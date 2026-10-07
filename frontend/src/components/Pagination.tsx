import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  totalItems?: number;
  perPage?: number;
}

export const Pagination: React.FC<Props> = ({
  page,
  totalPages,
  onPageChange,
  totalItems,
  perPage = 12
}) => {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * perPage + 1;
  const endItem = totalItems ? Math.min(page * perPage, totalItems) : page * perPage;

  return (
    <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-3 sm:px-6 mt-4">
      <div className="text-xs text-slate-400">
        {totalItems ? (
          <>Showing <span className="font-semibold text-slate-200">{startItem}</span> to <span className="font-semibold text-slate-200">{endItem}</span> of <span className="font-semibold text-slate-200">{totalItems}</span> results</>
        ) : (
          <>Page {page} of {totalPages}</>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center px-3 py-1.5 rounded text-xs font-medium border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
        </button>
        <span className="text-xs font-mono px-2 text-slate-300">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center px-3 py-1.5 rounded text-xs font-medium border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
};
