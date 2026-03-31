"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FolderOpen, Loader2, Activity, X, Plus, Save, Trash2, Edit2 } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (data) setProducts(data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefineData = async () => {
    setLoading(true);
    const categoryImages: any = {
      'الصدامات والواجهة': 'https://images.unsplash.com/photo-1621379105494-013620803c58?w=800&q=80',
      'الشمعات والإضاءة': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=800&q=80',
      'الفرامل والأقمشة': 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=800&q=80',
      'المساعدات والمقصات': 'https://images.unsplash.com/photo-1588162818817-f5099f182858?w=800&q=80',
      'البواجي والفلاتر': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
      'الجنوط والكفرات': 'https://images.unsplash.com/photo-1517524008696-ea28c22765bf?w=800&q=80',
    };

    for (const prod of products) {
      const update: any = {};
      if (categoryImages[prod.category] && (prod.image_url?.includes('unsplash.com/photo-1600705544778') || !prod.image_url)) {
        update.image_url = categoryImages[prod.category];
      }
      if (prod.price > 1000) {
        update.price = Math.round(prod.price * 0.7);
        update.old_price = prod.price;
      }
      if (Object.keys(update).length > 0) {
        await supabase.from('products').update(update).eq('id', prod.id);
      }
    }
    await fetchProducts();
    alert('تم تحديث البيانات التجريبية بنجاح!');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const productData = {
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      old_price: formData.get('old_price') ? parseFloat(formData.get('old_price') as string) : null,
      condition: formData.get('condition') as string,
      stock: formData.get('stock') as string,
      shipping: formData.get('shipping') as string,
      image_url: formData.get('image_url') as string,
    };

    try {
      if (currentProduct) {
        await supabase.from('products').update(productData).eq('id', currentProduct.id);
      } else {
        await supabase.from('products').insert([productData]);
      }
      setModalOpen(false);
      await fetchProducts();
    } catch (err: any) {
      alert('خطأ: ' + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('حذف هذا المنتج؟')) return;
    setLoading(true);
    try {
      await supabase.from('products').delete().eq('id', id);
      await fetchProducts();
    } catch (err) {}
    setLoading(false);
  };

  const openModal = (product: any = null) => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem', fontWeight: 800 }}>إدارة المنتجات</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>مراجعة وتعديل قطع الغيار المعروضة على المنصة.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={handleRefineData} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} /> تحسين الصور والأسعار
          </button>
          <button onClick={() => openModal()} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)' }}>
            <Plus size={20} /> إضافة منتج
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 800 }}>المنتج</th>
                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 800 }}>الاسم والماركة</th>
                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 800 }}>السعر</th>
                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 800 }}>الحالة والمخزون</th>
                <th style={{ padding: '1.2rem', color: 'var(--text-secondary)', fontWeight: 800, textAlign: 'center' }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}><Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem' }} /> جاري تحميل البيانات...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>لا توجد منتجات مسجلة.</td></tr>
              ) : products.map(prod => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem' }}>
                    <img src={prod.image_url || 'https://via.placeholder.com/60'} alt="item" style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{prod.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{prod.brand} • {prod.category}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{prod.price} ر.س</div>
                    {prod.old_price && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{prod.old_price} ر.س</div>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{prod.condition}</span>
                      <span style={{ padding: '0.2rem 0.6rem', background: prod.stock === 'متوفر' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: prod.stock === 'متوفر' ? '#059669' : '#dc2626', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>{prod.stock}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button onClick={() => openModal(prod)} style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(prod.id)} style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', width: '100%', maxWidth: '650px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontWeight: 900, color: 'var(--text-primary)' }}>{currentProduct ? 'تعديل بيانات القطعة' : 'إضافة قطعة غيار جديدة'}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'var(--background)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>اسم القطعة</label>
                <input name="name" defaultValue={currentProduct?.name} required style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', outline: 'none' }} placeholder="مثال: طقم فحمات بوش أمامية" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>الماركة</label>
                  <input name="brand" defaultValue={currentProduct?.brand} style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', outline: 'none' }} placeholder="Toyota, Denso, etc." />
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>الفئة</label>
                  <select name="category" defaultValue={currentProduct?.category || 'أخرى'} style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', outline: 'none' }}>
                    <option>الصدامات والواجهة</option>
                    <option>الشمعات والإضاءة</option>
                    <option>الفرامل والأقمشة</option>
                    <option>المساعدات والمقصات</option>
                    <option>البواجي والفلاتر</option>
                    <option>أخرى</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>السعر الأساسي</label>
                  <input name="price" type="number" step="0.01" defaultValue={currentProduct?.price} required style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>السعر قبل الخصم</label>
                  <input name="old_price" type="number" step="0.01" defaultValue={currentProduct?.old_price} style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>الحالة</label>
                  <select name="condition" defaultValue={currentProduct?.condition || 'جديد'} style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', outline: 'none' }}>
                    <option>جديد</option>
                    <option>مستعمل</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>المخزون</label>
                  <select name="stock" defaultValue={currentProduct?.stock || 'متوفر'} style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', outline: 'none' }}>
                    <option>متوفر</option>
                    <option>غير متوفر</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>رابط صورة المنتج</label>
                <input name="image_url" defaultValue={currentProduct?.image_url} required style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '1rem', borderRadius: '12px', outline: 'none' }} placeholder="https://..." />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button type="submit" disabled={loading} style={{ flex: 2, background: 'var(--primary)', color: 'white', border: 'none', padding: '1.2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} حفظ البيانات
                </button>
                <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '1.2rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800 }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { display: inline-block; animation: spin 2s linear infinite; }
      `}</style>
    </div>
  );
}
