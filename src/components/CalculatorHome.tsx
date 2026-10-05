import React, { useState, useEffect, useId } from 'react';
import {
  ArrowRightLeft,
  RotateCcw,
  Copy,
  Share2,
  Check,
  Bookmark,
  Sparkles,
  Layers,
  History,
  Info,
  Scale,
  PlusCircle,
} from 'lucide-react';
import { AppSettings, CalculationHistoryItem, CalculationMode, RateUnit, SavedRate, WeightUnit } from '../types';
import {
  calculatePriceToWeight,
  calculateWeightToPrice,
  formatCurrency,
  formatRateUnit,
  formatWeightDisplays,
  parseSmartWeightInput,
} from '../utils/calculator';
import { feedback } from '../utils/feedback';
import { Keypad } from './Keypad';
import { CalculationBreakdown } from './CalculationBreakdown';
import { SavedRatesPickerModal } from './SavedRatesPickerModal';

interface CalculatorHomeProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  savedRates: SavedRate[];
  onAddHistory: (item: CalculationHistoryItem) => void;
  onNavigateToRates: () => void;
  onNavigateToHistory: () => void;
  externalRateSelection?: SavedRate | null;
  externalReusedCalculation?: CalculationHistoryItem | null;
}

export const CalculatorHome: React.FC<CalculatorHomeProps> = ({
  settings,
  onUpdateSettings,
  savedRates,
  onAddHistory,
  onNavigateToRates,
  onNavigateToHistory,
  externalRateSelection,
  externalReusedCalculation,
}) => {
  // Mode: PRICE_TO_WEIGHT or WEIGHT_TO_PRICE
  const [mode, setMode] = useState<CalculationMode>(settings.defaultCalcMode || 'PRICE_TO_WEIGHT');

  // Inputs as strings for responsive editing
  const [rateStr, setRateStr] = useState<string>(
    settings.rememberLastRate && settings.lastUsedRate ? String(settings.lastUsedRate) : '80'
  );
  const [rateUnit, setRateUnit] = useState<RateUnit>(settings.defaultRateUnit || 'per_kg');

  // Active item name if chosen from saved rates
  const [selectedItemName, setSelectedItemName] = useState<string | undefined>('General Item');

  // Input for Price -> Weight: Customer Pays ₹
  const [customerAmountStr, setCustomerAmountStr] = useState<string>('20');

  // Input for Weight -> Price: Weight amount & unit
  const [weightInputStr, setWeightInputStr] = useState<string>('250');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('g');

  // React to external rate selection
  useEffect(() => {
    if (externalRateSelection) {
      setRateStr(String(externalRateSelection.rate));
      setRateUnit(externalRateSelection.rateUnit);
      setSelectedItemName(externalRateSelection.name);
    }
  }, [externalRateSelection]);

  // React to reused calculation from history
  useEffect(() => {
    if (externalReusedCalculation) {
      setMode(externalReusedCalculation.mode);
      setRateStr(String(externalReusedCalculation.rate));
      setRateUnit(externalReusedCalculation.rateUnit);
      if (externalReusedCalculation.itemName) {
        setSelectedItemName(externalReusedCalculation.itemName);
      }
      if (externalReusedCalculation.mode === 'PRICE_TO_WEIGHT' && externalReusedCalculation.inputAmount !== undefined) {
        setCustomerAmountStr(String(externalReusedCalculation.inputAmount));
      } else if (externalReusedCalculation.mode === 'WEIGHT_TO_PRICE') {
        if (externalReusedCalculation.rawWeightInput) {
          setWeightInputStr(externalReusedCalculation.rawWeightInput.replace(/[^0-9.]/g, ''));
        } else if (externalReusedCalculation.inputWeightGrams !== undefined) {
          setWeightInputStr(String(externalReusedCalculation.inputWeightGrams));
          setWeightUnit('g');
        }
      }
    }
  }, [externalReusedCalculation]);

  // Active input field targeted by the on-screen keypad
  // 'rate' | 'amount' | 'weight'
  const [activeKeypadTarget, setActiveKeypadTarget] = useState<'rate' | 'amount' | 'weight'>(
    mode === 'PRICE_TO_WEIGHT' ? 'amount' : 'weight'
  );

  // Modal for selecting saved rate
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  // Sync mode changes with default active keypad target
  const handleModeSwitch = (newMode: CalculationMode) => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    setMode(newMode);
    setActiveKeypadTarget(newMode === 'PRICE_TO_WEIGHT' ? 'amount' : 'weight');
  };

  // Perform Calculation Live
  const numRate = parseFloat(rateStr) || 0;
  const numCustomerAmount = parseFloat(customerAmountStr) || 0;

  // Weight parsing
  const parsedWeight = parseSmartWeightInput(weightInputStr, weightUnit);
  const weightInGrams = parsedWeight.grams;

  // Calculation results
  const priceToWeightResult = calculatePriceToWeight(
    numRate,
    rateUnit,
    numCustomerAmount,
    settings.currency,
    settings.decimalPrecision
  );

  const weightToPriceResult = calculateWeightToPrice(
    numRate,
    rateUnit,
    weightInGrams,
    settings.currency,
    settings.decimalPrecision
  );

  const activeResult = mode === 'PRICE_TO_WEIGHT' ? priceToWeightResult : weightToPriceResult;

  // Save last used rate to settings if enabled
  useEffect(() => {
    if (settings.rememberLastRate && numRate > 0) {
      onUpdateSettings({
        ...settings,
        lastUsedRate: numRate,
        lastUsedRateUnit: rateUnit,
      });
    }
  }, [numRate, rateUnit]);

  // Keypad Handlers
  const handleKeypadPress = (val: string) => {
    const updateStr = (prev: string) => {
      // Prevent multiple decimals
      if (val === '.' && prev.includes('.')) return prev;
      // Leading zero replacement
      if (prev === '0' && val !== '.') return val;
      // Max length limit
      if (prev.length >= 8) return prev;
      return prev + val;
    };

    if (activeKeypadTarget === 'rate') {
      setRateStr((prev) => updateStr(prev));
    } else if (activeKeypadTarget === 'amount') {
      setCustomerAmountStr((prev) => updateStr(prev));
    } else {
      setWeightInputStr((prev) => updateStr(prev));
    }
  };

  const handleKeypadBackspace = () => {
    const backspace = (prev: string) => (prev.length <= 1 ? '' : prev.slice(0, -1));
    if (activeKeypadTarget === 'rate') {
      setRateStr((prev) => backspace(prev));
    } else if (activeKeypadTarget === 'amount') {
      setCustomerAmountStr((prev) => backspace(prev));
    } else {
      setWeightInputStr((prev) => backspace(prev));
    }
  };

  const handleClear = () => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    if (mode === 'PRICE_TO_WEIGHT') {
      setCustomerAmountStr('');
      setActiveKeypadTarget('amount');
    } else {
      setWeightInputStr('');
      setActiveKeypadTarget('weight');
    }
  };

  const handleNextField = () => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    if (activeKeypadTarget === 'rate') {
      setActiveKeypadTarget(mode === 'PRICE_TO_WEIGHT' ? 'amount' : 'weight');
    } else {
      setActiveKeypadTarget('rate');
    }
  };

  // Quick Amount Buttons: ₹5, ₹10, ₹20, ₹50, ₹100, ₹200, ₹500
  const handleQuickAmount = (amt: number) => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    setCustomerAmountStr(String(amt));
    setActiveKeypadTarget('amount');
    if (mode !== 'PRICE_TO_WEIGHT') {
      setMode('PRICE_TO_WEIGHT');
    }
  };

  // Quick Weight Buttons: 50g, 100g, 200g, 250g, 500g, 750g, 1kg, 1.5kg, 2kg, 5kg
  const handleQuickWeight = (val: string, unit: WeightUnit) => {
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
    setWeightInputStr(val);
    setWeightUnit(unit);
    setActiveKeypadTarget('weight');
    if (mode !== 'WEIGHT_TO_PRICE') {
      setMode('WEIGHT_TO_PRICE');
    }
  };

  // Save calculation to history
  const handleSaveToHistory = () => {
    if (!activeResult.isValid) return;

    feedback.triggerSuccess(settings.soundFeedback, settings.hapticFeedback);

    const historyItem: CalculationHistoryItem = {
      id: `calc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      mode,
      rate: numRate,
      rateUnit,
      itemName: selectedItemName,
      formula: activeResult.breakdownSteps.join(' | '),
      ...(mode === 'PRICE_TO_WEIGHT'
        ? {
            inputAmount: numCustomerAmount,
            resultWeightGrams: activeResult.weightGrams,
          }
        : {
            inputWeightGrams: weightInGrams,
            rawWeightInput: `${weightInputStr} ${weightUnit}`,
            resultPrice: activeResult.price,
          }),
    };

    onAddHistory(historyItem);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  // Copy result text
  const handleCopyResult = () => {
    if (!activeResult.isValid) return;
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);

    const shareText =
      mode === 'PRICE_TO_WEIGHT'
        ? `Taraju Calculation\nRate: ${settings.currency}${numRate} ${formatRateUnit(rateUnit)}\nAmount: ${settings.currency}${numCustomerAmount}\nWeight: ${activeResult.weightDisplayReadable || activeResult.weightDisplayG} (${activeResult.weightDisplayKg})`
        : `Taraju Calculation\nRate: ${settings.currency}${numRate} ${formatRateUnit(rateUnit)}\nWeight: ${parsedWeight.normalizedText}\nPrice: ${activeResult.priceFormatted}`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share calculation
  const handleShareResult = async () => {
    if (!activeResult.isValid) return;
    feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);

    const text =
      mode === 'PRICE_TO_WEIGHT'
        ? `Taraju: Rate ${settings.currency}${numRate}${formatRateUnit(rateUnit)} | Amount: ${settings.currency}${numCustomerAmount} → Weight: ${activeResult.weightDisplayReadable || activeResult.weightDisplayG}`
        : `Taraju: Rate ${settings.currency}${numRate}${formatRateUnit(rateUnit)} | Weight: ${parsedWeight.normalizedText} → Price: ${activeResult.priceFormatted}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Taraju Calculation',
          text,
        });
      } catch {
        handleCopyResult();
      }
    } else {
      handleCopyResult();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-3 pb-24 space-y-3.5">
      {/* 1. Mode Switcher */}
      <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => handleModeSwitch('PRICE_TO_WEIGHT')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'PRICE_TO_WEIGHT'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Price → Weight</span>
          <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(₹ to g)</span>
        </button>

        <button
          type="button"
          onClick={() => handleModeSwitch('WEIGHT_TO_PRICE')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'WEIGHT_TO_PRICE'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Weight → Price</span>
          <span className="text-[10px] opacity-75 font-normal hidden sm:inline">(g to ₹)</span>
        </button>
      </div>

      {/* 2. Rate Configuration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span>Rate</span>
            {selectedItemName && (
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200 dark:border-emerald-800/60">
                {selectedItemName}
              </span>
            )}
          </label>

          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-emerald-200/60 dark:border-emerald-800/40"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Rates</span>
          </button>
        </div>

        {/* Rate Input + Unit Switcher */}
        <div className="flex items-stretch gap-2">
          {/* Rate Number */}
          <div
            onClick={() => setActiveKeypadTarget('rate')}
            className={`flex-1 flex items-center bg-slate-50 dark:bg-slate-850 px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
              activeKeypadTarget === 'rate'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-slate-500 dark:text-slate-400 text-lg mr-2 select-none">
              {settings.currency}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={rateStr}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                setRateStr(val);
              }}
              onFocus={() => setActiveKeypadTarget('rate')}
              placeholder="0"
              className="w-full bg-transparent text-xl sm:text-2xl font-bold font-mono-num text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          {/* Rate Basis: per kg / per 100g */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => {
                feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
                setRateUnit('per_kg');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                rateUnit === 'per_kg'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              / kg
            </button>
            <button
              type="button"
              onClick={() => {
                feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
                setRateUnit('per_100g');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                rateUnit === 'per_100g'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              / 100 g
            </button>
          </div>
        </div>

        {/* Quick rate badges from popular staples */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar text-xs">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Quick rates:</span>
          {[40, 50, 60, 80, 100, 120, 150].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
                setRateStr(String(r));
                setSelectedItemName(undefined);
              }}
              className={`px-2 py-0.5 rounded-md font-mono-num font-semibold text-xs border transition-all cursor-pointer shrink-0 ${
                rateStr === String(r)
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {settings.currency}{r}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Primary Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {mode === 'PRICE_TO_WEIGHT' ? 'Customer Pays' : 'Weight of Item'}
          </label>
          <span className="text-[11px] text-slate-400">
            {mode === 'PRICE_TO_WEIGHT' ? 'Amount in Rupee (₹)' : 'e.g. 250g or 1.5kg'}
          </span>
        </div>

        {mode === 'PRICE_TO_WEIGHT' ? (
          /* Customer Pays Input */
          <div
            onClick={() => setActiveKeypadTarget('amount')}
            className={`flex items-center bg-slate-50 dark:bg-slate-850 px-3.5 py-3 rounded-xl border-2 transition-all cursor-pointer ${
              activeKeypadTarget === 'amount'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-2xl mr-2 select-none">
              {settings.currency}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={customerAmountStr}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                setCustomerAmountStr(val);
              }}
              onFocus={() => setActiveKeypadTarget('amount')}
              placeholder="0"
              className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold font-mono-num text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        ) : (
          /* Weight Input + Unit */
          <div className="flex items-stretch gap-2">
            <div
              onClick={() => setActiveKeypadTarget('weight')}
              className={`flex-1 flex items-center bg-slate-50 dark:bg-slate-850 px-3.5 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                activeKeypadTarget === 'weight'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <input
                type="text"
                inputMode="decimal"
                value={weightInputStr}
                onChange={(e) => {
                  setWeightInputStr(e.target.value);
                }}
                onFocus={() => setActiveKeypadTarget('weight')}
                placeholder="250"
                className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold font-mono-num text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            {/* Weight Unit Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => {
                  feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
                  setWeightUnit('g');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  weightUnit === 'g'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Grams (g)
              </button>
              <button
                type="button"
                onClick={() => {
                  feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
                  setWeightUnit('kg');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  weightUnit === 'kg'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                kg
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Large Digital Scale Style Result Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-5 sm:p-6 shadow-xl border border-emerald-900/60 transition-all">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-widest text-[11px]">
              <Scale className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>{mode === 'PRICE_TO_WEIGHT' ? 'Weight to Weigh (तराज़ू)' : 'Total Price to Collect'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {activeResult.isValid && (
                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  className="px-2.5 py-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  title="Save this calculation to History"
                >
                  {savedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Large Main Result Readout */}
          <div className="py-2">
            {activeResult.isValid ? (
              mode === 'PRICE_TO_WEIGHT' ? (
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-extrabold text-4xl sm:text-6xl font-mono-num tracking-tight text-white scale-lcd-glow">
                      {activeResult.weightDisplayReadable || activeResult.weightDisplayG}
                    </span>
                  </div>

                  {/* Equivalent Values */}
                  <div className="mt-2 flex items-center gap-3 text-xs sm:text-sm text-emerald-300/90 font-mono-num">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-900/40 border border-emerald-700/40">
                      = {activeResult.weightDisplayKg}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-900/40 border border-emerald-700/40">
                      = {activeResult.weightDisplayG}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-4xl sm:text-6xl font-mono-num tracking-tight text-emerald-400 scale-lcd-glow">
                      {activeResult.priceFormatted}
                    </span>
                  </div>

                  <div className="mt-2 text-xs sm:text-sm text-emerald-300/80 font-mono-num">
                    for weight: <strong className="text-white font-bold">{parsedWeight.normalizedText}</strong>
                  </div>
                </div>
              )
            ) : (
              <div className="py-4 text-slate-400 text-sm">
                {activeResult.errorMessage || 'Enter rate and amount to calculate'}
              </div>
            )}
          </div>

          {/* Bottom Action Bar inside result card */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="text-[11px] text-slate-400">
              Rate: <span className="text-emerald-300 font-mono-num font-semibold">{settings.currency}{numRate}{formatRateUnit(rateUnit)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyResult}
                disabled={!activeResult.isValid}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareResult}
                disabled={!activeResult.isValid}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-medium flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Shortcut Buttons (Amounts & Weights) */}
      {settings.enableShortcuts && (
        <div className="space-y-3">
          {/* Quick Amounts */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-[11px] uppercase tracking-wider">Quick Amounts (Customer Pays)</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">1-Tap Calculate</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[5, 10, 20, 50, 100, 200, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className={`flex-1 min-w-[50px] py-2 rounded-xl text-center font-mono-num font-bold text-xs sm:text-sm border transition-all cursor-pointer active:scale-95 ${
                    mode === 'PRICE_TO_WEIGHT' && customerAmountStr === String(amt)
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}
                >
                  {settings.currency}{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Weights */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-[11px] uppercase tracking-wider">Quick Weights</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Common Portions</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap">
              {[
                { label: '50g', val: '50', unit: 'g' as WeightUnit },
                { label: '100g', val: '100', unit: 'g' as WeightUnit },
                { label: '200g', val: '200', unit: 'g' as WeightUnit },
                { label: '250g', val: '250', unit: 'g' as WeightUnit },
                { label: '500g', val: '500', unit: 'g' as WeightUnit },
                { label: '750g', val: '750', unit: 'g' as WeightUnit },
                { label: '1 kg', val: '1', unit: 'kg' as WeightUnit },
                { label: '1.5 kg', val: '1.5', unit: 'kg' as WeightUnit },
                { label: '2 kg', val: '2', unit: 'kg' as WeightUnit },
                { label: '5 kg', val: '5', unit: 'kg' as WeightUnit },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickWeight(item.val, item.unit)}
                  className={`py-2 px-2 rounded-xl text-center font-mono-num font-bold text-xs border transition-all cursor-pointer active:scale-95 sm:flex-1 ${
                    mode === 'WEIGHT_TO_PRICE' && weightInputStr === item.val && weightUnit === item.unit
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. On-Screen Numeric Keypad (Optimized for One-Hand Mobile Shop-Counter Use) */}
      {settings.showKeypad && (
        <div className="pt-1">
          <Keypad
            onKeyPress={handleKeypadPress}
            onBackspace={handleKeypadBackspace}
            onClear={handleClear}
            onNextField={handleNextField}
            activeFieldLabel={
              activeKeypadTarget === 'rate'
                ? `Rate (${settings.currency} ${formatRateUnit(rateUnit)})`
                : activeKeypadTarget === 'amount'
                ? `Customer Pays (${settings.currency})`
                : `Weight (${weightUnit})`
            }
            soundEnabled={settings.soundFeedback}
            hapticsEnabled={settings.hapticFeedback}
          />
        </div>
      )}

      {/* 7. Calculation Breakdown (Collapsible) */}
      <CalculationBreakdown
        steps={activeResult.breakdownSteps}
        isOpenDefault={settings.showBreakdownByDefault}
      />

      {/* Saved Rates Picker Modal */}
      <SavedRatesPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        savedRates={savedRates}
        onSelectRate={(rateItem) => {
          feedback.triggerTap(settings.soundFeedback, settings.hapticFeedback);
          setRateStr(String(rateItem.rate));
          setRateUnit(rateItem.rateUnit);
          setSelectedItemName(rateItem.name);
        }}
        onNavigateToRatesTab={onNavigateToRates}
        currency={settings.currency}
      />
    </div>
  );
};
