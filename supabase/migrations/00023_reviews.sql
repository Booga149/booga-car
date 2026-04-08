-- ═══ Reviews System ═══
-- Enables customers to rate and review purchased products

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  user_name TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- One review per user per product
  UNIQUE(product_id, user_id)
);

-- Performance index
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);

-- Authenticated users can insert their own reviews
CREATE POLICY "reviews_insert" ON reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "reviews_update" ON reviews FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "reviews_delete" ON reviews FOR DELETE 
  USING (auth.uid() = user_id);
