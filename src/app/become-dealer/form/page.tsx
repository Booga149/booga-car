"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  Building2, 
  MapPin, 
  FileCheck, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Rocket
} from 'lucide-react';

export default function DealerFormPage() {
  const { user, openLoginModal } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    cr_number: '',
    city: 'الرياض',
    phone: ''
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
       addToast("يرجى تسجيل الدخول أولاً للمتابعة", "info");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal();
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: formData.business_name,
          cr_number: formData.cr_number,
          city: formData.city,
          phone: formData.phone,
          role: 'seller'
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Notify Admin
      await supabase.from('admin_notifications').insert([{
        type: 'NEW_DEALER',
        title: 'تاجر جديد سجل بالمنصة!',
        message: `المتجر: ${formData.business_name} | السجل: ${formData.cr_number} | المدينة: ${formData.city} | الجوال: ${formData.phone}`,
        is_read: false
      }]);

      setSuccess(true);
      addToast("مبارك! تم تفعيل حساب التاجر الخاص بك بنجاح", "success");
      
      setTimeout(() => {
        window.location.href = '/seller/dashboard';
      }, 3000);
    } catch (error: any) {
      console.error("Error upgrading account:", error);
      addToast(`فشل في ترقية الحساب: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user && !success) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12rem 2rem' }}>
          <div className="glass-panel" style={{ 
            maxWidth: '500px', width: '100%', padding: '4rem 2rem', textAlign: 'center',
            borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--surface)'
          }}>
             <Building2 size={60} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
             <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>سجل دخولك أولاً</h2>
             <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontWeight: 600 }}>يجب أن تملك حساباً عادياً لتتمكن من ترقيته إلى حساب بوجا للأعمال.</p>
             <button onClick={openLoginModal} style={{ 
               background: 'var(--primary)', color: 'white', padding: '1rem 3rem',
               borderRadius: '12px', fontWeight: 800, border: 'none', cursor: 'pointer',
               boxShadow: '0 8px 20px rgba(244, 63, 94, 0.3)'
             }}>تسجيل الدخول / إنشاء حساب</button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ padding: '8rem 1.5rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
        {success ? (
          <div className="glass-panel" style={{ 
            padding: '5rem 3rem', borderRadius: '32px', textAlign: 'center',
            background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)'
          }}>
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', background: '#10b981',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem',
              boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)'
            }}>
              <ShieldCheck size={50} />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '1rem', color: '#10b981' }}>مبارك يا شريك!</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.6 }}>
               لقد تم ترقية حسابك إلى "تاجر معتمد". يمكنك الآن البدء بإضافة قطع الغيار بأسلوب احترافي من لوحة التحكم.
            </p>
            <div style={{ marginTop: '3rem', padding: '1rem', background: 'rgba(16,185,129,0.05)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: '#10b981', fontWeight: 800 }}>
              <Rocket size={20} /> جاري تحويلك للوحة المبيعات...
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ 
            padding: '4rem 3rem', borderRadius: '32px', 
            background: 'var(--surface)', border: '1px solid var(--border)',
            boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ 
               position: 'absolute', top: 0, left: 0, height: '4px', width: step === 1 ? '50%' : '100%', 
               background: 'var(--primary)', transition: '0.5s' 
            }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-1px' }}>انضم كتاجر معتمد</h1>
              <span style={{ fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--background)', padding: '0.4rem 1rem', borderRadius: '40px', fontSize: '0.9rem' }}>الخطوة {step} من 2</span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {step === 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      <Building2 size={18} color="var(--primary)" /> اسم المتجر / المؤسسة
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="مثال: شركة الرمال لقطع الغيار"
                      value={formData.business_name}
                      onChange={e => setFormData({...formData, business_name: e.target.value})}
                      style={{ 
                        width: '100%', padding: '1.2rem', background: 'var(--background)',
                        border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)',
                        fontSize: '1.1rem', outline: 'none', transition: '0.3s', fontWeight: 600
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      <FileCheck size={18} color="var(--primary)" /> الرقم الضريبي أو السجل التجاري
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="مثال: 1010XXXXXX"
                      value={formData.cr_number}
                      onChange={e => setFormData({...formData, cr_number: e.target.value})}
                      style={{ 
                        width: '100%', padding: '1.2rem', background: 'var(--background)',
                        border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)',
                        fontSize: '1.1rem', outline: 'none', transition: '0.3s', fontWeight: 600
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={() => formData.business_name && formData.cr_number && setStep(2)}
                    disabled={!formData.business_name || !formData.cr_number}
                    style={{ 
                      marginTop: '1rem', padding: '1.4rem', background: 'var(--primary)', color: 'white',
                      border: 'none', borderRadius: '16px', fontWeight: 950, fontSize: '1.2rem',
                      cursor: formData.business_name && formData.cr_number ? 'pointer' : 'not-allowed',
                      opacity: formData.business_name && formData.cr_number ? 1 : 0.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                      boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)'
                    }}>
                      التالي <ArrowRight size={20} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                        <MapPin size={18} color="var(--primary)" /> المنطقة / المدينة
                      </label>
                      <select 
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        style={{ 
                          width: '100%', padding: '1.2rem', background: 'var(--background)',
                          border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)',
                          fontSize: '1.1rem', outline: 'none', transition: '0.3s', fontWeight: 600
                        }}>
                        {['الرياض', 'جدة', 'الدمام', 'المدينة المنورة', 'مكة المكرمة', 'القصيم', 'أخرى'].map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>رقم الجوال التجاري</label>
                      <input 
                        required 
                        type="tel" 
                        placeholder="05XXXXXXXX"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        style={{ 
                          width: '100%', padding: '1.2rem', background: 'var(--background)',
                          border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)',
                          fontSize: '1.1rem', outline: 'none', transition: '0.3s', fontWeight: 600
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ padding: '1.5rem', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '16px', border: '1px dashed var(--primary)' }}>
                    <p style={{ display: 'flex', gap: '0.8rem', fontSize: '0.9rem', lineHeight: 1.6, fontWeight: 600 }}>
                       <ShieldCheck size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                       بإرسال هذا الطلب، أنت توافق على شروط بوجا للأعمال وسياسة الخصوصية. سيتم ترقية حسابك فوراً للحصول على شارة التاجر.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      style={{ 
                        flex: 1, padding: '1.4rem', background: 'transparent', color: 'var(--text-primary)',
                        border: '1px solid var(--border)', borderRadius: '16px', fontWeight: 800,
                        cursor: 'pointer'
                      }}>السابق</button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      style={{ 
                        flex: 2, padding: '1.4rem', background: 'var(--primary)', color: 'white',
                        border: 'none', borderRadius: '16px', fontWeight: 950, fontSize: '1.2rem',
                        cursor: 'pointer', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
                      }}>
                        {loading ? 'جاري تفعيل الحساب...' : 'تأكيد التسجيل وتفعيل الحساب'} <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
