"use client";
import { ShieldCheck, Lock, CreditCard, Landmark, Smartphone, MapPin, Phone, Zap, Terminal, Crosshair, Activity, Crown } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user?.email) { setIsAdmin(false); return; }
    if (user.email.startsWith('mrmrx2824') || user.email.startsWith('admin')) {
      setIsAdmin(true);
      return;
    }
    supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
      if (data?.role === 'admin' || data?.role === 'superadmin') setIsAdmin(true);
    });
  }, [user]);

  /* ═══ ADMIN CYBER FOOTER ═══ */
  if (isAdmin) {
    return (
      <footer style={{
        background: '#020205',
        borderTop: '1px solid rgba(76,201,240,0.15)',
        padding: '4rem 2rem 2rem',
        marginTop: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Scanline effect */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, #4cc9f0, transparent)', opacity: 0.6 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(76,201,240,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(76,201,240,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem' }}>
          {/* Brand */}
          <div>
            <h2 style={{ color: '#4cc9f0', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: 950, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Crown size={22} color="#f43f5e" /> BOOGA <span style={{ color: '#f43f5e' }}>CAR</span>
            </h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '6px', color: '#f43f5e', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1.5px', marginBottom: '1rem' }}>
              <Terminal size={11} /> GOD MODE ACTIVE
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, fontSize: '0.9rem' }}>
              نظام إدارة متقدم لمنصة بوجا كار. جميع الصلاحيات ممنوحة.
            </p>
          </div>

          {/* Admin Quick Links */}
          <div>
            <h3 style={{ color: '#4cc9f0', marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Crosshair size={16} /> القيادة السريعة
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                { href: '/admin', label: 'مركز القيادة', icon: <Activity size={14} /> },
                { href: '/admin/products', label: 'ترسانة المنتجات', icon: <Zap size={14} /> },
                { href: '/admin/users', label: 'سجلات المستهدفين', icon: <Crosshair size={14} /> },
                { href: '/admin/finances', label: 'الماليات والعمولات', icon: <Landmark size={14} /> },
              ].map(link => (
                <a key={link.href} href={link.href} style={{
                  color: 'rgba(76,201,240,0.5)', textDecoration: 'none', fontWeight: 700,
                  fontSize: '0.9rem', transition: '0.2s', display: 'flex', alignItems: 'center',
                  gap: '0.6rem',
                }}
                  onMouseOver={e => e.currentTarget.style.color = '#4cc9f0'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(76,201,240,0.5)'}
                >
                  {link.icon} {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div>
            <h3 style={{ color: '#4cc9f0', marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} /> حالة النظام
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'خوادم API', status: 'نشط', color: '#10b981' },
                { label: 'قاعدة البيانات', status: 'متصل', color: '#10b981' },
                { label: 'نظام الدفع', status: 'جاهز', color: '#4cc9f0' },
                { label: 'حماية RLS', status: 'مفعّل', color: '#10b981' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(76,201,240,0.06)' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: item.color, fontSize: '0.8rem', fontWeight: 900 }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 style={{ color: '#4cc9f0', marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
              إجراءات سريعة
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <a href="/sell" style={{
                padding: '0.8rem 1.2rem', borderRadius: '10px',
                background: 'rgba(76,201,240,0.06)', border: '1px solid rgba(76,201,240,0.15)',
                color: '#4cc9f0', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem',
                textAlign: 'center', transition: '0.2s', display: 'block',
              }}>
                إضافة منتج جديد
              </a>
              <a href="/products" style={{
                padding: '0.8rem 1.2rem', borderRadius: '10px',
                background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)',
                color: '#f43f5e', textDecoration: 'none', fontWeight: 800, fontSize: '0.85rem',
                textAlign: 'center', transition: '0.2s', display: 'block',
              }}>
                تصفح كالمستخدم
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ maxWidth: '1200px', margin: '2.5rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(76,201,240,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ color: 'rgba(76,201,240,0.3)', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 8px #f43f5e' }} />
            ADMIN SESSION — {user?.email} — {new Date().toLocaleDateString('ar-SA')}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 600 }}>
            © {new Date().getFullYear()} BOOGA CAR — God Mode v2.0
          </div>
        </div>
      </footer>
    );
  }

  /* ═══ REGULAR FOOTER ═══ */
  return (
    <footer style={{ background: 'var(--background)', borderTop: '1px solid var(--border)', padding: '6rem 2rem 3rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '4rem' }}>
        {/* Brand & Mission */}
        <div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 950, letterSpacing: '1px' }}>
            CAR <span style={{ color: 'var(--primary)' }}>BOOGA</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
            {siteConfig.description}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={18} color="var(--primary)" /> {siteConfig.contact.address}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Phone size={18} color="var(--primary)" /> {siteConfig.contact.phone}
            </div>
          </div>
        </div>
        
        {/* Quick Links */}
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.3rem', fontWeight: 800 }}>روابط الاستكشاف</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {siteConfig.navigation.quickLinks.map(link => (
              <a 
                key={link.href} 
                href={link.href} 
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: '0.2s', fontWeight: 600 }}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        {/* Policies */}
        <div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.3rem', fontWeight: 800 }}>السياسات والثقة</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {siteConfig.navigation.policies.map(link => (
              <a 
                key={link.href} 
                href={link.href} 
                style={{ 
                  color: link.highlight ? '#4cc9f0' : 'var(--text-secondary)', 
                  textDecoration: 'none', 
                  fontWeight: link.highlight ? 800 : 600,
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}
              >
                {link.name} {link.highlight && <ShieldCheck size={18} />}
              </a>
            ))}
          </div>
        </div>

        {/* App Download & Payment Methods */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.2rem', fontSize: '1.3rem', fontWeight: 900 }}>حمل التطبيق الآن</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.8rem' }}>
              <div style={{ gridRow: 'span 2' }}>
                <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ width: '100%', height: 'auto', borderRadius: '10px' }} /></a>
              </div>
              <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" style={{ width: '100%', height: 'auto', borderRadius: '10px' }} /></a>
              <a href="#"><img src="https://consumer-img.huawei.com/content/dam/huawei-cbg-site/common/mkt/pdp/phones/p60-pro/images/appgallery-badge.png" alt="AppGallery" style={{ width: '100%', height: 'auto', borderRadius: '10px' }} /></a>
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.2rem', fontSize: '1.3rem', fontWeight: 900 }}>نقبل طرق الدفع</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--surface)', padding: '1rem', borderRadius: '18px', border: '1px solid var(--border)' }}>
              <img src="https://tabby.ai/logo.png" alt="Tabby" style={{ height: '22px', width: 'auto' }} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ height: '28px', width: 'auto' }} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style={{ height: '18px', width: 'auto' }} />
              <img src="https://www.mada.com.sa/sites/default/files/mada-logo.png" alt="Mada" style={{ height: '22px', width: 'auto' }} />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" style={{ height: '22px', width: 'auto' }} />
              <img src="https://mispay.co/logo.png" alt="MisPay" style={{ height: '24px', width: 'auto' }} />
              <img src="https://tamara.co/logo.png" alt="Tamara" style={{ height: '22px', width: 'auto' }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* KSA Compliance Row */}
      <div style={{ maxWidth: '1200px', margin: '3rem auto 0', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', opacity: 0.6, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
         <div>الرقم الضريبي: 300054321000003</div>
         <div>سجل تجاري: 1010543210</div>
         <div>ترخيص وزارة التجارة: معروف #987654</div>
      </div>

      {/* Copyright */}
      <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
        © {new Date().getFullYear()} تم التطوير بواسطة فريق {siteConfig.nameArabic}. جميع الحقوق محفوظة للمملكة العربية السعودية.
      </div>
    </footer>
  );
}

