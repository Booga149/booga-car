"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { logSecurityEvent } from '@/lib/utils';
import { Eye, EyeOff, X as XIcon, Trophy, Shield, Sparkles, Star, ArrowRight, Phone, Mail, Lock, CheckCircle2, Gauge, Zap, Crown } from 'lucide-react';

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

  // Sync with initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsLoginMode(initialMode === 'login');
      setAuthError('');
    }
  }, [isOpen, initialMode]);
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
  const [gaugeAngle, setGaugeAngle] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShowSplash(true);
      const timer = setTimeout(() => setShowSplash(false), 3500);
      
      const interval = setInterval(() => {
        setLiveUsers(prev => prev + (Math.random() > 0.5 ? 2 : -1) * Math.floor(Math.random() * 4));
      }, 2500);

      // Animate gauge
      const gaugeTimer = setTimeout(() => {
        setGaugeAngle(220);
      }, 500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
        clearTimeout(gaugeTimer);
      };
    } else {
      setGaugeAngle(0);
    }
  }, [isOpen]);

  // --- Google Auth ---
  const handleGoogleSignIn = async () => {
    console.log('🔵 Google Sign-In clicked!');
    setLoading(true);
    setAuthError('');
    try {
      console.log('🔵 Calling supabase.auth.signInWithOAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/auth/callback` 
            : undefined,
        }
      });
      console.log('🔵 OAuth response:', { data, error });
      if (error) throw error;
      // If we get here with a URL, redirect manually
      if (data?.url) {
        console.log('🔵 Redirecting to:', data.url);
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('🔴 Google Auth Error:', err);
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
          // Better Arabic error messages
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('لم يتم تأكيد بريدك الإلكتروني بعد. تحقق من صندوق الوارد');
          }
          throw error;
        }
        await logSecurityEvent(supabase, {
          type: 'AUTH_SUCCESS',
          title: 'دخول ناجح (إيميل)',
          account: email
        });
        onClose();
        location.reload();
      } else {
        // Sign up with metadata for profile trigger
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' 
              ? `${window.location.origin}/auth/callback` 
              : undefined,
            data: {
              full_name: email.split('@')[0],
            }
          }
        });
        if (error) {
          // Better Arabic error messages
          if (error.message.includes('already registered') || error.message.includes('already been registered')) {
            throw new Error('هذا البريد مسجل مسبقاً. جرب تسجيل الدخول');
          }
          if (error.message.includes('Password should be at least')) {
            throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
          }
          if (error.message.includes('valid email')) {
            throw new Error('يرجى إدخال بريد إلكتروني صحيح');
          }
          throw error;
        }
        
        // Check if user was auto-confirmed (no email confirmation required)
        if (data?.user?.confirmed_at || data?.session) {
          await logSecurityEvent(supabase, {
            type: 'AUTH_SUCCESS',
            title: 'تسجيل حساب جديد',
            account: email
          });
          onClose();
          location.reload();
          return;
        }
        
        // Email confirmation is required
        setAuthError('تم إرسال رابط التأكيد لبريدك الإلكتروني ✅ تحقق من صندوق الوارد أو مجلد السبام');
        return;
      }
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
    background: focusedField === field ? 'rgba(255,215,0,0.04)' : 'rgba(0,0,0,0.03)',
    border: focusedField === field ? '2px solid #D4AF37' : '2px solid rgba(0,0,0,0.1)',
    borderRadius: '16px',
    color: '#111',
    outline: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(212, 175, 55, 0.1), 0 0 30px rgba(212, 175, 55, 0.05)' : 'none',
  });

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200000,
      background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(30px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem'
    }} onClick={onClose}>
      
      <div className="auth-modal-container" style={{
        background: 'var(--surface)', borderRadius: '32px', width: '100%', maxWidth: '1100px',
        border: '1px solid rgba(255,215,0,0.12)', 
        boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 100px rgba(255,215,0,0.03), 0 0 0 1px rgba(255,255,255,0.03) inset', 
        overflow: 'hidden',
        display: 'flex', position: 'relative', minHeight: '650px', 
        animation: 'authModalIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{ 
          position: 'absolute', top: '1.2rem', left: '1.2rem', 
          background: 'rgba(0,0,0,0.06)', 
          border: '1px solid rgba(0,0,0,0.08)', 
          color: 'var(--text-secondary)', width: '40px', height: '40px', 
          borderRadius: '50%', cursor: 'pointer', zIndex: 50, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          transition: 'all 0.2s', backdropFilter: 'blur(10px)',
        }}>
          <XIcon size={18} />
        </button>
        
        {/* Splash Animation */}
        {showSplash && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 100,
            background: 'var(--surface)', 
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', gap: '1.5rem',
            animation: 'splashFadeOut 0.8s ease 2.8s forwards'
          }}>
            {/* Radial glow behind logo */}
            <div style={{
              position: 'absolute',
              width: '400px', height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }} />
            
            <div style={{ position: 'relative' }}>
              <div style={{ 
                fontSize: 'clamp(2.5rem, 10vw, 4.5rem)', fontWeight: 950, letterSpacing: '-3px',
                background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'logoReveal 1s cubic-bezier(0.77, 0, 0.175, 1), gradientShift 3s ease infinite',
                textShadow: 'none',
              }}>
                BOOGA CAR
              </div>
              <div style={{
                position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
                height: '3px', borderRadius: '2px',
                background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                animation: 'lineGrow 0.8s ease 0.4s forwards', width: '0'
              }} />
            </div>
            <div style={{ 
              color: 'rgba(255,215,0,0.5)', fontSize: '1rem', fontWeight: 700, 
              opacity: 0, animation: 'fadeInUp 0.5s ease 0.7s forwards',
              letterSpacing: '6px', textTransform: 'uppercase'
            }}>
              Premium Auto Parts
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ 
                  width: '8px', height: '8px', borderRadius: '50%', 
                  background: '#FFD700',
                  animation: `dotPulse 1s ease ${i * 0.15}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        
        {/* === LEFT SIDE: Cinematic Hero === */}
        <div style={{ 
          flex: '1.15', position: 'relative', overflow: 'hidden', 
          display: 'flex', flexDirection: 'column',
        }} className="auth-hero">
          
          {/* === CINEMATIC BACKGROUND LAYER STACK === */}
          
          {/* Layer 1: Deep space base */}
          <div style={{ 
            position: 'absolute', inset: 0, 
            background: 'radial-gradient(ellipse at 60% 20%, #ffffff 0%, #f1f3f7 40%, var(--background) 100%)',
          }} />

          {/* Layer 2: Car track / road texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 48px, rgba(255,215,0,0.6) 48px, rgba(255,215,0,0.6) 50px),
              repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(255,215,0,0.4) 48px, rgba(255,215,0,0.4) 50px)`,
            backgroundSize: '50px 50px',
            animation: 'gridScroll 20s linear infinite',
          }} />

          {/* Layer 3: Diagonal speed lines */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.08 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${-10 + i * 15}%`,
                top: '-20%',
                width: '1px',
                height: '140%',
                background: 'linear-gradient(180deg, transparent 0%, rgba(255,215,0,0.8) 30%, rgba(255,165,0,0.6) 60%, transparent 100%)',
                transform: 'rotate(-15deg)',
                animation: `speedLine ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
              }} />
            ))}
          </div>
          
          {/* Layer 4: Giant radial golden glow center */}
          <div style={{
            position: 'absolute',
            top: '15%', left: '50%', transform: 'translateX(-50%)',
            width: '500px', height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,180,0,0.08) 0%, rgba(255,100,0,0.04) 40%, transparent 70%)',
            animation: 'masterGlow 6s ease-in-out infinite',
          }} />
          
          {/* Layer 5: Top cinematic light beam */}
          <div style={{
            position: 'absolute', top: '-60%', left: '40%', transform: 'translateX(-50%)',
            width: '250px', height: '1000px',
            background: 'linear-gradient(180deg, rgba(255,220,0,0.12) 0%, rgba(255,160,0,0.04) 50%, transparent 100%)',
            filter: 'blur(40px)',
            animation: 'lightBeamSway 10s ease-in-out infinite',
            transformOrigin: 'top center',
          }} />
          
          {/* Layer 6: Secondary accent beam from right */}
          <div style={{
            position: 'absolute', top: '-20%', right: '-5%',
            width: '300px', height: '700px',
            background: 'linear-gradient(200deg, rgba(220,100,0,0.07) 0%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'lightBeamSway 15s ease-in-out infinite reverse',
          }} />
          
          {/* Layer 7: Bottom floor reflection / glow */}
          <div style={{
            position: 'absolute', bottom: '-10%', left: '50%', transform: 'translateX(-50%)',
            width: '90%', height: '300px',
            background: 'radial-gradient(ellipse at center bottom, rgba(255,140,0,0.06) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }} />

          {/* Layer 8: Floating energy orbs */}
          <div style={{ 
            position: 'absolute', top: '8%', right: '8%', width: '200px', height: '200px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)',
            animation: 'orbFloat 7s ease-in-out infinite',
          }} />
          <div style={{ 
            position: 'absolute', bottom: '15%', left: '2%', width: '150px', height: '150px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(255,120,0,0.09) 0%, transparent 70%)',
            animation: 'orbFloat 11s ease-in-out 2s infinite reverse',
          }} />
          <div style={{ 
            position: 'absolute', top: '50%', right: '-5%', width: '100px', height: '100px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(255,200,0,0.06) 0%, transparent 70%)',
            animation: 'orbFloat 5s ease-in-out 1s infinite',
          }} />

          {/* Layer 9: Decorative arc rings */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <svg style={{ position: 'absolute', top: '-10%', left: '-15%', width: '70%', height: '70%', opacity: 0.06 }} viewBox="0 0 400 400">
              <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,215,0,0.8)" strokeWidth="0.5" strokeDasharray="10 15" />
              <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(255,165,0,0.6)" strokeWidth="0.5" strokeDasharray="5 20" />
              <circle cx="200" cy="200" r="100" fill="none" stroke="rgba(255,215,0,0.4)" strokeWidth="0.5" />
            </svg>
            <svg style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '60%', height: '60%', opacity: 0.04 }} viewBox="0 0 400 400">
              <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,140,0,1)" strokeWidth="1" strokeDasharray="8 20" />
              <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255,200,0,0.7)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Layer 10: Animated particle constellation */}
          <div className="auth-particles" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {[...Array(20)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: `${1 + (i % 3)}px`,
                height: `${1 + (i % 3)}px`,
                borderRadius: '50%',
                background: i % 4 === 0 
                  ? `rgba(255, 215, 0, ${0.3 + (i % 5) * 0.1})` 
                  : i % 4 === 1 
                    ? `rgba(255, 160, 0, ${0.2 + (i % 4) * 0.1})` 
                    : `rgba(255, 255, 255, ${0.05 + (i % 3) * 0.05})`,
                left: `${(i * 13 + 7) % 100}%`,
                top: `${(i * 17 + 11) % 100}%`,
                animation: `particleFloat ${4 + (i % 7)}s ease-in-out ${(i % 5) * 0.6}s infinite`,
                boxShadow: i % 4 === 0 ? '0 0 6px rgba(255,215,0,0.5)' : 'none',
              }} />
            ))}
          </div>
          
          {/* Content */}
          <div style={{ 
            position: 'relative', zIndex: 10, padding: '3rem 3rem', 
            display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center'
          }}>
            {/* Premium Badge */}
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem', 
              padding: '0.5rem 1.2rem', 
              background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,165,0,0.08))', 
              border: '1px solid rgba(255,215,0,0.2)', 
              borderRadius: '100px', 
              color: '#FFD700', fontSize: '0.78rem', fontWeight: 800, 
              width: 'fit-content', marginBottom: '2rem',
              animation: 'fadeInUp 0.6s ease 0.2s both',
              backdropFilter: 'blur(10px)',
            }}>
              <Crown size={14} /> المنصة الأولى للسيارات في المملكة
            </div>
            
            {/* Title */}
            <h2 style={{ 
              fontSize: '2.8rem', margin: '0 0 1rem', fontWeight: 950, lineHeight: 1.08,
              color: '#1a1a1a', letterSpacing: '-1px',
              animation: 'fadeInUp 0.6s ease 0.3s both'
            }}>
              ادخل عالم
              <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #B8860B, #D4AF37, #B8860B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>القيادة الفاخرة</span>
            </h2>
            
            <p style={{ 
              color: 'rgba(0,0,0,0.5)', fontSize: '1rem', lineHeight: 1.7, 
              marginBottom: '2.5rem', fontWeight: 500, maxWidth: '380px',
              animation: 'fadeInUp 0.6s ease 0.4s both'
            }}>
              أكبر متجر إلكتروني لقطع غيار السيارات في المملكة العربية السعودية.
              تسوق بثقة واستمتع بتجربة فريدة من نوعها.
            </p>
            
            {/* Speedometer Visual */}
            <div style={{
              width: '180px', height: '100px', position: 'relative', marginBottom: '2rem',
              animation: 'fadeInUp 0.6s ease 0.45s both'
            }}>
              <svg viewBox="0 0 200 110" style={{ width: '100%', height: '100%' }}>
                {/* Background arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" />
                {/* Colored arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray="251" strokeDashoffset={251 - (gaugeAngle / 270) * 251}
                  style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FF4500" />
                  </linearGradient>
                </defs>
                {/* Needle */}
                <line x1="100" y1="100" x2="100" y2="30" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"
                  style={{
                    transformOrigin: '100px 100px',
                    transform: `rotate(${-135 + (gaugeAngle / 270) * 270}deg)`,
                    transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                <circle cx="100" cy="100" r="5" fill="#FFD700" />
              </svg>
              <div style={{
                position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)',
                color: 'rgba(0,0,0,0.4)', fontSize: '0.7rem', fontWeight: 700,
                letterSpacing: '2px', textTransform: 'uppercase',
              }}>
                PERFORMANCE
              </div>
            </div>

            {/* Features */}
            <div style={{ 
              display: 'flex', flexDirection: 'column', gap: '0.9rem',
              animation: 'fadeInUp 0.6s ease 0.5s both'
            }}>
              {[
                { icon: <Shield size={16} />, text: 'ضمان أصالة 100% على جميع القطع' },
                { icon: <Zap size={16} />, text: 'توصيل سريع لكل مدن المملكة' },
                { icon: <Star size={16} />, text: 'أسعار تنافسية وعروض حصرية' },
              ].map((feat, i) => (
                <div key={i} style={{ 
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  color: 'rgba(0,0,0,0.5)', fontSize: '0.85rem', fontWeight: 600,
                }}>
                  <div style={{ 
                    color: '#B8860B', 
                    background: 'rgba(212,175,55,0.1)', 
                    padding: '0.35rem', borderRadius: '8px', display: 'flex',
                    border: '1px solid rgba(212,175,55,0.15)',
                  }}>
                    {feat.icon}
                  </div>
                  {feat.text}
                </div>
              ))}
            </div>
            
            {/* Live Users */}
            <div style={{ 
              marginTop: 'auto', paddingTop: '1.5rem',
              animation: 'fadeInUp 0.6s ease 0.6s both'
            }}>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '1rem', 
                background: 'rgba(0,0,0,0.03)', 
                padding: '1rem 1.3rem', borderRadius: '16px', 
                border: '1px solid rgba(0,0,0,0.06)',
                backdropFilter: 'blur(10px)',
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
                  <div style={{ color: '#1a1a1a', fontWeight: 900, fontSize: '1.3rem', lineHeight: 1 }}>
                    {liveUsers.toLocaleString()}
                  </div>
                  <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.15rem' }}>
                    يتسوقون الآن
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT SIDE: Form === */}
        <div className="auth-form-side" style={{ 
          flex: '1', padding: '2.5rem 2.8rem', display: 'flex', flexDirection: 'column', 
          justifyContent: 'center', 
          background: '#ffffff',
          overflowY: 'auto',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          position: 'relative',
        }}>
          {/* Saudi Flag */}
          <div style={{
            position: 'absolute', top: '1.2rem', right: '1.2rem',
            fontSize: '2rem', lineHeight: 1,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          }}>
            🇸🇦
          </div>
          {/* Header */}
          <div style={{ marginBottom: '1.8rem' }}>
            <h2 style={{ 
              fontSize: '1.8rem', marginBottom: '0.5rem', fontWeight: 950, 
              color: '#111', letterSpacing: '-0.5px'
            }}>
              {isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h2>
            <p style={{ color: 'rgba(0,0,0,0.45)', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
              {isLoginMode ? 'أدخل بياناتك للوصول إلى حسابك' : 'انضم لأكبر مجتمع سيارات في المملكة'}
            </p>
          </div>

          {/* Google Sign-In Button */}
          <button 
            onClick={handleGoogleSignIn}
            style={{
              width: '100%', padding: '0.95rem', borderRadius: '14px',
              background: 'rgba(0,0,0,0.03)', 
              border: '2px solid rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
              cursor: 'pointer', transition: 'all 0.3s', fontWeight: 700,
              fontSize: '0.95rem', color: '#333',
              marginBottom: '1.3rem',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'rgba(66,133,244,0.5)';
              e.currentTarget.style.background = 'rgba(66,133,244,0.06)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(66,133,244,0.15)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
              e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
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
            margin: '0.3rem 0 1.3rem',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
            <span style={{ color: 'rgba(0,0,0,0.35)', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              أو استخدم
            </span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
          </div>

          {/* Method Toggle */}
          <div style={{ 
            display: 'flex', 
            background: 'rgba(0,0,0,0.03)', 
            borderRadius: '12px', 
            padding: '0.3rem', 
            marginBottom: '1.3rem',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <button 
              onClick={() => { setAuthMethod('phone'); setIsOtpSent(false); setAuthError(''); }} 
              style={{ 
                flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', 
                background: authMethod === 'phone' ? 'rgba(212,175,55,0.12)' : 'transparent', 
                color: authMethod === 'phone' ? '#B8860B' : 'rgba(0,0,0,0.4)', 
                fontWeight: 800, cursor: 'pointer', transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontSize: '0.85rem',
                boxShadow: authMethod === 'phone' ? '0 2px 12px rgba(212,175,55,0.12)' : 'none',
              }}
            >
              <Phone size={16} /> الجوال
            </button>
            <button 
              onClick={() => { setAuthMethod('email'); setIsOtpSent(false); setAuthError(''); }} 
              style={{ 
                flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', 
                background: authMethod === 'email' ? 'rgba(212,175,55,0.12)' : 'transparent', 
                color: authMethod === 'email' ? '#B8860B' : 'rgba(0,0,0,0.4)', 
                fontWeight: 800, cursor: 'pointer', transition: 'all 0.25s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                fontSize: '0.85rem',
                boxShadow: authMethod === 'email' ? '0 2px 12px rgba(212,175,55,0.12)' : 'none',
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
                  background: 'rgba(255,215,0,0.04)', borderRadius: '16px',
                  border: '1px solid rgba(255,215,0,0.1)',
                }}>
                  <CheckCircle2 size={32} color="#FFD700" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 700, color: 'white', margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
                    تم إرسال رمز التحقق إلى
                  </p>
                  <p style={{ fontWeight: 900, color: '#FFD700', margin: '0.3rem 0 0', fontSize: '1.1rem', direction: 'ltr' }}>
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
                    color: '#FFD700',
                  }} 
                  onFocus={() => setFocusedField('otp')}
                  onBlur={() => setFocusedField('')}
                />
                <button type="submit" disabled={loading} className="auth-submit-btn" style={{ 
                  padding: '1.1rem', background: 'linear-gradient(135deg, #FFD700, #FFA500)', 
                  color: 'var(--text-primary)', border: 'none', borderRadius: '14px', fontWeight: 900, 
                  cursor: 'pointer', fontSize: '1rem',
                  boxShadow: '0 8px 30px rgba(255, 215, 0, 0.2)',
                  transition: 'all 0.3s',
                }}>
                  {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
                </button>
                {authError && <div style={{ color: '#f43f5e', fontSize: '0.9rem', padding: '0.8rem', background: 'rgba(244, 63, 94, 0.06)', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.15)', fontWeight: 700, textAlign: 'center' }}>{authError}</div>}
                <button type="button" onClick={() => setIsOtpSent(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(0,0,0,0.4)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                  ← تغيير الرقم
                </button>
              </form>
            ) : (
              <form onSubmit={handlePhoneAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ color: 'rgba(0,0,0,0.6)', fontWeight: 700, fontSize: '0.85rem' }}>رقم الجوال</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ 
                      position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', 
                      fontWeight: 800, color: 'rgba(0,0,0,0.4)', fontSize: '0.95rem',
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
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)', 
                  color: '#111', border: 'none', borderRadius: '14px', fontWeight: 900, 
                  cursor: 'pointer', fontSize: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  boxShadow: '0 8px 30px rgba(255, 215, 0, 0.2)',
                  transition: 'all 0.3s',
                }}>
                  {loading ? 'جاري الإرسال...' : (<>إرسال رمز التحقق <ArrowRight size={18} /></>)}
                </button>
                {/* Toggle login/signup */}
                <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                  <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
                    {isLoginMode ? 'ما عندك حساب؟ ' : 'عندك حساب؟ '}
                    <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} style={{ 
                      background: 'transparent', border: 'none', color: '#B8860B', 
                      cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', padding: '0 2px',
                      textDecoration: 'underline', textUnderlineOffset: '3px',
                    }}>
                      {isLoginMode ? 'أنشئ حساب الآن' : 'سجل دخولك'}
                    </button>
                  </p>
                </div>
              </form>
            )
          ) : (
            <>
              <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <label style={{ color: 'rgba(0,0,0,0.6)', fontWeight: 700, fontSize: '0.85rem' }}>البريد الإلكتروني</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.3)' }} />
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
                  <label style={{ color: 'rgba(0,0,0,0.6)', fontWeight: 700, fontSize: '0.85rem' }}>كلمة المرور</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0,0,0,0.3)' }} />
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
                      background: 'transparent', border: 'none', color: 'rgba(0,0,0,0.3)', 
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
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)', 
                  color: 'var(--text-primary)', border: 'none', borderRadius: '14px', fontWeight: 900, 
                  fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', 
                  transition: 'all 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  boxShadow: '0 8px 30px rgba(255, 215, 0, 0.2)',
                }}>
                  {loading ? 'جاري التحقق...' : (<>{isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب'} <ArrowRight size={18} /></>)}
                </button>
                {/* Toggle login/signup for email */}
                <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                  <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
                    {isLoginMode ? 'ما عندك حساب؟ ' : 'عندك حساب؟ '}
                    <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }} style={{ 
                      background: 'transparent', border: 'none', color: '#B8860B', 
                      cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', padding: '0 2px',
                      textDecoration: 'underline', textUnderlineOffset: '3px',
                    }}>
                      {isLoginMode ? 'أنشئ حساب الآن' : 'سجل دخولك'}
                    </button>
                  </p>
                </div>
              </form>
            </>
          )}

          {/* Trust badges */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
            marginTop: '1.5rem', paddingTop: '1rem',
          }}>
            {[
              { icon: <Shield size={14} />, text: 'تشفير SSL' },
              { icon: <Lock size={14} />, text: 'بيانات آمنة' },
            ].map((badge, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: 'rgba(0,0,0,0.3)', fontSize: '0.72rem', fontWeight: 600,
              }}>
                {badge.icon} {badge.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes authModalIn {
          from { opacity: 0; transform: translateY(40px) scale(0.94); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
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
          33% { transform: translate(25px, -30px) scale(1.08); }
          66% { transform: translate(-15px, -15px) scale(0.95); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes lightBeamSway {
          0%, 100% { transform: translateX(-50%) rotate(-8deg) scaleX(0.8); opacity: 0.7; }
          50% { transform: translateX(-50%) rotate(8deg) scaleX(1.2); opacity: 1; }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(-60px) translateX(20px); opacity: 0.8; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-120px) translateX(-10px); opacity: 0; }
        }
        @keyframes masterGlow {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.7; }
          50% { transform: translateX(-50%) scale(1.3); opacity: 1; }
        }
        @keyframes gridScroll {
          from { backgroundPosition: 0 0; }
          to { backgroundPosition: 50px 50px; }
        }
        @keyframes speedLine {
          0% { opacity: 0; transform: rotate(-15deg) translateY(-100%); }
          20% { opacity: 1; }
          80% { opacity: 0.5; }
          100% { opacity: 0; transform: rotate(-15deg) translateY(100%); }
        }
        @keyframes heroShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .auth-submit-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 40px rgba(255, 215, 0, 0.35) !important;
          filter: brightness(1.05);
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
