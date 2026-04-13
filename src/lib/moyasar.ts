/**
 * Moyasar Payment Gateway Integration
 * ====================================
 * بوابة الدفع السعودية - تدعم: مدى، فيزا، ماستركارد، Apple Pay، STC Pay
 * 
 * SETUP:
 * 1. سجل في https://moyasar.com
 * 2. أضف المتغيرات في Vercel:
 *    - MOYASAR_SECRET_KEY (from Moyasar Dashboard → API Keys)
 *    - MOYASAR_PUBLISHABLE_KEY (للفرونت إند)
 *    - NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY (للفرونت إند)
 */

const MOYASAR_API = 'https://api.moyasar.com/v1';

export type PaymentSource = 'creditcard' | 'stcpay' | 'applepay';

export interface CreatePaymentParams {
  amount: number; // بالهللة (100 = 1 ريال)
  currency?: string;
  description: string;
  callbackUrl: string;
  source: {
    type: PaymentSource;
    // For credit card
    name?: string;
    number?: string;
    month?: string;
    year?: string;
    cvc?: string;
    // For STC Pay
    mobile?: string;
    // For Apple Pay
    token?: string;
  };
  metadata?: Record<string, string>;
}

export interface MoyasarPayment {
  id: string;
  status: 'initiated' | 'paid' | 'failed' | 'authorized' | 'captured' | 'refunded' | 'voided';
  amount: number;
  fee: number;
  currency: string;
  refunded: number;
  description: string;
  invoice_id: string | null;
  ip: string | null;
  callback_url: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, string>;
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    message: string | null;
    transaction_url: string | null;
  };
}

/**
 * Server-side Moyasar API client
 */
export class MoyasarClient {
  private secretKey: string;

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.MOYASAR_SECRET_KEY || '';
    if (!this.secretKey) {
      console.warn('[Moyasar] No secret key configured. Payment processing will use test mode.');
    }
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(this.secretKey + ':').toString('base64');
  }

  /**
   * Create a new payment
   */
  async createPayment(params: CreatePaymentParams): Promise<MoyasarPayment> {
    const body = {
      amount: Math.round(params.amount), // Must be in halalas (smallest unit)
      currency: params.currency || 'SAR',
      description: params.description,
      callback_url: params.callbackUrl,
      source: params.source,
      metadata: params.metadata || {},
    };

    const res = await fetch(`${MOYASAR_API}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Unknown payment error' }));
      throw new Error(err.message || `Payment failed with status ${res.status}`);
    }

    return res.json();
  }

  /**
   * Fetch payment by ID
   */
  async getPayment(paymentId: string): Promise<MoyasarPayment> {
    const res = await fetch(`${MOYASAR_API}/payments/${paymentId}`, {
      headers: { 'Authorization': this.getAuthHeader() },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch payment ${paymentId}`);
    }

    return res.json();
  }

  /**
   * Refund a payment (partial or full)
   */
  async refundPayment(paymentId: string, amount?: number): Promise<MoyasarPayment> {
    const body: any = {};
    if (amount) body.amount = Math.round(amount);

    const res = await fetch(`${MOYASAR_API}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Refund failed' }));
      throw new Error(err.message || 'Refund failed');
    }

    return res.json();
  }

  /**
   * Check if Moyasar is properly configured
   */
  isConfigured(): boolean {
    return !!this.secretKey && this.secretKey.length > 10;
  }
}

/**
 * Convert SAR to halalas for Moyasar API
 */
export function sarToHalalas(sarAmount: number): number {
  return Math.round(sarAmount * 100);
}

/**
 * Convert halalas to SAR for display
 */
export function halalasToSar(halalas: number): number {
  return halalas / 100;
}

/**
 * Map checkout payment method to Moyasar source type
 */
export function mapPaymentSource(method: string): PaymentSource | 'cod' | 'tabby' | 'tamara' {
  switch (method) {
    case 'مدى':
    case 'فيزا / ماستركارد':
      return 'creditcard';
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
