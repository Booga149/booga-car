-- =============================================================
-- Visitor Tracking & Security System
-- =============================================================

-- 1. Visitor Logs Table
CREATE TABLE IF NOT EXISTS visitor_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL DEFAULT 'unknown',
  country TEXT DEFAULT 'غير معروف',
  city TEXT DEFAULT 'غير معروف',
  device_type TEXT DEFAULT 'unknown',
  browser TEXT DEFAULT 'unknown',
  os TEXT DEFAULT 'unknown',
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  page_visited TEXT DEFAULT '/',
  referrer TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_visitor_logs_created ON visitor_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_ip ON visitor_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_user ON visitor_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_country ON visitor_logs(country);

-- 2. Blocked IPs Table
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT DEFAULT '',
  blocked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_address ON blocked_ips(ip_address);

-- 3. RLS Policies
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert visitor logs (anonymous tracking)
CREATE POLICY "allow_insert_visitor_logs" ON visitor_logs
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read visitor logs (admin check done in app)
CREATE POLICY "allow_read_visitor_logs" ON visitor_logs
  FOR SELECT USING (true);

-- Blocked IPs - full access (admin check done in app)
CREATE POLICY "allow_all_blocked_ips" ON blocked_ips
  FOR ALL USING (true);

-- 4. Auto-cleanup function (delete logs older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_visitor_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM visitor_logs WHERE created_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
