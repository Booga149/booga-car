"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useProducts } from '@/context/ProductsContext';
import { PartyPopper, Sparkles } from 'lucide-react';
import { predictMetadata } from '@/lib/searchParser';
import { useToast } from '@/context/ToastContext';

export default function SellPage() {
  const { addProduct } = useProducts();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ 
    name: '', 
    brand: '', 
    price: '', 
    image: '', 
    category: 'أخرى', 
    condition: 'جديد' as 'جديد' | 'مستعمل' 
  });
  const [success, setSuccess] = useState(false);
  const [isSmartFilled, setIsSmartFilled] = useState({ brand: false, category: false });

  const handleSmartFill = () => {
    if (!formData.name) return;
    
    const { brand, category } = predictMetadata(formData.name);
    
    let updated = false;
    const newFilling = { ...isSmartFilled };

    if (brand && !formData.brand) {
      setFormData(prev => ({ ...prev, brand: brand || '' }));
      newFilling.brand = true;
      updated = true;
    }

    if (category && category !== 'أخرى' && formData.category === 'أخرى') {
      setFormData(prev => ({ ...prev, category: category || 'أخرى' }));
      newFilling.category = true;
      updated = true;
    }

    if (updated) {
       setIsSmartFilled(newFilling);
       addToast("تم ملء البيانات بذكاء!", "success");
       // Reset highlights after a while
       setTimeout(() => setIsSmartFilled({ brand: false, category: false }), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.brand) return;
    
    addProduct({
      name: formData.name,
      brand: formData.brand,
      price: Number(formData.price),
      category: formData.category,
      condition: formData.condition,
      stock: 'متوفر',
      shipping: 'عادي',
      image: formData.image || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80',
    });
    setSuccess(true);
    setFormData({ name: '', brand: '', price: '', image: '', category: 'أخرى', condition: 'جديد' });
    
    setTimeout(() => {
      window.location.href = '/';
    }, 2500);
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8rem 1.5rem 4rem' }}>
        <div className="glass-panel" style={{ 
          maxWidth: '650px', width: '100%', padding: '3.5rem', borderRadius: '32px', 
          border: '1px solid var(--border)', background: 'var(--surface)',
          boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', 
            background: 'linear-gradient(225deg, var(--primary) -50%, transparent 60%)', opacity: 0.1
          }}></div>

          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '0.8rem', textAlign: 'center', color: 'var(--primary)', letterSpacing: '-1px' }}>اعرض قطعتك للبيع</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
            شارك قطع سيارتك مع آلاف المشترين في منصة Booga Car الآن.
          </p>

          {success ? (
            <div style={{ 
              textAlign: 'center', padding: '4rem 2rem', background: 'rgba(16, 185, 129, 0.05)', 
              borderRadius: '24px', border: '1px solid var(--success)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem'
            }}>
              <div style={{ 
                background: 'var(--success)', color: 'white', width: '80px', height: '80px', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
              }}>
                <PartyPopper size={40} />
              </div>
              <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '1.8rem', fontWeight: 900 }}>تم النشر بنجاح!</h3>
              <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>ستظهر قطعتك في الصفحة الرئيسية وفي نتائج البحث فوراً.</p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '1rem', background: 'var(--background)', padding: '0.5rem 1.5rem', borderRadius: '30px' }}>جاري التحويل للصفحة الرئيسية...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 800 }}>
                   اسم القطعة
                   <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}><Sparkles size={12}/> خاصية التعبئة الذكية مفعلة</span>
                </label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  onBlur={handleSmartFill}
                  type="text" 
                  placeholder="مثال: فحمات سيراميك تويوتا كامري" 
                  style={{ 
                    width: '100%', padding: '1.2rem', background: 'var(--background)', border: '1px solid var(--border)', 
                    borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1.05rem', outline: 'none', transition: '0.3s', fontWeight: 600
                  }} 
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} 
                  onBlurCapture={handleSmartFill}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 800 }}>الشركة/الماركة</label>
                  <input required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} type="text" placeholder="تويوتا، بوش، الخ" style={{ 
                    width: '100%', padding: '1.2rem', background: 'var(--background)', border: isSmartFilled.brand ? '2px solid #10b981' : '1px solid var(--border)', 
                    borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1.05rem', outline: 'none', transition: '0.5s', fontWeight: 600
                  }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                  {isSmartFilled.brand && <Sparkles size={16} color="#10b981" style={{ position: 'absolute', top: '3.6rem', left: '1rem', animation: 'sparkle 2s' }} />}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 800 }}>السعر (ر.س)</label>
                  <input required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} type="number" placeholder="0" style={{ 
                    width: '100%', padding: '1.2rem', background: 'var(--background)', border: '1px solid var(--border)', 
                    borderRadius: '12px', color: 'var(--primary)', fontSize: '1.1rem', outline: 'none', transition: '0.3s', fontWeight: 900
                  }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 800 }}>الفئة الفنية</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ 
                    width: '100%', padding: '1.2rem', background: 'var(--background)', border: isSmartFilled.category ? '2px solid #10b981' : '1px solid var(--border)', 
                    borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1.05rem', outline: 'none', transition: '0.5s', fontWeight: 600
                  }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <option value="أخرى">أخرى</option>
                    <option>الصدامات والواجهة</option>
                    <option>الشمعات والإضاءة</option>
                    <option>الفرامل والأقمشة</option>
                    <option>المساعدات والمقصات</option>
                    <option>البواجي والفلاتر</option>
                    <option>أجزاء المحرك</option>
                    <option>برمجة وأنظمة ذكية</option>
                  </select>
                  {isSmartFilled.category && <Sparkles size={16} color="#10b981" style={{ position: 'absolute', top: '3.6rem', left: '1rem', animation: 'sparkle 2s' }} />}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 800 }}>الحالة</label>
                  <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value as 'جديد' | 'مستعمل'})} style={{ 
                    width: '100%', padding: '1.2rem', background: 'var(--background)', border: '1px solid var(--border)', 
                    borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1.05rem', outline: 'none', transition: '0.3s', fontWeight: 600
                  }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <option>جديد</option>
                    <option>مستعمل</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 800 }}>رابط صورة المنتج (اختياري)</label>
                <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} type="url" placeholder="https://..." style={{ 
                  width: '100%', padding: '1.2rem', background: 'var(--background)', border: '1px solid var(--border)', 
                  borderRadius: '12px', color: 'var(--text-primary)', fontSize: '1.05rem', outline: 'none', transition: '0.3s', fontWeight: 600
                }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
              </div>

              <button type="submit" style={{ 
                marginTop: '1.5rem', padding: '1.5rem', background: 'var(--primary)', color: 'white', 
                border: 'none', borderRadius: '16px', fontWeight: 900, fontSize: '1.3rem', 
                cursor: 'pointer', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)', 
                transition: 'all 0.3s' 
              }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(244, 63, 94, 0.4)' }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(244, 63, 94, 0.3)' }}>
                انشر الإعلان الآن
              </button>
            </form>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes sparkle {
          0% { transform: scale(0) rotate(0); opacity: 0; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
