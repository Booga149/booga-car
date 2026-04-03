"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, ShoppingCart, Settings, Clock, CheckCircle2, Truck, MapPin, Tag, LogOut, Save, AlertCircle, XCircle, ShieldCheck, BarChart3, TrendingUp, Heart as HeartIcon, Eye as EyeIcon, DollarSign, Crown, Zap, PackagePlus, Store, Star, Crosshair, Users } from 'lucide-react';

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
  const icons = [<Clock size={16} key="c" />, <CheckCircle2 size={16} key="cf" />, <Truck size={16} key="t" />, <MapPin size={16} key="m" />];
  const labels = ['قيد المراجعة', 'تم التأكيد', 'جاري الشحن', 'تم التوصيل'];

  if (isCancelled) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--error)', fontWeight: 800, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
        <XCircle size={18} /> تم إلغاء الطلب
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', padding: '0.8rem 0' }}>
      <div style={{ position: 'absolute', top: '22px', left: '12%', right: '12%', height: '3px', background: 'var(--border)', zIndex: 0 }}>
        <div style={{ height: '100%', background: 'var(--primary)', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)', width: currentIndex <= 0 ? '0%' : `${(currentIndex / (STATUS_FLOW.length - 1)) * 100}%` }} />
      </div>
      {STATUS_FLOW.map((step, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1, gap: '0.6rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'var(--primary)' : 'var(--surface)', color: done ? '#ffffff' : 'var(--text-secondary)', border: '2px solid', borderColor: done ? 'transparent' : 'var(--border)', boxShadow: active ? '0 0 20px rgba(244, 63, 94, 0.3)' : 'none', transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.4s ease' }}>
              {icons[i]}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: done ? 800 : 500, color: done ? 'var(--text-primary)' : 'var(--text-secondary)', textAlign: 'center' }}>{labels[i]}</span>
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
  const [activeTab, setActiveTab] = useState<string>('orders');
  const [saving, setSaving] = useState(false);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const router = useRouter();
  const isMerchant = !!profile?.cr_number;
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin' || user?.email?.startsWith('mrmrx2824') || user?.email?.startsWith('admin');

  useEffect(() => {
    async function getData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/'); return; }
      setUser(session.user);
      try {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (prof) {
          setProfile(prof);
          const isAdm = prof?.role === 'admin' || prof?.role === 'superadmin' || session.user.email?.startsWith('mrmrx2824') || session.user.email?.startsWith('admin');
          if (prof?.cr_number && !isAdm) {
            setActiveTab('store');
          } else if (isAdm) {
            setActiveTab('orders');
          }
        }
        const { data: ords } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', session.user.id).order('created_at', { ascending: false });
        if (ords) setOrders(ords);
        if (prof?.cr_number) {
           const { data: myProds } = await supabase.from('products').select('id, name, price, stock, category, views_count, likes_count, reviews_count, image_url, is_active').eq('seller_id', session.user.id);
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
    const updates = { full_name: formData.get('full_name'), phone: formData.get('phone'), updated_at: new Date().toISOString() };
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) { setProfile({ ...profile, ...updates }); } else { alert('خطأ أثناء التحديث: ' + error.message); }
    setSaving(false);
  };

  const cancelOrder = async (orderId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟')) return;
    const { error } = await supabase.from('orders').update({ status: 'ملغي' }).eq('id', orderId);
    if (!error) { setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'ملغي' } : o)); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/'); };

  if (loading) return <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', fontWeight: 700 }}>جاري تحميل حسابك...</div>;
  if (!user) return null;

  const totalViews = myProducts.reduce((s, p) => s + (p.views_count || 0), 0);
  const totalLikes = myProducts.reduce((s, p) => s + (p.likes_count || 0), 0);
  const activeProducts = myProducts.filter(p => p.is_active !== false).length;

  return (
    <div style={{ minHeight: '100vh', background: isAdmin ? '#020205' : isMerchant ? '#050400' : 'var(--background)' }}>
      
      {/* ═══════════════════════════════════════════
          ADMIN GOD MODE HERO HEADER
      ═══════════════════════════════════════════ */}
      {isAdmin ? (
        <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '70px' }}>
          {/* Background Layers */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, #0a0a1a 0%, #020208 50%, #020205 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(76,201,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(76,201,240,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,201,240,0.06) 0%, transparent 70%)', animation: 'merchantGlow 5s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,63,94,0.05) 0%, transparent 70%)', animation: 'merchantGlow 8s ease-in-out 2s infinite reverse' }} />
          {/* Cyber particles */}
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`, borderRadius: '50%', background: `rgba(76,201,240,${0.15 + (i % 5) * 0.08})`, left: `${(i * 17 + 5) % 100}%`, top: `${(i * 13 + 8) % 100}%`, animation: `particleUp ${4 + (i % 5)}s ease-in-out ${(i % 4) * 0.7}s infinite`, boxShadow: i % 3 === 0 ? '0 0 6px rgba(76,201,240,0.4)' : 'none' }} />
          ))}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(76,201,240,0.5) 20%, rgba(76,201,240,0.8) 50%, rgba(76,201,240,0.5) 80%, transparent 100%)' }} />

          {/* Hero Content */}
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem 0' }}>
            {/* GOD MODE BADGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '2rem', animation: 'fadeInUp 0.5s ease 0.1s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem 0.4rem 0.7rem', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '100px', color: '#f43f5e', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1.5px' }}>
                <Crown size={13} /> GOD MODE — System Administrator
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(76,201,240,0.1)', border: '1px solid rgba(76,201,240,0.25)', borderRadius: '100px', color: '#4cc9f0', fontSize: '0.72rem', fontWeight: 900 }}>
                <ShieldCheck size={13} /> صلاحيات عليا ✓
              </div>
            </div>

            {/* Main hero row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              {/* Avatar with cyber ring */}
              <div style={{ position: 'relative', flexShrink: 0, animation: 'fadeInUp 0.5s ease 0.2s both' }}>
                <div style={{ position: 'absolute', inset: '-5px', borderRadius: '35px', background: 'conic-gradient(from 0deg, #4cc9f0, #f43f5e, rgba(76,201,240,0.2), #f43f5e, #4cc9f0)', animation: 'spinRing 6s linear infinite', opacity: 0.8 }} />
                <div style={{ width: '110px', height: '110px', borderRadius: '30px', background: 'linear-gradient(135deg, #0a0a1a 0%, #131325 50%, #0a0a1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', color: '#4cc9f0', fontWeight: 900, textTransform: 'uppercase', boxShadow: '0 20px 50px rgba(76,201,240,0.2), inset 0 0 30px rgba(76,201,240,0.05)', position: 'relative', zIndex: 1, border: '2px solid rgba(76,201,240,0.2)' }}>
                  <Crosshair size={48} />
                </div>
                <div style={{ position: 'absolute', bottom: -8, right: -8, background: '#020205', borderRadius: '50%', padding: '3px', zIndex: 2 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #be123c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(244,63,94,0.5)' }}>
                    <Crown size={15} color="white" />
                  </div>
                </div>
              </div>

              {/* Admin info */}
              <div style={{ flex: 1, animation: 'fadeInUp 0.5s ease 0.3s both' }}>
                <h1 style={{ margin: '0 0 0.6rem', fontSize: '3rem', fontWeight: 950, letterSpacing: '-1.5px', lineHeight: 1, color: '#4cc9f0', textShadow: '0 0 30px rgba(76,201,240,0.3)' }}>
                  {profile?.full_name || 'مدير النظام'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={14} color="rgba(76,201,240,0.5)" /> {user.email}
                  </span>
                  <span style={{ color: 'rgba(244,63,94,0.6)', fontSize: '0.78rem', fontWeight: 900, letterSpacing: '1px', fontFamily: 'monospace' }}>
                    ROLE: ADMIN
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.6rem', background: 'linear-gradient(135deg, #4cc9f0, #0891b2)', color: '#020205', borderRadius: '14px', textDecoration: 'none', fontWeight: 900, fontSize: '0.95rem', boxShadow: '0 8px 25px rgba(76,201,240,0.3)', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(76,201,240,0.45)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(76,201,240,0.3)'; }}>
                    <BarChart3 size={18} /> مركز القيادة
                  </Link>
                  <Link href="/admin/users" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.6rem', background: 'rgba(76,201,240,0.08)', color: '#4cc9f0', border: '1px solid rgba(76,201,240,0.25)', borderRadius: '14px', textDecoration: 'none', fontWeight: 800, fontSize: '0.95rem', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(76,201,240,0.15)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(76,201,240,0.08)'; }}>
                    <Users size={18} /> المستخدمين
                  </Link>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.4rem', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ff5555'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                    <LogOut size={16} /> الخروج
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Tabs */}
          </div>
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '2rem 2rem 0' }}>
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(76,201,240,0.1)' }}>
              {[
                { id: 'orders', label: 'مشترياتي', icon: <ShoppingCart size={16}/> },
                { id: 'settings', label: 'إعدادات الحساب', icon: <Settings size={16}/> },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  padding: '0.9rem 1.5rem', border: 'none', cursor: 'pointer',
                  background: 'transparent', fontWeight: 800, fontSize: '0.9rem',
                  color: activeTab === tab.id ? '#4cc9f0' : 'rgba(255,255,255,0.3)',
                  borderBottom: activeTab === tab.id ? '2px solid #4cc9f0' : '2px solid transparent',
                  marginBottom: '-1px', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: activeTab === tab.id ? '0 10px 20px rgba(76,201,240,0.05)' : 'none',
                }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : isMerchant ? (
        <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '70px' }}>
          
          {/* Background Layers */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, #1a1100 0%, #080600 50%, #020200 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(212,175,55,0.03) 59px, rgba(212,175,55,0.03) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(212,175,55,0.02) 59px, rgba(212,175,55,0.02) 60px)', backgroundSize: '60px 60px' }} />
          <div style={{ position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)', animation: 'merchantGlow 5s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', animation: 'merchantGlow 8s ease-in-out 2s infinite reverse' }} />
          {/* Gold particles */}
          {[...Array(15)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`, borderRadius: '50%', background: `rgba(212,175,55,${0.15 + (i % 5) * 0.08})`, left: `${(i * 17 + 5) % 100}%`, top: `${(i * 13 + 8) % 100}%`, animation: `particleUp ${4 + (i % 5)}s ease-in-out ${(i % 4) * 0.7}s infinite`, boxShadow: i % 3 === 0 ? '0 0 6px rgba(212,175,55,0.4)' : 'none' }} />
          ))}
          {/* Top gold line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.6) 20%, rgba(255,215,0,0.9) 50%, rgba(212,175,55,0.6) 80%, transparent 100%)' }} />

          {/* Hero Content */}
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem 0' }}>
            
            {/* PRO BADGE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '2rem', animation: 'fadeInUp 0.5s ease 0.1s both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem 0.4rem 0.7rem', background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', color: '#D4AF37', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px' }}>
                <Crown size={13} /> MERCHANT PRO — حساب تجاري موثق
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '100px', color: '#10b981', fontSize: '0.72rem', fontWeight: 900 }}>
                <ShieldCheck size={13} /> موثق ✓
              </div>
            </div>

            {/* Main hero row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              {/* Avatar with spinning gold ring */}
              <div style={{ position: 'relative', flexShrink: 0, animation: 'fadeInUp 0.5s ease 0.2s both' }}>
                <div style={{ position: 'absolute', inset: '-5px', borderRadius: '35px', background: 'conic-gradient(from 0deg, #D4AF37, #FFD700, rgba(212,175,55,0.2), #FFD700, #D4AF37)', animation: 'spinRing 6s linear infinite', opacity: 0.8 }} />
                <div style={{ width: '110px', height: '110px', borderRadius: '30px', background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 40%, #AA7C11 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', color: '#111', fontWeight: 900, textTransform: 'uppercase', boxShadow: '0 20px 50px rgba(212,175,55,0.35)', position: 'relative', zIndex: 1 }}>
                  {profile?.business_name?.charAt(0) || profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                </div>
                {/* Verified badge on avatar */}
                <div style={{ position: 'absolute', bottom: -8, right: -8, background: '#111', borderRadius: '50%', padding: '3px', zIndex: 2 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16,185,129,0.5)' }}>
                    <ShieldCheck size={15} color="white" />
                  </div>
                </div>
              </div>

              {/* Merchant info */}
              <div style={{ flex: 1, animation: 'fadeInUp 0.5s ease 0.3s both' }}>
                <h1 style={{ margin: '0 0 0.6rem', fontSize: '3rem', fontWeight: 950, letterSpacing: '-1.5px', lineHeight: 1, background: 'linear-gradient(135deg, #FFD700, #D4AF37, #FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'shimmerText 4s ease infinite' }}>
                  {profile?.business_name || profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={14} color="rgba(212,175,55,0.5)" /> {user.email}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Tag size={14} color="rgba(212,175,55,0.5)" /> س.ت: <span style={{ color: 'rgba(212,175,55,0.8)', fontFamily: 'monospace', letterSpacing: '1px' }}>{profile.cr_number}</span>
                  </span>
                </div>
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link href="/seller/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.6rem', background: 'linear-gradient(135deg, #D4AF37, #FFD700, #AA7C11)', color: '#111', borderRadius: '14px', textDecoration: 'none', fontWeight: 900, fontSize: '0.95rem', boxShadow: '0 8px 25px rgba(212,175,55,0.3)', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 35px rgba(212,175,55,0.45)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(212,175,55,0.3)'; }}>
                    <BarChart3 size={18} /> لوحة التحكم
                  </Link>
                  <Link href="/sell" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.6rem', background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '14px', textDecoration: 'none', fontWeight: 800, fontSize: '0.95rem', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <PackagePlus size={18} /> إضافة منتج
                  </Link>
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.4rem', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ff5555'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                    <LogOut size={16} /> الخروج
                  </button>
                </div>
              </div>
            </div>

            {/* Merchant Stats Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(212,175,55,0.1)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.12)', animation: 'fadeInUp 0.5s ease 0.4s both' }}>
              {[
                { label: 'إجمالي المنتجات', value: myProducts.length, icon: <Package size={20}/>, color: '#D4AF37' },
                { label: 'منتج نشط', value: activeProducts, icon: <Zap size={20}/>, color: '#10b981' },
                { label: 'إجمالي المشاهدات', value: totalViews.toLocaleString(), icon: <EyeIcon size={20}/>, color: '#3b82f6' },
                { label: 'الإعجابات', value: totalLikes.toLocaleString(), icon: <HeartIcon size={20}/>, color: '#f43f5e' },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '1rem', backdropFilter: 'blur(10px)' }}>
                  <div style={{ color: stat.color, opacity: 0.8 }}>{stat.icon}</div>
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 950, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginTop: '0.2rem' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Merchant Tabs */}
          <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto', padding: '2rem 2rem 0' }}>
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
              {[
                { id: 'store', label: 'منتجاتي', icon: <Store size={16}/> },
                { id: 'orders', label: 'مشترياتي', icon: <ShoppingCart size={16}/> },
                { id: 'settings', label: 'إعدادات المحل', icon: <Settings size={16}/> },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  padding: '0.9rem 1.5rem', border: 'none', cursor: 'pointer',
                  background: 'transparent', fontWeight: 800, fontSize: '0.9rem',
                  color: activeTab === tab.id ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                  borderBottom: activeTab === tab.id ? '2px solid #D4AF37' : '2px solid transparent',
                  marginBottom: '-1px', transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  boxShadow: activeTab === tab.id ? '0 10px 20px rgba(212,175,55,0.05)' : 'none',
                }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ═══════ REGULAR USER HEADER ═══════ */
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '7rem 1.5rem 0' }}>
          <div style={{ background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', padding: '2.5rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'linear-gradient(225deg, var(--primary) -50%, transparent 60%)', opacity: 0.1 }} />
            <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', fontWeight: 900, flexShrink: 0, textTransform: 'uppercase', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)' }}>
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: '0 0 0.4rem', fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                أهلاً، {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
              </h1>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
                {user.email} 
                <span style={{ padding: '0.3rem 0.8rem', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>عميل مميز</span>
              </p>
            </div>
            <button onClick={handleLogout} style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--error)', color: 'var(--error)', background: 'transparent', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', transition: '0.2s', fontSize: '0.95rem' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <LogOut size={18} /> تسجيل الخروج
            </button>
          </div>
        </div>
      )}

      {/* ═══ PAGE BODY ═══ */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMerchant ? '2rem 2rem 4rem' : '0 1.5rem 4rem' }}>

        {/* Regular user tabs */}
        {!isMerchant && (
          <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '3rem', padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px' }}>
            {[
              { id: 'orders', label: 'مشترياتي', icon: <ShoppingCart size={20} /> },
              { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: '1.4rem', borderRadius: '12px', fontWeight: 900, fontSize: '1.05rem',
                cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                border: 'none', boxShadow: activeTab === tab.id ? '0 10px 20px rgba(244, 63, 94, 0.2)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ═══ MY STORE TAB (Merchant only) ═══ */}
        {isMerchant && activeTab === 'store' && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#D4AF37', fontWeight: 900, fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Package size={22} /> منتجاتي في المتجر
              </h2>
              <Link href="/sell" style={{ padding: '0.7rem 1.5rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.25s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(212,175,55,0.18)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(212,175,55,0.1)'}>
                <PackagePlus size={16} /> إضافة منتج جديد
              </Link>
            </div>

            {myProducts.length === 0 ? (
              <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'rgba(212,175,55,0.03)', borderRadius: '20px', border: '1px dashed rgba(212,175,55,0.15)' }}>
                <Store size={56} color="rgba(212,175,55,0.3)" style={{ marginBottom: '1.5rem' }} />
                <h3 style={{ color: 'rgba(212,175,55,0.6)', fontWeight: 800, marginBottom: '1rem' }}>مخزنك فارغ</h3>
                <p style={{ color: 'rgba(255,255,255,0.25)', marginBottom: '2rem' }}>ابدأ بإضافة منتجاتك لتظهر في المتجر</p>
                <Link href="/sell" style={{ padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #D4AF37, #FFD700)', color: '#111', borderRadius: '14px', textDecoration: 'none', fontWeight: 900 }}>إضافة أول منتج</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.2rem' }}>
                {myProducts.map(prod => (
                  <div key={prod.id} style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ height: '140px', position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={48} color="rgba(212,175,55,0.2)" />
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, background: prod.is_active !== false ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)', color: 'white' }}>
                        {prod.is_active !== false ? 'نشط' : 'موقوف'}
                      </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>{prod.name}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <span style={{ color: '#D4AF37', fontWeight: 900, fontSize: '1.1rem' }}>{prod.price?.toLocaleString()} ر.س</span>
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>مخزون: {prod.stock || 0}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><EyeIcon size={12} /> {prod.views_count || 0}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><HeartIcon size={12} /> {prod.likes_count || 0}</span>
                      </div>
                    </div>
                    <div style={{ padding: '0 1rem 1rem' }}>
                      <Link href={`/seller/products/edit/${prod.id}`} style={{ display: 'block', textAlign: 'center', padding: '0.6rem', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)', color: 'rgba(212,175,55,0.7)', borderRadius: '10px', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 800, transition: '0.2s' }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; e.currentTarget.style.color = '#D4AF37'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.color = 'rgba(212,175,55,0.7)'; }}>
                        تعديل المنتج
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ ORDERS TAB ═══ */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: isMerchant ? '2rem' : '0' }}>
            {orders.length === 0 ? (
              <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '24px', padding: '6rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '100px', height: '100px', background: 'var(--surface-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                  <Package size={48} color="var(--text-secondary)" />
                </div>
                <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 900, fontSize: '1.6rem' }}>لا توجد طلبات سابقة</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontWeight: 600 }}>ابدأ رحلتك واستكشف أفضل قطع الغيار لسيارتك الآن</p>
                <a href="/products" style={{ background: 'var(--primary)', color: 'white', padding: '1.2rem 3rem', borderRadius: '16px', textDecoration: 'none', fontWeight: 900, fontSize: '1.1rem', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)' }}>تصفح المتجر</a>
              </div>
            ) : orders.map(order => (
              <div key={order.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--card-shadow)', transition: '0.3s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ padding: '1.5rem 2.5rem', background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      طلب <span style={{ color: 'var(--primary)' }}>#{order.id.substring(0, 6).toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.2rem' }}>
                      {new Date(order.created_at).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--success)' }}>{order.total?.toLocaleString()} ر.س</div>
                </div>
                <div style={{ padding: '2.5rem' }}><StatusTimeline currentStatus={order.status} /></div>
                <div style={{ padding: '0 2.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap', fontWeight: 600 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} color="var(--primary)" /> {order.shipping_address || '—'}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}><Package size={16} color="var(--primary)" /> {order.order_items?.length || 0} قطع</span>
                  </div>
                  {order.status === 'قيد المراجعة' && (
                    <button onClick={() => cancelOrder(order.id)} style={{ color: 'var(--error)', background: 'transparent', border: '1px solid var(--error)', padding: '0.7rem 1.4rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', transition: '0.2s' }}>إلغاء الطلب</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ SETTINGS TAB ═══ */}
        {activeTab === 'settings' && (
          <div style={{ background: isAdmin ? 'rgba(76,201,240,0.03)' : isMerchant ? 'rgba(212,175,55,0.03)' : 'var(--surface)', borderRadius: '24px', border: isAdmin ? '1px solid rgba(76,201,240,0.15)' : isMerchant ? '1px solid rgba(212,175,55,0.12)' : '1px solid var(--border)', padding: '3rem', boxShadow: 'var(--card-shadow)', marginTop: isAdmin || isMerchant ? '2rem' : '0' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', fontWeight: 900, color: isAdmin ? '#4cc9f0' : isMerchant ? '#D4AF37' : 'var(--text-primary)' }}>{isAdmin ? 'إعدادات المدير' : isMerchant ? 'إعدادات المحل' : 'تعديل البيانات الشخصية'}</h2>
            <p style={{ color: isAdmin ? 'rgba(76,201,240,0.4)' : isMerchant ? 'rgba(212,175,55,0.4)' : 'var(--text-secondary)', fontWeight: 600, marginBottom: '2.5rem' }}>حافظ على بياناتك محدثة</p>
            <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '2rem' }}>
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 800, color: isAdmin ? 'rgba(76,201,240,0.7)' : isMerchant ? 'rgba(212,175,55,0.7)' : 'var(--text-primary)' }}>الاسم بالكامل</label>
                <input name="full_name" defaultValue={profile?.full_name} placeholder="أدخل اسمك بالكامل" style={{ padding: '1.2rem', borderRadius: '14px', border: `2px solid ${isAdmin ? 'rgba(76,201,240,0.2)' : isMerchant ? 'rgba(212,175,55,0.2)' : 'var(--border)'}`, background: isAdmin ? 'rgba(5,5,15,0.6)' : isMerchant ? 'rgba(0,0,0,0.3)' : 'var(--surface-hover)', color: isAdmin || isMerchant ? '#fff' : 'var(--text-primary)', outline: 'none', fontWeight: 600, fontSize: '1rem', transition: '0.3s' }}
                  onFocus={e => e.currentTarget.style.borderColor = isAdmin ? '#4cc9f0' : isMerchant ? 'rgba(212,175,55,0.6)' : 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = isAdmin ? 'rgba(76,201,240,0.2)' : isMerchant ? 'rgba(212,175,55,0.2)' : 'var(--border)'} />
              </div>
              <div style={{ display: 'grid', gap: '0.8rem' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 800, color: isAdmin ? 'rgba(76,201,240,0.7)' : isMerchant ? 'rgba(212,175,55,0.7)' : 'var(--text-primary)' }}>رقم الجوال</label>
                <input name="phone" defaultValue={profile?.phone} placeholder="05XXXXXXXX" style={{ padding: '1.2rem', borderRadius: '14px', border: `2px solid ${isAdmin ? 'rgba(76,201,240,0.2)' : isMerchant ? 'rgba(212,175,55,0.2)' : 'var(--border)'}`, background: isAdmin ? 'rgba(5,5,15,0.6)' : isMerchant ? 'rgba(0,0,0,0.3)' : 'var(--surface-hover)', color: isAdmin || isMerchant ? '#fff' : 'var(--text-primary)', textAlign: 'left', direction: 'ltr', fontWeight: 600, fontSize: '1.1rem', transition: '0.3s' }}
                  onFocus={e => e.currentTarget.style.borderColor = isAdmin ? '#4cc9f0' : isMerchant ? 'rgba(212,175,55,0.6)' : 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = isAdmin ? 'rgba(76,201,240,0.2)' : isMerchant ? 'rgba(212,175,55,0.2)' : 'var(--border)'} />
              </div>
              <button type="submit" disabled={saving} style={{ background: isAdmin ? 'linear-gradient(135deg, #4cc9f0, #0891b2)' : isMerchant ? 'linear-gradient(135deg, #D4AF37, #FFD700)' : 'var(--primary)', color: isAdmin ? '#020205' : isMerchant ? '#111' : '#ffffff', padding: '1.4rem', borderRadius: '16px', border: 'none', fontWeight: 900, fontSize: '1.1rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', boxShadow: isAdmin ? '0 8px 25px rgba(76,201,240,0.3)' : isMerchant ? '0 8px 25px rgba(212,175,55,0.3)' : '0 8px 25px rgba(244, 63, 94, 0.3)', transition: '0.3s' }}
                onMouseOver={e => !saving && (e.currentTarget.style.transform = 'translateY(-3px)')} onMouseOut={e => !saving && (e.currentTarget.style.transform = 'translateY(0)')}>
                {saving ? 'جاري الحفظ...' : <><Save size={22} /> حفظ التغييرات</>}
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes merchantGlow {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.7; }
          50% { transform: translateX(-50%) scale(1.2); opacity: 1; }
        }
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes particleUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-80px); opacity: 0; }
        }
        @keyframes shimmerText {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
