/**
 * Site Configuration for Booga Car
 * Centralizes all common strings, social links, and contact information.
 */

export const siteConfig = {
  name: 'Booga Car',
  nameArabic: 'بوجا كار',
  description: 'المنصة الأكبر لقطع غيار السيارات في المملكة والخليج، خيارات ذكية لأفضل أداء.',
  tagline: 'قطع غيار أصلية للمحترفين',
  contact: {
    phone: '+966500000000',
    whatsapp: 'https://wa.me/966500000000',
    email: 'support@booga-car.sa',
    address: 'الرياض، المملكة العربية السعودية',
  },
  socials: {
    twitter: 'https://twitter.com/boogacar',
    instagram: 'https://instagram.com/boogacar',
    linkedin: 'https://linkedin.com/company/boogacar',
  },
  navigation: {
    quickLinks: [
      { name: 'تصفح محرك القطع', href: '/products' },
      { name: 'سعّرلي (طلب تسعير)', href: '/price-request' },
      { name: 'تتبع طلبك', href: '/track-order' },
      { name: 'من نحن', href: '/about' },
      { name: 'بوجا للأعمال (للتجار)', href: '/become-dealer' },
      { name: 'الأسئلة الشائعة', href: '/faq' },
      { name: 'تواصل معنا', href: '/contact' },
    ],
    policies: [
      { name: 'سياسة الاسترجاع', href: '/return-policy', highlight: true },
      { name: 'سياسة الضمان', href: '/warranty', highlight: false },
      { name: 'الشحن والتوصيل', href: '/shipping', highlight: false },
      { name: 'سياسة الخصوصية', href: '/privacy', highlight: false },
      { name: 'الشروط والأحكام', href: '/terms', highlight: false },
    ]
  },
  seo: {
    themeColor: '#FFD700',
    favicon: '/favicon.png',
  }
};
