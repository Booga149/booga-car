/**
 * Arabic-to-English auto-translation for car parts search
 * Maps common Arabic car parts terms to their English equivalents
 */

const carPartsDict: Record<string, string> = {
  // Brakes
  'فرامل': 'brake pads',
  'فحمات': 'brake pads',
  'فحمات فرامل': 'brake pads',
  'هوبات': 'brake disc rotor',
  'ديسك فرامل': 'brake disc rotor',
  'ديسكات': 'brake disc',
  'تيل فرامل': 'brake pads',
  'سيلندر فرامل': 'brake cylinder',
  'ماستر فرامل': 'brake master cylinder',
  
  // Oil & Filters
  'فلتر': 'filter',
  'فلتر زيت': 'oil filter',
  'فلتر هواء': 'air filter',
  'فلتر مكيف': 'cabin air filter',
  'فلتر بنزين': 'fuel filter',
  'فلتر ديزل': 'diesel filter',
  'زيت': 'engine oil',
  'زيت محرك': 'engine oil',
  'زيت قير': 'transmission oil',
  'زيت فرامل': 'brake fluid',
  'زيوت': 'oil',
  
  // Engine
  'محرك': 'engine',
  'بوجيهات': 'spark plugs',
  'بواجي': 'spark plugs',
  'شمعات': 'spark plugs',
  'كويلات': 'ignition coil',
  'كويل': 'ignition coil',
  'حساس': 'sensor',
  'حساس اكسجين': 'oxygen sensor',
  'حساس كرنك': 'crankshaft sensor',
  'حساس كام': 'camshaft sensor',
  'حساس حرارة': 'temperature sensor',
  'حساس ضغط زيت': 'oil pressure sensor',
  'ثرموستات': 'thermostat',
  'رديتر': 'radiator',
  'رديتير': 'radiator',
  'مروحة': 'fan',
  'مروحة رديتر': 'radiator fan',
  'طرمبة ماء': 'water pump',
  'طرمبة بنزين': 'fuel pump',
  'سير': 'belt',
  'سير مكينة': 'engine belt',
  'سير توقيت': 'timing belt',
  'سير دينمو': 'alternator belt',
  'دينمو': 'alternator',
  'مارش': 'starter motor',
  'بطارية': 'car battery',
  
  // Suspension
  'مساعدات': 'shock absorber',
  'مساعد': 'shock absorber',
  'ممتص صدمات': 'shock absorber',
  'ياي': 'spring coil',
  'ياي مساعد': 'coil spring',
  'مقصات': 'control arm',
  'مقص': 'control arm',
  'مقص علوي': 'upper control arm',
  'مقص سفلي': 'lower control arm',
  'كبالن': 'CV joint',
  'كبل': 'CV joint',
  'طقم كبالن': 'CV joint kit',
  'جلد مقصات': 'control arm bushing',
  'روتيلا': 'ball joint',
  'وصلة ثبات': 'stabilizer link',
  'جلدة دركسون': 'steering rack boot',
  
  // Steering
  'دركسون': 'steering',
  'طرمبة دركسون': 'power steering pump',
  'طاره': 'steering wheel',
  'تيرود': 'tie rod',
  'نهاية تيرود': 'tie rod end',
  
  // Transmission
  'قير': 'transmission',
  'جربوكس': 'gearbox',
  'كلتش': 'clutch',
  'دبرياج': 'clutch',
  'طقم كلتش': 'clutch kit',
  'فتيس': 'gearbox',
  'كردان': 'drive shaft',
  
  // Electrical
  'كشافات': 'headlights',
  'كشاف': 'headlight',
  'ليد': 'LED light',
  'لمبة': 'bulb',
  'لمبات': 'car bulbs',
  'اشارة': 'turn signal',
  'سنسور': 'sensor',
  'كمبيوتر سيارة': 'car ECU',
  'ضفيرة': 'wiring harness',
  
  // Body
  'صدام': 'bumper',
  'صدام امامي': 'front bumper',
  'صدام خلفي': 'rear bumper',
  'شبك': 'grille',
  'مراية': 'mirror',
  'مرايا': 'side mirror',
  'مساحات': 'wiper blades',
  'مساحة': 'wiper blade',
  'زجاج': 'windshield',
  
  // AC
  'مكيف': 'AC compressor',
  'كمبروسر': 'AC compressor',
  'كمبريسور': 'AC compressor',
  'فريون': 'refrigerant',
  'مبخر': 'evaporator',
  'مكثف': 'condenser',
  
  // Exhaust
  'شكمان': 'exhaust',
  'عادم': 'exhaust',
  'كاتلايزر': 'catalytic converter',
  'دبة': 'muffler',
  
  // Wheels & Tires
  'جنوط': 'wheels rims',
  'جنط': 'wheel rim',
  'كفرات': 'tires',
  'كفر': 'tire',
  'بلوف': 'tire valve',
  
  // Interior
  'كراسي': 'car seat cover',
  'غطاء مقعد': 'seat cover',
  'طارة': 'steering wheel cover',
  'دواسات': 'pedal pads',
  'سجاد': 'car floor mat',
  
  // Accessories
  'اكسسوار': 'car accessories',
  'اكسسوارات': 'car accessories',
  'كاميرا خلفية': 'backup camera',
  'شاشة': 'car display screen',
  'شاحن': 'car charger',
  'حامل جوال': 'phone holder car',
  
  // Car brands
  'كامري': 'camry',
  'تويوتا': 'toyota',
  'هوندا': 'honda',
  'اكورد': 'accord',
  'سيفيك': 'civic',
  'نيسان': 'nissan',
  'هيونداي': 'hyundai',
  'كيا': 'kia',
  'بي ام دبليو': 'BMW',
  'مرسيدس': 'mercedes',
  'لكزس': 'lexus',
  'شيفروليه': 'chevrolet',
  'فورد': 'ford',
  'جي ام سي': 'GMC',
  'هايلكس': 'hilux',
  'لاندكروزر': 'land cruiser',
  'باترول': 'patrol',
  'اف جي': 'FJ cruiser',
  'بريوس': 'prius',
  'كورولا': 'corolla',
  'يارس': 'yaris',
  'سوناتا': 'sonata',
  'اكسنت': 'accent',
  'النترا': 'elantra',
  'ماليبو': 'malibu',
};

/**
 * Detect if text contains Arabic characters
 */
function isArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Translate an Arabic search query to English using the car parts dictionary
 */
export function translateSearchQuery(query: string): string {
  const trimmed = query.trim();
  
  // If not Arabic, return as-is
  if (!isArabic(trimmed)) return trimmed;
  
  // Try exact match first
  const exactMatch = carPartsDict[trimmed];
  if (exactMatch) return exactMatch;
  
  // Try lowercase match
  const lowerMatch = carPartsDict[trimmed.toLowerCase()];
  if (lowerMatch) return lowerMatch;
  
  // Try matching each word and building a translated query
  const words = trimmed.split(/\s+/);
  const translated: string[] = [];
  let i = 0;
  
  while (i < words.length) {
    let matched = false;
    
    // Try matching 3-word, 2-word, then 1-word phrases
    for (let len = Math.min(3, words.length - i); len >= 1; len--) {
      const phrase = words.slice(i, i + len).join(' ');
      const translation = carPartsDict[phrase];
      if (translation) {
        translated.push(translation);
        i += len;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      // Check if the word itself has a translation
      const word = words[i];
      const wordTranslation = carPartsDict[word];
      translated.push(wordTranslation || word);
      i++;
    }
  }
  
  return translated.join(' ');
}
