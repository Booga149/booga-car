/**
 * Saudi Arabia Shipping System
 * Complete shipping calculator with all Saudi regions, cities, and carrier pricing
 */

// ═══ Saudi Regions & Cities ═══

export interface SaudiCity {
  nameAr: string;
  nameEn: string;
  region: string;
  zone: ShippingZone;
}

export type ShippingZone = 'central' | 'western' | 'eastern' | 'northern' | 'southern';

export type ShippingCarrier = 'aramex' | 'smsa' | 'zajil' | 'spl';

export type ShippingSpeed = 'standard' | 'express';

export interface ShippingOption {
  carrier: ShippingCarrier;
  carrierNameAr: string;
  carrierLogo: string;
  speed: ShippingSpeed;
  speedNameAr: string;
  price: number;
  currency: string;
  estimatedDays: { min: number; max: number };
  estimatedDaysText: string;
  freeShippingThreshold: number;
  isFreeShipping: boolean;
}

export interface ShippingQuote {
  city: SaudiCity;
  options: ShippingOption[];
  cheapest: ShippingOption;
  fastest: ShippingOption;
}

// All 13 Saudi regions with major cities
export const SAUDI_REGIONS: Record<string, { nameAr: string; zone: ShippingZone }> = {
  'riyadh': { nameAr: 'منطقة الرياض', zone: 'central' },
  'makkah': { nameAr: 'منطقة مكة المكرمة', zone: 'western' },
  'madinah': { nameAr: 'منطقة المدينة المنورة', zone: 'western' },
  'eastern': { nameAr: 'المنطقة الشرقية', zone: 'eastern' },
  'qassim': { nameAr: 'منطقة القصيم', zone: 'central' },
  'hail': { nameAr: 'منطقة حائل', zone: 'northern' },
  'tabuk': { nameAr: 'منطقة تبوك', zone: 'northern' },
  'northern_borders': { nameAr: 'منطقة الحدود الشمالية', zone: 'northern' },
  'jouf': { nameAr: 'منطقة الجوف', zone: 'northern' },
  'asir': { nameAr: 'منطقة عسير', zone: 'southern' },
  'najran': { nameAr: 'منطقة نجران', zone: 'southern' },
  'jazan': { nameAr: 'منطقة جازان', zone: 'southern' },
  'bahah': { nameAr: 'منطقة الباحة', zone: 'southern' },
};

export const SAUDI_CITIES: Record<string, SaudiCity> = {
  // Central
  'riyadh': { nameAr: 'الرياض', nameEn: 'Riyadh', region: 'riyadh', zone: 'central' },
  'kharj': { nameAr: 'الخرج', nameEn: 'Al Kharj', region: 'riyadh', zone: 'central' },
  'dawadmi': { nameAr: 'الدوادمي', nameEn: 'Ad Dawadmi', region: 'riyadh', zone: 'central' },
  'majmaah': { nameAr: 'المجمعة', nameEn: 'Al Majmaah', region: 'riyadh', zone: 'central' },
  'aflaj': { nameAr: 'الأفلاج', nameEn: 'Al Aflaj', region: 'riyadh', zone: 'central' },
  'hotat_bani_tamim': { nameAr: 'حوطة بني تميم', nameEn: 'Hotat Bani Tamim', region: 'riyadh', zone: 'central' },
  'wadi_dawasir': { nameAr: 'وادي الدواسر', nameEn: 'Wadi ad-Dawasir', region: 'riyadh', zone: 'central' },
  'buraidah': { nameAr: 'بريدة', nameEn: 'Buraydah', region: 'qassim', zone: 'central' },
  'unaizah': { nameAr: 'عنيزة', nameEn: 'Unaizah', region: 'qassim', zone: 'central' },
  'rass': { nameAr: 'الرس', nameEn: 'Ar Rass', region: 'qassim', zone: 'central' },

  // Western
  'jeddah': { nameAr: 'جدة', nameEn: 'Jeddah', region: 'makkah', zone: 'western' },
  'makkah': { nameAr: 'مكة المكرمة', nameEn: 'Makkah', region: 'makkah', zone: 'western' },
  'taif': { nameAr: 'الطائف', nameEn: 'Taif', region: 'makkah', zone: 'western' },
  'rabigh': { nameAr: 'رابغ', nameEn: 'Rabigh', region: 'makkah', zone: 'western' },
  'qunfudhah': { nameAr: 'القنفذة', nameEn: 'Al Qunfudhah', region: 'makkah', zone: 'western' },
  'madinah': { nameAr: 'المدينة المنورة', nameEn: 'Madinah', region: 'madinah', zone: 'western' },
  'yanbu': { nameAr: 'ينبع', nameEn: 'Yanbu', region: 'madinah', zone: 'western' },
  'badr': { nameAr: 'بدر', nameEn: 'Badr', region: 'madinah', zone: 'western' },

  // Eastern
  'dammam': { nameAr: 'الدمام', nameEn: 'Dammam', region: 'eastern', zone: 'eastern' },
  'khobar': { nameAr: 'الخبر', nameEn: 'Al Khobar', region: 'eastern', zone: 'eastern' },
  'dhahran': { nameAr: 'الظهران', nameEn: 'Dhahran', region: 'eastern', zone: 'eastern' },
  'jubail': { nameAr: 'الجبيل', nameEn: 'Al Jubail', region: 'eastern', zone: 'eastern' },
  'qatif': { nameAr: 'القطيف', nameEn: 'Al Qatif', region: 'eastern', zone: 'eastern' },
  'ahsa': { nameAr: 'الأحساء', nameEn: 'Al-Ahsa', region: 'eastern', zone: 'eastern' },
  'hafar_batin': { nameAr: 'حفر الباطن', nameEn: 'Hafar Al-Batin', region: 'eastern', zone: 'eastern' },

  // Northern
  'hail': { nameAr: 'حائل', nameEn: 'Hail', region: 'hail', zone: 'northern' },
  'tabuk': { nameAr: 'تبوك', nameEn: 'Tabuk', region: 'tabuk', zone: 'northern' },
  'arar': { nameAr: 'عرعر', nameEn: 'Arar', region: 'northern_borders', zone: 'northern' },
  'rafha': { nameAr: 'رفحاء', nameEn: 'Rafha', region: 'northern_borders', zone: 'northern' },
  'sakaka': { nameAr: 'سكاكا', nameEn: 'Sakaka', region: 'jouf', zone: 'northern' },
  'dawmat_jandal': { nameAr: 'دومة الجندل', nameEn: 'Dawmat Al Jandal', region: 'jouf', zone: 'northern' },

  // Southern
  'abha': { nameAr: 'أبها', nameEn: 'Abha', region: 'asir', zone: 'southern' },
  'khamis_mushait': { nameAr: 'خميس مشيط', nameEn: 'Khamis Mushait', region: 'asir', zone: 'southern' },
  'bisha': { nameAr: 'بيشة', nameEn: 'Bisha', region: 'asir', zone: 'southern' },
  'najran': { nameAr: 'نجران', nameEn: 'Najran', region: 'najran', zone: 'southern' },
  'jazan': { nameAr: 'جازان', nameEn: 'Jazan', region: 'jazan', zone: 'southern' },
  'sabya': { nameAr: 'صبيا', nameEn: 'Sabya', region: 'jazan', zone: 'southern' },
  'bahah': { nameAr: 'الباحة', nameEn: 'Al Bahah', region: 'bahah', zone: 'southern' },
};

