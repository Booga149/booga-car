const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, ANON_KEY);

const categoryImages = {
  'الصدامات والواجهة': 'https://images.unsplash.com/photo-1621379105494-013620803c58?w=800&q=80',
  'الشمعات والإضاءة': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=800&q=80',
  'الفرامل والأقمشة': 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=800&q=80',
  'الأبواب والرفرف': 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=800&q=80',
  'المساعدات والمقصات': 'https://images.unsplash.com/photo-1588162818817-f5099f182858?w=800&q=80',
  'البواجي والفلاتر': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
  'نظام التكييف والتبريد': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
  'نظام الوقود': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
  'الشكمان': 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=800&q=80',
  'الدركسون وملحقاته': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0be2?w=800&q=80',
  'الكهرباء والحساسات': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80',
  'البطاريات وملحقاتها': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
  'الديكور الداخلي والمقاعد': 'https://images.unsplash.com/photo-1600705544778-594246ed8052?w=800&q=80',
  'البودي والطلاء': 'https://images.unsplash.com/photo-1541892809703-a1afabbb457e?w=800&q=80',
  'العكس والدفرنس': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
  'الجنوط والكفرات': 'https://images.unsplash.com/photo-1517524008696-ea28c22765bf?w=800&q=80',
};

async function modernize() {
  console.log('Fetching products...');
  const { data: products, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  
  console.log(`Updating ${products.length} products...`);
  
  for (const product of products) {
    const updateData = {};
    
    // 1. Assign professional category images
    if (categoryImages[product.category]) {
      updateData.image_url = categoryImages[product.category];
    }
    
    // 2. Adjust prices to be lower/more competitive based on research
    // Example: original 1800 -> 1030 for bumpers
    if (product.category === 'الصدامات والواجهة' && product.price > 1000) {
      updateData.price = Math.round(product.price * 0.65); // ~35% reduction
      updateData.old_price = product.price;
    }
    
    if (product.category === 'الفرامل والأقمشة') {
      updateData.price = Math.round(product.price * 0.85); // Realistic pads are cheaper
      updateData.old_price = product.price;
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`Failed to update ${product.name}:`, updateError);
      } else {
        console.log(`✅ Updated: ${product.name}`);
      }
    }
  }
}

modernize();
