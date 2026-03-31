"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/utils';
import { Eye, EyeOff, X as XIcon, Trophy, Heart, ShoppingCart, User, Settings, LogOut, Tag, Zap, Hand, Rocket, Lock, Car } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [liveUsers, setLiveUsers] = useState(247);

  useEffect(() => {
    if (isOpen) {
      setShowSplash(true);
      const timer = setTimeout(() => setShowSplash(false), 5000);
      
      const interval = setInterval(() => {
        setLiveUsers(prev => prev + (Math.random() > 0.5 ? 2 : -1) * Math.floor(Math.random() * 4));
      }, 2500);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  // --- Phone Auth Logic ---
  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    
    try {
      let formattedPhone = phoneNumber.trim();
      if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.substring(1);
      if (!formattedPhone.startsWith('+')) formattedPhone = `966${formattedPhone}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      setIsOtpSent(true);
    } catch (err: any) {
      setAuthError(err.message || 'حدث خطأ أثناء إرسال الكود');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      let formattedPhone = phoneNumber.trim();
      if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.substring(1);
      if (!formattedPhone.startsWith('+')) formattedPhone = `966${formattedPhone}`;

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode,
        type: 'sms',
      });

      if (error) {
        await logSecurityEvent(supabase, {
          type: 'AUTH_FAILURE',
          title: 'فشل تحقق الجوال',
          account: `جوال: ${formattedPhone}`
        });
        throw error;
      }
      
      await logSecurityEvent(supabase, {
        type: 'AUTH_SUCCESS',
        title: 'دخول ناجح بالجوال',
        account: `جوال: ${formattedPhone}`
      });

      onClose();
      setIsOtpSent(false);
      location.reload(); 
    } catch (err: any) {
      setAuthError('كود التحقق غير صحيح، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          await logSecurityEvent(supabase, {
            type: 'AUTH_FAILURE',
            title: 'فشل دخول (إيميل)',
            account: email
          });
          throw error;
        }
        await logSecurityEvent(supabase, {
          type: 'AUTH_SUCCESS',
          title: 'دخول ناجح (إيميل)',
          account: email
        });
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setAuthError('تم إرسال رابط التأكيد لبريدك الإلكتروني');
        return;
      }
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'خطأ في المصادقة');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem'
    }} onClick={onClose}>
      
      <div style={{
        background: 'var(--surface)', borderRadius: '32px', width: '100%', maxWidth: '1000px',
        border: '1px solid var(--border)', boxShadow: '0 40px 100px rgba(0,0,0,0.4)', overflow: 'hidden',
        display: 'flex', position: 'relative', minHeight: '600px', animation: 'modalSlideUp 0.4s ease-out'
      }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{ 
          position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'var(--surface)', 
          border: '1px solid var(--border)', color: 'var(--text-primary)', width: '40px', height: '40px', 
          borderRadius: '50%', cursor: 'pointer', zIndex: 50, display: 'flex', alignItems: 'center', 
          justifyContent: 'center', transition: '0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <XIcon size={20} />
        </button>
        
        {showSplash && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'var(--surface)', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', gap: '1.5rem',
            animation: 'fadeOut 0.5s ease 4.5s forwards'
          }}>
            <div style={{ 
              fontSize: '4.5rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-2px', position: 'relative',
              animation: 'logoReveal 1.2s cubic-bezier(0.77, 0, 0.175, 1)'
            }}>
              BOOGA CAR
              <div style={{
                position: 'absolute', bottom: '-10px', left: '0', height: '4px',
                background: 'var(--primary)', boxShadow: '0 0 20px var(--primary)',
                animation: 'lineGrow 1s ease 0.5s forwards', width: '0'
              }}></div>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 700, opacity: 0, animation: 'fadeInUp 0.6s ease 0.8s forwards' }}>
              المملكة بين يديك...
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ 
                  width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)',
                  animation: `dotPulse 1s ease ${i * 0.15}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        
        <div style={{ flex: '1', position: 'relative', background: 'var(--primary)', display: 'flex', flexDirection: 'column', color: 'white', overflow: 'hidden' }} className="auth-hero"> 
          <img src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=800&q=80" alt="Showcase" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, mixBlendMode: 'overlay' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)', opacity: 0.9 }}></div>
          <div style={{ position: 'relative', zIndex: 10, padding: '4rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '24px', color: 'white', fontSize: '0.85rem', fontWeight: 900, width: 'fit-content', marginBottom: '3rem', backdropFilter: 'blur(10px)' }}>
              <Trophy size={16} /> #1 منصة سيارات في المملكة
            </div>
            <h2 style={{ fontSize: '3.2rem', margin: '0 0 1.5rem', fontWeight: 900, lineHeight: 1.1 }}>
              اكتشف عالم <br /><span style={{ color: 'rgba(255,255,255,0.8)' }}>قطع الغيار</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '3rem', fontWeight: 600 }}>
              كل ما تحتاجه لسيارتك تجده هنا في مكان واحد. تسوق أذكى، أسرع، وبكل ثقة.
            </p>
            <div style={{ marginTop: 'auto' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)' }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 15px #10b981', animation: 'pulse 2s infinite' }}></div>
                 <div>
                   <div style={{ color: 'white', fontWeight: 900, fontSize: '1.8rem', lineHeight: 1 }}>{liveUsers.toLocaleString()}</div>
                   <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 800, marginTop: '0.3rem' }}>مستخدم نشط الآن في المتجر</div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <div style={{ flex: '1', padding: '4rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--surface)' }}>
           <div style={{ marginBottom: '3rem' }}>
             <h2 style={{ fontSize: '2.4rem', marginBottom: '0.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>
               {isLoginMode ? 'أهلاً بك مجدداً' : 'ابدأ رحلتك معنا'}
             </h2>
             <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 600 }}>
               {isLoginMode ? 'سجل دخولك للوصول إلى كافة المميزات' : 'أنشئ حسابك الجديد واستمتع بخصومات حصرية'}
             </p>
           </div>
           
           <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: '14px', padding: '0.4rem', marginBottom: '2rem' }}>
              <button onClick={() => { setAuthMethod('phone'); setIsOtpSent(false); setAuthError(''); }} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', background: authMethod === 'phone' ? 'var(--surface)' : 'transparent', color: authMethod === 'phone' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}>
                رقم الجوال
              </button>
              <button onClick={() => { setAuthMethod('email'); setIsOtpSent(false); setAuthError(''); }} style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: 'none', background: authMethod === 'email' ? 'var(--surface)' : 'transparent', color: authMethod === 'email' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}>
                البريد (للشركات)
              </button>
           </div>
           
           {authMethod === 'phone' ? (
             isOtpSent ? (
               <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div style={{ textAlign: 'center' }}>
                   <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>أدخل رمز التحقق المرسل إلى {phoneNumber}</p>
                 </div>
                 <input type="text" required placeholder="000000" value={otpCode} onChange={e => setOtpCode(e.target.value)} style={{ width: '100%', padding: '1.2rem', textAlign: 'center', letterSpacing: '8px', background: 'var(--surface-hover)', border: '2px solid var(--border)', borderRadius: '14px', fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)', outline: 'none' }} />
                 <button type="submit" disabled={loading} style={{ padding: '1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)' }}>
                   {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
                 </button>
                 {authError && <div style={{ color: 'var(--primary)', fontSize: '0.95rem', padding: '1rem', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)', fontWeight: 700, marginTop: '1rem' }}>{authError}</div>}
                 <button type="button" onClick={() => setIsOtpSent(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer' }}>تغيير الرقم</button>
               </form>
             ) : (
               <form onSubmit={handlePhoneAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem' }}>رقم الجوال</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-secondary)' }}>+966</span>
                      <input type="tel" required placeholder="5XXXXXXXX" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} style={{ width: '100%', padding: '1.2rem', paddingRight: '4.5rem', background: 'var(--surface-hover)', border: '2px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', outline: 'none', fontSize: '1.1rem' }} />
                    </div>
                  </div>
                  {authError && <div style={{ color: 'var(--primary)', fontSize: '0.95rem', padding: '1rem', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)', fontWeight: 700 }}>{authError}</div>}
                  <button type="submit" disabled={loading} style={{ padding: '1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)' }}>
                    {loading ? 'جاري الإرسال...' : 'إرسال كود التحقق'}
                  </button>
               </form>
             )
           ) : (
             <>
               <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem' }}>البريد الإلكتروني</label>
                   <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com" style={{ width: '100%', padding: '1.2rem', background: 'var(--surface-hover)', border: '2px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', outline: 'none', fontSize: '1.1rem', transition: 'all 0.3s' }} />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem' }}>كلمة المرور</label>
                   <div style={{ position: 'relative' }}>
                     <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} style={{ width: '100%', padding: '1.2rem', paddingLeft: '3.5rem', background: 'var(--surface-hover)', border: '2px solid var(--border)', borderRadius: '14px', color: 'var(--text-primary)', outline: 'none', fontSize: '1.1rem', transition: 'all 0.3s' }} />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.2s' }}>
                       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                   </div>
                 </div>
                 {authError && <div style={{ color: 'var(--primary)', fontSize: '0.95rem', padding: '1rem', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)', fontWeight: 700 }}>{authError}</div>}
                 <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 25px rgba(244, 63, 94, 0.3)' }}>
                   {loading ? 'جاري التحقق...' : (isLoginMode ? 'دخول' : 'تسجيل')}
                 </button>
               </form>
               <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 600 }}>
                   {isLoginMode ? 'لا تملك حساباً؟ ' : 'لديك حساب بالفعل؟ '}
                   <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 900, fontSize: '1.05rem', padding: '0 4px' }}>
                     {isLoginMode ? 'سجل الآن' : 'سجل دخولك'}
                   </button>
                 </p>
               </div>
             </>
           )}
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; pointer-events: auto; }
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes logoReveal {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 1; }
        }
        @media (max-width: 900px) {
          .auth-hero { display: none !important; }
        }
      `}</style>
    </div>
  );
}