// ═══ Carrier Info ═══

export const CARRIERS: Record<ShippingCarrier, { nameAr: string; nameEn: string; logo: string; trackingUrl: string }> = {
  aramex: {
    nameAr: 'أرامكس',
    nameEn: 'Aramex',
    logo: '📦',
    trackingUrl: 'https://www.aramex.com/sa/ar/track/results?ShipmentNumber=',
  },
  smsa: {
    nameAr: 'SMSA إكسبريس',
    nameEn: 'SMSA Express',
    logo: '🚚',
    trackingUrl: 'https://www.smsaexpress.com/sa/trackingdetails?tracknumbers=',
  },
  zajil: {
    nameAr: 'زاجل إكسبريس',
    nameEn: 'Zajil Express',
    logo: '📮',
    trackingUrl: 'https://zajil.com/tracking/',
  },
  spl: {
    nameAr: 'سُبل (البريد السعودي)',
    nameEn: 'SPL (Saudi Post)',
    logo: '✉️',
    trackingUrl: 'https://www.spl.com.sa/ar/trackingdetails?tracknumbers=',
  },
};

// ═══ Pricing Engine ═══

// Base prices per zone (in SAR) for standard first KG
const BASE_PRICES: Record<ShippingZone, Record<ShippingCarrier, { standard: number; express: number }>> = {
  central: {
    aramex: { standard: 20, express: 35 },
    smsa: { standard: 18, express: 32 },
    zajil: { standard: 15, express: 28 },
    spl: { standard: 12, express: 25 },
  },
  western: {
    aramex: { standard: 25, express: 40 },
    smsa: { standard: 22, express: 38 },
    zajil: { standard: 18, express: 33 },
    spl: { standard: 15, express: 28 },
  },
  eastern: {
    aramex: { standard: 25, express: 40 },
    smsa: { standard: 22, express: 38 },
    zajil: { standard: 18, express: 33 },
    spl: { standard: 15, express: 28 },
  },
  northern: {
    aramex: { standard: 30, express: 50 },
    smsa: { standard: 28, express: 45 },
    zajil: { standard: 22, express: 38 },
    spl: { standard: 18, express: 33 },
  },
  southern: {
    aramex: { standard: 30, express: 50 },
    smsa: { standard: 28, express: 45 },
    zajil: { standard: 22, express: 38 },
    spl: { standard: 18, express: 33 },
  },
};

