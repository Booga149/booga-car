/**
 * Smart Search Parser for Booga Car
 * Converts natural language strings into structured search filters.
 */

export interface ParsedSearch {
  make: string | null;
  model: string | null;
  year: string | null;
  query: string;
}

const COMMON_MAKES: Record<string, string> = {
  'تويوتا': 'Toyota',
  'هيونداي': 'Hyundai',
  'فورد': 'Ford',
  'نيسان': 'Nissan',
  'كيا': 'Kia',
  'هوندا': 'Honda',
  'مازدا': 'Mazda',
  'لكزس': 'Lexus',
  'مرسيدس': 'Mercedes-Benz',
  'بي ام': 'BMW',
  'bmw': 'BMW',
  'جمس': 'GMC',
  'شيفروليه': 'Chevrolet',
  'شفر': 'Chevrolet',
};

const COMMON_MODELS: Record<string, string> = {
  'كامري': 'Camry',
  'كورولا': 'Corolla',
  'يارس': 'Yaris',
  'افالون': 'Avalon',
  'النترا': 'Elantra',
  'اكسنت': 'Accent',
  'سوناتا': 'Sonata',
  'توسان': 'Tucson',
  'سانتا فيه': 'Santa Fe',
  'كورد': 'Accord',
  'سيفيك': 'Civic',
  'باترول': 'Patrol',
  'صني': 'Sunny',
  'تيتان': 'Titan',
  'لاندكروزر': 'Land Cruiser',
  'جيب': 'Jeep',
};

/**
 * Parses a string to extract car attributes and the actual part query.
 * Example: "فرامل كامري 2022" -> { make: 'Toyota', model: 'Camry', year: '2022', query: 'فرامل' }
 */
export function parseSmartSearch(input: string): ParsedSearch {
  const words = input.toLowerCase().split(/\s+/);
  const result: ParsedSearch = {
    make: null,
    model: null,
    year: null,
    query: ''
  };

  const queryParts: string[] = [];

  for (const word of words) {
    // 1. Detect Year (4 digits, e.g., 2022)
    if (/^(20|19)\d{2}$/.test(word)) {
      result.year = word;
      continue;
    }

    // 2. Detect Make
    let foundMake = false;
    for (const [ar, en] of Object.entries(COMMON_MAKES)) {
      if (word.includes(ar) || word === en.toLowerCase()) {
        result.make = en;
        foundMake = true;
        break;
      }
    }
    if (foundMake) continue;

    // 3. Detect Model
    let foundModel = false;
    for (const [ar, en] of Object.entries(COMMON_MODELS)) {
      if (word.includes(ar) || word === en.toLowerCase()) {
        result.model = en;
        foundModel = true;
        break;
      }
    }
    if (foundModel) continue;

    // 4. If not metadata, it's part of the search query
    queryParts.push(word);
  }

  result.query = queryParts.join(' ');
  
  // Implicit mapping: if model found but no make, try to find make
  if (result.model && !result.make) {
     // (Optional: cross-reference logic)
  }

  return result;
}

/**
 * Predicts metadata for a product listing based on its name.
 * Ideal for Auto-Filling the 'Sell' form.
 */
export function predictMetadata(name: string): { brand: string | null; category: string | null } {
  const parsed = parseSmartSearch(name);
  const words = name.toLowerCase();
  
  let predictedCategory = 'أخرى';

  // Category Keyword Mappings
  const categoryKeywords: Record<string, string[]> = {
    'الصدامات والواجهة': ['صدام', 'شبك', 'رفرف', 'لحية', 'bumper', 'grille'],
    'الشمعات والإضاءة': ['شمعة', 'إضاءة', 'انطباب', 'لمبات', 'led', 'headlight', 'tail light'],
    'الفرامل والأقمشة': ['فرامل', 'فحمات', 'هوبات', 'ماستر', 'brake', 'pads', 'rotor'],
    'المساعدات والمقصات': ['مساعد', 'مساعدات', 'مقص', 'مقصات', 'ركبة', 'shock', 'strut', 'arm'],
    'البواجي والفلاتر': ['بواجي', 'فلتر', 'زيت', 'هواء', 'بنزين', 'spark plug', 'filter', 'oil'],
    'أجزاء المحرك': ['مكينة', 'جير', 'جيربوكس', 'راس', 'وجه', 'engine', 'gearbox', 'transmission'],
    'برمجة وأنظمة ذكية': ['كمبيوتر', 'برمجة', 'حساس', 'حساسات', 'فحص', 'ecu', 'scanner', 'sensor', 'obd'],
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(k => words.includes(k))) {
      predictedCategory = cat;
      break;
    }
  }

  // Use the detected Make as the brand
  let predictedBrand = parsed.make || '';

  return {
    brand: predictedBrand,
    category: predictedCategory
  };
}
