"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Search, Send, Car, Wrench, Phone, CheckCircle2, Clock, DollarSign, ArrowRight, Sparkles, Tag } from 'lucide-react';

const CAR_BRANDS = ['تويوتا', 'هيونداي', 'كيا', 'نيسان', 'شيفروليه', 'فورد', 'هوندا', 'مازدا', 'بي إم دبليو', 'مرسيدس', 'لكزس', 'جمس', 'دودج', 'جيب', 'ميتسوبيشي', 'سوزوكي', 'إيسوزو', 'أودي', 'فولكس واجن', 'أخرى'];

export default function PriceRequestPage() {
  const { user, openLoginModal } = useAuth();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [form, setForm] = useState({
    car_brand: '', car_model: '', car_year: '', part_name: '', part_number: '', description: '', contact_phone: ''
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('price_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setMyRequests(data);
    });
  }, [user, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { openLoginModal(); return; }
    if (!form.car_brand || !form.car_model || !form.car_year || !form.part_name || !form.contact_phone) {
      addToast('يرجى ملء جميع الحقول المطلوبة', 'error'); return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('price_requests').insert([{ ...form, user_id: user.id }]);
      if (error) throw error;
      // Notify admin (non-blocking — don't let this fail the user's request)
      try { await supabase.from('admin_notifications').insert({ type: 'PRICE_REQUEST', title: 'طلب تسعير جديد', message: `${form.part_name} لسيارة ${form.car_brand} ${form.car_model} ${form.car_year}` }); } catch {}
      setSuccess(true);
      setForm({ car_brand: '', car_model: '', car_year: '', part_name: '', part_number: '', description: '', contact_phone: '' });
      addToast('تم إرسال طلب التسعير بنجاح! سنتواصل معك قريباً 🎉', 'success');
    } catch (err) { addToast('حدث خطأ أثناء إرسال الطلب', 'error'); }
    finally { setSubmitting(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '1.1rem 1.2rem', background: 'var(--background)',
    border: '2px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)',
    fontSize: '1rem', fontWeight: 600, outline: 'none', transition: '0.3s'
  };

  const statusColor = (s: string) => s === 'quoted' ? '#10b981' : s === 'fulfilled' ? '#3b82f6' : s === 'closed' ? 'var(--text-secondary)' : '#f59e0b';
  const statusLabel = (s: string) => s === 'quoted' ? 'تم التسعير' : s === 'fulfilled' ? 'تم التوفير' : s === 'closed' ? 'مغلق' : 'قيد المراجعة';

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '8rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(225,29,72,0.06) 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem', background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: '100px', color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 900, marginBottom: '1.5rem' }}>
            <Sparkles size={14} /> خدمة حصرية من Booga Car
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 950, margin: '0 0 1rem', color: 'var(--text-primary)', letterSpacing: '-2px', lineHeight: 1.1 }}>
            سعّرلي <span style={{ color: 'var(--primary)' }}>!</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.7, maxWidth: '500px', margin: '0 auto' }}>
            مش لاقي القطعة اللي تبيها؟ أرسل لنا طلبك وفريقنا هيوفرها لك بأفضل سعر خلال 24 ساعة
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '0 1.5rem 4rem' }}>

        {/* Trust badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { icon: <Clock size={24} />, title: 'رد سريع', desc: 'خلال 24 ساعة كحد أقصى' },
            { icon: <DollarSign size={24} />, title: 'أفضل سعر', desc: 'نقارن الأسعار من عدة موردين' },
            { icon: <CheckCircle2 size={24} />, title: 'بدون التزام', desc: 'استلم السعر وقرر بحريتك' },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{b.icon}</div>
              <div>
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-primary)' }}>{b.title}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '28px', padding: '3rem', boxShadow: 'var(--card-shadow)', marginBottom: '3rem' }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Search size={24} color="var(--primary)" /> أرسل طلب تسعير
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2.5rem' }}>أدخل بيانات سيارتك والقطعة المطلوبة وسنتواصل معك</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Car info row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <Car size={14} style={{ verticalAlign: 'middle', marginLeft: '0.3rem' }} /> ماركة السيارة *
                </label>
                <select value={form.car_brand} onChange={e => setForm({...form, car_brand: e.target.value})} required style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <option value="">اختر الماركة</option>
                  {CAR_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>الموديل *</label>
                <input value={form.car_model} onChange={e => setForm({...form, car_model: e.target.value})} required placeholder="مثال: كامري، أكسنت" style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>سنة الصنع *</label>
                <input value={form.car_year} onChange={e => setForm({...form, car_year: e.target.value})} required placeholder="2024" type="number" min="1990" max="2027" style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
              </div>
            </div>

            {/* Part info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <Wrench size={14} style={{ verticalAlign: 'middle', marginLeft: '0.3rem' }} /> اسم القطعة المطلوبة *
                </label>
                <input value={form.part_name} onChange={e => setForm({...form, part_name: e.target.value})} required placeholder="مثال: فحمات أمامية سيراميك" style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <Tag size={14} style={{ verticalAlign: 'middle', marginLeft: '0.3rem' }} /> رقم القطعة (اختياري)
                </label>
                <input value={form.part_number} onChange={e => setForm({...form, part_number: e.target.value})} placeholder="OEM Part #" style={{...inputStyle, direction: 'ltr', textAlign: 'left'}}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>وصف إضافي (اختياري)</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="أي تفاصيل إضافية مثل أصلي/بديل، يمين/يسار..." style={{...inputStyle, resize: 'vertical'}}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                <Phone size={14} style={{ verticalAlign: 'middle', marginLeft: '0.3rem' }} /> رقم الجوال للتواصل *
              </label>
              <input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} required placeholder="05XXXXXXXX" type="tel" style={{...inputStyle, direction: 'ltr', textAlign: 'left'}}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
            </div>

            <button type="submit" disabled={submitting} style={{
              padding: '1.4rem', background: 'var(--primary)', color: 'white', border: 'none',
              borderRadius: '16px', fontWeight: 900, fontSize: '1.2rem', cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 25px rgba(225,29,72,0.3)', transition: '0.3s', opacity: submitting ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
            }}
              onMouseOver={e => !submitting && (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseOut={e => !submitting && (e.currentTarget.style.transform = 'translateY(0)')}>
              <Send size={22} /> {submitting ? 'جاري الإرسال...' : 'أرسل طلب التسعير'}
            </button>
          </form>
        </div>

        {/* My Previous Requests */}
        {myRequests.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock size={22} /> طلباتي السابقة
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myRequests.map(r => (
                <div key={r.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{r.part_name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 600 }}>
                      {r.car_brand} {r.car_model} {r.car_year} • {new Date(r.created_at).toLocaleDateString('ar-SA')}
                    </p>
                    {r.admin_response && (
                      <div style={{ marginTop: '0.8rem', padding: '0.8rem 1rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
                        {r.admin_response} {r.quoted_price && <span style={{ fontWeight: 900 }}>— {r.quoted_price} ر.س</span>}
                      </div>
                    )}
                  </div>
                  <span style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 900, color: statusColor(r.status), background: `${statusColor(r.status)}15`, border: `1px solid ${statusColor(r.status)}30` }}>
                    {statusLabel(r.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
