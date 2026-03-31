"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  Building2, 
  MapPin, 
  FileCheck2, 
  Save, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function MerchantSettingsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    cr_number: '',
    city: ''
  });

  useEffect(() => {
    if (!user) return;

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('business_name, cr_number, city')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error("Error loading profile:", error);
      } else if (data) {
        setFormData({
          business_name: data.business_name || '',
          cr_number: data.cr_number || '',
          city: data.city || ''
        });
      }
      setLoading(false);
    }

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        business_name: formData.business_name,
        cr_number: formData.cr_number,
        city: formData.city,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      addToast("فشل تحديث البيانات: " + error.message, "error");
    } else {
      addToast("تم تحديث بيانات المتجر بنجاح", "success");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '8rem 1.5rem 4rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <Link href="/seller/dashboard" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
            color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 700,
            marginBottom: '1rem', transition: '0.2s'
          }} onMouseOver={e=>e.currentTarget.style.color='var(--primary)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-secondary)'}>
            <ArrowRight size={18} /> العودة للوحة التحكم
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--text-primary)' }}>إعدادات <span style={{ color: 'var(--primary)' }}>المتجر</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.5rem' }}>بياناتك التجارية تظهر للمشترين لتعزيز الثقة في متجرك.</p>
        </header>

        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '32px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Previous Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                <Building2 size={20} color="var(--primary)" /> اسم المنشأة / المحل التجاري
              </label>
              <input 
                type="text"
                placeholder="مثال: شركة بوجا لقطع الغيار"
                value={formData.business_name}
                onChange={e => setFormData({...formData, business_name: e.target.value})}
                required
                style={{ 
                  padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', 
                  border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600,
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <FileCheck2 size={20} color="var(--primary)" /> رقم السجل التجاري (CR)
                </label>
                <input 
                  type="text"
                  placeholder="1010XXXXXX"
                  value={formData.cr_number}
                  onChange={e => setFormData({...formData, cr_number: e.target.value})}
                  style={{ 
                    padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', 
                    border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <MapPin size={20} color="var(--primary)" /> المدينة
                </label>
                <select 
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  required
                  style={{ 
                    padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', 
                    border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600,
                    appearance: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="">اختر المدينة</option>
                  <option value="الرياض">الرياض</option>
                  <option value="جدة">جدة</option>
                  <option value="الدمام">الدمام</option>
                  <option value="مكة المكرمة">مكة المكرمة</option>
                  <option value="المدينة المنورة">المدينة المنورة</option>
                  <option value="الخبر">الخبر</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              style={{ 
                marginTop: '1rem', padding: '1.4rem', borderRadius: '18px', background: 'var(--primary)',
                color: 'white', border: 'none', fontWeight: 950, fontSize: '1.2rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                boxShadow: '0 8px 30px rgba(244, 63, 94, 0.4)', transition: '0.3s'
              }}
            >
              {saving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> حفظ بيانات المتجر</>}
            </button>
          </form>

          <div style={{ 
            marginTop: '4rem', paddingTop: '3rem', borderTop: '2px dashed var(--border)',
            display: 'flex', flexDirection: 'column', gap: '1.5rem'
          }}>
            <h4 style={{ margin: 0, fontWeight: 950, fontSize: '1.4rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertCircle size={24} /> منطقة الخطر (إدارة البيانات التجريبية)
            </h4>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.6 }}>
               إذا كنت قد رفعت بيانات تجريبية (Test Data) وتود البدء من جديد، يمكنك مسح كافة منتجاتك بضغطة واحدة. <br />
               <span style={{ color: 'var(--primary)' }}>تحذير: هذا الإجراء لا يمكن التراجع عنه.</span>
            </p>
            
            <button 
              onClick={async () => {
                if (confirm("هل أنت متأكد من حذف كافة المنتجات؟ سيتم مسح مخزونك التجريبي بالكامل.")) {
                  const { error } = await supabase.from('products').delete().eq('seller_id', user?.id);
                  if (error) {
                    addToast("فشل الحذف: " + error.message, "error");
                  } else {
                    addToast("تم مسح كافة المنتجات بنجاح", "success");
                  }
                }
              }}
              style={{ 
                padding: '1.2rem', borderRadius: '16px', background: 'transparent',
                border: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: 900,
                cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'var(--primary)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--primary)';
              }}
            >
              مسح كافة منتجاتي الآن
            </button>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
           <AlertCircle size={16} /> إذا كنت تواجه مشكلة في التوثيق، تواصل مع فريق الدعم الفني.
        </div>
      </div>

      <Footer />
    </main>
  );
}
