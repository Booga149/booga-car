-- ============================================================
-- Fix Security Definer Warning for seller_engagement_ranking
-- ============================================================

-- Alter the view to use the invoker's security context (RLS) instead of the definer's.
-- This resolves the "High Importance" security warning in Supabase.
ALTER VIEW public.seller_engagement_ranking SET (security_invoker = true);
