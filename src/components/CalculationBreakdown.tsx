import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Check, Copy } from 'lucide-react';

interface CalculationBreakdownProps {
  steps: string[];
  isOpenDefault?: boolean;
}

export const CalculationBreakdown: React.FC<CalculationBreakdownProps> = ({
  steps,
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [copied, setCopied] = useState(false);

  if (!steps || steps.length === 0) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(steps.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>How this was calculated</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-[11px]">{isOpen ? 'Hide' : 'Show formula'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-3.5 pb-3 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 font-mono-num space-y-1">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  {idx + 1}.
                </span>
                <span className="text-slate-700 dark:text-slate-200">{step}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied steps!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy steps</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
