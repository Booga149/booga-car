"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  ChevronRight, 
  Save, 
  Trash2, 
  ArrowLeft, 
  Package, 
  Tag, 
  Settings, 
  Image as ImageIcon, 
  Loader2,
  FileText,
  DollarSign,
  Box,
  Truck
} from 'lucide-react';

export default function SellerProductEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productData, setProductData] = useState<any>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!user || !id) return;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error || !data) {
        addToast("فشل جلب بيانات المنتج", "error");
        router.push('/seller/dashboard');
        return;
      }
      
      // Security check: only owner can edit
      if (data.seller_id !== user.id) {
        addToast("ليس لديك صلاحية لتعديل هذا المنتج", "error");
        router.push('/seller/dashboard');
        return;
      }
      
      setProductData(data);
      setLoading(false);
    }
    
    fetchProduct();
  }, [id, user, router, addToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);
        
      if (error) throw error;
      
      addToast("تمت تحديث البيانات بنجاح", "success");
      router.push('/seller/dashboard');
    } catch (err: any) {
      addToast("فشل التحديث: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      addToast("تم حذف المنتج بنجاح", "success");
      router.push('/seller/dashboard');
    } catch (err: any) {
      addToast("فشل الحذف: " + err.message, "error");
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
      <Loader2 className="animate-spin" size={40} color="var(--primary)" />
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />
      
      <div style={{ padding: '8rem 1.5rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
        <button 
          onClick={() => router.push('/seller/dashboard')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', 
            border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 800,
            marginBottom: '2.5rem', fontSize: '1rem', transition: '0.3s'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={20} /> العودة للوحة التحكم
        </button>

        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
             <h1 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>إدارة المنتج</h1>
             <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600 }}>تعديل بيانات قطعة الغيار: <span style={{ color: 'var(--primary)' }}>{productData?.name}</span></p>
          </div>
          <button 
            onClick={handleDelete}
            disabled={saving}
            style={{ 
              background: 'rgba(244, 63, 94, 0.05)', color: 'var(--primary)', border: '1px solid rgba(244, 63, 94, 0.15)',
              padding: '0.8rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: '0.3s'
            }}
          >
            <Trash2 size={20} /> حذف المنتج
          </button>
        </header>

        <div className="glass-panel" style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '32px',
          padding: '3rem', boxShadow: 'var(--card-shadow)'
        }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* -- Sections Grid -- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '3rem' }}>
              
              {/* Left Column: Basic Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <h4 style={{ margin: 0, fontWeight: 950, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Package size={20} color="var(--primary)" /> المعلومات الأساسية
                </h4>
                
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>اسم المنتج</label>
                  <input 
                    value={productData?.name}
                    onChange={e => setProductData({...productData, name: e.target.value})}
                    required
                    style={{ padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>الماركة</label>
                    <input 
                      value={productData?.brand}
                      onChange={e => setProductData({...productData, brand: e.target.value})}
                      style={{ padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>رقم القطعة</label>
                    <input 
                      value={productData?.part_number}
                      onChange={e => setProductData({...productData, part_number: e.target.value})}
                      style={{ padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>التصنيف</label>
                  <select 
                    value={productData?.category}
                    onChange={e => setProductData({...productData, category: e.target.value})}
                    style={{ padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700, appearance: 'none' }}
                  >
                    <option>الصدامات والواجهة</option>
                    <option>الشمعات والإضاءة</option>
                    <option>الفرامل والأقمشة</option>
                    <option>المساعدات والمقصات</option>
                    <option>البواجي والفلاتر</option>
                    <option>أخرى</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Pricing & Inventory */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 <h4 style={{ margin: 0, fontWeight: 950, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <DollarSign size={20} color="var(--primary)" /> السعر والمخزون
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>السعر الأساسي</label>
                    <input 
                      type="number"
                      value={productData?.price}
                      onChange={e => setProductData({...productData, price: parseFloat(e.target.value)})}
                      style={{ padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--primary)', fontWeight: 900, fontSize: '1.2rem' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>السعر السابق</label>
                    <input 
                      type="number"
                      value={productData?.old_price || ''}
                      onChange={e => setProductData({...productData, old_price: e.target.value ? parseFloat(e.target.value) : null})}
                      style={{ padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>حالة المخزون</label>
                    <select 
                      value={productData?.stock}
                      onChange={e => setProductData({...productData, stock: e.target.value})}
                      style={{ padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700 }}
                    >
                      <option>متوفر</option>
                      <option>غير متوفر</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>الكمية</label>
                    <input 
                      type="number"
                      value={productData?.stock_quantity || 0}
                      onChange={e => setProductData({...productData, stock_quantity: parseInt(e.target.value)})}
                      style={{ padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>رابط الصورة</label>
                  <input 
                    value={productData?.image_url}
                    onChange={e => setProductData({...productData, image_url: e.target.value})}
                    style={{ padding: '1.2rem', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Section: Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <h4 style={{ margin: 0, fontWeight: 950, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <FileText size={20} color="var(--primary)" /> وصف المنتج والبيانات التقنية
              </h4>
              <textarea 
                value={productData?.description || ''}
                onChange={e => setProductData({...productData, description: e.target.value})}
                placeholder="صف مواصفات القطعة، موديلات السيارات المتوافقة، وغيرها من التفاصيل..."
                style={{ 
                  width: '100%', minHeight: '150px', padding: '1.5rem', borderRadius: '20px', 
                  background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', 
                  fontWeight: 600, lineHeight: 1.6, resize: 'vertical'
                }}
              />
            </div>

            <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
               <button 
                type="button"
                onClick={() => router.push('/seller/dashboard')}
                style={{ 
                  padding: '1.2rem 2.5rem', borderRadius: '16px', background: 'var(--background)', 
                  color: 'var(--text-secondary)', border: '1px solid var(--border)', fontWeight: 800, cursor: 'pointer' 
                }}
               >إلغاء</button>
               <button 
                type="submit"
                disabled={saving}
                style={{ 
                  padding: '1.2rem 4rem', borderRadius: '16px', background: 'var(--primary)', 
                  color: 'white', border: 'none', fontWeight: 950, fontSize: '1.1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)'
                }}
               >
                {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />} حفظ التغييرات والعودة
               </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
      
      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 2s linear infinite; }
      `}</style>
    </main>
  );
}
