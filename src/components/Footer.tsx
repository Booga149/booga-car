"use client";
import { ShieldCheck, Lock, CreditCard, Landmark, Smartphone, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

export default function Footer() {
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

        {/* App Download & Payment Methods (New Premium Section) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Download App */}
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

          {/* Accept Payment Methods */}
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
