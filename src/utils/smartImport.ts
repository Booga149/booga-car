/**
 * Smart Import Utility for Merchant Bulk Upload
 * Handles fuzzy header mapping and automatic categorization.
 */

export interface ImportProduct {
  name: string;
  price: number;
  brand: string;
  category: string;
  condition: 'جديد' | 'مستعمل';
  stock: 'متوفر' | 'غير متوفر';
  image_url?: string;
  part_number?: string;
  old_price?: number;
  description?: string;
}

// Synonyms for mapping messy headers to our internal keys
const HEADER_SYNONYMS: Record<string, string[]> = {
  name: ['الاسم', 'اسم المنتج', 'القطعة', 'اسم القطعة', 'product', 'title', 'item', 'desc', 'description', 'الوصف'],
  price: ['السعر', 'القيمة', 'التكلفة', 'price', 'cost', 'val', 'rate', 'بيع', 'سعر البيع'],
  brand: ['الماركة', 'الشركة', 'البراند', 'صانع', 'brand', 'make', 'manufacturer', 'vendor'],
  category: ['القسم', 'الفئة', 'النوع', 'تصنيف', 'category', 'type', 'dept', 'classification'],
  image_url: ['الصورة', 'رابط الصورة', 'link', 'image', 'picture', 'url', 'thumb', 'photo', 'img'],
  part_number: ['رقم القطعة', 'رقم', 'كود', 'الرقم المصنعي', 'sku', 'part number', 'pn', 'partno', 'serial', 'part'],
  condition: ['الحالة', 'جديد/مستعمل', 'مستعمل/جديد', 'condition', 'status', 'state'],
  stock: ['المخزون', 'الكمية', 'المتوفر', 'stock', 'qty', 'status_stock', 'quantity', 'count'],
  description: ['الوصف', 'التفاصيل', 'وصف المنتج', 'البيانات', 'details', 'info', 'body', 'content', 'about']
};

// Keyword mapping for automatic categorization with weighted scoring
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'الفرامل والأقمشة': ['فرامل', 'أقمشة', 'هوبات', 'فحمات', 'brake', 'pad', 'disc', 'rotor', 'caliper', 'abs'],
  'البواجي والفلاتر': ['فلتر', 'بواجي', 'صفاية', 'منقي', 'filter', 'spark', 'plug', 'oil filter', 'air filter', 'fuel filter'],
  'الشمعات والإضاءة': ['شمعة', 'إضاءة', 'لمبة', 'كشاف', 'زنون', 'light', 'headlight', 'lamp', 'bulb', 'led', 'xenon', 'tail'],
  'المساعدات والمقصات': ['مساعد', 'مقص', 'جلد', 'عكوس', 'ركبة', 'جوزة', 'shock', 'strut', 'arm', 'suspension', 'bushing', 'mount'],
  'نظام التكييف والتبريد': ['تكييف', 'تبريد', 'رديتر', 'كمبروسر', 'ثلاجة', 'بلف', 'ac', 'cooling', 'radiator', 'compressor', 'condenser', 'fan'],
  'الكهرباء والحساسات': ['حساس', 'كهرباء', 'دينمو', 'سلف', 'كويل', 'كمبيوتر', 'sensor', 'electrical', 'alternator', 'starter', 'coil', 'ecu'],
  'الجنوط والكفرات': ['جنط', 'كفر', 'إطار', 'تنسيم', 'wheel', 'rim', 'tire', 'tyre', 'alloy'],
  'البطاريات وملحقاتها': ['بطارية', 'أصابع', 'منظم', 'battery', 'terminal', 'voltage'],
  'نظام الوقود': ['طرمبة', 'بخاخ', 'بنزين', 'خزان', 'fuel', 'pump', 'injector', 'tank', 'diesel'],
  'الديكور الداخلي والمقاعد': ['ديكور', 'مقعد', 'طبلون', 'مرتبة', 'فرش', 'سقف', 'interior', 'dash', 'seat', 'upholstery', 'console'],
  'الأبواب والرفرف': ['باب', 'رفرف', 'كبوت', 'شنطة', 'مراية', 'قفل', 'door', 'fender', 'hood', 'trunk', 'mirror', 'lock'],
  'الصدامات والواجهة': ['صدام', 'شبك', 'وجهية', 'كشافات ضباب', 'bumper', 'grille', 'front', 'fascia'],
  'البودي والطلاء': ['بودي', 'رش', 'بوية', 'تلميع', 'جلاكسي', 'body', 'paint', 'polish', 'wax'],
  'العكس والدفرنس': ['عكس', 'دفرنس', 'ترس', 'عمود دوران', 'axle', 'diff', 'differential', 'gear', 'shaft', 'cv joint'],
  'صيانة دورية': ['زيت', 'تصفية', 'تربيط', 'تشحيم', 'oil', 'service', 'maintenance', 'lube']
};

/**
 * Fuzzy matches a header string to one of our internal keys
 */
export const mapHeader = (rawHeader: string): string | null => {
  const normalized = rawHeader.trim().toLowerCase();
  for (const [key, synonyms] of Object.entries(HEADER_SYNONYMS)) {
    if (key === normalized || synonyms.some(s => normalized === s || normalized.includes(s))) {
      return key;
    }
  }
  return null;
};

/**
 * Automatically calculates the best category for a product based on its name
 */
export const autoCategorize = (productName: string): string => {
  const normalized = productName.trim().toLowerCase();
  let bestCategory = 'أخرى';
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    keywords.forEach(k => {
      if (normalized.includes(k.toLowerCase())) {
        score += k === normalized ? 10 : 2; // Exact match gets higher priority
      }
    });
    
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  
  return bestCategory;
};

/**
 * Processes a raw object from a CSV/Excel row into a valid ImportProduct
 */
export const processRow = (rawRow: Record<string, any>): ImportProduct => {
  const product: any = {};
  
  // Apply fuzzy mapping
  Object.entries(rawRow).forEach(([header, value]) => {
    const key = mapHeader(header);
    if (key) {
      product[key] = value;
    }
  });

  // Ensure data types and defaults
  const finalProduct: ImportProduct = {
    name: product.name || 'منتج غير مسمى',
    price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price).replace(/[^\d.]/g, '')) || 0,
    brand: product.brand || 'غير محدد',
    category: product.category || autoCategorize(product.name || ''),
    condition: product.condition?.toString().includes('مستعمل') ? 'مستعمل' : 'جديد',
    stock: product.stock?.toString().includes('غير متوفر') ? 'غير متوفر' : 'متوفر',
    image_url: product.image_url || '',
    part_number: product.part_number?.toString() || '',
    old_price: product.old_price ? parseFloat(String(product.old_price).replace(/[^\d.]/g, '')) : undefined,
    description: product.description || ''
  };

  return finalProduct;
};

