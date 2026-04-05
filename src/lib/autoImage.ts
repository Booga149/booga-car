/**
 * Auto-Image System — صور قطع الغيار الفعلية
 * يعيّن صور تلقائية احترافية لكل قطعة بناءً على اسمها وتصنيفها
 * للتجار اللي ما عندهم صور أو كمبيوتر
 */

// صور قطع غيار حقيقية حسب الكلمات المفتاحية (الأولوية الأعلى)
const PART_IMAGES: Record<string, string> = {
  // === فرامل ===
  'فحمات': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80',
  'أقمشة فرامل': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80',
  'هوبات': 'https://images.unsplash.com/photo-1659083817-52e93eef9703?w=500&q=80',
  'ديسك فرامل': 'https://images.unsplash.com/photo-1659083817-52e93eef9703?w=500&q=80',
  'brake pad': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80',
  'brake disc': 'https://images.unsplash.com/photo-1659083817-52e93eef9703?w=500&q=80',
  
  // === فلاتر ===
  'فلتر زيت': 'https://images.unsplash.com/photo-1635784063803-6e7e33bf0696?w=500&q=80',
  'فلتر هواء': 'https://images.unsplash.com/photo-1620085629530-74fb8862fde1?w=500&q=80',
  'فلتر مكيف': 'https://images.unsplash.com/photo-1620085629530-74fb8862fde1?w=500&q=80',
  'فلتر بنزين': 'https://images.unsplash.com/photo-1635784063803-6e7e33bf0696?w=500&q=80',
  'oil filter': 'https://images.unsplash.com/photo-1635784063803-6e7e33bf0696?w=500&q=80',
  'air filter': 'https://images.unsplash.com/photo-1620085629530-74fb8862fde1?w=500&q=80',
  
  // === بواجي وكويلات ===
  'بوجي': 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=500&q=80',
  'بواجي': 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=500&q=80',
  'كويل': 'https://images.unsplash.com/photo-1622473041783-11be5a56b7c0?w=500&q=80',
  'spark plug': 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=500&q=80',
  
  // === إضاءة ===
  'شمعة': 'https://images.unsplash.com/photo-1621266876144-2a1893306246?w=500&q=80',
  'هيدلايت': 'https://images.unsplash.com/photo-1621266876144-2a1893306246?w=500&q=80',
  'لمبة': 'https://images.unsplash.com/photo-1590004987778-bece5c530e50?w=500&q=80',
  'كشاف': 'https://images.unsplash.com/photo-1621266876144-2a1893306246?w=500&q=80',
  'headlight': 'https://images.unsplash.com/photo-1621266876144-2a1893306246?w=500&q=80',
  'فانوس': 'https://images.unsplash.com/photo-1590004987778-bece5c530e50?w=500&q=80',
  'led': 'https://images.unsplash.com/photo-1590004987778-bece5c530e50?w=500&q=80',
  
  // === محرك ===
  'مكينة': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80',
  'محرك': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80',
  'engine': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80',
  'بستم': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80',
  'جلد مكينة': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80',
  
  // === تعليق ===
  'مساعد': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&q=80',
  'مقص': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&q=80',
  'جوزة': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&q=80',
  'عكس': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&q=80',
  'shock': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&q=80',
  
  // === بطارية ===
  'بطارية': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&q=80',
  'battery': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&q=80',
  
  // === تكييف ===
  'رديتر': 'https://images.unsplash.com/photo-1585435557343-3b348031af67?w=500&q=80',
  'مروحة': 'https://images.unsplash.com/photo-1585435557343-3b348031af67?w=500&q=80',
  'كمبروسر': 'https://images.unsplash.com/photo-1585435557343-3b348031af67?w=500&q=80',
  'radiator': 'https://images.unsplash.com/photo-1585435557343-3b348031af67?w=500&q=80',
  'compressor': 'https://images.unsplash.com/photo-1585435557343-3b348031af67?w=500&q=80',
  
  // === إطارات وجنوط ===
  'كفر': 'https://images.unsplash.com/photo-1605559913988-90e12e6dba19?w=500&q=80',
  'إطار': 'https://images.unsplash.com/photo-1605559913988-90e12e6dba19?w=500&q=80',
  'جنط': 'https://images.unsplash.com/photo-1611270418597-a6c77f4b7271?w=500&q=80',
  'tire': 'https://images.unsplash.com/photo-1605559913988-90e12e6dba19?w=500&q=80',
  'rim': 'https://images.unsplash.com/photo-1611270418597-a6c77f4b7271?w=500&q=80',
  'wheel': 'https://images.unsplash.com/photo-1611270418597-a6c77f4b7271?w=500&q=80',
  
  // === وقود ===
  'طرمبة بنزين': 'https://images.unsplash.com/photo-1614026480209-cd9934144671?w=500&q=80',
  'بخاخ': 'https://images.unsplash.com/photo-1614026480209-cd9934144671?w=500&q=80',
  'injector': 'https://images.unsplash.com/photo-1614026480209-cd9934144671?w=500&q=80',
  'fuel pump': 'https://images.unsplash.com/photo-1614026480209-cd9934144671?w=500&q=80',
  
  // === كهرباء ===
  'حساس': 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=500&q=80',
  'دينمو': 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=500&q=80',
  'سلف': 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=500&q=80',
  'sensor': 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=500&q=80',
  'alternator': 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=500&q=80',
  
  // === صدام وبودي ===
  'صدام': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&q=80',
  'شبك': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&q=80',
  'bumper': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&q=80',
  'مراية': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&q=80',
  'mirror': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&q=80',
  
  // === سيور ===
  'سير': 'https://images.unsplash.com/photo-1622473041783-11be5a56b7c0?w=500&q=80',
  'belt': 'https://images.unsplash.com/photo-1622473041783-11be5a56b7c0?w=500&q=80',
  'تيمنق': 'https://images.unsplash.com/photo-1622473041783-11be5a56b7c0?w=500&q=80',
  
  // === زيت ===
  'زيت': 'https://images.unsplash.com/photo-1635784063803-6e7e33bf0696?w=500&q=80',
  'oil': 'https://images.unsplash.com/photo-1635784063803-6e7e33bf0696?w=500&q=80',
  
  // === شكمان ===
  'شكمان': 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=500&q=80',
  'دبة': 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=500&q=80',
  'exhaust': 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=500&q=80',
  'كتلايزر': 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=500&q=80',
  
  // === قير/ناقل ===
  'قير': 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=500&q=80',
  'ناقل': 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=500&q=80',
  'فتيس': 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=500&q=80',
  'transmission': 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=500&q=80',
  
  // === مقاعد ===
  'مقعد': 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=500&q=80',
  'كرسي': 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=500&q=80',
  'seat': 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=500&q=80',
  'طبلون': 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=500&q=80',
  'dashboard': 'https://images.unsplash.com/photo-1583267746897-2cf415887172?w=500&q=80',
  
  // === دركسون ===
  'دركسون': 'https://images.unsplash.com/photo-1589362142070-f3083e73f94b?w=500&q=80',
  'طارة': 'https://images.unsplash.com/photo-1589362142070-f3083e73f94b?w=500&q=80',
  'steering': 'https://images.unsplash.com/photo-1589362142070-f3083e73f94b?w=500&q=80',
};

