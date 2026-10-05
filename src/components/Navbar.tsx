import React from 'react';
import { Calculator, History, BookmarkCheck, Settings } from 'lucide-react';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  historyCount: number;
  ratesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  historyCount,
  ratesCount,
}) => {
  const tabs = [
    {
      id: 'HOME' as AppTab,
      label: 'Calculator',
      icon: Calculator,
    },
    {
      id: 'HISTORY' as AppTab,
      label: 'History',
      icon: History,
      badge: historyCount > 0 ? historyCount : undefined,
    },
    {
      id: 'RATES' as AppTab,
      label: 'Saved Rates',
      icon: BookmarkCheck,
      badge: ratesCount > 0 ? ratesCount : undefined,
    },
    {
      id: 'SETTINGS' as AppTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors shadow-lg">
      <div className="max-w-2xl mx-auto px-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 relative transition-all cursor-pointer flex-1 select-none active:scale-95 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-emerald-50 dark:bg-emerald-950/60' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform" />
                </div>
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 min-w-4 text-center rounded-full bg-emerald-600 text-white text-[10px] font-bold leading-tight">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight truncate max-w-[80px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
