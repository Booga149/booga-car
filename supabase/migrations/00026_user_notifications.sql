-- ═══ User Notifications System ═══
-- Internal notifications for users (order updates, etc.)

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info', -- 'order_update', 'price_response', 'promotion', 'info'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- optional deep link (e.g. /track-order?id=xxx)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_notif_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notif_read ON user_notifications(user_id, is_read);

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "user_notif_select" ON user_notifications FOR SELECT USING (auth.uid() = user_id);
-- System/admin can insert (enforced at app level)
CREATE POLICY "user_notif_insert" ON user_notifications FOR INSERT WITH CHECK (true);
-- Users can mark as read
CREATE POLICY "user_notif_update" ON user_notifications FOR UPDATE USING (auth.uid() = user_id);
