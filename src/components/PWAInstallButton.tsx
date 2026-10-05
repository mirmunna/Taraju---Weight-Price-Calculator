import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={
          compact
            ? "flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2.5 py-1 text-xs font-semibold shadow-sm transition-all"
            : "flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 text-sm font-semibold shadow-md transition-all cursor-pointer"
        }
        title="Install Taraju on your device"
      >
        <Download className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={
            compact
              ? "flex items-center gap-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-semibold active:scale-95 transition-all"
              : "flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200 cursor-pointer"
          }
          title="Add Taraju to iPhone Home Screen"
        >
          <Smartphone className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <Download className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-xs font-bold text-emerald-700 dark:text-emerald-300">1</span>
                  <p>Tap the <strong className="text-slate-800 dark:text-slate-100 inline-flex items-center gap-1"><Share2 className="w-3.5 h-3.5 inline text-blue-500" /> Share</strong> button in your Safari toolbar.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-xs font-bold text-emerald-700 dark:text-emerald-300">2</span>
                  <p>Scroll down the list and tap <strong className="text-slate-800 dark:text-slate-100">Add to Home Screen</strong>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-xs font-bold text-emerald-700 dark:text-emerald-300">3</span>
                  <p>Tap <strong className="text-slate-800 dark:text-slate-100">Add</strong> in top right. Taraju will work offline directly from your home screen!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-98 transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
