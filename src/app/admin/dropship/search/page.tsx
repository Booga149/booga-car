"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Package, Star, ShoppingCart, ExternalLink, Loader2, Import } from 'lucide-react';

export default function DropshipSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  async function handleSearch(p = 1) {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setPage(p);

    try {
      const res = await fetch(`/api/dropship/search?q=${encodeURIComponent(query)}&page=${p}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.products || []);
      setTotalCount(data.totalCount || 0);
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    }
    setLoading(false);
  }

  async function handleImport(productId: string) {
    setImporting(productId);
    try {
      const res = await fetch('/api/dropship/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImportedIds(prev => new Set(prev).add(productId));
      alert(`✅ تم الاستيراد بنجاح!\nالسعر: ${data.localPrice} ر.س (هامش ${data.markup}%)`);
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
    setImporting(null);
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/admin/dropship" style={{
          width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface)', textDecoration: 'none', color: 'var(--text-secondary)',
        }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>بحث واستيراد من AliExpress</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ابحث عن منتجات واستوردها بضغطة زر</p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px',
        padding: '1.2rem', marginBottom: '1.5rem', boxShadow: 'var(--card-shadow)',
        display: 'flex', gap: '0.8rem',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
            placeholder="ابحث عن منتج... مثال: car oxygen sensor, BMW oil filter"
            style={{
              width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem',
              border: '1px solid var(--border)', borderRadius: '10px',
              fontSize: '0.95rem', background: 'var(--surface-hover)',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
          <Search size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
        <button
          onClick={() => handleSearch(1)}
          disabled={loading || !query.trim()}
          style={{
            padding: '0 2rem', background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer',
            fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            opacity: loading || !query.trim() ? 0.6 : 1,
          }}
        >
          {loading ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
          بحث
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '10px', color: '#dc2626', marginBottom: '1rem', fontWeight: 600,
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
            عثرنا على {totalCount.toLocaleString()} منتج
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
            {results.map((product: any) => {
              const isImported = importedIds.has(product.productId);
              const isImportingThis = importing === product.productId;

              return (
                <div key={product.productId} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '14px', overflow: 'hidden', boxShadow: 'var(--card-shadow)',
                  transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ position: 'relative', height: '200px', background: '#f8fafc' }}>
                    <img src={product.imageUrl} alt="" style={{
                      width: '100%', height: '100%', objectFit: 'cover',
                    }} />
                    <a href={product.productUrl} target="_blank" rel="noopener noreferrer" style={{
                      position: 'absolute', top: '8px', right: '8px',
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.9)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
                    }}>
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h3 style={{
                      margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden', lineHeight: 1.4, minHeight: '2.5rem',
                    }}>
                      {product.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>
                        ${product.price}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                        {product.rating || '4.5'} · {(product.orders || 0).toLocaleString()} طلب
                      </div>
                    </div>

                    {product.storeName && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        المتجر: {product.storeName}
                      </div>
                    )}

                    <button
                      onClick={() => !isImported && handleImport(product.productId)}
                      disabled={isImported || isImportingThis}
                      style={{
                        marginTop: 'auto', padding: '0.7rem', border: 'none', borderRadius: '10px',
                        fontWeight: 700, fontSize: '0.88rem', cursor: isImported ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        background: isImported ? '#ecfdf5' : 'var(--primary)',
                        color: isImported ? '#10b981' : '#fff',
                        opacity: isImportingThis ? 0.7 : 1,
                      }}
                    >
                      {isImportingThis ? (
                        <><Loader2 size={16} /> جارٍ الاستيراد...</>
                      ) : isImported ? (
                        <>✅ تم الاستيراد</>
                      ) : (
                        <><Import size={16} /> استيراد المنتج</>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            {page > 1 && (
              <button onClick={() => handleSearch(page - 1)} style={{
                padding: '0.6rem 1.2rem', border: '1px solid var(--border)', borderRadius: '8px',
                background: 'var(--surface)', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)',
              }}>
                السابق
              </button>
            )}
            <span style={{ padding: '0.6rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              صفحة {page}
            </span>
            {results.length >= 20 && (
              <button onClick={() => handleSearch(page + 1)} style={{
                padding: '0.6rem 1.2rem', border: '1px solid var(--border)', borderRadius: '8px',
                background: 'var(--surface)', cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)',
              }}>
                التالي
              </button>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
