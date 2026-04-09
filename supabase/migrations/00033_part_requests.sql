-- ═══════════════════════════════════════════════════════════
-- Migration 00033: Part Requests (مالقيت قطعتك؟)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS part_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- بيانات السيارة
  car_make TEXT NOT NULL,         -- الماركة (تويوتا، هونداي...)
  car_model TEXT NOT NULL,        -- الموديل (كامري، سوناتا...)
  car_year TEXT,                  -- السنة
  
  -- بيانات القطعة
  part_name TEXT NOT NULL,        -- اسم أو وصف القطعة
  part_number TEXT,               -- رقم القطعة OEM (اختياري)
  part_image TEXT,                -- صورة القطعة (اختياري)
  
  -- بيانات التواصل
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT DEFAULT 'الرياض',
  
  -- حالة الطلب
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'searching', 'found', 'not_found', 'completed')),
  admin_notes TEXT,               -- ملاحظات الإدارة
  quoted_price DECIMAL(10,2),     -- السعر المعروض
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_part_requests_status ON part_requests(status);
CREATE INDEX IF NOT EXISTS idx_part_requests_user ON part_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_part_requests_recent ON part_requests(created_at DESC);

-- RLS
ALTER TABLE part_requests ENABLE ROW LEVEL SECURITY;

-- أي شخص يقدر يرسل طلب (حتى بدون حساب)
CREATE POLICY "anyone_can_insert_part_request" ON part_requests
  FOR INSERT WITH CHECK (true);

-- المستخدم يشوف طلباته فقط
CREATE POLICY "users_see_own_requests" ON part_requests
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin(auth.uid())
  );

-- الأدمن يقدر يعدل
CREATE POLICY "admin_manage_requests" ON part_requests
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "admin_delete_requests" ON part_requests  
  FOR DELETE USING (public.is_admin(auth.uid()));