// صورة قطعة غيار عامة (مش سيارة!)
const DEFAULT_PART_IMAGE = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500&q=80';

/**
 * يرجع صورة القطعة الفعلية بناءً على اسم المنتج والتصنيف
 * الأولوية: اسم القطعة > التصنيف > صورة افتراضية
 */
export function getAutoImage(category?: string, name?: string): string {
  // 1. أول شي: ابحث بالاسم — الأكثر دقة
  if (name) {
    const nameLower = name.toLowerCase().trim();
    
    // ابحث عن أطول تطابق أولاً (أكثر دقة)
    const sortedKeys = Object.keys(PART_IMAGES).sort((a, b) => b.length - a.length);
    
    for (const keyword of sortedKeys) {
      if (nameLower.includes(keyword.toLowerCase())) {
        return PART_IMAGES[keyword];
      }
    }
  }

  // 2. ثاني شي: ابحث بالتصنيف
  if (category) {
    const categoryImages: Record<string, string> = {
      'الفرامل والأقمشة': PART_IMAGES['فحمات'],
      'البواجي والفلاتر': PART_IMAGES['بوجي'],
      'الشمعات والإضاءة': PART_IMAGES['هيدلايت'],
      'المساعدات والمقصات': PART_IMAGES['مساعد'],
      'نظام التكييف والتبريد': PART_IMAGES['رديتر'],
      'الكهرباء والحساسات': PART_IMAGES['حساس'],
      'الجنوط والكفرات': PART_IMAGES['كفر'],
      'البطاريات وملحقاتها': PART_IMAGES['بطارية'],
      'نظام الوقود': PART_IMAGES['بخاخ'],
      'الديكور الداخلي والمقاعد': PART_IMAGES['مقعد'],
      'الأبواب والرفرف': PART_IMAGES['صدام'],
      'الصدامات والواجهة': PART_IMAGES['صدام'],
      'البودي والطلاء': PART_IMAGES['صدام'],
      'العكس والدفرنس': PART_IMAGES['قير'],
      'الدركسون وملحقاته': PART_IMAGES['دركسون'],
    };
    
    if (categoryImages[category]) {
      return categoryImages[category];
    }
  }

  // 3. صورة قطعة غيار عامة
  return DEFAULT_PART_IMAGE;
}

/**
 * يتأكد إن الصورة صالحة ومش الصورة القديمة الافتراضية
 */
export function isValidImage(url?: string | null): boolean {
  if (!url) return false;
  if (url.trim() === '') return false;
  // تجاهل الصورة الافتراضية القديمة (صورة سيارة)
  if (url.includes('1494976388531-d1058494cdd8')) return false;
  return true;
}
