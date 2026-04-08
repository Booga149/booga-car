"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Building2, MapPin, FileCheck, ChevronRight, ArrowRight, ShieldCheck, Rocket } from 'lucide-react';

export default function DealerFormPage() {
  const { user, openLoginModal } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [formData, setFormData] = useState({ business_name: '', cr_number: '', city: 'الرياض', phone: '' });
  const [success, setSuccess] = useState(false);
  const [crError, setCrError] = useState('');

  const validateCrNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'يرجى إدخال الرقم';
    if (digits.length === 10) {
      if (digits.startsWith('10') || digits.startsWith('40')) return '';
      return 'السجل التجاري يجب أن يبدأ بـ 10 أو 40';
    }
    if (digits.length === 15) {
      if (digits.startsWith('3')) return '';
      return 'الرقم الضريبي يجب أن يبدأ بـ 3';
    }
    return 'أدخل سجل تجاري (10 أرقام) أو رقم ضريبي (15 رقم)';
  };

  useEffect(() => {
    if (!user) { setCheckingProfile(false); return; }
    supabase.from('profiles').select('cr_number, business_name, dealer_status').eq('id', user.id).single().then(({ data }) => {
      setProfile(data);
      setCheckingProfile(false);
      if (data?.dealer_status === 'approved') {
        addToast("أنت مسجل كتاجر بالفعل!", "info");
        router.replace('/seller/dashboard');
      }
      if (data?.dealer_status === 'pending') {
        addToast("طلبك قيد المراجعة من الإدارة.", "info");
      }
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { openLoginModal(); return; }
    const validationError = validateCrNumber(formData.cr_number);
    if (validationError) { setCrError(validationError); addToast(validationError, 'error'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        business_name: formData.business_name, cr_number: formData.cr_number,
        city: formData.city, phone: formData.phone, dealer_status: 'pending'
      }).eq('id', user.id);
      if (error) throw error;
      
      await supabase.from('admin_notifications').insert([{
        type: 'NEW_DEALER',
        title: '⏳ طلب تاجر جديد بانتظار الموافقة',
        message: `المتجر: ${formData.business_name} | السجل: ${formData.cr_number} | المدينة: ${formData.city} | الجوال: ${formData.phone}`,
        is_read: false
      }]);
      setSuccess(true);
      addToast("تم إرسال طلبك بنجاح! سيتم مراجعته من الإدارة", "success");
    } catch (error: any) {
      addToast(`فشل في إرسال الطلب: ${error.message}`, "error");
    } finally { setLoading(false); }
  };

  if (checkingProfile) {
    return (<main style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Navbar /><div style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>جاري التحقق...</div></main>);
  }

  if (!user && !success) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--background)' }}><Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12rem 2rem' }}>
          <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
             <Building2 size={60} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
             <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>سجل دخولك أولاً</h2>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontWeight: 600 }}>يجب أن تملك حساباً عادياً لتتمكن من ترقيته إلى حساب تاجر.</p>
             <button onClick={openLoginModal} style={{ background: 'var(--primary)', color: 'white', padding: '1rem 3rem', borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(244, 63, 94, 0.3)' }}>تسجيل الدخول / إنشاء حساب</button>
          </div>
        </div>
      </main>
    );
  }

  if (profile?.dealer_status === 'pending') {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--background)' }}><Navbar />
        <div style={{ padding: '8rem 1.5rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '5rem 3rem', borderRadius: '32px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)' }}><Clock size={50} /></div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '1rem', color: '#f59e0b' }}>طلبك قيد المراجعة</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.6 }}>تم إرسال طلبك مسبقاً وهو الآن بانتظار موافقة الإدارة.</p>
            <button onClick={() => window.location.href = '/'} style={{ marginTop: '2rem', padding: '1rem 3rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}>العودة للرئيسية</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}><Navbar />
      <div style={{ padding: '8rem 1.5rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
        {success ? (
          <div className="glass-panel" style={{ padding: '5rem 3rem', borderRadius: '32px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', boxShadow: '0 10px 40px rgba(245, 158, 11, 0.3)' }}><Clock size={50} /></div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '1rem', color: '#f59e0b' }}>تم استلام طلبك!</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.6 }}>طلبك قيد المراجعة. سيتم التحقق من بياناتك التجارية والإشعار بالنتيجة قريباً.</p>
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: '#f59e0b', fontWeight: 800, marginBottom: '0.8rem' }}><ShieldCheck size={20} /> البيانات المرسلة</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600, lineHeight: 2 }}>
                <div>المتجر: <span style={{ color: 'white', fontWeight: 800 }}>{formData.business_name}</span></div>
                <div>السجل/الضريبي: <span style={{ color: 'white', fontWeight: 800 }}>{formData.cr_number}</span></div>
              </div>
            </div>
            <button onClick={() => window.location.href = '/'} style={{ marginTop: '2rem', padding: '1rem 3rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}>العودة للرئيسية</button>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '4rem 3rem', borderRadius: '32px', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: step === 1 ? '50%' : '100%', background: 'var(--primary)', transition: '0.5s' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-1px' }}>انضم كتاجر معتمد</h1>
              <span style={{ fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--background)', padding: '0.4rem 1rem', borderRadius: '40px', fontSize: '0.9rem' }}>الخطوة {step} من 2</span>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {step === 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}><Building2 size={18} color="var(--primary)" /> اسم المتجر / المؤسسة</label>
                    <input required type="text" placeholder="مثال: شركة الرمال لقطع الغيار" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} style={{ width: '100%', padding: '1.2rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontSize: '1.1rem', outline: 'none', transition: '0.3s', fontWeight: 600 }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} />
                  </div>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}><FileCheck size={18} color="var(--primary)" /> الرقم الضريبي أو السجل التجاري</label>
                    <input required type="text" placeholder="سجل تجاري (10 أرقام) أو رقم ضريبي (15 رقم)" value={formData.cr_number} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setFormData({...formData, cr_number: val}); if (crError) setCrError(validateCrNumber(val)); }} maxLength={15} style={{ width: '100%', padding: '1.2rem', background: 'var(--background)', border: crError ? '1px solid #f43f5e' : '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontSize: '1.1rem', outline: 'none', transition: '0.3s', fontWeight: 600, direction: 'ltr', textAlign: 'left' }} onFocus={e => e.currentTarget.style.borderColor = crError ? '#f43f5e' : 'var(--primary)'} onBlur={() => { if (formData.cr_number) setCrError(validateCrNumber(formData.cr_number)); }} />
                    {crError && <p style={{ color: '#f43f5e', fontSize: '0.85rem', fontWeight: 700, margin: '0.5rem 0 0' }}>⚠ {crError}</p>}
                    {!crError && formData.cr_number.length >= 10 && <p style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 700, margin: '0.5rem 0 0' }}>✓ {formData.cr_number.length === 10 ? 'صيغة سجل تجاري صحيحة' : 'صيغة رقم ضريبي صحيحة'}</p>}
                  </div>
                  <button type="button" onClick={() => { const err = validateCrNumber(formData.cr_number); if (err) { setCrError(err); return; } if (formData.business_name && formData.cr_number) setStep(2); }} disabled={!formData.business_name || !formData.cr_number} style={{ marginTop: '1rem', padding: '1.4rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 950, fontSize: '1.2rem', cursor: formData.business_name && formData.cr_number ? 'pointer' : 'not-allowed', opacity: formData.business_name && formData.cr_number ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)' }}>التالي <ArrowRight size={20} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}><MapPin size={18} color="var(--primary)" /> المنطقة / المدينة</label>
                      <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '1.2rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontSize: '1.1rem', outline: 'none', fontWeight: 600 }}>
                        {['الرياض', 'جدة', 'الدمام', 'المدينة المنورة', 'مكة المكرمة', 'القصيم', 'أخرى'].map(city => (<option key={city} value={city}>{city}</option>))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>رقم الجوال التجاري</label>
                      <input required type="tel" placeholder="05XXXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '1.2rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontSize: '1.1rem', outline: 'none', fontWeight: 600 }} />
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '16px', border: '1px dashed var(--primary)' }}>
                    <p style={{ display: 'flex', gap: '0.8rem', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 600 }}><ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0 }} /> بإرسال هذا الطلب، سيتم مراجعة بياناتك التجارية من إدارة المنصة قبل تفعيل حساب التاجر.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '1.4rem', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '16px', fontWeight: 800, cursor: 'pointer' }}>السابق</button>
                    <button type="submit" disabled={loading} style={{ flex: 2, padding: '1.4rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 950, fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>{loading ? 'جاري إرسال الطلب...' : 'إرسال طلب التسجيل'} <ChevronRight size={20} /></button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
