import React, { useState } from 'react';
import {
  History as HistoryIcon,
  Trash2,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { CalculationHistoryItem, AppSettings, SavedRate } from '../types';
import { formatRateUnit, formatWeightDisplays } from '../utils/calculator';
import { feedback } from '../utils/feedback';

interface HistoryScreenProps {
  history: CalculationHistoryItem[];
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  onReuseCalculation: (item: CalculationHistoryItem) => void;
  settings: AppSettings;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  onDeleteHistoryItem,
  onClearHistory,
  onReuseCalculation,
  settings,
}) => {
  const [search, setSearch] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter history
  const filtered = history.filter((item) => {
    const text = `${item.itemName || ''} ${item.rate} ${item.inputAmount || ''} ${
      item.inputWeightGrams || ''
    } ${item.mode}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const handleCopy = (item: CalculationHistoryItem) => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    const dateStr = new Date(item.timestamp).toLocaleString();
    const text =
      item.mode === 'PRICE_TO_WEIGHT'
        ? `Taraju Record (${dateStr})\nItem: ${item.itemName || 'General'}\nRate: ${settings.currency}${item.rate}${formatRateUnit(item.rateUnit)}\nPaid: ${settings.currency}${item.inputAmount}\nWeight: ${item.resultWeightGrams ? formatWeightDisplays(item.resultWeightGrams).composite : ''}`
        : `Taraju Record (${dateStr})\nItem: ${item.itemName || 'General'}\nRate: ${settings.currency}${item.rate}${formatRateUnit(item.rateUnit)}\nWeight: ${item.rawWeightInput || (item.inputWeightGrams ? `${item.inputWeightGrams}g` : '')}\nPrice: ${settings.currency}${item.resultPrice?.toFixed(2)}`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = async (item: CalculationHistoryItem) => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    const text =
      item.mode === 'PRICE_TO_WEIGHT'
        ? `Taraju: Rate ${settings.currency}${item.rate}${formatRateUnit(item.rateUnit)} | ${settings.currency}${item.inputAmount} → ${item.resultWeightGrams ? formatWeightDisplays(item.resultWeightGrams).composite : ''}`
        : `Taraju: Rate ${settings.currency}${item.rate}${formatRateUnit(item.rateUnit)} | ${item.rawWeightInput} → ${settings.currency}${item.resultPrice?.toFixed(2)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Taraju Calculation', text });
      } catch {
        handleCopy(item);
      }
    } else {
      handleCopy(item);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 pb-24 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Calculation History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {history.length} {history.length === 1 ? 'record' : 'records'} saved locally
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition cursor-pointer border border-rose-200 dark:border-rose-900/60"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Search Input if entries exist */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records by rate, amount, or item..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      {/* History Items List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">
              {search ? 'No calculations match your search' : 'No calculations yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {search
                ? 'Try searching with a different rate or number.'
                : 'Perform calculations in the Calculator tab and tap "Save" to keep a persistent record on your device.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const isPriceToWeight = item.mode === 'PRICE_TO_WEIGHT';
            const weightFormatted = item.resultWeightGrams
              ? formatWeightDisplays(item.resultWeightGrams, settings.decimalPrecision)
              : null;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-2.5"
              >
                {/* Top Row: Date, Mode badge & Delete */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(item.timestamp)}</span>
                    {item.itemName && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                        {item.itemName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPriceToWeight
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {isPriceToWeight ? 'Price → Weight' : 'Weight → Price'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main calculation details */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-xs text-slate-500">
                      Rate: <strong className="font-mono-num text-slate-800 dark:text-slate-200">{settings.currency}{item.rate}{formatRateUnit(item.rateUnit)}</strong>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono-num mt-0.5">
                      {isPriceToWeight ? (
                        <>Paid: <span className="text-slate-900 dark:text-white font-bold">{settings.currency}{item.inputAmount}</span></>
                      ) : (
                        <>Weight: <span className="text-slate-900 dark:text-white font-bold">{item.rawWeightInput || (item.inputWeightGrams ? `${item.inputWeightGrams} g` : '')}</span></>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Result
                    </span>
                    <div className="font-extrabold text-xl font-mono-num text-emerald-600 dark:text-emerald-400">
                      {isPriceToWeight
                        ? weightFormatted?.composite || `${item.resultWeightGrams} g`
                        : `${settings.currency}${item.resultPrice?.toFixed(settings.decimalPrecision)}`}
                    </div>
                    {isPriceToWeight && weightFormatted && (
                      <span className="text-[11px] text-slate-400 font-mono-num block">
                        = {weightFormatted.kgStr}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Action strip */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => onReuseCalculation(item)}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Recalculate / Use in Scale</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Copy calculation"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(item)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Share calculation"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Clear History?</h3>
                <p className="text-xs text-slate-500">This will remove all recorded calculations.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your <strong>Saved Rates</strong> and <strong>Settings</strong> will remain intact. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer transition active:scale-95"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
