"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';

import { HelpCircle, ChevronDown, Search, Truck, CreditCard, Wrench, RotateCcw, MapPin } from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    name: 'الشراء والدفع',
    icon: <CreditCard size={20} />,
    questions: [
      { q: 'كيف أشتري قطعة غيار من الموقع؟', a: 'ابحث عن القطعة المطلوبة باستخدام شريط البحث أو اختر ماركة سيارتك، ثم أضف المنتج للسلة واتبع خطوات الدفع. يمكنك الدفع إلكترونياً أو عند الاستلام.' },
      { q: 'ما هي طرق الدفع المتوفرة؟', a: 'نوفر الدفع عند الاستلام (كاش)، الدفع بالبطاقة الائتمانية (فيزا/ماستركارد)، والتحويل البنكي المباشر. جميع المعاملات مشفرة وآمنة بنسبة 100%.' },
      { q: 'هل الأسعار تشمل ضريبة القيمة المضافة (VAT)؟', a: 'نعم، جميع الأسعار المعروضة على الموقع تشمل ضريبة القيمة المضافة بنسبة 15% وفقاً لأنظمة هيئة الزكاة والضريبة والجمارك.' },
      { q: 'هل يوجد حد أدنى للطلب؟', a: 'لا يوجد حد أدنى — يمكنك طلب قطعة واحدة. لكن الطلبات فوق 500 ريال تحصل على شحن مجاني.' },
    ]
  },
  {
    name: 'التوافق والملاءمة',
    icon: <Wrench size={20} />,
    questions: [
      { q: 'كيف أتأكد أن القطعة تتوافق مع سيارتي؟', a: 'استخدم أداة البحث الذكي في الموقع: أدخل رقم الهيكل (VIN) أو اختر ماركة وموديل وسنة الصنع لعرض القطع المتوافقة فقط. كما يمكنك الاستعانة بفريق الدعم الفني للتأكد من التوافق.' },
      { q: 'ما هو رقم الهيكل (VIN) وأين أجده؟', a: 'رقم الهيكل هو رقم مكون من 17 خانة يحدد مواصفات سيارتك بدقة. تجده عادة على الزجاج الأمامي السفلي (جهة السائق)، أو على ملصق داخل باب السائق، أو في استمارة السيارة.' },
      { q: 'ماذا لو طلبت قطعة غير متوافقة مع سيارتي؟', a: 'يمكنك استرجاعها خلال 14 يوماً بشرط عدم التركيب أو الاستخدام. فريقنا سيساعدك في إيجاد القطعة الصحيحة المتوافقة دون أي رسوم إضافية.' },
      { q: 'ما الفرق بين القطع الأصلية (OEM) والبديلة (Aftermarket)؟', a: 'القطع الأصلية (OEM) هي نفس القطع المصنّعة للشركة المصنّعة للسيارة. القطع البديلة (Aftermarket) مصنّعة من شركات أخرى بجودة قد تكون مماثلة أو أعلى وبسعر أقل. نحن نوضح نوع كل قطعة في صفحة المنتج.' },
    ]
  },
  {
    name: 'الشحن والتوصيل',
    icon: <Truck size={20} />,
    questions: [
      { q: 'كم مدة التوصيل؟', a: 'الرياض وجدة والدمام: خلال 1-3 أيام عمل. باقي مناطق المملكة: 3-7 أيام عمل. نوفر خيار شحن سريع (يوم واحد) في المدن الرئيسية مقابل رسوم إضافية.' },
      { q: 'كم تكلفة الشحن؟', a: 'الشحن مجاني للطلبات فوق 500 ريال. للطلبات الأقل، رسوم الشحن 35 ريال لجميع مناطق المملكة. القطع الثقيلة (أكثر من 30 كجم) قد تخضع لرسوم شحن إضافية.' },
      { q: 'هل يمكنني تتبع شحنتي؟', a: 'نعم! بمجرد شحن طلبك ستحصل على رقم تتبع. يمكنك متابعة الشحنة من صفحة "تتبع الطلب" في الموقع أو من تطبيق شركة الشحن مباشرة.' },
      { q: 'هل تشحنون خارج المملكة؟', a: 'حالياً نغطي جميع مناطق المملكة العربية السعودية. نعمل على إضافة الشحن الدولي لدول الخليج قريباً.' },
    ]
  },
  {
    name: 'الاسترجاع والضمان',
    icon: <RotateCcw size={20} />,
    questions: [
      { q: 'ما هي سياسة الاسترجاع لديكم؟', a: 'يحق لك استرجاع القطع الجديدة خلال 14 يوماً والمستعملة خلال 3 أيام من الاستلام، بشرط أن تكون في حالتها الأصلية ولم يتم تركيبها. راجع صفحة سياسة الاسترجاع للتفاصيل الكاملة.' },
      { q: 'هل القطع مضمونة؟', a: 'نعم! كل القطع الأصلية مضمونة لمدة سنة كاملة ضد عيوب التصنيع. القطع البديلة مضمونة لمدة 6 أشهر. الضمان لا يشمل الاستخدام الخاطئ أو التركيب غير الصحيح.' },
      { q: 'كيف أسترجع منتج؟', a: 'تواصل مع فريق الدعم عبر صفحة "تواصل معنا" أو واتساب مع ذكر رقم الطلب. سنرتب استلام القطعة وإرجاع المبلغ خلال 5-7 أيام عمل.' },
    ]
  },
  {
    name: 'للتجار والموردين',
    icon: <MapPin size={20} />,
    questions: [
      { q: 'كيف أنضم كتاجر في المنصة؟', a: 'اذهب لصفحة "كن تاجراً معتمداً" واملأ نموذج التقديم. ستحتاج رقم السجل التجاري وبيانات المنشأة. يتم مراجعة الطلبات خلال 1-3 أيام عمل.' },
      { q: 'كم عمولة المنصة على المبيعات؟', a: 'عمولة المنصة 10% من قيمة البيع — تشمل معالجة الدفع والدعم الفني والتسويق. لا يوجد رسوم اشتراك شهرية أو رسوم إدراج.' },
      { q: 'هل أستطيع رفع منتجاتي بالجملة؟', a: 'نعم! نوفر أداة استيراد منتجات بالجملة عبر ملفات CSV أو Excel. يمكنك رفع مئات المنتجات دفعة واحدة من لوحة تحكم البائع.' },
    ]
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleQuestion = (idx: number) => {
    setOpenQuestions(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const allQuestions = FAQ_CATEGORIES.flatMap((cat, ci) =>
    cat.questions.map((q, qi) => ({ ...q, catIndex: ci, globalIndex: ci * 100 + qi }))
  );

  const filteredQuestions = searchQuery
    ? allQuestions.filter(q => q.q.includes(searchQuery) || q.a.includes(searchQuery))
    : FAQ_CATEGORIES[activeCategory].questions.map((q, qi) => ({ ...q, catIndex: activeCategory, globalIndex: activeCategory * 100 + qi }));

  return (
    <main style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '10rem 2rem 4rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(244,63,94,0.06) 0%, transparent 60%)' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          الأسئلة <span style={{ color: 'var(--primary)' }}>الشائعة</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 500, maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          كل ما تحتاج معرفته عن الشراء، الشحن، التوافق، الاسترجاع والمزيد
        </p>

        {/* Search */}
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            placeholder="ابحث في الأسئلة الشائعة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '1.2rem 3rem 1.2rem 1.2rem', borderRadius: '18px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', outline: 'none'
            }}
          />
        </div>
      </section>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        {/* Category Tabs */}
        {!searchQuery && (
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3rem' }}>
            {FAQ_CATEGORIES.map((cat, i) => (
              <button key={i} onClick={() => { setActiveCategory(i); setOpenQuestions([]); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.8rem 1.5rem', borderRadius: '14px', border: '1px solid',
                  borderColor: activeCategory === i ? 'var(--primary)' : 'var(--border)',
                  background: activeCategory === i ? 'var(--primary)' : 'var(--surface)',
                  color: activeCategory === i ? 'white' : 'var(--text-primary)',
                  fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: '0.2s'
                }}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredQuestions.map((item, i) => {
            const isOpen = openQuestions.includes(item.globalIndex);
            return (
              <div key={item.globalIndex} style={{
                background: 'var(--surface)', border: '1px solid',
                borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
                borderRadius: '20px', overflow: 'hidden', transition: '0.3s'
              }}>
                <button onClick={() => toggleQuestion(item.globalIndex)} style={{
                  width: '100%', padding: '1.5rem 2rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.05rem',
                  textAlign: 'right', gap: '1rem'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <HelpCircle size={20} color="var(--primary)" />
                    {item.q}
                  </span>
                  <ChevronDown size={20} style={{
                    transition: '0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0, color: 'var(--text-secondary)'
                  }} />
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 2rem 1.5rem 2rem', paddingRight: '3.5rem',
                    color: 'var(--text-secondary)', lineHeight: 1.9, fontWeight: 500,
                    fontSize: '1rem', borderTop: '1px solid var(--border)'
                  }}>
                    <p style={{ marginTop: '1rem' }}>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions */}
        <div style={{
          marginTop: '4rem', textAlign: 'center', padding: '3rem',
          background: 'var(--surface)', borderRadius: '28px', border: '1px solid var(--border)'
        }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            لم تجد إجابتك؟
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontWeight: 500 }}>
            فريقنا جاهز لمساعدتك — تواصل معنا مباشرة.
          </p>
          <a href="/contact" style={{
            background: 'var(--primary)', color: 'white', padding: '1rem 2.5rem',
            borderRadius: '16px', fontWeight: 900, textDecoration: 'none',
            boxShadow: '0 8px 25px rgba(244,63,94,0.3)'
          }}>تواصل معنا</a>
        </div>
      </div>

    </main>
  );
}
