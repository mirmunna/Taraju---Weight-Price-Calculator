import React from 'react';
import { Delete, CornerDownLeft, XCircle } from 'lucide-react';
import { feedback } from '../utils/feedback';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onNextField?: () => void;
  activeFieldLabel?: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onKeyPress,
  onBackspace,
  onClear,
  onNextField,
  activeFieldLabel,
  soundEnabled,
  hapticsEnabled,
}) => {
  const handleKey = (key: string) => {
    feedback.triggerTap(soundEnabled, hapticsEnabled);
    onKeyPress(key);
  };

  const handleBackspace = () => {
    feedback.triggerTap(soundEnabled, hapticsEnabled);
    onBackspace();
  };

  const handleClear = () => {
    feedback.triggerTap(soundEnabled, hapticsEnabled);
    onClear();
  };

  return (
    <div className="bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl p-2 sm:p-3 border border-slate-200 dark:border-slate-800 shadow-inner">
      {activeFieldLabel && (
        <div className="flex items-center justify-between px-2 pb-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Typing for: <strong className="text-emerald-700 dark:text-emerald-400">{activeFieldLabel}</strong></span>
          <span className="text-[10px] text-slate-400">Tap field to switch</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {/* Row 1 */}
        <button
          type="button"
          onClick={() => handleKey('7')}
          className="h-13 sm:h-14 rounded-xl bg-white dark:bg-slate-800 text-xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 active:bg-slate-200 dark:active:bg-slate-700 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleKey('8')}
          className="h-13 sm:h-14 rounded-xl bg-white dark:bg-slate-800 text-xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 active:bg-slate-200 dark:active:bg-slate-700 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleKey('9')}
          className="h-13 sm:h-14 rounded-xl bg-white dark:bg-slate-800 text-xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 active:bg-slate-200 dark:active:bg-slate-700 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          9
        </button>
        <button
          type="button"
          onClick={handleBackspace}
          aria-label="Backspace"
          className="h-13 sm:h-14 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-900/60 shadow-xs active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          <Delete className="w-5 h-5" />
        </button>

        {/* Row 2 */}
        <button
          type="button"
          onClick={() => handleKey('4')}
          className="h-13 sm:h-14 rounded-xl bg-white dark:bg-slate-800 text-xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 active:bg-slate-200 dark:active:bg-slate-700 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleKey('5')}
          className="h-13 sm:h-14 rounded-xl bg-white dark:bg-slate-800 text-xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 active:bg-slate-200 dark:active:bg-slate-700 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleKey('6')}
          className="h-13 sm:h-14 rounded-xl bg-white dark:bg-slate-800 text-xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 active:bg-slate-200 dark:active:bg-slate-700 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          6
        </button>
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear All"
          className="h-13 sm:h-14 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-bold text-sm border border-rose-200 dark:border-rose-900/60 shadow-xs active:scale-97 transition-all cursor-pointer flex flex-col items-center justify-center"
        >
          <span className="font-extrabold text-base">C</span>
          <span className="text-[9px] uppercase tracking-wider -mt-1">Clear</span>
        </button>

        {/* Row 3 */}
        <button
          type="button"
          onClick={() => handleKey('1')}
          className="h-13 sm:h-14 rounded-xl bg-white dark:bg-slate-800 text-xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 active:bg-slate-200 dark:active:bg-slate-700 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleKey('2')}
          className="h-13 sm:h-14 rounded-xl bg-white dark:bg-slate-800 text-xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 active:bg-slate-200 dark:active:bg-slate-700 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleKey('3')}
          className="h-13 sm:h-14 rounded-xl bg-white dark:bg-slate-800 text-xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 active:bg-slate-200 dark:active:bg-slate-700 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => handleKey('00')}
          className="h-13 sm:h-14 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-lg font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-300 dark:border-slate-600 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          00
        </button>

        {/* Row 4 */}
        <button
          type="button"
          onClick={() => handleKey('.')}
          className="h-13 sm:h-14 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-2xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-300 dark:border-slate-600 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          .
        </button>
        <button
          type="button"
          onClick={() => handleKey('0')}
          className="h-13 sm:h-14 rounded-xl bg-white dark:bg-slate-800 text-xl font-bold font-mono-num text-slate-800 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700/80 active:bg-slate-200 dark:active:bg-slate-700 active:scale-97 transition-all cursor-pointer flex items-center justify-center"
        >
          0
        </button>
        <button
          type="button"
          onClick={onNextField}
          aria-label="Switch Field"
          className="col-span-2 h-13 sm:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-97 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Next Field</span>
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
