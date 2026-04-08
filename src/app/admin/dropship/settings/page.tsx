"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Settings, ArrowLeft, Save, ExternalLink, CheckCircle, AlertTriangle, Link2 } from 'lucide-react';

export default function DropshipSettings() {
  const [config, setConfig] = useState({
    app_key: '',
    app_secret: '',
    default_markup_percent: 30,
    auto_fulfill: false,
    auto_sync_prices: true,
    auto_sync_stock: true,
    is_active: false,
    token_expires_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() {
    const { data } = await supabase
      .from('dropship_config')
      .select('*')
      .eq('provider', 'aliexpress')
      .single();

    if (data) {
      setConfig({
        app_key: data.app_key || '',
        app_secret: data.app_secret || '',
        default_markup_percent: data.default_markup_percent || 30,
        auto_fulfill: data.auto_fulfill || false,
        auto_sync_prices: data.auto_sync_prices ?? true,
        auto_sync_stock: data.auto_sync_stock ?? true,
        is_active: data.is_active || false,
        token_expires_at: data.token_expires_at || '',
      });
      setHasToken(!!data.access_token);
    }
  }

  async function saveConfig() {
    setSaving(true);
    try {
      const res = await fetch('/api/dropship/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'aliexpress', ...config }),
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('✅ تم حفظ الإعدادات');
    } catch { alert('❌ فشل الحفظ'); }
    setSaving(false);
  }

  async function toggleActive() {
    const newState = !config.is_active;
    await supabase.from('dropship_config').update({ is_active: newState }).eq('provider', 'aliexpress');
    setConfig(prev => ({ ...prev, is_active: newState }));
  }

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', border: '1px solid var(--border)',
    borderRadius: '10px', fontSize: '0.9rem', background: 'var(--surface-hover)',
    color: 'var(--text-primary)', outline: 'none',
  };

  const labelStyle = {
    display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem',
    fontWeight: 700 as const, color: 'var(--text-primary)',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/dropship" style={{
          width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface)', textDecoration: 'none', color: 'var(--text-secondary)',
        }}><ArrowLeft size={18} /></Link>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>إعدادات AliExpress</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ربط الحساب وتهيئة الإعدادات</p>
        </div>
      </div>

      {/* Connection Status */}
      <div style={{
        padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', marginBottom: '1.5rem', boxShadow: 'var(--card-shadow)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {hasToken ? (
            <CheckCircle size={24} color="var(--success)" />
          ) : (
            <AlertTriangle size={24} color="#f59e0b" />
          )}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {hasToken ? 'الحساب مربوط' : 'الحساب غير مربوط'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {hasToken
                ? `Token صالح حتى: ${config.token_expires_at ? new Date(config.token_expires_at).toLocaleDateString('ar-SA') : '—'}`
                : 'أدخل App Key و Secret ثم اربط حسابك'}
            </div>
          </div>
        </div>
        <button onClick={toggleActive} style={{
          padding: '0.5rem 1.2rem', borderRadius: '8px', border: 'none',
          fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
          background: config.is_active ? '#ecfdf5' : '#fef2f2',
          color: config.is_active ? '#10b981' : '#ef4444',
        }}>
          {config.is_active ? '✅ مفعل' : '❌ معطل'}
        </button>
      </div>

      {/* API Credentials */}
      <div style={{
        padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', marginBottom: '1.5rem', boxShadow: 'var(--card-shadow)',
      }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link2 size={18} /> بيانات API
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>App Key</label>
            <input
              type="text"
              value={config.app_key}
              onChange={(e) => setConfig(prev => ({ ...prev, app_key: e.target.value }))}
              placeholder="أدخل App Key من AliExpress Open Platform"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>App Secret</label>
            <input
              type="password"
              value={config.app_secret}
              onChange={(e) => setConfig(prev => ({ ...prev, app_secret: e.target.value }))}
              placeholder="أدخل App Secret"
              style={inputStyle}
            />
          </div>
          <a href="https://openservice.aliexpress.com" target="_blank" rel="noopener noreferrer" style={{
            fontSize: '0.82rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}>
            <ExternalLink size={14} /> إنشاء حساب على AliExpress Open Platform
          </a>

          {config.app_key && config.app_secret && !hasToken && (
            <button
              onClick={async () => {
                // Save config first, then redirect to OAuth
                await saveConfig();
                const callbackUrl = `${window.location.origin}/api/dropship/callback`;
                const authUrl = `https://api-sg.aliexpress.com/oauth/authorize?response_type=code&force_auth=true&redirect_uri=${encodeURIComponent(callbackUrl)}&client_id=${config.app_key}`;
                window.location.href = authUrl;
              }}
              style={{
                padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700,
                fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
              }}
            >
              <Link2 size={16} /> ربط الحساب مع AliExpress
            </button>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div style={{
        padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', marginBottom: '1.5rem', boxShadow: 'var(--card-shadow)',
      }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>💰 التسعير</h2>
        <div>
          <label style={labelStyle}>هامش الربح الافتراضي (%)</label>
          <input
            type="number"
            min="0"
            max="200"
            value={config.default_markup_percent}
            onChange={(e) => setConfig(prev => ({ ...prev, default_markup_percent: parseFloat(e.target.value) || 30 }))}
            style={{ ...inputStyle, width: '200px' }}
          />
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
            مثال: منتج بـ $10 + شحن $2 × {config.default_markup_percent}% هامش = {Math.ceil(((10 + 2) * 3.75 * (1 + config.default_markup_percent / 100)) / 5) * 5} ر.س
          </p>
        </div>
      </div>

      {/* Automation */}
      <div style={{
        padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', marginBottom: '1.5rem', boxShadow: 'var(--card-shadow)',
      }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>⚡ الأتمتة</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {[
            { key: 'auto_fulfill', label: 'تنفيذ الطلبات تلقائياً', desc: 'عند استلام طلب، يتم إنشاؤه على AliExpress أوتوماتيكياً' },
            { key: 'auto_sync_prices', label: 'مزامنة الأسعار تلقائياً', desc: 'تحديث أسعار المنتجات كل 6 ساعات' },
            { key: 'auto_sync_stock', label: 'مزامنة المخزون تلقائياً', desc: 'تحديث حالة المخزون تلقائياً' },
          ].map(opt => (
            <div key={opt.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.8rem 1rem', background: 'var(--surface-hover)', borderRadius: '10px',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{opt.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{opt.desc}</div>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, [opt.key]: !(prev as any)[opt.key] }))}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
                  background: (config as any)[opt.key] ? 'var(--primary)' : '#d1d5db',
                  position: 'relative', transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: '2px',
                  left: (config as any)[opt.key] ? '2px' : '24px',
                  transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button onClick={saveConfig} disabled={saving} style={{
        width: '100%', padding: '1rem', background: 'var(--primary)', color: '#fff',
        border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '1rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        boxShadow: '0 4px 14px rgba(37,99,235,0.3)', opacity: saving ? 0.7 : 1,
      }}>
        <Save size={20} /> {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
}
