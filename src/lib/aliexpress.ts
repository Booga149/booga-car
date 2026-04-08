/**
 * AliExpress Dropshipping API SDK
 * Handles authentication, product search, order creation, and tracking.
 * Uses the official AliExpress Open Platform DS (Dropshipping) API.
 */

import crypto from 'crypto';

// ═══ Types ═══

export interface AliExpressConfig {
  appKey: string;
  appSecret: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
}

export interface AEProduct {
  productId: string;
  title: string;
  imageUrl: string;
  images: string[];
  price: number;
  originalPrice?: number;
  currency: string;
  rating: number;
  orders: number;
  shippingCost?: number;
  shippingDays?: string;
  storeName: string;
  storeUrl: string;
  productUrl: string;
  category: string;
  variants?: AEVariant[];
}

export interface AEVariant {
  id: string;
  name: string;
  image?: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface AEOrderResult {
  orderId: string;
  orderStatus: string;
  totalCost: number;
}

export interface AETrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  events: { date: string; description: string; location: string }[];
}

// ═══ Core SDK ═══

const AE_API_URL = 'https://api-sg.aliexpress.com/sync';

export class AliExpressSDK {
  private config: AliExpressConfig;

  constructor(config: AliExpressConfig) {
    this.config = config;
  }

  /**
   * Generate API request signature (HMAC-SHA256)
   */
  private generateSign(params: Record<string, string>): string {
    const sorted = Object.keys(params).sort();
    let signStr = '';
    for (const key of sorted) {
      signStr += key + params[key];
    }
    return crypto
      .createHmac('sha256', this.config.appSecret)
      .update(signStr)
      .digest('hex')
      .toUpperCase();
  }

  /**
   * Make an API call to AliExpress Open Platform
   */
  private async apiCall(method: string, params: Record<string, any> = {}): Promise<any> {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    
    const baseParams: Record<string, string> = {
      app_key: this.config.appKey,
      method,
      sign_method: 'sha256',
      timestamp,
      v: '2.0',
      format: 'json',
      simplify: 'true',
    };

    if (this.config.accessToken) {
      baseParams.session = this.config.accessToken;
    }

    // Merge additional params
    const allParams: Record<string, string> = { ...baseParams };
    for (const [key, value] of Object.entries(params)) {
      allParams[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }

    // Generate signature
    allParams.sign = this.generateSign(allParams);

    const response = await fetch(AE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(allParams).toString(),
    });

    if (!response.ok) {
      throw new Error(`AliExpress API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check for API-level errors
    const responseKey = method.replace(/\./g, '_') + '_response';
    const result = data[responseKey] || data;
    
    if (result?.error_response) {
      throw new Error(`AliExpress API Error: ${result.error_response.msg || JSON.stringify(result.error_response)}`);
    }

    return result;
  }

  // ═══ Authentication ═══

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(redirectUrl: string): string {
    return `https://api-sg.aliexpress.com/oauth/authorize?response_type=code&force_auth=true&redirect_uri=${encodeURIComponent(redirectUrl)}&client_id=${this.config.appKey}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const result = await this.apiCall('aliexpress.auth.token.create', {
      code,
    });

    return {
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      expiresIn: result.expire_time,
    };
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    if (!this.config.refreshToken) {
      throw new Error('No refresh token available');
    }

    const result = await this.apiCall('aliexpress.auth.token.refresh', {
      refresh_token: this.config.refreshToken,
    });

    this.config.accessToken = result.access_token;
    this.config.refreshToken = result.refresh_token;

    return {
      accessToken: result.access_token,
      refreshToken: result.refresh_token,
      expiresIn: result.expire_time,
    };
  }

  // ═══ Product Search & Details ═══

