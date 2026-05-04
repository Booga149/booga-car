/**
 * Stripe Payment Gateway Integration
 * ====================================
 * بوابة الدفع العالمية - تدعم: فيزا، ماستركارد، Apple Pay
 * 
 * SETUP:
 * 1. سجل في https://dashboard.stripe.com
 * 2. أضف المتغيرات:
 *    - STRIPE_SECRET_KEY (Test: sk_test_...)
 *    - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Test: pk_test_...)
 */

import Stripe from 'stripe';

// ─── Server-side Stripe instance ───
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = (process.env.STRIPE_SECRET_KEY || '').trim();
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      typescript: true,
    });
  }
  return stripeInstance;
}

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  const key = (process.env.STRIPE_SECRET_KEY || '').trim();
  return !!key && key.length > 10 && key.startsWith('sk_');
}

/**
 * Map Arabic payment method names to internal identifiers
 */
export function mapPaymentMethod(method: string): 'card' | 'cod' | 'tabby' | 'tamara' | 'stcpay' | 'applepay' {
  switch (method) {
    case 'مدى':
    case 'فيزا / ماستركارد':
      return 'card';
    case 'STC Pay':
      return 'stcpay';
    case 'Apple Pay':
      return 'applepay';
    case 'تابي (Tabby)':
      return 'tabby';
    case 'تمارا (Tamara)':
      return 'tamara';
    case 'الدفع عند الاستلام':
    default:
      return 'cod';
  }
}

/**
 * Create a Stripe Checkout Session
 * This redirects the customer to Stripe's hosted payment page
 */
export async function createCheckoutSession(params: {
  orderId: string;
  amount: number; // In SAR
  customerName: string;
  customerEmail?: string;
  paymentMethod: string;
  lineItems: Array<{ name: string; quantity: number; price: number }>;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe();

  // Convert line items to Stripe format
  const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.lineItems.map(item => ({
    price_data: {
      currency: 'sar',
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * 100), // Convert SAR to halalas
    },
    quantity: item.quantity,
  }));

  // If no line items, create a single one with total
  if (stripeLineItems.length === 0) {
    stripeLineItems.push({
      price_data: {
        currency: 'sar',
        product_data: { name: `طلب Booga Car #${params.orderId.slice(0, 8)}` },
        unit_amount: Math.round(params.amount * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: stripeLineItems,
    success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${params.orderId}`,
    cancel_url: `${params.cancelUrl}?order_id=${params.orderId}`,
    metadata: {
      order_id: params.orderId,
      customer_name: params.customerName,
      payment_method_ar: params.paymentMethod,
    },
    ...(params.customerEmail ? { customer_email: params.customerEmail } : {}),
  });

  return {
    sessionId: session.id,
    url: session.url || '',
  };
}

/**
 * Create a PaymentIntent for embedded payment forms
 */
export async function createPaymentIntent(params: {
  amount: number; // In SAR
  orderId: string;
  customerName: string;
  paymentMethod: string;
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100), // Convert SAR to halalas (cents)
    currency: 'sar',
    description: `طلب بوجا كار #${params.orderId.slice(0, 8)}`,
    metadata: {
      order_id: params.orderId,
      customer_name: params.customerName,
      payment_method_ar: params.paymentMethod,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret || '',
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Retrieve a Checkout Session by ID
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent'],
  });
}

/**
 * Retrieve a PaymentIntent by ID
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(paymentIntentId);
}
