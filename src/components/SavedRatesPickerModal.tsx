import React, { useState } from 'react';
import { X, Search, Plus, Bookmark, ArrowRight } from 'lucide-react';
import { SavedRate } from '../types';
import { formatRateUnit } from '../utils/calculator';

interface SavedRatesPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedRates: SavedRate[];
  onSelectRate: (rate: SavedRate) => void;
  onNavigateToRatesTab: () => void;
  currency: string;
}

export const SavedRatesPickerModal: React.FC<SavedRatesPickerModalProps> = ({
  isOpen,
  onClose,
  savedRates,
  onSelectRate,
  onNavigateToRatesTab,
  currency,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = savedRates.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                Select Saved Rate
              </h3>
              <p className="text-xs text-slate-500">Pick an item to auto-fill its rate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items (e.g. Rice, Sugar)..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>
        </div>

        {/* Items List */}
        <div className="overflow-y-auto p-3 space-y-2 flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-500">
              <p className="text-sm">No matching saved rates found</p>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToRatesTab();
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add new item in Saved Rates</span>
              </button>
            </div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectRate(item);
                  onClose();
                }}
                className="w-full p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-850 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    {item.name}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {item.category || 'Commodity'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono-num font-bold text-emerald-600 dark:text-emerald-400 text-base">
                    {currency}{item.rate}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {formatRateUnit(item.rateUnit)}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">{savedRates.length} saved items</span>
          <button
            onClick={() => {
              onClose();
              onNavigateToRatesTab();
            }}
            className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
          >
            <span>Manage All Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
