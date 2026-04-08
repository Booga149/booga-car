-- Add dealer_status column for approval workflow
-- Values: NULL (not a dealer), 'pending', 'approved', 'rejected'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dealer_status TEXT DEFAULT NULL;

-- Index for fast lookups of pending dealers
CREATE INDEX IF NOT EXISTS idx_profiles_dealer_status ON profiles(dealer_status) WHERE dealer_status IS NOT NULL;

-- Update existing sellers to have approved status
UPDATE profiles SET dealer_status = 'approved' WHERE role = 'seller' AND dealer_status IS NULL;
