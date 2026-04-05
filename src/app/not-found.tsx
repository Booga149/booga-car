import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a', padding: '2rem', textAlign: 'center'
    }}>
      <div style={{ maxWidth: '600px' }}>
        <div style={{
          fontSize: 'clamp(8rem, 20vw, 14rem)', fontWeight: 950,
          color: '#f43f5e',
          lineHeight: 1, marginBottom: '1rem', letterSpacing: '-8px'
        }}>
          404
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 950, color: '#fff', marginBottom: '1rem' }}>
          الصفحة غير موجودة
        </h1>
        <p style={{ color: '#888', fontSize: '1.15rem', fontWeight: 500, lineHeight: 1.8, marginBottom: '3rem' }}>
          يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها أو أن الرابط غير صحيح.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            background: '#f43f5e', color: 'white', padding: '1rem 2rem',
            borderRadius: '16px', fontWeight: 900, textDecoration: 'none',
            fontSize: '1rem'
          }}>
            🏠 الصفحة الرئيسية
          </Link>
          <Link href="/products" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            background: '#1a1a1a', color: '#fff', padding: '1rem 2rem',
            borderRadius: '16px', fontWeight: 900, textDecoration: 'none',
            border: '1px solid #333', fontSize: '1rem'
          }}>
            🔍 تصفح المنتجات
          </Link>
        </div>
      </div>
    </main>
  );
}
