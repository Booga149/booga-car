"use client";
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/context/CartContext';
import { Search, Car, Wrench, Phone, MapPin, Send, CheckCircle, ArrowLeft, Sparkles, ShoppingCart, ExternalLink, Loader2, Package, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const carMakes = ['تويوتا','هيونداي','كيا','نيسان','شيفروليه','فورد','هوندا','مرسيدس','بي إم دبليو','لكزس','جينيسيس','مازدا','ميتسوبيشي','سوزوكي','جيب','دودج','كرايسلر','جي إم سي','كاديلاك','أودي','فولكس واجن','بورشه','لاند روفر','جاكوار','إنفينيتي','سوبارو','بيجو','رينو','ستروين','فيات','شانجان','هافال','جيلي','إم جي','BYD','أخرى'];
const cities = ['الرياض','جدة','مكة المكرمة','المدينة المنورة','الدمام','الخبر','الظهران','أبها','تبوك','القصيم','حائل','جازان','نجران','الباحة','الجوف','عرعر','ينبع','الطائف','خميس مشيط','الأحساء','حفر الباطن','أخرى'];
const years = Array.from({ length: 35 }, (_, i) => String(2026 - i));

type Product = { id: string; name: string; price: number; image_url?: string; brand?: string; part_number?: string; stock?: string; category?: string; };

export default function RequestPartPage() {
  const { user } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const searchTimer = useRef<any>(null);

  const [formData, setFormData] = useState({
    car_make: '', car_model: '', car_year: '',
    part_name: '', part_number: '',
    customer_name: '', customer_phone: '', customer_city: 'الرياض',
  });

  const update = (key: string, val: string) => setFormData(prev => ({ ...prev, [key]: val }));

  // Auto-search when part_name changes
  useEffect(() => {
    if (formData.part_name.length < 2) { setSearchResults([]); setSearchDone(false); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(formData.part_name, formData.part_number), 600);
    return () => clearTimeout(searchTimer.current);
  }, [formData.part_name, formData.part_number]);

  const doSearch = async (name: string, partNum: string) => {
    setSearching(true);
    setSearchDone(false);
    try {
      let query = supabase.from('products')
        .select('id, name, price, image_url, brand, part_number, stock, category')
        .eq('stock', 'متوفر')
        .limit(6);

      if (partNum.trim().length > 2) {
        query = query.or(`part_number.ilike.%${partNum}%,name.ilike.%${name}%`);
      } else {
        query = query.ilike('name', `%${name}%`);
      }

      const { data } = await query;
      setSearchResults(data || []);
    } catch { setSearchResults([]); }
    setSearching(false);
    setSearchDone(true);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url || '', brand: product.brand || '' });
    setIsCartOpen(true);
    setAddedIds(prev => [...prev, product.id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('part_requests').insert([{ ...formData, user_id: user?.id || null }]);
      if (error) throw error;
      await supabase.from('admin_notifications').insert([{
        type: 'PART_REQUEST',
        title: '🔍 طلب قطعة جديد!',
        message: `${formData.car_make} ${formData.car_model} ${formData.car_year} - ${formData.part_name} | ${formData.customer_city} | ${formData.customer_phone}`,
        is_read: false,
      }]);
      setSuccess(true);
    } catch (err: any) {
      alert('حصل خطأ: ' + (err?.message || 'حاول مرة تانية'));
    }
    setLoading(false);
  };

  const inp: React.CSSProperties = { width: '100%', padding: '1rem 1.2rem', background: 'var(--surface-hover)', border: '1.5px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, outline: 'none', transition: 'all 0.3s' };
  const lbl: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-secondary)' };

  if (success) return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      <div style={{ padding: '10rem 1.5rem 4rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '32px', padding: '4rem 2.5rem', boxShadow: 'var(--card-shadow)' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 10px 40px rgba(16,185,129,0.3)' }}>
            <CheckCircle size={45} color="white" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '1rem', color: 'var(--text-primary)' }}>تم استلام طلبك! 🎉</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.7, marginBottom: '2rem' }}>
            فريقنا هيدور على القطعة ويتواصل معك على <strong style={{ color: 'var(--primary)' }}>{formData.customer_phone}</strong> في أقرب وقت.
          </p>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', background: 'var(--primary)', color: 'white', borderRadius: '14px', fontWeight: 800, textDecoration: 'none' }}>
            العودة للرئيسية <ArrowLeft size={18} />
          </a>
        </div>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      <div style={{ padding: '8rem 1.5rem 4rem', maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.2rem', background: 'rgba(244,63,94,0.08)', borderRadius: '40px', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>
            <Sparkles size={16} /> خدمة حصرية
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '0.8rem', letterSpacing: '-1px', color: 'var(--text-primary)' }}>مالقيت قطعتك؟ 🔍</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600, maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            ادخل بيانات قطعتك — نبحث لك أولاً في مخزوننا، وإذا ما وجدناها نرسل طلبك لفريقنا فوراً
          </p>
        </div>

        {/* Main Form Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '28px', padding: '2.5rem 2rem', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
          {/* Progress bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', width: step === 1 ? '33%' : step === 2 ? '66%' : '100%', background: 'linear-gradient(90deg, var(--primary), #f97316)', transition: 'width 0.5s ease' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {step === 1 ? '🚗 بيانات السيارة' : step === 2 ? '🔧 بيانات القطعة' : '📱 بيانات التواصل'}
            </h2>
            <span style={{ fontWeight: 800, color: 'var(--text-secondary)', background: 'var(--background)', padding: '0.3rem 0.8rem', borderRadius: '40px', fontSize: '0.82rem' }}>{step} / 3</span>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Step 1: Car Info */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
                <div>
                  <label style={lbl}><Car size={16} color="var(--primary)" /> ماركة السيارة *</label>
                  <select required value={formData.car_make} onChange={e => update('car_make', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">اختر الماركة</option>
                    {carMakes.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}><Car size={16} color="var(--primary)" /> الموديل *</label>
                  <input required type="text" placeholder="مثال: كامري، سوناتا، أكورد..." value={formData.car_model} onChange={e => update('car_model', e.target.value)} style={inp} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={lbl}><Car size={16} color="var(--primary)" /> سنة الصنع</label>
                  <select value={formData.car_year} onChange={e => update('car_year', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">اختر السنة</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => { if (formData.car_make && formData.car_model) setStep(2); }} disabled={!formData.car_make || !formData.car_model}
                  style={{ padding: '1.1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1.05rem', cursor: formData.car_make && formData.car_model ? 'pointer' : 'not-allowed', opacity: formData.car_make && formData.car_model ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 6px 20px rgba(244,63,94,0.3)' }}>
                  التالي <ArrowLeft size={18} />
                </button>
              </div>
            )}

            {/* Step 2: Part Info + Live Search */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
                <div>
                  <label style={lbl}><Wrench size={16} color="var(--primary)" /> اسم أو وصف القطعة *</label>
                  <div style={{ position: 'relative' }}>
                    <textarea required placeholder="مثال: فلتر مكيف، طرمبة بنزين، كشاف أمامي يمين..." rows={3}
                      value={formData.part_name} onChange={e => update('part_name', e.target.value)}
                      style={{ ...inp, resize: 'vertical', minHeight: '80px', paddingLeft: '2.5rem' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                    {searching && <Loader2 size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />}
                  </div>
                </div>

                <div>
                  <label style={lbl}><Search size={16} color="var(--primary)" /> رقم القطعة OEM (اختياري)</label>
                  <input type="text" placeholder="مثال: 04152-YZZA1" value={formData.part_number} onChange={e => update('part_number', e.target.value)} style={{ ...inp, direction: 'ltr', textAlign: 'left' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                </div>

                {/* ─── SMART SEARCH RESULTS ─── */}
                {searching && (
                  <div style={{ background: 'rgba(244,63,94,0.04)', border: '1px dashed var(--primary)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 700 }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                    <div>جارٍ البحث في مخزوننا...</div>
                    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                  </div>
                )}

                {!searching && searchDone && searchResults.length > 0 && (
                  <div style={{ background: 'rgba(16,185,129,0.04)', border: '1.5px solid rgba(16,185,129,0.25)', borderRadius: '18px', padding: '1.2rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981', fontWeight: 800, fontSize: '0.95rem' }}>
                      <CheckCircle size={18} />
                      وجدنا {searchResults.length} نتيجة في مخزوننا! 🎉 يمكنك إضافتها للسلة مباشرة
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {searchResults.map(p => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', borderRadius: '14px', padding: '0.9rem 1rem', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                          {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />}
                          {!p.image_url && <div style={{ width: '56px', height: '56px', background: 'var(--surface-hover)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={24} color="var(--text-secondary)" /></div>}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              {p.brand && <span>{p.brand}</span>}
                              {p.part_number && <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>#{p.part_number}</span>}
                              <span style={{ color: '#10b981', fontWeight: 800 }}>{p.price.toLocaleString('ar-SA')} ر.س</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <Link href={`/products/${p.id}`} target="_blank" style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ExternalLink size={16} />
                            </Link>
                            <button type="button" onClick={() => handleAddToCart(p)}
                              style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', background: addedIds.includes(p.id) ? '#10b981' : 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}>
                              {addedIds.includes(p.id) ? <><CheckCircle size={14} /> أُضيف!</> : <><ShoppingCart size={14} /> أضف للسلة</>}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'var(--surface-hover)', borderRadius: '10px', fontSize: '0.83rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>
                      القطعة اللي تبحث عنها مختلفة أو ما وجدتها؟ اكمل الطلب وفريقنا يدورلك عليها 👇
                    </div>
                  </div>
                )}

                {!searching && searchDone && searchResults.length === 0 && formData.part_name.length > 2 && (
                  <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px dashed rgba(245,158,11,0.3)', borderRadius: '14px', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.88rem' }}>
                    <AlertCircle size={18} />
                    القطعة غير متوفرة حالياً في مخزوننا — أكمل بياناتك وفريقنا يدورلك عليها!
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '1.1rem', background: 'transparent', color: 'var(--text-primary)', border: '1.5px solid var(--border)', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}>السابق</button>
                  <button type="button" onClick={() => { if (formData.part_name) setStep(3); }} disabled={!formData.part_name}
                    style={{ flex: 2, padding: '1.1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1.05rem', cursor: formData.part_name ? 'pointer' : 'not-allowed', opacity: formData.part_name ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 6px 20px rgba(244,63,94,0.3)' }}>
                    {searchResults.length > 0 ? 'القطعة مختلفة؟ أكمل الطلب' : 'التالي'} <ArrowLeft size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.3rem' }}>
                <div>
                  <label style={lbl}><Phone size={16} color="var(--primary)" /> الاسم *</label>
                  <input required type="text" placeholder="اسمك الكريم" value={formData.customer_name} onChange={e => update('customer_name', e.target.value)} style={inp} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={lbl}><Phone size={16} color="var(--primary)" /> رقم الجوال *</label>
                  <input required type="tel" placeholder="05XXXXXXXX" value={formData.customer_phone} onChange={e => update('customer_phone', e.target.value)} style={{ ...inp, direction: 'ltr', textAlign: 'left' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={lbl}><MapPin size={16} color="var(--primary)" /> المدينة *</label>
                  <select required value={formData.customer_city} onChange={e => update('customer_city', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Summary */}
                <div style={{ padding: '1.2rem', background: 'rgba(244,63,94,0.04)', borderRadius: '14px', border: '1px dashed var(--primary)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>📋 ملخص الطلب</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.8 }}>
                    <div>🚗 {formData.car_make} {formData.car_model} {formData.car_year}</div>
                    <div>🔧 {formData.part_name} {formData.part_number && `(${formData.part_number})`}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: '1.1rem', background: 'transparent', color: 'var(--text-primary)', border: '1.5px solid var(--border)', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}>السابق</button>
                  <button type="submit" disabled={loading || !formData.customer_name || !formData.customer_phone}
                    style={{ flex: 2, padding: '1.1rem', background: 'linear-gradient(135deg, var(--primary), #f97316)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 6px 20px rgba(244,63,94,0.4)', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'جاري الإرسال...' : 'أرسل الطلب'} <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Trust badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem', textAlign: 'center' }}>
          {[{ icon: '🔍', text: 'نبحث تلقائياً في مخزوننا' }, { icon: '🚚', text: 'نوصل لكل المملكة' }, { icon: '💬', text: 'نتواصل معك بسرعة' }].map((b, i) => (
            <div key={i} style={{ padding: '1.2rem 0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--card-shadow)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{b.icon}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{b.text}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
