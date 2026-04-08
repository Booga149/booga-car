"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight, ArrowRight, Copy, Check } from 'lucide-react';

type Coupon = {
  id: string; code: string; discount_percent: number; max_uses: number | null;
  current_uses: number; min_order_amount: number; expires_at: string | null;
  is_active: boolean; created_at: string;
};

export default function AdminCouponsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '', discount_type: 'percent', discount_value: '10', discount_percent: '10',
    max_uses: '', min_order_amount: '0', max_discount: '', expires_at: '',
    first_order_only: false, description: ''
  });

  useEffect(() => {
    if (user === undefined) return;
    if (!user) { router.replace('/'); return; }
    fetchCoupons();
  }, [user]);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  };

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = form.code.trim().toUpperCase();
    if (!code || !form.discount_value) { addToast('يرجى ملء الكود والقيمة', 'error'); return; }

    const { error } = await supabase.from('coupons').insert({
      code,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      discount_percent: form.discount_type === 'percent' ? Number(form.discount_value) : 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      min_order_amount: Number(form.min_order_amount) || 0,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      expires_at: form.expires_at || null,
      first_order_only: form.first_order_only,
      description: form.description,
      created_by: user?.id
    });

    if (error) {
      addToast(error.message.includes('duplicate') ? 'هذا الكود مستخدم مسبقاً' : 'خطأ في إنشاء الكوبون', 'error');
    } else {
      addToast('تم إنشاء الكوبون بنجاح! 🎫', 'success');
      setForm({ code: '', discount_type: 'percent', discount_value: '10', discount_percent: '10', max_uses: '', min_order_amount: '0', max_discount: '', expires_at: '', first_order_only: false, description: '' });
      setShowForm(false);
      fetchCoupons();
    }
  };

  const toggleCoupon = async (id: string, currentState: boolean) => {
    await supabase.from('coupons').update({ is_active: !currentState }).eq('id', id);
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentState } : c));
    addToast(!currentState ? 'تم تفعيل الكوبون' : 'تم إيقاف الكوبون', 'success');
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
    await supabase.from('coupons').delete().eq('id', id);
    setCoupons(prev => prev.filter(c => c.id !== id));
    addToast('تم حذف الكوبون', 'success');
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(76,201,240,0.15)', borderRadius: '12px', color: '#fff',
    fontSize: '0.95rem', fontWeight: 600, outline: 'none', transition: '0.3s'
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.3rem', fontSize: '2rem', fontWeight: 950, color: '#4cc9f0', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <Ticket size={28} /> إدارة الكوبونات
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>إنشاء وإدارة أكواد الخصم للعملاء</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem',
          background: showForm ? 'rgba(239,68,68,0.15)' : 'rgba(76,201,240,0.15)',
          border: `1px solid ${showForm ? 'rgba(239,68,68,0.3)' : 'rgba(76,201,240,0.3)'}`,
          color: showForm ? '#ef4444' : '#4cc9f0', borderRadius: '14px', fontWeight: 900,
          fontSize: '0.9rem', cursor: 'pointer', transition: '0.2s'
        }}>
          {showForm ? '✕ إلغاء' : <><Plus size={18} /> كوبون جديد</>}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{
          background: 'rgba(76,201,240,0.03)', border: '1px solid rgba(76,201,240,0.12)',
          borderRadius: '20px', padding: '2rem', marginBottom: '2rem', animation: 'fadeInUp 0.3s ease'
        }}>
          <h3 style={{ color: '#4cc9f0', fontWeight: 900, marginBottom: '1.5rem', fontSize: '1.2rem' }}>➕ إنشاء كوبون جديد</h3>
          <form onSubmit={createCoupon} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 800 }}>كود الخصم *</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required
                placeholder="مثال: WELCOME20" style={{...inputStyle, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 900}}
                onFocus={e => e.currentTarget.style.borderColor = '#4cc9f0'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(76,201,240,0.15)'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 800 }}>نسبة الخصم (%) *</label>
              <input value={form.discount_percent} onChange={e => setForm({...form, discount_percent: e.target.value})} required
                type="number" min="1" max="100" placeholder="15" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = '#4cc9f0'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(76,201,240,0.15)'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 800 }}>عدد الاستخدامات (فارغ = غير محدود)</label>
              <input value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})}
                type="number" min="1" placeholder="∞" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = '#4cc9f0'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(76,201,240,0.15)'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 800 }}>الحد الأدنى للطلب (ر.س)</label>
              <input value={form.min_order_amount} onChange={e => setForm({...form, min_order_amount: e.target.value})}
                type="number" min="0" placeholder="0" style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = '#4cc9f0'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(76,201,240,0.15)'} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 800 }}>تاريخ الانتهاء (فارغ = لا ينتهي)</label>
              <input value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})}
                type="datetime-local" style={{...inputStyle, colorScheme: 'dark'}}
                onFocus={e => e.currentTarget.style.borderColor = '#4cc9f0'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(76,201,240,0.15)'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" style={{
                width: '100%', padding: '0.9rem', background: 'linear-gradient(135deg, #4cc9f0, #06b6d4)',
                color: '#000', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '0.95rem',
                cursor: 'pointer', boxShadow: '0 6px 20px rgba(76,201,240,0.3)', transition: '0.3s'
              }}>
                إنشاء الكوبون ✓
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(76,201,240,0.5)', fontWeight: 700 }}>جاري التحميل...</div>
      ) : coupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(76,201,240,0.02)', borderRadius: '24px', border: '1px dashed rgba(76,201,240,0.1)' }}>
          <Ticket size={48} color="rgba(76,201,240,0.2)" />
          <h3 style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginTop: '1rem' }}>لا توجد كوبونات بعد</h3>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>أنشئ أول كوبون خصم لعملائك!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '20px', border: '1px solid rgba(76,201,240,0.1)', background: 'rgba(76,201,240,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(76,201,240,0.08)' }}>
                {['الكود', 'الخصم', 'الاستخدامات', 'الحد الأدنى', 'الانتهاء', 'الحالة', 'إجراءات'].map((h, i) => (
                  <th key={i} style={{ padding: '1rem 1.2rem', color: 'rgba(76,201,240,0.45)', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id} style={{ borderTop: '1px solid rgba(76,201,240,0.05)', transition: '0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(76,201,240,0.03)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '1.2rem', fontFamily: 'monospace', fontWeight: 900, fontSize: '1.05rem', color: '#4cc9f0', letterSpacing: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {c.code}
                      <button onClick={() => copyCode(c.code, c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === c.id ? '#10b981' : 'rgba(255,255,255,0.3)', transition: '0.2s', padding: '2px' }}>
                        {copiedId === c.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem', color: '#10b981', fontWeight: 900, fontSize: '1.1rem' }}>{c.discount_percent}%</td>
                  <td style={{ padding: '1.2rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>
                    {c.current_uses} / {c.max_uses || '∞'}
                  </td>
                  <td style={{ padding: '1.2rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
                    {c.min_order_amount > 0 ? `${c.min_order_amount} ر.س` : '—'}
                  </td>
                  <td style={{ padding: '1.2rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.85rem' }}>
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('ar-SA') : 'لا ينتهي'}
                  </td>
                  <td style={{ padding: '1.2rem' }}>
                    <button onClick={() => toggleCoupon(c.id, c.is_active)} style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none',
                      cursor: 'pointer', color: c.is_active ? '#10b981' : '#f87171', fontWeight: 800, fontSize: '0.85rem'
                    }}>
                      {c.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      {c.is_active ? 'نشط' : 'متوقف'}
                    </button>
                  </td>
                  <td style={{ padding: '1.2rem' }}>
                    <button onClick={() => deleteCoupon(c.id)} style={{
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                      borderRadius: '10px', padding: '0.5rem 0.8rem', cursor: 'pointer', color: '#ef4444', transition: '0.2s'
                    }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                       onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
