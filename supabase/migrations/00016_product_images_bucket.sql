-- ============================================================
-- Booga Car - Product Images Storage Setup
-- Creates the 'product-images' bucket and sets up RLS policies.
-- ============================================================

-- 1. Create the bucket (Postgres function to safely create bucket)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to read images (Required for ProductCard display)
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- 3. Allow authenticated sellers to upload their own images
-- For simplicity in dev, we allow any authenticated user to upload.
-- In production, we'd check if the user is a 'seller'.
CREATE POLICY "Sellers can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

-- 4. Allow sellers to update/delete their own images
CREATE POLICY "Sellers can manage images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Sellers can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
  );
