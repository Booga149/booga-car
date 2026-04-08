/**
 * ═══════════════════════════════════════════════════
 * Booga Car — Centralized Pricing Service v2
 * Single Source of Truth for ALL price calculations
 * ═══════════════════════════════════════════════════
 * 
 * Discount Application Order:
 * 1. Product discount (oldPrice → price)
 * 2. Coupon discount (percent / fixed / free_shipping)
 * 3. First order discount (applied last)
 * 
 * Rules:
 * - ALL price calculations go through this file
 * - Rounding: always 2 decimal places
 * - Store original price + discount %, never final price
 * - max_discount caps the coupon benefit
 */

// ─── Types ───────────────────────────────────────

export type DiscountType = 'percent' | 'fixed' | 'free_shipping';

export interface CouponData {
  discount_type: DiscountType;
  discount_value: number;
  discount_percent?: number;
  max_discount?: number | null;
  first_order_only?: boolean;
  target_product_ids?: string[] | null;
  target_categories?: string[] | null;
}

export interface PriceInput {
  originalPrice: number;
  discountPercent?: number;
  oldPrice?: number;
  quantity?: number;
  productId?: string;
  category?: string;
}

export interface PriceResult {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  formattedPrice: string;
  formattedOriginal: string;
  hasDiscount: boolean;
}

export interface CartPriceResult {
  subtotal: number;
  productDiscountTotal: number;
  shippingCost: number;
  couponDiscount: number;
  couponPercent: number;
  couponType: DiscountType | null;
  firstOrderDiscount: number;
  totalBeforeDiscount: number;
  finalTotal: number;
  formattedSubtotal: string;
  formattedShipping: string;
  formattedDiscount: string;
  formattedTotal: string;
  isFreeShipping: boolean;
  items: PriceResult[];
}

// ─── Constants ───────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 500;
const STANDARD_SHIPPING_COST = 35;
const COMMISSION_RATE = 0.10;
const FIRST_ORDER_DISCOUNT_PERCENT = 10;
const FIRST_ORDER_MAX_DISCOUNT = 50;
const CURRENCY = 'ر.س';

// ─── Core Rounding ──────────────────────────────

export function roundPrice(amount: number): number {
  return Math.round(amount * 100) / 100;
}

// ─── Format Currency ─────────────────────────────

export function formatPrice(amount: number): string {
  const rounded = roundPrice(amount);
  return `${rounded.toLocaleString('ar-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${CURRENCY}`;
}

// ─── Product Price Calculator ───────────────────

export function calculateProductPrice(input: PriceInput): PriceResult {
  const originalPrice = roundPrice(input.originalPrice);
  const quantity = Math.max(1, Math.round(input.quantity || 1));
  
  let discountPercent = input.discountPercent || 0;
  if (!discountPercent && input.oldPrice && input.oldPrice > originalPrice) {
    discountPercent = roundPrice(((input.oldPrice - originalPrice) / input.oldPrice) * 100);
  }

  const discountAmount = roundPrice(originalPrice * (discountPercent / 100));
  const unitPrice = roundPrice(originalPrice - discountAmount);
  const lineTotal = roundPrice(unitPrice * quantity);

  return {
    originalPrice, discountPercent, discountAmount, unitPrice, quantity, lineTotal,
    formattedPrice: formatPrice(unitPrice),
    formattedOriginal: formatPrice(originalPrice),
    hasDiscount: discountPercent > 0,
  };
}

// ─── Coupon Discount Calculator ─────────────────

