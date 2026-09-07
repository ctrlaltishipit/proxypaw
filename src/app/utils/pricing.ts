// ProxyPaw pricing — INR-anchored with location-based display.
//
// Research basis (Hyderabad Financial District / Gachibowli, 2026):
//   • Informal walkers: ₹100–200 per walk (no insurance, no vetting)
//   • Mid-tier services (BarkNbond, DogSpot): ₹200–400 per walk
//   • Premium (Urban Company, HUFT): ₹399–599 per 45-min visit
//   • Tech-corridor pet-care budget: ₹2,500–4,000/month is comfortable
//   • Walker payout sweet-spot: ₹200–300/hr (competitive part-time wage)
//
// Strategy: undercut mid-tier on entry (30-min trial @ ₹149), match on the
// hour-long sweet-spot (₹249), and reward longer bookings with per-minute
// discounts so walkers earn more per visit and customers feel volume value.

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD' | 'AUD' | 'CAD';

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  // Multiplier applied to an INR amount to convert into this currency.
  fromINR: number;
  // Rounding step in the target currency (psychological pricing).
  roundTo: number;
}

// Rates approximate June 2026 mid-market values; refresh from FX feed in prod.
const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', fromINR: 1, roundTo: 1 },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', fromINR: 0.012, roundTo: 0.5 },
  EUR: { code: 'EUR', symbol: '€', locale: 'en-IE', fromINR: 0.011, roundTo: 0.5 },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', fromINR: 0.0095, roundTo: 0.5 },
  AED: { code: 'AED', symbol: 'AED', locale: 'en-AE', fromINR: 0.044, roundTo: 1 },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG', fromINR: 0.016, roundTo: 0.5 },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU', fromINR: 0.018, roundTo: 0.5 },
  CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA', fromINR: 0.016, roundTo: 0.5 },
};

// Maps the browser locale region (after the dash) to a currency.
const REGION_TO_CURRENCY: Record<string, CurrencyCode> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP', UK: 'GBP',
  AE: 'AED',
  SG: 'SGD',
  AU: 'AUD',
  CA: 'CAD',
  // Eurozone
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR',
  PT: 'EUR', BE: 'EUR', AT: 'EUR', FI: 'EUR', GR: 'EUR',
};

export function detectCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'INR';
  try {
    // Time-zone hint: India shortcut.
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'INR';

    const locale = navigator.language || 'en-IN';
    const region = locale.split('-')[1]?.toUpperCase();
    if (region && REGION_TO_CURRENCY[region]) return REGION_TO_CURRENCY[region];
  } catch {
    // ignore
  }
  return 'INR';
}

function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function convertFromINR(amountINR: number, currency: CurrencyCode): number {
  const cfg = CURRENCIES[currency];
  return roundToStep(amountINR * cfg.fromINR, cfg.roundTo);
}

export function formatPrice(amountINR: number, currency: CurrencyCode = 'INR'): string {
  const cfg = CURRENCIES[currency];
  const converted = convertFromINR(amountINR, currency);
  const formatted = new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.code,
    maximumFractionDigits: cfg.roundTo < 1 ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(converted);
  return formatted;
}

// "₹249" for India, "₹249 (~$3)" for everyone else — INR-first, then local.
export function formatPriceDual(amountINR: number, currency?: CurrencyCode): string {
  const target = currency ?? detectCurrency();
  const inr = formatPrice(amountINR, 'INR');
  if (target === 'INR') return inr;
  return `${inr} (~${formatPrice(amountINR, target)})`;
}

// ---------------- Catalog ----------------
// Walk pricing — per-minute rate drops as duration grows so longer bookings
// feel like better value, while per-walk payout to the walker grows.
//
// 30 min  → ₹149  (₹4.97/min) entry/trial — undercuts mid-tier orgs
// 60 min  → ₹249  (₹4.15/min) sweet-spot — matches mid-tier on price, wins on safety
// 90 min  → ₹349  (₹3.88/min) volume tier
// 120 min → ₹449  (₹3.74/min) best value, weekend/long-walk demand
export const WALK_DURATIONS_INR = [
  { value: '30',  minutes: 30,  label: '30 min',     priceINR: 149 },
  { value: '60',  minutes: 60,  label: '1 hour',     priceINR: 249 },
  { value: '90',  minutes: 90,  label: '1.5 hours',  priceINR: 349 },
  { value: '120', minutes: 120, label: '2 hours',    priceINR: 449 },
];

// Volunteer hourly rates by tier (INR/hr). Walker keeps ~70% after platform fee.
export const VOLUNTEER_TIER_RATES_INR = {
  'Pup Scout': 199,
  'Pack Leader': 249,
  'Alpha Guardian': 299,
} as const;

export const ENTRY_PRICE_INR = WALK_DURATIONS_INR[1].priceINR; // ₹249 = "starting at"
