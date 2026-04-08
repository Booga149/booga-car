-- ═══ Dynamic Coupons System ═══
-- Admin can create, manage, and track promo codes

CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_uses INTEGER DEFAULT NULL, -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  min_order_amount NUMERIC DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL, -- NULL = never expires
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Everyone can read active coupons (for validation)
CREATE POLICY "coupons_select" ON coupons FOR SELECT USING (true);
-- Only admins can insert/update (enforced at app level)
CREATE POLICY "coupons_insert" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "coupons_update" ON coupons FOR UPDATE USING (true);