export function applyCouponDiscount(
  subtotal: number,
  shippingCost: number,
  coupon: CouponData | null,
  items?: PriceInput[]
): { couponDiscount: number; couponType: DiscountType | null; overrideShipping: boolean } {
  if (!coupon) return { couponDiscount: 0, couponType: null, overrideShipping: false };

  const type = coupon.discount_type || 'percent';
  const value = coupon.discount_value || coupon.discount_percent || 0;
  const maxDiscount = coupon.max_discount;

  // Product/category targeting
  let targetSubtotal = subtotal;
  if (items && (coupon.target_product_ids?.length || coupon.target_categories?.length)) {
    targetSubtotal = roundPrice(items.reduce((sum, item) => {
      const matchesProduct = coupon.target_product_ids?.includes(item.productId || '');
      const matchesCategory = coupon.target_categories?.includes(item.category || '');
      if (matchesProduct || matchesCategory) {
        return sum + roundPrice((item.originalPrice) * (item.quantity || 1));
      }
      return sum;
    }, 0));
  }

  let discount = 0;
  switch (type) {
    case 'percent':
      discount = roundPrice(targetSubtotal * (value / 100));
      break;
    case 'fixed':
      discount = roundPrice(Math.min(value, targetSubtotal));
      break;
    case 'free_shipping':
      return { couponDiscount: 0, couponType: 'free_shipping', overrideShipping: true };
  }

  if (maxDiscount && maxDiscount > 0) {
    discount = roundPrice(Math.min(discount, maxDiscount));
  }

  return { couponDiscount: discount, couponType: type, overrideShipping: false };
}

// ─── Cart Total Calculator (v2) ─────────────────

export function calculateCartTotal(
  items: { price: number; oldPrice?: number; quantity: number; discountPercent?: number; productId?: string; category?: string }[],
  couponOrPercent: CouponData | number | null = null,
  isFirstOrder: boolean = false
): CartPriceResult {
  const pricedItems = items.map(item => 
    calculateProductPrice({
      originalPrice: item.price, oldPrice: item.oldPrice,
      quantity: item.quantity, discountPercent: item.discountPercent,
      productId: item.productId, category: item.category,
    })
  );

  const subtotal = roundPrice(pricedItems.reduce((sum, item) => sum + item.lineTotal, 0));
  const productDiscountTotal = roundPrice(pricedItems.reduce((sum, item) => sum + (item.discountAmount * item.quantity), 0));

  const isFreeShippingByThreshold = subtotal >= FREE_SHIPPING_THRESHOLD;
  let shippingCost = isFreeShippingByThreshold ? 0 : STANDARD_SHIPPING_COST;

  // Coupon
  let couponResult = { couponDiscount: 0, couponType: null as DiscountType | null, overrideShipping: false };
  let couponPercent = 0;

  if (typeof couponOrPercent === 'number') {
    couponPercent = couponOrPercent;
    couponResult.couponDiscount = roundPrice(subtotal * (couponOrPercent / 100));
    couponResult.couponType = 'percent';
  } else if (couponOrPercent) {
    couponResult = applyCouponDiscount(subtotal, shippingCost, couponOrPercent, items.map(i => ({
      originalPrice: i.price, quantity: i.quantity, productId: i.productId, category: i.category,
    })));
    couponPercent = couponOrPercent.discount_value || 0;
    if (couponResult.overrideShipping) shippingCost = 0;
  }

  // First order
  let firstOrderDiscount = 0;
  if (isFirstOrder) {
    const afterCoupon = roundPrice(subtotal - couponResult.couponDiscount);
    firstOrderDiscount = roundPrice(Math.min(
      roundPrice(afterCoupon * (FIRST_ORDER_DISCOUNT_PERCENT / 100)),
      FIRST_ORDER_MAX_DISCOUNT
    ));
  }

  const totalBeforeDiscount = roundPrice(subtotal + shippingCost);
  const totalDiscount = roundPrice(couponResult.couponDiscount + firstOrderDiscount);
  const finalTotal = roundPrice(Math.max(0, totalBeforeDiscount - totalDiscount));

  return {
    subtotal, productDiscountTotal, shippingCost,
    couponDiscount: couponResult.couponDiscount,
    couponPercent,
    couponType: couponResult.couponType,
    firstOrderDiscount,
    totalBeforeDiscount, finalTotal,
    formattedSubtotal: formatPrice(subtotal),
    formattedShipping: shippingCost === 0 ? 'مجاني' : formatPrice(shippingCost),
    formattedDiscount: formatPrice(totalDiscount),
    formattedTotal: formatPrice(finalTotal),
    isFreeShipping: shippingCost === 0,
    items: pricedItems,
  };
}

