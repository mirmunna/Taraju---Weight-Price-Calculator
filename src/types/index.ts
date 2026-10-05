export type CalculationMode = 'PRICE_TO_WEIGHT' | 'WEIGHT_TO_PRICE';

export type RateUnit = 'per_kg' | 'per_100g' | 'per_g';

export type WeightUnit = 'g' | 'kg' | 'mg';

export type AppTab = 'HOME' | 'HISTORY' | 'RATES' | 'SETTINGS';

export interface SavedRate {
  id: string;
  name: string;
  rate: number;
  rateUnit: RateUnit;
  category?: string;
  updatedAt: number;
}

export interface CalculationHistoryItem {
  id: string;
  timestamp: number;
  mode: CalculationMode;
  rate: number;
  rateUnit: RateUnit;
  itemName?: string;
  // If PRICE_TO_WEIGHT:
  inputAmount?: number;
  resultWeightGrams?: number;
  // If WEIGHT_TO_PRICE:
  inputWeightGrams?: number;
  rawWeightInput?: string;
  resultPrice?: number;
  // Transparency breakdown:
  formula: string;
}

export interface AppSettings {
  currency: string;
  defaultWeightUnit: WeightUnit;
  defaultRateUnit: RateUnit;
  decimalPrecision: number;
  hapticFeedback: boolean;
  soundFeedback: boolean;
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  defaultCalcMode: CalculationMode;
  rememberLastRate: boolean;
  lastUsedRate: number | null;
  lastUsedRateUnit: RateUnit;
  enableShortcuts: boolean;
  showBreakdownByDefault: boolean;
  showKeypad: boolean;
}

export interface ExportData {
  version: number;
  exportedAt: string;
  calculationHistory: CalculationHistoryItem[];
  savedRates: SavedRate[];
  appSettings: AppSettings;
}
