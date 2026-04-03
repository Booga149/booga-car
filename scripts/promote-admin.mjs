import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwafrmrgzohcfppftqwz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3YWZybXJnem9oY2ZwcGZ0cXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzU1MjQsImV4cCI6MjA4OTg1MTUyNH0.j_pX83IQltUMdMTAMI03wp4Bh_3kVRGikAmFaVZ7qPM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function promoteToAdmin() {
  console.log('🔐 جاري تسجيل الدخول...');
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'mrmrx2824@gmail.com',
    password: 'Booga14/9@',
  });

  if (authError) {
    console.error('❌ فشل تسجيل الدخول:', authError.message);
    return;
  }

  const userId = authData.user.id;
  const userEmail = authData.user.email;
  console.log('✅ تم تسجيل الدخول! User ID:', userId);

  // Step 1: Check if profile exists
  const { data: profiles, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId);

  console.log('📋 نتيجة البحث عن البروفايل:', profiles, 'خطأ:', selectError?.message);

  if (!profiles || profiles.length === 0) {
    // Profile doesn't exist — create it with admin role
    console.log('⚠️ البروفايل غير موجود! جاري إنشاء بروفايل جديد كـ admin...');
    
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: 'مدير النظام',
        role: 'admin',
      }, { onConflict: 'id' })
      .select();

    if (insertError) {
      console.error('❌ فشل إنشاء البروفايل:', insertError.message, insertError.details);
    } else {
      console.log('🎉 تم إنشاء البروفايل بصلاحيات admin!');
      console.log('📋 البروفايل:', inserted);
    }
  } else {
    // Profile exists — update the role
    console.log('📋 البروفايل موجود، الرتبة الحالية:', profiles[0].role);
    
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('❌ فشل التحديث:', updateError.message);
    } else {
      console.log('🎉 تمت الترقية بنجاح!');
      console.log('📋 البروفايل المحدث:', updated);
    }
  }

  // Final verification
  const { data: finalCheck } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId);
  
  console.log('\n✅ التحقق النهائي:', finalCheck);
}

promoteToAdmin();
