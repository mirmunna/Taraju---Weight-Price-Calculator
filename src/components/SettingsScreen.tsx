import React, { useRef, useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Palette,
  Calculator,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  Info,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Wifi,
} from 'lucide-react';
import { AppSettings, CalculationMode, RateUnit, WeightUnit } from '../types';
import { storage } from '../services/storage';
import { feedback } from '../utils/feedback';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearHistory: () => void;
  onDataImported: () => void;
  historyCount: number;
  ratesCount: number;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
  onDataImported,
  historyCount,
  ratesCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'pending';
    message: string;
  } | null>(null);

  const [pendingImportJson, setPendingImportJson] = useState<string | null>(null);
  const [showImportModeDialog, setShowImportModeDialog] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [showResetSettingsConfirm, setShowResetSettingsConfirm] = useState(false);
  const [showFullResetConfirm, setShowFullResetConfirm] = useState(false);

  // Export Data as JSON
  const handleExport = async () => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    const data = await storage.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taraju-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON trigger
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPendingImportJson(content);
      setShowImportModeDialog(true);
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeImport = async (mode: 'merge' | 'replace') => {
    if (!pendingImportJson) return;
    setShowImportModeDialog(false);
    setImportStatus({ type: 'pending', message: 'Validating and importing data...' });

    const res = await storage.importAllData(pendingImportJson, mode);
    setPendingImportJson(null);

    if (res.success) {
      setImportStatus({ type: 'success', message: res.message });
      onDataImported();
    } else {
      setImportStatus({ type: 'error', message: res.message });
    }

    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleResetSettings = async () => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    const defaults = await storage.resetSettings();
    onUpdateSettings(defaults);
    setShowResetSettingsConfirm(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-4 pb-24 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>App Settings</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize currency, defaults, precision, audio and backups
        </p>
      </div>

      {/* Import Status Alert */}
      {importStatus && (
        <div
          className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* PWA Offline & Install Card */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-900 dark:text-emerald-200">
            <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Install Taraju for Instant Offline Use</span>
          </div>
          <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80">
            Add to your home screen. Works at the shop counter without internet connection.
          </p>
        </div>
        <div className="shrink-0">
          <PWAInstallButton />
        </div>
      </section>

      {/* 1. GENERAL SETTINGS */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" />
          <span>General</span>
        </h3>

        {/* Currency */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Currency Symbol</div>
            <div className="text-xs text-slate-500">Default is Indian Rupee (₹)</div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['₹', '$', '€', '£', 'Rs'].map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => onUpdateSettings({ ...settings, currency: curr })}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${
                  settings.currency === curr
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Decimal Precision */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Decimal Precision</div>
            <div className="text-xs text-slate-500">Number of decimal places shown</div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {[0, 1, 2, 3].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onUpdateSettings({ ...settings, decimalPrecision: p })}
                className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${
                  settings.decimalPrecision === p
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Audio & Haptic Feedback */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Sound Feedback</div>
            <div className="text-xs text-slate-500">Keypad click & calculation chime</div>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings({ ...settings, soundFeedback: !settings.soundFeedback })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              settings.soundFeedback
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {settings.soundFeedback ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{settings.soundFeedback ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Haptic Vibration</div>
            <div className="text-xs text-slate-500">Gentle touch buzz on phone keypad</div>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings({ ...settings, hapticFeedback: !settings.hapticFeedback })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              settings.hapticFeedback
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{settings.hapticFeedback ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </section>

      {/* 2. APPEARANCE SETTINGS */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5" />
          <span>Appearance</span>
        </h3>

        {/* Theme mode */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Theme</div>
            <div className="text-xs text-slate-500">Light, Dark or System setting</div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onUpdateSettings({ ...settings, theme: t })}
                className={`px-3 py-1 text-xs font-bold capitalize rounded-lg cursor-pointer transition ${
                  settings.theme === t
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CALCULATOR BEHAVIOR */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculator Preferences</span>
        </h3>

        {/* Default mode */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Default Mode</div>
            <div className="text-xs text-slate-500">Mode active on app launch</div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, defaultCalcMode: 'PRICE_TO_WEIGHT' })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${
                settings.defaultCalcMode === 'PRICE_TO_WEIGHT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Price → Wt
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, defaultCalcMode: 'WEIGHT_TO_PRICE' })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition ${
                settings.defaultCalcMode === 'WEIGHT_TO_PRICE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Wt → Price
            </button>
          </div>
        </div>

        {/* Remember last rate */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Remember Last Rate</div>
            <div className="text-xs text-slate-500">Auto-restore last typed rate upon opening</div>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings({ ...settings, rememberLastRate: !settings.rememberLastRate })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              settings.rememberLastRate
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {settings.rememberLastRate ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Quick shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Quick Shortcuts</div>
            <div className="text-xs text-slate-500">Show 1-tap ₹ and gram weight chips</div>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings({ ...settings, enableShortcuts: !settings.enableShortcuts })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              settings.enableShortcuts
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {settings.enableShortcuts ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* On-screen Keypad */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Shop Keypad</div>
            <div className="text-xs text-slate-500">Large touch numeric buttons</div>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings({ ...settings, showKeypad: !settings.showKeypad })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              settings.showKeypad
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {settings.showKeypad ? 'VISIBLE' : 'HIDDEN'}
          </button>
        </div>
      </section>

      {/* 4. DATA MANAGEMENT (Export, Import, Clear History, Reset Settings) */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          <span>Data & Backups</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Calculation History</span>
            <div className="font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">{historyCount} items</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Saved Rates</span>
            <div className="font-extrabold text-lg text-slate-900 dark:text-white mt-0.5">{ratesCount} items</div>
          </div>
        </div>

        {/* Export & Import Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-xs hover:bg-emerald-100 transition cursor-pointer active:scale-97"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer active:scale-97">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import Backup (JSON)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Clear History Button (Does NOT delete saved rates) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Clear History</div>
            <div className="text-xs text-slate-500">Deletes calculations without touching Saved Rates</div>
          </div>
          <button
            type="button"
            onClick={() => setShowClearHistoryConfirm(true)}
            disabled={historyCount === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition cursor-pointer disabled:opacity-40"
          >
            Clear History
          </button>
        </div>

        {/* Reset Settings Button (Does NOT delete saved rates or history) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm text-slate-800 dark:text-white">Reset Settings</div>
            <div className="text-xs text-slate-500">Restores defaults without deleting Rates or History</div>
          </div>
          <button
            type="button"
            onClick={() => setShowResetSettingsConfirm(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            Reset Settings
          </button>
        </div>
      </section>

      {/* 5. ABOUT APP */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">About Taraju</h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>Taraju</strong> is a fast, offline-capable mobile-first weight and price calculator
          crafted for grocery stores, market vendors, grain merchants, and everyday buyers.
          100% of calculations and storage run privately inside your device browser.
        </p>
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <span>Version 1.0.0 (PWA Ready)</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Offline Compatible</span>
        </div>
      </section>

      {/* Import Mode Modal (Replace vs Merge) */}
      {showImportModeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Import Backup Options</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              How would you like to handle your imported data?
            </p>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => executeImport('merge')}
                className="w-full p-3 rounded-xl border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-left hover:bg-emerald-100 transition cursor-pointer"
              >
                <div className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  Merge With Existing Data (Recommended)
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Combines backup records with your current history and rates.
                </div>
              </button>

              <button
                type="button"
                onClick={() => executeImport('replace')}
                className="w-full p-3 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-left hover:bg-rose-100 transition cursor-pointer"
              >
                <div className="font-bold text-xs text-rose-800 dark:text-rose-300">
                  Replace Existing Data
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Overwrites current records with the contents of the backup file.
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportModeDialog(false);
                  setPendingImportJson(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      {showClearHistoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">Clear History?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete all {historyCount} calculation records? Your Saved Rates and settings will NOT be touched.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearHistoryConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setShowClearHistoryConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Settings Confirmation Modal */}
      {showResetSettingsConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">Reset Settings?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              This will restore general preferences to factory defaults. Your Saved Rates and History will remain untouched.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetSettingsConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetSettings}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
              >
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
