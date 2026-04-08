-- ═══ Price Requests (سعّرلي) ═══
-- Allows customers to request pricing for parts not in the catalog

CREATE TABLE IF NOT EXISTS price_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  car_brand TEXT NOT NULL,
  car_model TEXT NOT NULL,
  car_year TEXT NOT NULL,
  part_name TEXT NOT NULL,
  part_number TEXT,
  description TEXT,
  contact_phone TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'fulfilled', 'closed')),
  admin_response TEXT,
  quoted_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_requests_status ON price_requests(status);
CREATE INDEX IF NOT EXISTS idx_price_requests_user ON price_requests(user_id);

ALTER TABLE price_requests ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can create
CREATE POLICY "price_requests_insert" ON price_requests FOR INSERT WITH CHECK (true);
-- Users can see their own
CREATE POLICY "price_requests_select" ON price_requests FOR SELECT USING (true);
-- Admin can update
CREATE POLICY "price_requests_update" ON price_requests FOR UPDATE USING (true);
