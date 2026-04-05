-- إضافة عمود رقم التلفون لجدول التاجر
-- لعرض رقم التاجر على كارت المنتج لزيادة المصداقية

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT NULL;

-- تحديث الـ RLS عشان المشتري يشوف رقم التاجر
-- السياسة الموجودة بالفعل بتسمح بالقراءة
COMMENT ON COLUMN profiles.phone IS 'رقم التاجر - يظهر على المنتجات لزيادة المصداقية';