// ─── Commission Calculator ──────────────────────

export function calculateCommission(grossPrice: number) {
  const gross = roundPrice(grossPrice);
  const fee = roundPrice(gross * COMMISSION_RATE);
  const net = roundPrice(gross - fee);
  return { gross, fee, net, rate: COMMISSION_RATE };
}

// ─── Server Validation Helper ───────────────────

export function prepareOrderForValidation(
  items: { productId: string; quantity: number }[],
  couponCode?: string
) {
  return {
    items: items.map(i => ({ product_id: i.productId, quantity: Math.max(1, Math.round(i.quantity)) })),
    coupon_code: couponCode?.trim().toUpperCase() || null,
  };
}

// ─── Price Audit Log ────────────────────────────

export function createPriceAuditEntry(
  orderId: string, items: PriceResult[], cartResult: CartPriceResult, couponCode?: string
) {
  return {
    order_id: orderId,
    timestamp: new Date().toISOString(),
    items: items.map(item => ({
      original_price: item.originalPrice, discount_percent: item.discountPercent,
      discount_amount: item.discountAmount, unit_price: item.unitPrice,
      quantity: item.quantity, line_total: item.lineTotal,
    })),
    subtotal: cartResult.subtotal,
    shipping_cost: cartResult.shippingCost,
    coupon_code: couponCode || null,
    coupon_type: cartResult.couponType,
    coupon_discount: cartResult.couponDiscount,
    first_order_discount: cartResult.firstOrderDiscount,
    final_total: cartResult.finalTotal,
  };
}

// ─── First Order Detection ──────────────────────

export async function checkIsFirstOrder(supabase: any, userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', userId);
    return (count || 0) === 0;
  } catch { return false; }
}

// ─── Full Coupon Validation ─────────────────────

export async function validateCoupon(
  supabase: any, code: string, userId: string | null, cartTotal: number
): Promise<{ valid: boolean; coupon: CouponData | null; error: string }> {
  if (!code) return { valid: false, coupon: null, error: 'لم يتم إدخال كود' };

  const { data, error } = await supabase.from('coupons').select('*')
    .eq('code', code.trim().toUpperCase()).eq('is_active', true).single();

  if (error || !data) return { valid: false, coupon: null, error: 'كود الخصم غير صحيح أو غير نشط' };
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { valid: false, coupon: null, error: 'كود الخصم منتهي الصلاحية' };
  if (data.max_uses && data.current_uses >= data.max_uses) return { valid: false, coupon: null, error: 'تم استنفاد عدد استخدامات هذا الكود' };
  if (data.min_order_amount && cartTotal < data.min_order_amount) return { valid: false, coupon: null, error: `الحد الأدنى للطلب ${data.min_order_amount} ر.س` };

  if (data.per_user_limit && userId) {
    const { count } = await supabase.from('coupon_usage').select('id', { count: 'exact', head: true }).eq('coupon_id', data.id).eq('user_id', userId);
    if ((count || 0) >= data.per_user_limit) return { valid: false, coupon: null, error: 'لقد استخدمت هذا الكود الحد الأقصى المسموح' };
  }

  if (data.first_order_only && userId) {
    const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', userId);
    if ((count || 0) > 0) return { valid: false, coupon: null, error: 'هذا الكود متاح للطلب الأول فقط' };
  }

  return {
    valid: true,
    coupon: {
      discount_type: data.discount_type || 'percent',
      discount_value: data.discount_value || data.discount_percent || 0,
      discount_percent: data.discount_percent,
      max_discount: data.max_discount,
      first_order_only: data.first_order_only,
      target_product_ids: data.target_product_ids,
      target_categories: data.target_categories,
    },
    error: '',
  };
}

// ─── Exports ────────────────────────────────────

export { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST, COMMISSION_RATE, FIRST_ORDER_DISCOUNT_PERCENT, FIRST_ORDER_MAX_DISCOUNT };