// Extra per KG after first KG
const EXTRA_PER_KG: Record<ShippingCarrier, number> = {
  aramex: 5,
  smsa: 4,
  zajil: 3,
  spl: 2,
};

// Delivery days by zone
const DELIVERY_DAYS: Record<ShippingZone, { standard: { min: number; max: number }; express: { min: number; max: number } }> = {
  central: { standard: { min: 2, max: 4 }, express: { min: 1, max: 2 } },
  western: { standard: { min: 3, max: 5 }, express: { min: 1, max: 2 } },
  eastern: { standard: { min: 3, max: 5 }, express: { min: 1, max: 2 } },
  northern: { standard: { min: 4, max: 7 }, express: { min: 2, max: 3 } },
  southern: { standard: { min: 4, max: 7 }, express: { min: 2, max: 3 } },
};

// Free shipping threshold per carrier (order total in SAR)
const FREE_SHIPPING_THRESHOLD: Record<ShippingCarrier, number> = {
  aramex: 500,
  smsa: 500,
  zajil: 400,
  spl: 300,
};

// ═══ Calculator Functions ═══

/**
 * Calculate shipping cost for a specific carrier
 */
function calculateCarrierPrice(
  carrier: ShippingCarrier,
  zone: ShippingZone,
  speed: ShippingSpeed,
  weightKg: number,
  orderTotal: number
): ShippingOption {
  const base = BASE_PRICES[zone][carrier][speed];
  const extraWeight = Math.max(0, Math.ceil(weightKg) - 1);
  const rawPrice = base + extraWeight * EXTRA_PER_KG[carrier];
  const threshold = FREE_SHIPPING_THRESHOLD[carrier];
  const isFree = orderTotal >= threshold;
  const days = DELIVERY_DAYS[zone][speed];

  return {
    carrier,
    carrierNameAr: CARRIERS[carrier].nameAr,
    carrierLogo: CARRIERS[carrier].logo,
    speed,
    speedNameAr: speed === 'express' ? 'شحن سريع' : 'شحن عادي',
    price: isFree ? 0 : rawPrice,
    currency: 'SAR',
    estimatedDays: days,
    estimatedDaysText: `${days.min}-${days.max} أيام عمل`,
    freeShippingThreshold: threshold,
    isFreeShipping: isFree,
  };
}

/**
 * Get all shipping options for a city
 */
export function calculateShipping(params: {
  cityKey: string;
  weightKg?: number;
  orderTotal?: number;
}): ShippingQuote | null {
  const { cityKey, weightKg = 1, orderTotal = 0 } = params;
  const city = SAUDI_CITIES[cityKey];
  if (!city) return null;

  const carriers: ShippingCarrier[] = ['aramex', 'smsa', 'zajil', 'spl'];
  const speeds: ShippingSpeed[] = ['standard', 'express'];

  const options: ShippingOption[] = [];
  for (const carrier of carriers) {
    for (const speed of speeds) {
      options.push(calculateCarrierPrice(carrier, city.zone, speed, weightKg, orderTotal));
    }
  }

  // Sort by price (cheapest first)
  options.sort((a, b) => a.price - b.price);

  const cheapest = options.find(o => o.speed === 'standard') || options[0];
  const fastest = options.find(o => o.speed === 'express') || options[0];

  return { city, options, cheapest, fastest };
}

/**
 * Search cities by Arabic or English name
 */
export function searchCities(query: string): Array<{ key: string; city: SaudiCity }> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return Object.entries(SAUDI_CITIES)
    .filter(([_, city]) =>
      city.nameAr.includes(q) ||
      city.nameEn.toLowerCase().includes(q)
    )
    .map(([key, city]) => ({ key, city }))
    .slice(0, 10);
}

/**
 * Get all cities as a sorted list
 */
export function getAllCities(): Array<{ key: string; city: SaudiCity }> {
  return Object.entries(SAUDI_CITIES)
    .map(([key, city]) => ({ key, city }))
    .sort((a, b) => a.city.nameAr.localeCompare(b.city.nameAr, 'ar'));
}

/**
 * Get tracking URL for a shipment
 */
export function getTrackingUrl(carrier: ShippingCarrier, trackingNumber: string): string {
  return CARRIERS[carrier].trackingUrl + trackingNumber;
}

// ═══ Shipping Status ═══

export const SHIPPING_STATUSES = {
  pending: { ar: 'قيد التجهيز', en: 'Preparing', icon: '📋' },
  picked_up: { ar: 'تم الاستلام من المتجر', en: 'Picked Up', icon: '📦' },
  in_transit: { ar: 'في الطريق', en: 'In Transit', icon: '🚛' },
  out_for_delivery: { ar: 'جاري التوصيل', en: 'Out for Delivery', icon: '🏍️' },
  delivered: { ar: 'تم التوصيل ✅', en: 'Delivered', icon: '✅' },
  returned: { ar: 'مسترجع', en: 'Returned', icon: '↩️' },
  failed: { ar: 'فشل التوصيل', en: 'Failed', icon: '❌' },
};
