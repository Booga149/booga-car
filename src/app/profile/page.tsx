"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Package, ShoppingCart, Settings, Clock, CheckCircle2, Truck, MapPin, Tag, LogOut, Save, AlertCircle, XCircle, ShieldCheck, BarChart3, TrendingUp, Heart as HeartIcon, Eye as EyeIcon, DollarSign } from 'lucide-react';

type Order = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  order_items?: { id: string; quantity: number; price_at_time: number; product_id: string; product_name?: string }[];
};

const STATUS_FLOW = ['قيد المراجعة', 'تم التأكيد', 'جاري الشحن', 'تم التوصيل'];

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const isCancelled = currentStatus === 'ملغي' || currentStatus === 'cancelled';

  const icons = [
    <Clock size={16} key="c" />,
    <CheckCircle2 size={16} key="cf" />,
    <Truck size={16} key="t" />,
    <MapPin size={16} key="m" />,
  ];
  const labels = ['قيد المراجعة', 'تم التأكيد', 'جاري الشحن', 'تم التوصيل'];

  if (isCancelled) {
    return (
      <div style={{ 
        textAlign: 'center', padding: '1rem', color: 'var(--error)', fontWeight: 800, 
        background: 'rgba(var(--error-rgb, 239, 68, 68), 0.1)', border: '1px solid var(--error)', 
        borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', 
        justifyContent: 'center', gap: '0.6rem' 
      }}>
        <XCircle size={18} /> تم إلغاء الطلب
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', padding: '0.8rem 0' }}>
      {/* Progress Line */}
      <div style={{ position: 'absolute', top: '22px', left: '12%', right: '12%', height: '3px', background: 'var(--border)', zIndex: 0 }}>
        <div style={{
          height: '100%', background: 'var(--primary)', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          width: currentIndex <= 0 ? '0%' : `${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%`,
        }} />
      </div>

      {STATUS_FLOW.map((step, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1, gap: '0.6rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? 'var(--primary)' : 'var(--surface)',
              color: done ? '#ffffff' : 'var(--text-secondary)',
              border: '2px solid',
              borderColor: done ? 'transparent' : 'var(--border)',
              boxShadow: active ? '0 0 20px rgba(244, 63, 94, 0.3)' : 'none',
              transform: active ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 0.4s ease',
            }}>
              {icons[i]}
            </div>
            <span style={{
              fontSize: '0.75rem', fontWeight: done ? 800 : 500,
              color: done ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center',
            }}>
              {labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings' | 'analytics'>('orders');
  const [saving, setSaving] = useState(false);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function getData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      setUser(session.user);

      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (prof) setProfile(prof);

        const { data: ords } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        if (ords) setOrders(ords);

        // Fetch seller products if they are a registered merchant
        if (prof?.cr_number) {
           const { data: myProds } = await supabase
              .from('products')
              .select('id, name, price, stock, category, views_count, likes_count, reviews_count, image_url')
              .eq('seller_id', session.user.id);
           if (myProds) setMyProducts(myProds);
        }
      } catch (err) {}
      setLoading(false);
    }
    getData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      full_name: formData.get('full_name'),
      phone: formData.get('phone'),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, ...updates });
    } else {
      alert('خطأ أثناء التحديث: ' + error.message);
    }
    setSaving(false);
  };

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟')) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'ملغي' })
      .eq('id', orderId);

    if (!error) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'ملغي' } : o));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontWeight: 700 }}>جاري تحميل حسابك...</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '6rem 1.5rem', minHeight: '80vh' }}>
      
      {/* Profile Header */}
      {/* Profile Header */}
      {profile?.cr_number ? (
        <div style={{
          background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)', borderRadius: '32px', border: '1px solid #333',
          marginBottom: '3rem',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255, 215, 0, 0.1), inset 0 -2px 0 rgba(0,0,0,0.5)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* VIP Cover Background Effects */}
          <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '140%', height: '140%', background: 'radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.15), transparent 60%)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1), transparent 70%)', pointerEvents: 'none', filter: 'blur(30px)' }}></div>
          
          <div style={{ padding: '3rem 3rem 2rem', display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap', position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            
            {/* VIP Avatar */}
            <div style={{
              width: '120px', height: '120px', borderRadius: '30px', background: 'linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3.5rem', color: '#111', fontWeight: 900, flexShrink: 0, textTransform: 'uppercase',
              boxShadow: '0 15px 35px rgba(212, 175, 55, 0.3), inset 0 2px 5px rgba(255,255,255,0.5)',
              border: '2px solid rgba(255,215,0,0.5)',
              position: 'relative'
            }}>
              {profile?.business_name?.charAt(0) || profile?.full_name?.charAt(0) || user.email?.charAt(0)}
              <div style={{ position: 'absolute', bottom: -10, right: -10, background: '#111', borderRadius: '50%', padding: '0.4rem', border: '1px solid #333' }}>
                 <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16,185,129,0.5)' }}>
                    <ShieldCheck size={16} color="white" />
                 </div>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 0.8rem', fontSize: '2.8rem', fontWeight: 900, color: '#f8f8f8', letterSpacing: '-1px', textShadow: '0 2px 4px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {profile?.business_name || profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                 <p style={{ margin: 0, color: '#999', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <User size={16} color="#D4AF37" /> {user.email}
                 </p>
                 <span style={{ color: '#444' }}>|</span>
                 <p style={{ margin: 0, color: '#999', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Tag size={16} color="#D4AF37" /> سجل تجاري: <span style={{ color: '#fff', letterSpacing: '1px' }}>{profile.cr_number}</span>
                 </p>
                 
                 <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1.2rem', background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))', color: '#D4AF37', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 900, boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)' }}>
                    شريك أعمال استراتيجي - PRO
                 </div>
              </div>
            </div>

            <button onClick={handleLogout} style={{
              padding: '1rem 2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', background: 'rgba(255,255,255,0.03)', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.8rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', fontSize: '1rem',
              backdropFilter: 'blur(10px)'
            }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'; e.currentTarget.style.color = '#ff4d4d'; e.currentTarget.style.transform = 'translateY(-2px)' }} 
               onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <LogOut size={20} /> الخروج
            </button>
          </div>

          {/* VIP Stats Bar */}
          <div style={{ padding: '1.5rem 3rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', position: 'relative', zIndex: 1, background: 'rgba(0,0,0,0.2)' }}>
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                   <CheckCircle2 size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, marginBottom: '0.2rem' }}>موثوقية المتجر</div>
                  <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 900 }}>ممتازة %99.8</div>
                </div>
             </div>
             
             <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
             
             <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                   <Truck size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, marginBottom: '0.2rem' }}>سرعة الشحن والإنجاز</div>
                  <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 900 }}>أولوية (Priority)</div>
                </div>
             </div>

             <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)' }}></div>

             <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                   <Settings size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 700, marginBottom: '0.2rem' }}>مستوى الدعم الفني</div>
                  <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 900 }}>دعم مباشر VIP</div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)',
          padding: '2.5rem', marginBottom: '3rem',
          display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
          boxShadow: 'var(--card-shadow)',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', 
            background: 'linear-gradient(225deg, var(--primary) -50%, transparent 60%)', opacity: 0.1
          }}></div>

          <div style={{
            width: '100px', height: '100px', borderRadius: '24px', background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', color: 'white', fontWeight: 900, flexShrink: 0, textTransform: 'uppercase',
            boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)'
          }}>
            {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: '0 0 0.4rem', fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              أهلاً، {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
              {user.email} 
              <span style={{ padding: '0.3rem 0.8rem', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>حساب عميل مميز</span>
            </p>
          </div>
          <button onClick={handleLogout} style={{
            padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--error)',
            color: 'var(--error)', background: 'transparent', fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.6rem', transition: '0.2s', fontSize: '0.95rem'
          }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.transform = 'translateY(-2px)' }} 
             onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <LogOut size={18} /> تسجيل الخروج
          </button>
        </div>
      )}

      {/* Profile Tabs */}
      <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '3rem', padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px' }}>
        <button onClick={() => setActiveTab('orders')} style={{
          flex: 1, padding: '1.4rem', borderRadius: '12px', fontWeight: 900, fontSize: '1.05rem',
          cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
          color: activeTab === 'orders' ? 'white' : 'var(--text-secondary)',
          border: 'none',
          boxShadow: activeTab === 'orders' ? '0 10px 20px rgba(244, 63, 94, 0.2)' : 'none'
        }}>
          <ShoppingCart size={20} style={{ verticalAlign: 'middle', marginLeft: '0.8rem' }} /> مشترياتي
        </button>
        <button onClick={() => setActiveTab('settings')} style={{
          flex: 1, padding: '1.4rem', borderRadius: '12px', fontWeight: 900, fontSize: '1.05rem',
          cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: activeTab === 'settings' ? 'var(--primary)' : 'transparent',
          color: activeTab === 'settings' ? 'white' : 'var(--text-secondary)',
          border: 'none',
          boxShadow: activeTab === 'settings' ? '0 10px 20px rgba(244, 63, 94, 0.2)' : 'none'
        }}>
          <Settings size={20} style={{ verticalAlign: 'middle', marginLeft: '0.8rem' }} /> الإعدادات
        </button>
      </div>

      {/* ═══ Orders Tab ═══ */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.length === 0 ? (
            <div style={{
              background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '24px',
              padding: '6rem 2rem', textAlign: 'center'
            }}>
              <div style={{ width: '100px', height: '100px', background: 'var(--surface-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                <Package size={48} color="var(--text-secondary)" />
              </div>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 900, fontSize: '1.6rem' }}>لا توجد طلبات سابقة</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontWeight: 600 }}>ابدأ رحلتك واستكشف أفضل قطع الغيار لسيارتك الآن</p>
              <a href="/products" style={{
                background: 'var(--primary)', color: 'white', padding: '1.2rem 3rem',
                borderRadius: '16px', textDecoration: 'none', fontWeight: 900, fontSize: '1.1rem',
                boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)'
              }}>تصفح المتجر</a>
            </div>
          ) : orders.map(order => (
            <div key={order.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px',
              overflow: 'hidden', boxShadow: 'var(--card-shadow)', transition: '0.3s'
            }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{
                padding: '1.5rem 2.5rem', background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
              }}>
                <div>
                  <div style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    طلب <span style={{ color: 'var(--primary)' }}>#BC-{order.id.substring(0, 6).toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.2rem' }}>
                    {new Date(order.created_at).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--success)', letterSpacing: '-0.5px' }}>
                  {order.total?.toLocaleString()} ر.س
                </div>
              </div>
              
              <div style={{ padding: '2.5rem' }}>
                <StatusTimeline currentStatus={order.status} />
              </div>

              <div style={{ padding: '0 2.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} color="var(--primary)" /> {order.shipping_address || '—'}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><Package size={16} color="var(--primary)" /> {order.order_items?.length || 0} قطع</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={16} color="var(--primary)" /> {order.payment_method || '—'}</span>
                </div>
                {order.status === 'قيد المراجعة' && (
                  <button onClick={() => cancelOrder(order.id)} style={{
                    color: 'var(--error)', background: 'transparent', border: '1px solid var(--error)',
                    padding: '0.7rem 1.4rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem',
                    transition: '0.2s'
                  }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>إلغاء الطلب</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ Settings Tab ═══ */}
      {activeTab === 'settings' && (
        <div style={{
          background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)',
          padding: '3rem', boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>تعديل البيانات الشخصية</h2>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>حافظ على بياناتك محدثة لضمان سرعة التوصيل</p>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '2rem' }}>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>الاسم بالكامل</label>
              <input name="full_name" defaultValue={profile?.full_name} placeholder="أدخل اسمك بالكامل" style={{
                padding: '1.2rem', borderRadius: '14px', border: '2px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-primary)', outline: 'none',
                fontWeight: 600, fontSize: '1rem', transition: '0.3s'
              }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
            </div>
            <div style={{ display: 'grid', gap: '0.8rem' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>رقم الجوال</label>
              <input name="phone" defaultValue={profile?.phone} placeholder="05XXXXXXXX" style={{
                padding: '1.2rem', borderRadius: '14px', border: '2px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-primary)',
                textAlign: 'left', direction: 'ltr', fontWeight: 600, fontSize: '1.1rem', transition: '0.3s'
              }} onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
            </div>
            
            <div style={{
              padding: '1.2rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid var(--warning)',
              borderRadius: '16px', color: 'var(--warning)', fontSize: '0.9rem', display: 'flex', gap: '1rem', fontWeight: 600, lineHeight: 1.5
            }}>
              <AlertCircle size={22} style={{ flexShrink: 0 }} />
              <div>نستخدم رقم الجوال و بياناتك الشخصية حصرياً لتسهيل عملية الشحن و ضمان وصول طلباتك بأفضل جودة و أسرع وقت.</div>
            </div>

            <button type="submit" disabled={saving} style={{
              marginTop: '1rem', background: 'var(--primary)', color: '#ffffff', padding: '1.4rem', borderRadius: '16px',
              border: 'none', fontWeight: 900, fontSize: '1.1rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.8rem', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)', transition: '0.3s'
            }} onMouseOver={e => !saving && (e.currentTarget.style.transform = 'translateY(-3px)')} onMouseOut={e => !saving && (e.currentTarget.style.transform = 'translateY(0)')}>
              {saving ? 'جاري الحفظ...' : <><Save size={22} /> حفظ التغييرات</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
