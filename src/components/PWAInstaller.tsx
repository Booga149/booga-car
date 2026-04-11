"use client";
import { useEffect, useState } from 'react';
import { Download, X, Smartphone, Zap, Bell, Wifi } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('✅ Service Worker registered:', reg.scope);
      }).catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      // Don't show again for 3 days
      if (Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isiOS);

    // Listen for install prompt (Android/Desktop)
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after 10 seconds of browsing
      setTimeout(() => setShowBanner(true), 10000);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);

    // For iOS, show after 15 seconds
    if (isiOS) {
      setTimeout(() => setShowBanner(true), 15000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  if (isInstalled || (!showBanner && !showIOSGuide)) return null;

  // iOS Guide Modal
  if (showIOSGuide) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 999999,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          background: '#1a1a2e', borderRadius: '24px 24px 0 0',
          padding: '2rem', maxWidth: '400px', width: '100%',
          border: '1px solid rgba(225,29,72,0.2)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'white', fontWeight: 900, fontSize: '1.2rem' }}>
              📱 تثبيت التطبيق
            </h3>
            <button onClick={handleDismiss} style={{
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.8)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(225,29,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.2rem' }}>1️⃣</span>
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                اضغط على زر <strong style={{ color: '#007AFF' }}>المشاركة</strong> (السهم للأعلى ⬆️) في أسفل المتصفح
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.8)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(225,29,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.2rem' }}>2️⃣</span>
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                اختر <strong style={{ color: 'white' }}>"إضافة إلى الشاشة الرئيسية"</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.8)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(225,29,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.2rem' }}>3️⃣</span>
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                اضغط <strong style={{ color: '#10b981' }}>"إضافة"</strong> وسيظهر التطبيق على شاشتك!
              </span>
            </div>
          </div>

          <button onClick={handleDismiss} style={{
            width: '100%', marginTop: '1.5rem', padding: '1rem',
            background: '#e11d48', color: 'white', border: 'none',
            borderRadius: '14px', fontWeight: 900, fontSize: '1rem',
            cursor: 'pointer',
          }}>
            فهمت! 👍
          </button>
        </div>
      </div>
    );
  }

  // Install Banner
  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 99998, width: '92%', maxWidth: '420px',
      animation: 'slideUpBanner 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '20px', padding: '1.5rem',
        border: '1px solid rgba(225,29,72,0.25)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
      }}>
        {/* Close button */}
        <button onClick={handleDismiss} style={{
          position: 'absolute', top: '0.8rem', left: '0.8rem',
          background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)',
          width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={14} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <img src="/favicon.png" alt="Booga Car" style={{
            width: '48px', height: '48px', borderRadius: '14px',
            boxShadow: '0 4px 15px rgba(225,29,72,0.3)',
          }} />
          <div>
            <div style={{ fontWeight: 900, color: 'white', fontSize: '1.05rem' }}>
              حمّل تطبيق Booga Car
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              تجربة أسرع وأذكى 🚀
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {[
            { icon: <Zap size={12} />, text: 'أسرع 3x' },
            { icon: <Wifi size={12} />, text: 'يعمل بدون نت' },
            { icon: <Bell size={12} />, text: 'إشعارات فورية' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.3rem 0.6rem', borderRadius: '8px',
              background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.15)',
              color: '#f43f5e', fontSize: '0.72rem', fontWeight: 700,
            }}>
              {f.icon} {f.text}
            </div>
          ))}
        </div>

        <button onClick={handleInstall} style={{
          width: '100%', padding: '0.9rem',
          background: 'linear-gradient(135deg, #e11d48, #be123c)',
          color: 'white', border: 'none', borderRadius: '14px',
          fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
          boxShadow: '0 8px 25px rgba(225,29,72,0.3)',
          transition: 'all 0.3s',
        }}>
          <Download size={18} />
          {isIOS ? 'كيفية التثبيت' : 'تثبيت التطبيق مجاناً'}
        </button>

        {/* Security note */}
        <div style={{
          marginTop: '0.8rem', textAlign: 'center',
          fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600,
          lineHeight: 1.5,
        }}>
          🔒 تطبيق آمن 100% — لو ظهرت رسالة حماية اضغط &quot;التثبيت على أي حال&quot;
        </div>
      </div>

      <style>{`
        @keyframes slideUpBanner {
          from { opacity: 0; transform: translateX(-50%) translateY(30px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
