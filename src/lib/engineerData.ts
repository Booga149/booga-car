import { Product } from '@/types';

export const ENGINEER_SYSTEMS_PRODUCTS: Product[] = [
  {
    id: 'sys_01',
    name: 'جهاز فحص كمبيوتر بوجا برو (OBDII)',
    brand: 'Booga Engineering',
    category: 'كمبيوترات',
    price: 850,
    oldPrice: 1100,
    condition: 'جديد',
    stock: 'متوفر',
    shipping: 'مجاني',
    rating: 5,
    reviews: 342,
    image: 'https://images.unsplash.com/photo-1593344484962-496045d6574f?w=500&q=80',
    color: '#f43f5e',
    description: 'أحدث جهاز فحص أعطال متوافق مع كافة السيارات، يقرأ الأخطاء ويقدم حلول هندسية فورية عبر تطبيق بوجا.'
  },
  {
    id: 'sys_02',
    name: 'كمبيوتر محرك (ECU) رياضي التعديل المباشر',
    brand: 'Nite-X Systems',
    category: 'برمجة',
    price: 4200,
    oldPrice: 5000,
    condition: 'جديد',
    stock: 'متوفر',
    shipping: 'عادي',
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&q=80',
    color: '#3b82f6',
    description: 'تحكم كامل في ضخ الوقود والهواء مع خرائط برمجة معدة مسبقاً لزيادة القدرة الحصانية بنسبة 25%.'
  },
  {
    id: 'sys_03',
    name: 'طقم حساسات أكسجين (O2) عالية الدقة',
    brand: 'PrecisionFlow',
    category: 'حساسات',
    price: 520,
    oldPrice: 700,
    condition: 'جديد',
    stock: 'متوفر',
    shipping: 'عادي',
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=500&q=80',
    color: '#10b981',
    description: 'حساسات ذات استجابة فائقة لضمان احتراق مثالي وتقليل استهلاك الوقود.'
  },
  {
    id: 'sys_04',
    name: 'وحدة تحكم مركزية للإضاءة الذكية 64 لون',
    brand: 'Aurora Logic',
    category: 'إضاءة',
    price: 380,
    condition: 'جديد',
    stock: 'متوفر',
    shipping: 'مجاني',
    rating: 4.7,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1549497638-8531-d1058494cdd8?w=500&q=80',
    color: '#fbbf24',
    description: 'حول مقصورة سيارتك إلى فضاء هندسي بـ 64 لوناً قابلاً للبرمجة عبر الهاتف.'
  }
];
