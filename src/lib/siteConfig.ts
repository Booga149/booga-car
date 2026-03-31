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
      { name: 'افتح متجرك و بيع قطعك', href: '/sell' },
      { name: 'بوجا للأعمال (للتجار)', href: '/become-dealer' },
      { name: 'قائمة أمنياتي (المفضلة)', href: '/wishlist' },
      { name: 'لوحة التحكم للمديرين', href: '/admin' },
    ],
    policies: [
      { name: 'سياسة الاسترجاع والضمان', href: '/return-policy', highlight: true },
      { name: 'الخصوصية ومعالجة البيانات', href: '/privacy' },
      { name: 'الشروط والأحكام', href: '/terms' },
      { name: 'مركز خدمة العملاء المتواصل', href: '/support' },
    ]
  },
  seo: {
    themeColor: '#FFD700',
    favicon: '/favicon.png',
  }
};
