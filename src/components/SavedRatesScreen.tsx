import React, { useState } from 'react';
import {
  BookmarkCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AppSettings, RateUnit, SavedRate } from '../types';
import { formatRateUnit } from '../utils/calculator';
import { feedback } from '../utils/feedback';

interface SavedRatesScreenProps {
  savedRates: SavedRate[];
  onSaveRate: (rate: SavedRate) => void;
  onDeleteRate: (id: string) => void;
  onUseRateInCalculator: (rate: SavedRate) => void;
  settings: AppSettings;
}

export const SavedRatesScreen: React.FC<SavedRatesScreenProps> = ({
  savedRates,
  onSaveRate,
  onDeleteRate,
  onUseRateInCalculator,
  settings,
}) => {
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formRate, setFormRate] = useState('');
  const [formUnit, setFormUnit] = useState<RateUnit>('per_kg');
  const [formCategory, setFormCategory] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    setEditingId(null);
    setFormName('');
    setFormRate('');
    setFormUnit('per_kg');
    setFormCategory('Grocery');
    setFormError('');
    setIsEditing(true);
  };

  const openEditModal = (item: SavedRate) => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    setEditingId(item.id);
    setFormName(item.name);
    setFormRate(String(item.rate));
    setFormUnit(item.rateUnit);
    setFormCategory(item.category || 'Grocery');
    setFormError('');
    setIsEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Item name is required');
      return;
    }
    const num = parseFloat(formRate);
    if (isNaN(num) || num <= 0) {
      setFormError('Please enter a valid rate greater than 0');
      return;
    }

    feedback.triggerSuccess(settings.soundFeedback, settings.hapticFeedback);

    const newItem: SavedRate = {
      id: editingId || `rate-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: formName.trim(),
      rate: num,
      rateUnit: formUnit,
      category: formCategory.trim() || 'General',
      updatedAt: Date.now(),
    };

    onSaveRate(newItem);
    setIsEditing(false);
  };

  const filtered = savedRates.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 pb-24 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Saved Commodity Rates</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Store daily grocery, grain & vegetable market prices
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-700/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rate</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search saved items (e.g. Rice, Sugar, Potato)..."
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Rates Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">
              {search ? 'No matching saved items found' : 'No saved rates yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Save your frequent commodities like Rice, Sugar, Lentils, Oil, or Potato to auto-fill them with 1 tap.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Your First Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-700 transition flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight truncate">
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-400">
                      {item.category || 'Commodity'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="Edit rate"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRate(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer"
                      title="Delete rate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-mono-num text-emerald-600 dark:text-emerald-400">
                    {settings.currency}{item.rate}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {formatRateUnit(item.rateUnit)}
                  </span>
                </div>
              </div>

              {/* Use Rate Button */}
              <button
                type="button"
                onClick={() => onUseRateInCalculator(item)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 hover:text-white dark:text-slate-200 dark:hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-97 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-600"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Use in Calculator</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Rate Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit Saved Rate' : 'Add New Commodity Rate'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="mt-4 space-y-3.5">
              {formError && (
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Basmati Rice, Toor Dal, Sugar..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Rate ({settings.currency})
                </label>
                <div className="flex items-stretch gap-2">
                  <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-400 mr-2">{settings.currency}</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formRate}
                      onChange={(e) => setFormRate(e.target.value)}
                      placeholder="80"
                      className="w-full bg-transparent font-mono-num font-bold text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>

                  <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setFormUnit('per_kg')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                        formUnit === 'per_kg'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      / kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormUnit('per_100g')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                        formUnit === 'per_100g'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      / 100g
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category (Optional)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {['Grains', 'Pulses / Dal', 'Vegetables', 'Spices', 'Oils', 'Dry Fruits'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border cursor-pointer ${
                        formCategory === cat
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. Grocery, Vegetables"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md cursor-pointer transition"
                >
                  {editingId ? 'Update Rate' : 'Save Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
