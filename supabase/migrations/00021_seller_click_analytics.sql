-- Seller Click Analytics — tracks call, whatsapp, and phone reveal clicks
-- Used for merchant ranking by engagement level

CREATE TABLE IF NOT EXISTS seller_click_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  click_type TEXT NOT NULL CHECK (click_type IN ('call', 'whatsapp', 'reveal_phone')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast queries by seller and time range
CREATE INDEX IF NOT EXISTS idx_click_analytics_seller ON seller_click_analytics(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_analytics_product ON seller_click_analytics(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_analytics_type ON seller_click_analytics(click_type);

-- Allow anyone to insert (anonymous click tracking)
ALTER TABLE seller_click_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert click analytics"
  ON seller_click_analytics FOR INSERT
  WITH CHECK (true);

-- Only admins/seller owners can read their own analytics
CREATE POLICY "Sellers can read own analytics"
  ON seller_click_analytics FOR SELECT
  USING (
    seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Handy view: seller engagement summary
CREATE OR REPLACE VIEW seller_engagement_ranking WITH (security_invoker = true) AS
SELECT
  seller_id,
  COUNT(*) FILTER (WHERE click_type = 'call') AS total_calls,
  COUNT(*) FILTER (WHERE click_type = 'whatsapp') AS total_whatsapp,
  COUNT(*) FILTER (WHERE click_type = 'reveal_phone') AS total_reveals,
  COUNT(*) AS total_clicks,
  COUNT(*) FILTER (WHERE created_at > now() - interval '7 days') AS clicks_last_7d,
  COUNT(*) FILTER (WHERE created_at > now() - interval '30 days') AS clicks_last_30d
FROM seller_click_analytics
GROUP BY seller_id
ORDER BY total_clicks DESC;