  /**
   * Search for products (DS recommended feed)
   */
  async searchProducts(params: {
    query?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
    sort?: 'SALE_PRICE_ASC' | 'SALE_PRICE_DESC' | 'LAST_VOLUME_ASC' | 'LAST_VOLUME_DESC';
    shipToCountry?: string;
  }): Promise<{ products: AEProduct[]; totalCount: number }> {
    const apiParams: Record<string, any> = {
      target_currency: 'USD',
      target_language: 'EN',
      ship_to_country: params.shipToCountry || 'SA',
      page_no: params.page || 1,
      page_size: Math.min(params.pageSize || 20, 50),
    };

    if (params.query) apiParams.keywords = params.query;
    if (params.categoryId) apiParams.category_id = params.categoryId;
    if (params.minPrice) apiParams.min_sale_price = params.minPrice;
    if (params.maxPrice) apiParams.max_sale_price = params.maxPrice;
    if (params.sort) apiParams.sort = params.sort;

    const result = await this.apiCall('aliexpress.ds.recommend.feed.get', apiParams);

    const products: AEProduct[] = (result?.products?.product || []).map((p: any) => ({
      productId: String(p.product_id),
      title: p.product_title || '',
      imageUrl: p.product_main_image_url || '',
      images: p.product_small_image_urls?.string || [],
      price: parseFloat(p.sale_price?.amount || p.target_sale_price || '0'),
      originalPrice: p.original_price ? parseFloat(p.original_price.amount || '0') : undefined,
      currency: p.sale_price?.currency_code || 'USD',
      rating: parseFloat(p.evaluate_rate || '0'),
      orders: parseInt(p.lastest_volume || '0', 10),
      storeName: '',
      storeUrl: '',
      productUrl: p.product_detail_url || `https://www.aliexpress.com/item/${p.product_id}.html`,
      category: p.first_level_category_name || '',
    }));

    return {
      products,
      totalCount: parseInt(result?.total_record_count || '0', 10),
    };
  }

  /**
   * Get detailed product information
   */
  async getProductDetails(productId: string): Promise<AEProduct | null> {
    const result = await this.apiCall('aliexpress.ds.product.get', {
      product_id: productId,
      target_currency: 'USD',
      target_language: 'EN',
      ship_to_country: 'SA',
    });

    const p = result?.result;
    if (!p) return null;

    const variants: AEVariant[] = (p.ae_sku_property_dtos?.ae_sku_property_d_t_o || []).map((v: any) => ({
      id: String(v.id || ''),
      name: v.sku_property_name || '',
      attributes: {},
    }));

    return {
      productId: String(p.product_id),
      title: p.ae_item_base_info_dto?.product_title || '',
      imageUrl: p.ae_multimedia_info_dto?.image_urls?.split(';')[0] || '',
      images: (p.ae_multimedia_info_dto?.image_urls || '').split(';').filter(Boolean),
      price: parseFloat(p.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o?.[0]?.offer_sale_price || '0'),
      originalPrice: parseFloat(p.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o?.[0]?.sku_price || '0'),
      currency: 'USD',
      rating: parseFloat(p.ae_item_base_info_dto?.avg_evaluation_rating || '0'),
      orders: parseInt(p.ae_item_base_info_dto?.sales_count || '0', 10),
      storeName: p.ae_store_info?.store_name || '',
      storeUrl: `https://www.aliexpress.com/store/${p.ae_store_info?.store_id || ''}`,
      productUrl: `https://www.aliexpress.com/item/${p.product_id}.html`,
      category: p.ae_item_base_info_dto?.category_id || '',
      variants,
    };
  }

  // ═══ Shipping ═══

  /**
   * Get shipping info for a product to Saudi Arabia
   */
  async getShippingInfo(productId: string): Promise<{
    methods: { name: string; cost: number; days: string; carrier: string }[];
  }> {
    const result = await this.apiCall('aliexpress.ds.freight.query', {
      product_id: productId,
      country_code: 'SA',
      quantity: 1,
    });

    const methods = (result?.freight_result?.freight || []).map((f: any) => ({
      name: f.service_name || '',
      cost: parseFloat(f.freight?.amount || '0'),
      days: `${f.estimated_delivery_time || '15-30'} days`,
      carrier: f.service_name || '',
    }));

    return { methods };
  }

  // ═══ Order Management ═══

