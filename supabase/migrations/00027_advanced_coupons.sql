-- ═══ Advanced Coupon System Upgrade ═══
-- Supports: percentage, fixed amount, free shipping, first order, product/category targeting

-- Add new columns to coupons table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed', 'free_shipping'));
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_value NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_discount NUMERIC DEFAULT NULL; -- Maximum discount cap (SAR)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS first_order_only BOOLEAN DEFAULT false;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS target_product_ids UUID[] DEFAULT NULL; -- Specific product IDs
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS target_categories TEXT[] DEFAULT NULL; -- Specific categories
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS per_user_limit INTEGER DEFAULT NULL; -- Max uses per user (NULL = unlimited)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Migrate existing data: copy discount_percent to discount_value
UPDATE coupons SET discount_value = discount_percent WHERE discount_value = 0 AND discount_percent > 0;

-- Coupon usage tracking per user
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  order_id UUID,
  used_at TIMESTAMPTZ DEFAULT now(),
  discount_applied NUMERIC NOT NULL,
  UNIQUE(coupon_id, order_id)
);

ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupon_usage_select" ON coupon_usage FOR SELECT USING (true);
CREATE POLICY "coupon_usage_insert" ON coupon_usage FOR INSERT WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id, coupon_id);
