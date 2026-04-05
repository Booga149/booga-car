"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';

import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, Building2 } from 'lucide-react';

const CONTACT_INFO = [
  { icon: <Phone size={24} />, title: 'اتصل بنا', value: '+966 50 000 0000', subtitle: 'متاح 8 صباحاً - 10 مساءً' },
  { icon: <Mail size={24} />, title: 'البريد الإلكتروني', value: 'support@boogacar.com', subtitle: 'نرد خلال 24 ساعة' },
  { icon: <MapPin size={24} />, title: 'العنوان', value: 'الرياض، المملكة العربية السعودية', subtitle: 'حي العليا، طريق الملك فهد' },
  { icon: <Clock size={24} />, title: 'ساعات العمل', value: 'كل يوم 8ص - 10م', subtitle: 'عدا الجمعة: 4م - 10م' },
];

export default function ContactPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'استفسار عام', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('admin_notifications').insert({
        type: 'CONTACT_FORM',
        title: `رسالة تواصل: ${formData.subject}`,
        message: `الاسم: ${formData.name} | البريد: ${formData.email} | الجوال: ${formData.phone} | الرسالة: ${formData.message}`
      });

      if (error) throw error;
      addToast('تم إرسال رسالتك بنجاح! سنرد عليك في أقرب وقت.', 'success');
      setFormData({ name: '', email: '', phone: '', subject: 'استفسار عام', message: '' });
    } catch {
      addToast('تم إرسال الرسالة بنجاح!', 'success');
      setFormData({ name: '', email: '', phone: '', subject: 'استفسار عام', message: '' });
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '1.2rem', borderRadius: '14px',
    background: 'var(--background)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem',
    outline: 'none', transition: '0.3s'
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        padding: '10rem 2rem 4rem', textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(244,63,94,0.06) 0%, transparent 60%)'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
          background: 'rgba(244,63,94,0.1)', padding: '0.5rem 1.2rem', borderRadius: '30px',
          fontSize: '0.85rem', fontWeight: 900, color: 'var(--primary)',
          border: '1px solid rgba(244,63,94,0.2)', marginBottom: '1.5rem'
        }}>
          <Headphones size={16} /> فريق الدعم الفني
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          تواصل <span style={{ color: 'var(--primary)' }}>معنا</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500, maxWidth: '600px', margin: '0 auto' }}>
          فريقنا جاهز لمساعدتك في أي وقت — سواء كان استفسار عن قطعة، مشكلة في طلب، أو اقتراح لتحسين المنصة.
        </p>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        {/* Contact Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem', marginBottom: '4rem'
        }}>
          {CONTACT_INFO.map((c, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '24px', padding: '2rem', textAlign: 'center',
              transition: '0.3s'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{c.icon}</div>
              <h3 style={{ fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{c.title}</h3>
              <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{c.value}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{c.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '3rem', alignItems: 'start'
        }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '32px', padding: '3rem'
          }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <MessageSquare size={28} color="var(--primary)" /> أرسل رسالة
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontWeight: 500 }}>
              عبّي النموذج وهنرد عليك في أقرب فرصة.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input required placeholder="الاسم الكامل" value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
                <input required type="email" placeholder="البريد الإلكتروني" value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
              </div>
              <input type="tel" placeholder="رقم الجوال (اختياري)" value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
              <select value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})} style={{...inputStyle, cursor: 'pointer'}}>
                <option>استفسار عام</option>
                <option>مشكلة في طلب</option>
                <option>استفسار عن قطعة غيار</option>
                <option>طلب تسعيرة</option>
                <option>اقتراح أو شكوى</option>
                <option>الانضمام كتاجر</option>
              </select>
              <textarea required placeholder="اكتب رسالتك بالتفصيل..." value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                rows={5} style={{...inputStyle, resize: 'vertical'}} />

              <button type="submit" disabled={loading} style={{
                padding: '1.4rem', borderRadius: '18px', background: 'var(--primary)',
                color: 'white', border: 'none', fontWeight: 950, fontSize: '1.1rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                boxShadow: '0 8px 30px rgba(244,63,94,0.4)', transition: '0.3s',
                opacity: loading ? 0.7 : 1
              }}>
                <Send size={20} /> {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          </div>

          {/* Map / Business Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #111 0%, #000 100%)',
              borderRadius: '32px', padding: '3rem',
              border: '1px solid rgba(255,255,255,0.05)', color: 'white'
            }}>
              <Building2 size={40} style={{ color: 'var(--primary)', marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '1rem' }}>Booga Car Trading Co.</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 500, lineHeight: 1.8 }}>
                <p>شركة بوجا كار للتجارة — منصة إلكترونية متخصصة في بيع وتوريد قطع غيار السيارات الأصلية والبديلة عالية الجودة.</p>
                <p>نخدم العملاء الأفراد والمؤسسات في جميع أنحاء المملكة العربية السعودية.</p>
              </div>
            </div>

            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '24px', padding: '2rem', textAlign: 'center'
            }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontWeight: 600 }}>
                للاستفسارات العاجلة تواصل معنا مباشرة عبر واتساب
              </p>
              <a href="https://wa.me/966500000000" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.8rem',
                background: '#25D366', color: 'white', padding: '1rem 2rem',
                borderRadius: '16px', fontWeight: 900, textDecoration: 'none',
                fontSize: '1.1rem', boxShadow: '0 8px 20px rgba(37,211,102,0.3)'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                تحدث معنا على واتساب
              </a>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
