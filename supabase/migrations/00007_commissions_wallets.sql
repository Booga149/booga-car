-- ============================================================
-- Booga Car - Marketplace Commissions & Wallets Schema
-- ============================================================

-- 1. Extend ORDER_ITEMS to track commissions directly per item
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0.10;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS platform_fee NUMERIC DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS seller_net NUMERIC DEFAULT 0;

-- 2. SELLER WALLETS
-- Tracks the aggregate balance available to the seller
CREATE TABLE IF NOT EXISTS public.seller_wallets (
  seller_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_sales NUMERIC DEFAULT 0,
  total_commission_paid NUMERIC DEFAULT 0,
  available_balance NUMERIC DEFAULT 0,
  pending_payouts NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view own wallet" ON public.seller_wallets FOR SELECT USING (auth.uid() = seller_id);
-- Admin override omitted for simplicity (Supabase service role bypasses RLS)

-- 3. PAYOUT REQUESTS
-- When a seller requests to withdraw their funds
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  bank_name TEXT,
  iban TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers view own payouts" ON public.payout_requests FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers insert own payouts" ON public.payout_requests FOR INSERT WITH CHECK (auth.uid() = seller_id);
