import React from 'react';
import { Scale, Moon, Sun, Monitor, Bookmark, Sparkles } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { AppSettings, SavedRate } from '../types';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenRates: () => void;
  savedRates: SavedRate[];
  activeRateItemName?: string;
  onSelectSavedRate: (rate: SavedRate) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenRates,
  savedRates,
  activeRateItemName,
  onSelectSavedRate,
}) => {
  const toggleTheme = () => {
    const nextTheme =
      settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'system' : 'light';
    onUpdateSettings({ ...settings, theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                Taraju
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Weight & Price Calculator
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <PWAInstallButton compact />

          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={`Current theme: ${settings.theme}. Click to change`}
          >
            {settings.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : settings.theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Monitor className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
