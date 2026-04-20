-- Create table for tracking checkout funnels live
CREATE TABLE IF NOT EXISTS public.checkout_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'started', 'payment_clicked', 'payment_failed', 'success', 'exit_intent'
    payment_method TEXT,
    order_total NUMERIC,
    error_message TEXT,
    order_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Protect metrics table
ALTER TABLE public.checkout_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert metrics
CREATE POLICY "Allow insertions for checkout metrics" 
ON public.checkout_metrics 
FOR INSERT 
TO public, authenticated 
WITH CHECK (true);

-- Only admins can read metrics
CREATE POLICY "Admins can view metrics" 
ON public.checkout_metrics 
FOR SELECT 
TO authenticated 
USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