  /**
   * Create a dropshipping order on AliExpress
   */
  async createOrder(params: {
    productId: string;
    quantity: number;
    skuId?: string;
    shippingAddress: {
      name: string;
      phone: string;
      address: string;
      city: string;
      province: string;
      country: string;
      zip: string;
    };
    shippingMethod?: string;
  }): Promise<AEOrderResult> {
    const result = await this.apiCall('aliexpress.ds.order.create', {
      product_id: params.productId,
      product_count: params.quantity,
      sku_id: params.skuId || '',
      logistics_address: JSON.stringify({
        full_name: params.shippingAddress.name,
        mobile_no: params.shippingAddress.phone,
        address: params.shippingAddress.address,
        city: params.shippingAddress.city,
        province: params.shippingAddress.province,
        country_code: params.shippingAddress.country || 'SA',
        zip: params.shippingAddress.zip,
      }),
      shipping_method: params.shippingMethod || '',
    });

    return {
      orderId: String(result?.result?.order_id || ''),
      orderStatus: result?.result?.order_status || 'created',
      totalCost: parseFloat(result?.result?.order_amount || '0'),
    };
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<{
    status: string;
    trackingNumber?: string;
    carrier?: string;
  }> {
    const result = await this.apiCall('aliexpress.ds.order.get', {
      order_id: orderId,
    });

    return {
      status: result?.result?.order_status || 'unknown',
      trackingNumber: result?.result?.logistics_info_list?.logistics_info?.[0]?.logistics_no,
      carrier: result?.result?.logistics_info_list?.logistics_info?.[0]?.logistics_service,
    };
  }

  /**
   * Get tracking information
   */
  async getTrackingInfo(orderId: string): Promise<AETrackingInfo | null> {
    try {
      const result = await this.apiCall('aliexpress.ds.tracking.info.query', {
        order_id: orderId,
      });

      return {
        trackingNumber: result?.result?.tracking_number || '',
        carrier: result?.result?.logistics_company || '',
        status: result?.result?.logistics_status || 'unknown',
        events: (result?.result?.details?.detail || []).map((e: any) => ({
          date: e.event_date || '',
          description: e.event_desc || '',
          location: e.address || '',
        })),
      };
    } catch {
      return null;
    }
  }
}

// ═══ Helper: Create SDK from Supabase config ═══

export async function createAliExpressSDK(supabase: any): Promise<AliExpressSDK | null> {
  const { data } = await supabase
    .from('dropship_config')
    .select('*')
    .eq('provider', 'aliexpress')
    .eq('is_active', true)
    .single();

  if (!data?.app_key || !data?.app_secret) return null;

  const sdk = new AliExpressSDK({
    appKey: data.app_key,
    appSecret: data.app_secret,
    accessToken: data.access_token || undefined,
    refreshToken: data.refresh_token || undefined,
    tokenExpiresAt: data.token_expires_at ? new Date(data.token_expires_at) : undefined,
  });

  // Auto-refresh token if expired
  if (data.access_token && data.token_expires_at) {
    const expiresAt = new Date(data.token_expires_at);
    const now = new Date();
    if (now >= expiresAt && data.refresh_token) {
      try {
        const newTokens = await sdk.refreshAccessToken();
        await supabase.from('dropship_config').update({
          access_token: newTokens.accessToken,
          refresh_token: newTokens.refreshToken,
          token_expires_at: new Date(Date.now() + newTokens.expiresIn).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', data.id);
      } catch (e) {
        console.error('Failed to refresh AliExpress token:', e);
      }
    }
  }

  return sdk;
}

// ═══ Price Calculation ═══

/**
 * Calculate local sale price from provider price + markup
 */
export function calculateDropshipPrice(
  providerPrice: number,
  shippingCost: number = 0,
  markupPercent: number = 30,
  usdToSar: number = 3.75,
): number {
  const totalCost = (providerPrice + shippingCost) * usdToSar;
  const salePrice = totalCost * (1 + markupPercent / 100);
  return Math.ceil(salePrice / 5) * 5; // Round up to nearest 5 SAR
}
