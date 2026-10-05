import { RateUnit, WeightUnit } from '../types';

export interface CalculationResult {
  isValid: boolean;
  errorMessage?: string;
  // If Price to Weight:
  weightGrams?: number;
  weightDisplayKg?: string;
  weightDisplayG?: string;
  weightDisplayReadable?: string;
  // If Weight to Price:
  price?: number;
  priceFormatted?: string;
  // Breakdown
  ratePerGram: number;
  breakdownSteps: string[];
}

/**
 * Calculates rate per single gram based on the rate basis unit
 */
export function getRatePerGram(rate: number, rateUnit: RateUnit): number {
  if (rate <= 0 || isNaN(rate)) return 0;
  switch (rateUnit) {
    case 'per_kg':
      return rate / 1000;
    case 'per_100g':
      return rate / 100;
    case 'per_g':
      return rate;
    default:
      return rate / 1000;
  }
}

/**
 * Format rate unit string for display (e.g. "/ kg", "/ 100g")
 */
export function formatRateUnit(rateUnit: RateUnit): string {
  switch (rateUnit) {
    case 'per_kg':
      return '/ kg';
    case 'per_100g':
      return '/ 100 g';
    case 'per_g':
      return '/ g';
  }
}

/**
 * Parses smart weight inputs like:
 * "500 g", "250g", "1 kg", "1.5 kg", "2 kg 250 g", "2kg 250g", "500"
 * Returns value in grams
 */
export function parseSmartWeightInput(
  rawInput: string,
  defaultUnit: WeightUnit = 'g'
): { grams: number; isValid: boolean; normalizedText: string } {
  if (!rawInput || !rawInput.trim()) {
    return { grams: 0, isValid: false, normalizedText: '' };
  }

  const clean = rawInput.trim().toLowerCase();

  // Pattern: "X kg Y g" e.g. "2 kg 250 g" or "2kg 250g" or "2kg250g"
  const compoundMatch = clean.match(/^([\d.]+)\s*kg\s*([\d.]+)\s*g?$/);
  if (compoundMatch) {
    const kg = parseFloat(compoundMatch[1]);
    const g = parseFloat(compoundMatch[2]);
    if (!isNaN(kg) && !isNaN(g) && kg >= 0 && g >= 0) {
      const totalG = kg * 1000 + g;
      return {
        grams: totalG,
        isValid: true,
        normalizedText: `${kg} kg ${g} g`,
      };
    }
  }

  // Pattern: "X kg" e.g. "1.5 kg" or "1.5kg"
  const kgMatch = clean.match(/^([\d.]+)\s*kg$/);
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1]);
    if (!isNaN(kg) && kg >= 0) {
      return {
        grams: kg * 1000,
        isValid: true,
        normalizedText: `${kg} kg`,
      };
    }
  }

  // Pattern: "X mg" e.g. "500 mg"
  const mgMatch = clean.match(/^([\d.]+)\s*mg$/);
  if (mgMatch) {
    const mg = parseFloat(mgMatch[1]);
    if (!isNaN(mg) && mg >= 0) {
      return {
        grams: mg / 1000,
        isValid: true,
        normalizedText: `${mg} mg`,
      };
    }
  }

  // Pattern: "X g" or "X grams"
  const gMatch = clean.match(/^([\d.]+)\s*(?:g|gm|grams?)$/);
  if (gMatch) {
    const g = parseFloat(gMatch[1]);
    if (!isNaN(g) && g >= 0) {
      return {
        grams: g,
        isValid: true,
        normalizedText: `${g} g`,
      };
    }
  }

  // Plain number e.g. "250" or "1.5"
  const num = parseFloat(clean);
  if (!isNaN(num) && num >= 0) {
    if (defaultUnit === 'kg') {
      return {
        grams: num * 1000,
        isValid: true,
        normalizedText: `${num} kg`,
      };
    } else if (defaultUnit === 'mg') {
      return {
        grams: num / 1000,
        isValid: true,
        normalizedText: `${num} mg`,
      };
    } else {
      return {
        grams: num,
        isValid: true,
        normalizedText: `${num} g`,
      };
    }
  }

  return { grams: 0, isValid: false, normalizedText: rawInput };
}

/**
 * Format weight nicely in human friendly dual metric units
 */
