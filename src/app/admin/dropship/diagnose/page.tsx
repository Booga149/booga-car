"use client";
import { useState } from 'react';
import { ArrowLeft, Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function DiagnosePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  async function runDiagnose() {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch('/api/dropship/diagnose');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/dropship" style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
        }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#4cc9f0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity size={24} /> تشخيص AliExpress API
          </h1>
          <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            اختبار جميع طرق البحث المتاحة في AliExpress
          </p>
        </div>
      </div>

      {/* Run Button */}
      <button onClick={runDiagnose} disabled={loading} style={{
        padding: '1rem 2rem', borderRadius: '14px', border: 'none',
        background: loading ? 'rgba(76,201,240,0.2)' : 'linear-gradient(135deg, #4cc9f0, #0891b2)',
        color: loading ? 'rgba(255,255,255,0.5)' : '#020205',
        fontWeight: 900, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        marginBottom: '2rem', transition: 'all 0.3s',
      }}>
        <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        {loading ? 'جاري الاختبار... (قد يستغرق 30 ثانية)' : 'بدء التشخيص'}
      </button>

      {error && (
        <div style={{
          padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '12px', color: '#ff5555', marginBottom: '1.5rem', fontWeight: 700,
        }}>
          ❌ خطأ: {error}
        </div>
      )}

      {data && (
        <>
          {/* Summary */}
          <div style={{
            padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem',
            background: data.status === 'failing' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
            border: `1px solid ${data.status === 'failing' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.8rem', color: data.status === 'failing' ? '#ff5555' : '#10b981' }}>
              {data.recommendation}
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                إجمالي: <strong style={{ color: '#fff' }}>{data.summary?.total}</strong>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                نجح: <strong style={{ color: '#10b981' }}>{data.summary?.success}</strong>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                فيه منتجات: <strong style={{ color: '#4cc9f0' }}>{data.summary?.withProducts}</strong>
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                فشل: <strong style={{ color: '#ff5555' }}>{data.summary?.errors}</strong>
              </span>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.results?.map((r: any, i: number) => (
              <div key={i} style={{
                padding: '1.2rem 1.5rem', borderRadius: '14px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${r.status === 'error' ? 'rgba(239,68,68,0.2)' : r.hasProducts ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                  {r.status === 'error' ? (
                    <XCircle size={20} color="#ff5555" />
                  ) : r.hasProducts ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : (
                    <AlertTriangle size={20} color="#D4AF37" />
                  )}
                  <code style={{
                    fontSize: '0.85rem', fontWeight: 800,
                    color: r.status === 'error' ? '#ff5555' : r.hasProducts ? '#10b981' : '#D4AF37',
                    fontFamily: 'monospace',
                  }}>
                    {r.method}
                  </code>
                  <span style={{
                    padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900,
                    background: r.status === 'error' ? 'rgba(239,68,68,0.15)' : r.hasProducts ? 'rgba(16,185,129,0.15)' : 'rgba(212,175,55,0.15)',
                    color: r.status === 'error' ? '#ff5555' : r.hasProducts ? '#10b981' : '#D4AF37',
                  }}>
                    {r.status === 'error' ? 'فشل' : r.hasProducts ? 'شغال ✓' : 'رد فارغ'}
                  </span>
                </div>

                {r.error && (
                  <div style={{ color: 'rgba(255,100,100,0.8)', fontSize: '0.82rem', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                    Error: {r.error}
                  </div>
                )}

                {r.fix && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                    padding: '0.6rem 0.8rem', background: 'rgba(212,175,55,0.05)',
                    borderRadius: '8px', color: '#D4AF37', fontSize: '0.8rem', fontWeight: 600,
                  }}>
                    <Wrench size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    {r.fix}
                  </div>
                )}

                {r.keys && (
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    Response keys: [{r.keys.join(', ')}]
                  </div>
                )}

                {r.sample && (
                  <details style={{ marginTop: '0.5rem' }}>
                    <summary style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', cursor: 'pointer' }}>
                      Raw Response (أول 500 حرف)
                    </summary>
                    <pre style={{
                      fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                      marginTop: '0.3rem', maxHeight: '200px', overflow: 'auto',
                    }}>
                      {r.sample}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div style={{
            marginTop: '2rem', padding: '1.5rem', borderRadius: '16px',
            background: 'rgba(76,201,240,0.05)', border: '1px solid rgba(76,201,240,0.1)',
          }}>
            <h3 style={{ margin: '0 0 1rem', color: '#4cc9f0', fontWeight: 900, fontSize: '1rem' }}>
              📋 خطوات الإصلاح
            </h3>
            <ol style={{ margin: 0, paddingRight: '1.2rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 2 }}>
              <li>ادخل على <a href="https://openplatform.aliexpress.com" target="_blank" style={{ color: '#4cc9f0' }}>AliExpress Open Platform</a></li>
              <li>اختار تطبيقك → App Management</li>
              <li>تحقق من الصلاحيات (Permissions): <strong style={{ color: '#fff' }}>Affiliate API + Dropship API</strong></li>
              <li>تأكد إن الـ Access Token لسه صالح (مدة صلاحيته محدودة)</li>
              <li>لو الـ Token انتهى، جدده من صفحة الإعدادات في لوحة التحكم</li>
            </ol>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
