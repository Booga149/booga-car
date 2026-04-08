-- ═══════════════════════════════════════════════════════════
-- Migration 00030: Dropshipping System Tables
-- Supports AliExpress + future providers (CJ, etc.)
-- ═══════════════════════════════════════════════════════════

-- 1. Provider configuration & API credentials
CREATE TABLE IF NOT EXISTS dropship_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('aliexpress', 'cj', 'alibaba')),
  app_key TEXT,
  app_secret TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  default_markup_percent DECIMAL(5,2) DEFAULT 30,
  auto_fulfill BOOLEAN DEFAULT false,
  auto_sync_prices BOOLEAN DEFAULT true,
  auto_sync_stock BOOLEAN DEFAULT true,
  sync_interval_hours INT DEFAULT 6,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider)
);

-- 2. Linked products (local ↔ provider)
CREATE TABLE IF NOT EXISTS dropship_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_product_id TEXT NOT NULL,
  provider_product_url TEXT,
  provider_price DECIMAL(10,2),
  provider_currency TEXT DEFAULT 'USD',
  provider_shipping_cost DECIMAL(10,2) DEFAULT 0,
  local_price DECIMAL(10,2),
  markup_percent DECIMAL(5,2) DEFAULT 30,
  auto_sync_price BOOLEAN DEFAULT true,
  auto_sync_stock BOOLEAN DEFAULT true,
  provider_stock_status TEXT DEFAULT 'in_stock',
  provider_images JSONB DEFAULT '[]',
  provider_variants JSONB DEFAULT '[]',
  provider_data JSONB DEFAULT '{}',
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_product_id)
);

-- 3. Dropship orders (fulfillment tracking)
CREATE TABLE IF NOT EXISTS dropship_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  provider_order_id TEXT,
  provider_order_status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  shipping_carrier TEXT,
  shipping_method TEXT,
  estimated_delivery_days INT,
  provider_cost DECIMAL(10,2),
  local_sale_price DECIMAL(10,2),
  profit DECIMAL(10,2),
  customer_name TEXT,
  customer_address JSONB,
  auto_ordered BOOLEAN DEFAULT false,
  retry_count INT DEFAULT 0,
  error_message TEXT,
  last_checked_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Sync & activity log
CREATE TABLE IF NOT EXISTS dropship_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN (
    'price_sync', 'stock_sync', 'order_create', 'order_fulfill',
    'tracking_update', 'product_import', 'token_refresh', 'config_update'
  )),
  provider TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  affected_count INT DEFAULT 0,
  details JSONB DEFAULT '{}',
  error_message TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Indexes ═══
CREATE INDEX IF NOT EXISTS idx_dropship_products_local ON dropship_products(local_product_id);
CREATE INDEX IF NOT EXISTS idx_dropship_products_provider ON dropship_products(provider, provider_product_id);
CREATE INDEX IF NOT EXISTS idx_dropship_products_active ON dropship_products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_dropship_orders_local ON dropship_orders(local_order_id);
CREATE INDEX IF NOT EXISTS idx_dropship_orders_status ON dropship_orders(provider_order_status);
CREATE INDEX IF NOT EXISTS idx_dropship_orders_tracking ON dropship_orders(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dropship_sync_log_action ON dropship_sync_log(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dropship_sync_log_recent ON dropship_sync_log(created_at DESC);

-- ═══ RLS Policies (admin only) ═══
ALTER TABLE dropship_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropship_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropship_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dropship_sync_log ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "admin_dropship_config" ON dropship_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_dropship_products" ON dropship_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_dropship_orders" ON dropship_orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_dropship_sync_log" ON dropship_sync_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
