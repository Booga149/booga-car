"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/utils';
import { Eye, EyeOff, X as XIcon, Trophy, Shield, Sparkles, Star, ArrowRight, Phone, Mail, Lock, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

/* Google SVG Icon */
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

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
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    if (isOpen) {
      setShowSplash(true);
      const timer = setTimeout(() => setShowSplash(false), 3500);
      
      const interval = setInterval(() => {
        setLiveUsers(prev => prev + (Math.random() > 0.5 ? 2 : -1) * Math.floor(Math.random() * 4));
      }, 2500);
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  // --- Google Auth ---
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setAuthError(err.message || 'فشل تسجيل الدخول بجوجل');
      setLoading(false);
    }
  };

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
        setAuthError('تم إرسال رابط التأكيد لبريدك الإلكتروني ✅');
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

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '1.1rem 1.4rem',
    background: focusedField === field ? 'var(--background)' : 'var(--surface-hover)',
    border: focusedField === field ? '2px solid var(--primary)' : '2px solid var(--border)',
    borderRadius: '16px',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(244, 63, 94, 0.1)' : 'none',
  });

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(20px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem'
    }} onClick={onClose}>
      
      <div style={{
        background: 'var(--surface)', borderRadius: '28px', width: '100%', maxWidth: '1050px',
        border: '1px solid var(--border)', 
        boxShadow: '0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05) inset', 
        overflow: 'hidden',
        display: 'flex', position: 'relative', minHeight: '620px', 
        animation: 'authModalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{ 
          position: 'absolute', top: '1.2rem', left: '1.2rem', 
          background: 'rgba(255,255,255,0.08)', 
          border: '1px solid rgba(255,255,255,0.12)', 
          color: 'white', width: '38px', height: '38px', 
          borderRadius: '12px', cursor: 'pointer', zIndex: 50, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          transition: 'all 0.2s',
        }}>
          <XIcon size={18} />
        </button>
        
        {/* Splash Animation */}
        {showSplash && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'linear-gradient(135deg, #0f0f12 0%, #1a1a2e 50%, #0f0f12 100%)', 
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', gap: '1.5rem',
            animation: 'splashFadeOut 0.6s ease 3s forwards'
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                fontSize: '4rem', fontWeight: 950, letterSpacing: '-3px',
                background: 'linear-gradient(135deg, #f43f5e, #fb923c, #f43f5e)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'logoReveal 1s cubic-bezier(0.77, 0, 0.175, 1), gradientShift 3s ease infinite',
              }}>
                BOOGA CAR
              </div>
              <div style={{
                position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
                height: '3px', borderRadius: '2px',
                background: 'linear-gradient(90deg, transparent, #f43f5e, transparent)',
                animation: 'lineGrow 0.8s ease 0.4s forwards', width: '0'
              }} />
            </div>
            <div style={{ 
              color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 600, 
              opacity: 0, animation: 'fadeInUp 0.5s ease 0.7s forwards',
              letterSpacing: '4px', textTransform: 'uppercase'
            }}>
              Premium Auto Parts
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ 
                  width: '8px', height: '8px', borderRadius: '50%', 
                  background: '#f43f5e',
                  animation: `dotPulse 1s ease ${i * 0.15}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        
        {/* === LEFT SIDE: Hero === */}
        <div style={{ 
          flex: '1.1', position: 'relative', overflow: 'hidden', 
          display: 'flex', flexDirection: 'column'
        }} className="auth-hero">
          
          {/* Gradient Background */}
          <div style={{ 
            position: 'absolute', inset: 0, 
            background: 'linear-gradient(160deg, #0f0f12 0%, #1a1025 30%, #1e1030 60%, #0f0f12 100%)',
          }} />
          
          {/* Animated Orbs */}
          <div style={{ 
            position: 'absolute', top: '-20%', right: '-30%', width: '500px', height: '500px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)',
            animation: 'orbFloat 8s ease-in-out infinite',
          }} />
          <div style={{ 
            position: 'absolute', bottom: '-10%', left: '-20%', width: '400px', height: '400px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            animation: 'orbFloat 10s ease-in-out infinite reverse',
          }} />
          
          {/* Grid Pattern */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          
          {/* Content */}
          <div style={{ 
            position: 'relative', zIndex: 10, padding: '3.5rem', 
            display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'
          }}>
            {/* Badge */}
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
              padding: '0.5rem 1rem', 
              background: 'rgba(244,63,94,0.1)', 
              border: '1px solid rgba(244,63,94,0.2)', 
              borderRadius: '100px', 
              color: '#f43f5e', fontSize: '0.8rem', fontWeight: 800, 
              width: 'fit-content', marginBottom: '2.5rem',
              animation: 'fadeInUp 0.6s ease 0.2s both'
            }}>
              <Trophy size={14} /> #1 منصة سيارات في المملكة
            </div>
            
            {/* Title */}
            <h2 style={{ 
              fontSize: '3rem', margin: '0 0 1.2rem', fontWeight: 950, lineHeight: 1.05,
              color: 'white', letterSpacing: '-1px',
              animation: 'fadeInUp 0.6s ease 0.3s both'
            }}>
              مرحباً بك في
              <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #f43f5e, #fb923c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>عالم السيارات</span>
            </h2>
            
            <p style={{ 
              color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem', lineHeight: 1.7, 
              marginBottom: '3rem', fontWeight: 500, maxWidth: '380px',
              animation: 'fadeInUp 0.6s ease 0.4s both'
            }}>
              أكبر متجر إلكتروني لقطع غيار السيارات في المملكة العربية السعودية.
              تسوق بثقة واستمتع بتجربة فريدة.
            </p>
            
            {/* Features */}
            <div style={{ 
              display: 'flex', flexDirection: 'column', gap: '1rem',
              animation: 'fadeInUp 0.6s ease 0.5s both'
            }}>
              {[
                { icon: <Shield size={18} />, text: 'ضمان أصالة 100% على جميع القطع' },
                { icon: <Sparkles size={18} />, text: 'توصيل سريع لكل مدن المملكة' },
                { icon: <Star size={18} />, text: 'أسعار تنافسية وعروض حصرية' },
              ].map((feat, i) => (
                <div key={i} style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 600,
                }}>
                  <div style={{ 
                    color: '#f43f5e', 
                    background: 'rgba(244,63,94,0.1)', 
                    padding: '0.4rem', borderRadius: '8px', display: 'flex' 
                  }}>
                    {feat.icon}
                  </div>
                  {feat.text}
                </div>
              ))}
            </div>
            
            {/* Live Users */}
            <div style={{ 
              marginTop: 'auto', paddingTop: '2rem',
              animation: 'fadeInUp 0.6s ease 0.6s both'
            }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', 
                background: 'rgba(255,255,255,0.04)', 
                padding: '1.2rem 1.5rem', borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.06)' 
              }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    width: '10px', height: '10px', borderRadius: '50%', 
                    background: '#10b981', 
                  }} />
                  <div style={{ 
                    position: 'absolute', inset: '-3px', borderRadius: '50%', 
                    border: '2px solid #10b981', opacity: 0.4,
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' 
                  }} />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 900, fontSize: '1.4rem', lineHeight: 1 }}>
                    {liveUsers.toLocaleString()}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.2rem' }}>
                    متصل الآن
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT SIDE: Form === */}
        <div style={{ 
          flex: '1', padding: '3rem 3rem', display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', background: 'var(--surface)',
          overflowY: 'auto',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.9rem', marginBottom: '0.5rem', fontWeight: 950, 
              color: 'var(--text-primary)', letterSpacing: '-0.5px'
            }}>
              {isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>
              {isLoginMode ? 'أدخل بياناتك للوصول إلى حسابك' : 'انضم لأكبر مجتمع سيارات في المملكة'}
            </p>
          </div>

          {/* Google Sign-In Button */}
          <button 
            onClick={handleGoogleSignIn}
            style={{
              width: '100%', padding: '0.95rem', borderRadius: '14px',
              background: 'var(--surface-hover)', 
              border: '2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
              cursor: 'pointer', transition: 'all 0.3s', fontWeight: 700,
              fontSize: '0.95rem', color: 'var(--text-primary)',
              marginBottom: '1.5rem',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'rgba(66,133,244,0.5)';
              e.currentTarget.style.background = 'rgba(66,133,244,0.05)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(66,133,244,0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface-hover)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <GoogleIcon />
            المتابعة بحساب Google
          </button>

          {/* Divider */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '1rem', 
            margin: '0.5rem 0 1.5rem',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              أو استخدم
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          {/* Method Toggle */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--background)', 
            borderRadius: '12px', 
            padding: '0.3rem', 
            marginBottom: '1.5rem',
            border: '1px solid var(--border)',
          }}>
            <button 
              onClick={() => { setAuthMethod('phone'); setIsOtpSent(false); setAuthError(''); }} 
              style={{ 
                flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', 
                background: authMethod === 'phone' ? 'var(--surface)' : 'transparent', 
                color: authMethod === 'phone' ? 'var(--primary)' : 'var(--text-secondary)', 
                fontWeight: 800, cursor: 'pointer', transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontSize: '0.85rem',
                boxShadow: authMethod === 'phone' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Phone size={16} /> الجوال
            </button>
            <button 
              onClick={() => { setAuthMethod('email'); setIsOtpSent(false); setAuthError(''); }} 
              style={{ 
                flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', 
                background: authMethod === 'email' ? 'var(--surface)' : 'transparent', 
                color: authMethod === 'email' ? 'var(--primary)' : 'var(--text-secondary)', 
                fontWeight: 800, cursor: 'pointer', transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontSize: '0.85rem',
                boxShadow: authMethod === 'email' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Mail size={16} /> البريد
            </button>
          </div>
           
          {/* Forms */}
          {authMethod === 'phone' ? (
            isOtpSent ? (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ 
                  textAlign: 'center', padding: '1.5rem', 
                  background: 'rgba(244,63,94,0.04)', borderRadius: '16px',
                  border: '1px solid rgba(244,63,94,0.1)',
                }}>
                  <CheckCircle2 size={32} color="#f43f5e" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
                    تم إرسال رمز التحقق إلى
                  </p>
                  <p style={{ fontWeight: 900, color: 'var(--primary)', margin: '0.3rem 0 0', fontSize: '1.1rem', direction: 'ltr' }}>
                    +966{phoneNumber}
                  </p>
                </div>
                <input 
                  type="text" required placeholder="000000" 
                  value={otpCode} onChange={e => setOtpCode(e.target.value)} 
                  style={{ 
                    ...inputStyle('otp'),
                    textAlign: 'center', letterSpacing: '10px', 
                    fontSize: '1.5rem', fontWeight: 900, 
                    color: 'var(--primary)',
                  }} 
                  onFocus={() => setFocusedField('otp')}
                  onBlur={() => setFocusedField('')}
                />
                <button type="submit" disabled={loading} className="auth-submit-btn" style={{ 
                  padding: '1.1rem', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', 
                  color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, 
                  cursor: 'pointer', fontSize: '1rem',
                  boxShadow: '0 8px 25px rgba(244, 63, 94, 0.25)',
                  transition: 'all 0.3s',
                }}>
                  {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
                </button>
                {authError && <div style={{ color: '#f43f5e', fontSize: '0.9rem', padding: '0.8rem', background: 'rgba(244, 63, 94, 0.06)', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.15)', fontWeight: 700, textAlign: 'center' }}>{authError}</div>}
                <button type="button" onClick={() => setIsOtpSent(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                  ← تغيير الرقم
                </button>
              </form>
            ) : (
              <form onSubmit={handlePhoneAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>رقم الجوال</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ 
                      position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', 
                      fontWeight: 800, color: 'var(--text-secondary)', fontSize: '0.95rem',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}>
                      🇸🇦 +966
                    </span>
                    <input 
                      type="tel" required placeholder="5XXXXXXXX" 
                      value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} 
                      style={{ ...inputStyle('phone'), paddingRight: '6rem' }} 
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField('')}
                    />
                  </div>
                </div>
                {authError && <div style={{ color: '#f43f5e', fontSize: '0.9rem', padding: '0.8rem', background: 'rgba(244, 63, 94, 0.06)', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.15)', fontWeight: 700, textAlign: 'center' }}>{authError}</div>}
                <button type="submit" disabled={loading} className="auth-submit-btn" style={{ 
                  padding: '1.1rem', 
                  background: 'linear-gradient(135deg, #f43f5e, #e11d48)', 
                  color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, 
                  cursor: 'pointer', fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  boxShadow: '0 8px 25px rgba(244, 63, 94, 0.25)',
                  transition: 'all 0.3s',
                }}>
                  {loading ? 'جاري الإرسال...' : (<>إرسال رمز التحقق <ArrowRight size={18} /></>)}
                </button>
              </form>
            )
          ) : (
            <>
              <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>البريد الإلكتروني</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type="email" required value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="name@example.com" 
                      style={{ ...inputStyle('email'), paddingRight: '3rem' }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>كلمة المرور</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input 
                      type={showPassword ? "text" : "password"} required 
                      value={password} onChange={e => setPassword(e.target.value)} 
                      placeholder="••••••••" minLength={6} 
                      style={{ ...inputStyle('password'), paddingRight: '3rem', paddingLeft: '3rem' }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ 
                      position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', 
                      background: 'transparent', border: 'none', color: 'var(--text-secondary)', 
                      cursor: 'pointer', display: 'flex', padding: '0.2rem',
                    }}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {authError && (
                  <div style={{ 
                    color: authError.includes('✅') ? '#10b981' : '#f43f5e', 
                    fontSize: '0.9rem', padding: '0.8rem', 
                    background: authError.includes('✅') ? 'rgba(16,185,129,0.06)' : 'rgba(244, 63, 94, 0.06)', 
                    borderRadius: '10px', 
                    border: authError.includes('✅') ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(244, 63, 94, 0.15)', 
                    fontWeight: 700, textAlign: 'center' 
                  }}>
                    {authError}
                  </div>
                )}
                <button type="submit" disabled={loading} className="auth-submit-btn" style={{ 
                  padding: '1.1rem', 
                  background: 'linear-gradient(135deg, #f43f5e, #e11d48)', 
                  color: 'white', border: 'none', borderRadius: '14px', fontWeight: 900, 
                  fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', 
                  transition: 'all 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  boxShadow: '0 8px 25px rgba(244, 63, 94, 0.25)',
                }}>
                  {loading ? 'جاري التحقق...' : (<>{isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب'} <ArrowRight size={18} /></>)}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
                  {isLoginMode ? 'ما عندك حساب؟ ' : 'عندك حساب؟ '}
                  <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} style={{ 
                    background: 'transparent', border: 'none', color: 'var(--primary)', 
                    cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', padding: '0 2px',
                    textDecoration: 'underline', textUnderlineOffset: '3px',
                  }}>
                    {isLoginMode ? 'أنشئ حساب الآن' : 'سجل دخولك'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes authModalIn {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes splashFadeOut {
          from { opacity: 1; }
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes logoReveal {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to { width: 60%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 1; }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .auth-submit-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 30px rgba(244, 63, 94, 0.35) !important;
        }
        .auth-submit-btn:active {
          transform: translateY(0) !important;
        }
        @media (max-width: 900px) {
          .auth-hero { display: none !important; }
        }
      `}</style>
    </div>
  );
}