export function formatWeightDisplays(grams: number, precision: number = 2) {
  if (grams < 0 || isNaN(grams)) {
    return {
      main: '0 g',
      alt: '0.000 kg',
      composite: '0 g',
    };
  }

  // For grams representation
  const roundedGrams = Number(grams.toFixed(precision));
  const gramsStr =
    roundedGrams % 1 === 0
      ? roundedGrams.toLocaleString('en-IN')
      : roundedGrams.toFixed(precision);

  // For kg representation
  const kg = grams / 1000;
  const kgStr =
    kg >= 1
      ? Number(kg.toFixed(3)).toString()
      : kg.toFixed(3);

  // Composite: e.g. 2 kg 250 g
  let composite = '';
  if (grams >= 1000) {
    const wholeKg = Math.floor(grams / 1000);
    const remGrams = Number((grams % 1000).toFixed(precision));
    if (remGrams === 0) {
      composite = `${wholeKg} kg`;
    } else {
      composite = `${wholeKg} kg ${remGrams % 1 === 0 ? remGrams : remGrams.toFixed(1)} g`;
    }
  } else {
    composite = `${gramsStr} g`;
  }

  return {
    gramsStr: `${gramsStr} g`,
    kgStr: `${kgStr} kg`,
    composite,
  };
}

/**
 * Format currency with Indian grouping (e.g. ₹ 1,23,456.00)
 */
export function formatCurrency(
  amount: number,
  currency: string = '₹',
  precision: number = 2
): string {
  if (isNaN(amount) || amount < 0) return `${currency} 0`;
  const rounded = Number(amount.toFixed(precision));
  // Format with en-IN locale
  const formattedNumber = rounded.toLocaleString('en-IN', {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : precision,
    maximumFractionDigits: precision,
  });
  return `${currency} ${formattedNumber}`;
}

/**
 * Perform Price -> Weight calculation
 */
export function calculatePriceToWeight(
  rate: number,
  rateUnit: RateUnit,
  customerAmount: number,
  currency: string = '₹',
  precision: number = 2
): CalculationResult {
  if (rate <= 0) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid rate greater than 0',
      ratePerGram: 0,
      breakdownSteps: [],
    };
  }

  if (customerAmount <= 0) {
    return {
      isValid: false,
      errorMessage: 'Please enter customer amount',
      ratePerGram: getRatePerGram(rate, rateUnit),
      breakdownSteps: [],
    };
  }

  const ratePerGram = getRatePerGram(rate, rateUnit);
  const weightGrams = customerAmount / ratePerGram;
  const formattedWeight = formatWeightDisplays(weightGrams, precision);

  const unitName = rateUnit === 'per_kg' ? 'kg (1,000 g)' : rateUnit === 'per_100g' ? '100 g' : 'g';
  const divisor = rateUnit === 'per_kg' ? 1000 : rateUnit === 'per_100g' ? 100 : 1;

  const breakdownSteps: string[] = [
    `Rate basis: ${currency}${rate} ${formatRateUnit(rateUnit)}`,
    `Rate per gram: ${currency}${rate} ÷ ${divisor} = ${currency}${ratePerGram.toFixed(4)} / gram`,
    `Weight calculation: ${currency}${customerAmount} ÷ ${currency}${ratePerGram.toFixed(4)} = ${weightGrams.toFixed(precision)} g`,
    `Equivalent: ${formattedWeight.gramsStr} = ${formattedWeight.kgStr}`,
  ];

  return {
    isValid: true,
    weightGrams,
    weightDisplayG: formattedWeight.gramsStr,
    weightDisplayKg: formattedWeight.kgStr,
    weightDisplayReadable: formattedWeight.composite,
    ratePerGram,
    breakdownSteps,
  };
}

/**
 * Perform Weight -> Price calculation
 */
export function calculateWeightToPrice(
  rate: number,
  rateUnit: RateUnit,
  weightInGrams: number,
  currency: string = '₹',
  precision: number = 2
): CalculationResult {
  if (rate <= 0) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid rate greater than 0',
      ratePerGram: 0,
      breakdownSteps: [],
    };
  }

  if (weightInGrams <= 0) {
    return {
      isValid: false,
      errorMessage: 'Please enter weight',
      ratePerGram: getRatePerGram(rate, rateUnit),
      breakdownSteps: [],
    };
  }

  const ratePerGram = getRatePerGram(rate, rateUnit);
  const price = weightInGrams * ratePerGram;
  const priceFormatted = formatCurrency(price, currency, precision);
  const formattedWeight = formatWeightDisplays(weightInGrams, precision);

  const divisor = rateUnit === 'per_kg' ? 1000 : rateUnit === 'per_100g' ? 100 : 1;

  const breakdownSteps: string[] = [
    `Rate basis: ${currency}${rate} ${formatRateUnit(rateUnit)}`,
    `Rate per gram: ${currency}${rate} ÷ ${divisor} = ${currency}${ratePerGram.toFixed(4)} / gram`,
    `Price calculation: ${weightInGrams.toFixed(precision)} g × ${currency}${ratePerGram.toFixed(4)} = ${priceFormatted}`,
    `Weight entered: ${formattedWeight.composite}`,
  ];

  return {
    isValid: true,
    price,
    priceFormatted,
    ratePerGram,
    breakdownSteps,
  };
}
