import React from 'react';
import Navbar from '@/components/Navbar';
import { Shield, CheckCircle2, AlertTriangle, Ban } from 'lucide-react';

export default function ReturnPolicyPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '10rem 2rem 4rem', flex: 1, color: 'var(--text-primary)' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          سياسة الاسترجاع والاستبدال <Shield size={48} />
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '4rem', lineHeight: 1.7 }}>
          في منصة Booga Car، رضاكم الكامل هو هدفنا الأساسي. نضمن لك حقوقك كاملة كعميل لأننا نعمل بمعايير تجارية احترافية وعالمية.
        </p>

        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', color: 'var(--text-primary)' }}>1. فترة السماح للاسترجاع</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}><CheckCircle2 size={20} color="#8ac926" style={{ flexShrink: 0, marginTop: '4px' }} /> يحق للعميل استرجاع أو استبدال القطع <strong>الجديدة</strong> خلال <strong>14 يوماً</strong> من تاريخ استلام الشحنة، متى ما توافرت شروط الاسترجاع المبكر.</li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}><CheckCircle2 size={20} color="#8ac926" style={{ flexShrink: 0, marginTop: '4px' }} /> قطع الغيار <strong>المستعملة أو التشليح</strong> تخضع لضمان استرجاع صارم مدته <strong>3 أيام</strong> فقط للتأكد من كفائتها وتطابقها مع المركبة.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', color: 'var(--text-primary)' }}>2. الشروط الأساسية لقبول الاسترجاع</h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}><AlertTriangle size={20} color="#fca311" style={{ flexShrink: 0, marginTop: '4px' }} /> أن تكون القطعة في <strong>حالتها الأصلية</strong> تماماً، ولم يتم استخدامها، خدشها، أو تركيبها في السيارة بأي شكل.</li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}><AlertTriangle size={20} color="#fca311" style={{ flexShrink: 0, marginTop: '4px' }} /> ألا تكون القطعة ضمن تصنيف الأجزاء <strong>الكهربائية والمستشعرات الحساسة (Sensors)</strong> التي تتلف بمجرد التجربة (يُستثنى من ذلك الحالات التي يثبت فيها بتقرير فني وجود تلف مصنعي).</li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}><AlertTriangle size={20} color="#fca311" style={{ flexShrink: 0, marginTop: '4px' }} /> توفر فاتورة الشراء الأصلية الإلكترونية (المرسلة للإيميل) والتغليف والإستيكرات الأصلية للشركة المصنعة.</li>
          </ul>
        </section>

        <section style={{ background: 'linear-gradient(145deg, rgba(230, 57, 70, 0.05), transparent)', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(230, 57, 70, 0.2)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#e63946', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>3. القطع التالفة وغير القابلة للاسترجاع <Ban size={28} /></h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            لأسباب تتعلق بالسلامة المهنية ومعايير الجودة للسيارات، نعتذر عن قبول استرجاع أو استبدال الحالات التالية:
          </p>
          <ul style={{ color: '#bbb', lineHeight: 2, marginRight: '1rem', fontSize: '1.05rem', listStyleType: 'disc' }}>
            <li>الزيوت بأنواعها، السوائل الهيدروليكية، والكيماويات إذا تم فتح الغطاء المطاطي أو الختم.</li>
            <li>الدوائر الكهربائية، وحدات التحكم (ECU)، ومفاتيح التشغيل بمجرد ربطها وبرمجتها على حاسوب المركبة.</li>
            <li>القطع التي تم <strong>قصها وتعديلها خصيصاً</strong> بناءً على طلب العميل المسبق.</li>
          </ul>
        </section>
        
        <div style={{ textAlign: 'center', marginTop: '5rem', paddingTop: '3rem', borderTop: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>لديك أسئلة أو تحتاج إلى مساعدة في الاسترجاع؟</p>
          <a href="#" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none' }}>تواصل مع فريق الدعم الفني الان</a>
        </div>

      </div>
    </main>
  );
}
