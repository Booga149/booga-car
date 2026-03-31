// Script to seed products into Supabase via REST API
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in .env.local');
  process.exit(1);
}

// Parse SQL INSERT statements and convert to JSON for REST API
function parseInserts(sql) {
  const products = [];
  // Match each VALUES block
  const insertRegex = /INSERT INTO public\.products \(([^)]+)\) VALUES\s*([\s\S]*?)ON CONFLICT DO NOTHING;/g;
  const simpleInsertRegex = /INSERT INTO public\.products \(([^)]+)\) VALUES\s*([\s\S]*?);/g;
  
  // Simpler approach: extract each row tuple
  const rowRegex = /\('([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*([\d.]+),\s*(\d+),\s*'([^']*)',\s*(true|false)\)/g;
  
  let match;
  while ((match = rowRegex.exec(sql)) !== null) {
    products.push({
      name: match[1],
      brand: match[2],
      category: match[3],
      price: Number(match[4]),
      old_price: Number(match[5]),
      condition: match[6],
      stock: match[7],
      shipping: match[8],
      rating: Number(match[9]),
      reviews_count: Number(match[10]),
      image_url: match[11],
      is_active: match[12] === 'true'
    });
  }
  return products;
}

async function seedProducts() {
  console.log('🚀 بدء تحميل المنتجات إلى Supabase...\n');
  
  // First delete existing products
  console.log('🗑️  حذف المنتجات القديمة...');
  const delRes = await fetch(`${SUPABASE_URL}/rest/v1/products?brand=not.is.null`, {
    method: 'DELETE',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    }
  });
  console.log(`   Status: ${delRes.status} ${delRes.status === 204 ? '✅' : '⚠️'}`);
  
  // Read all SQL files
  const sqlFiles = [
    '00004_full_products_seed.sql',
    '00005_full_products_seed_p2.sql', 
    '00006_full_products_seed_p3.sql'
  ];
  
  let allProducts = [];
  
  for (const file of sqlFiles) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ملف غير موجود: ${file}`);
      continue;
    }
    const sql = fs.readFileSync(filePath, 'utf-8');
    const products = parseInserts(sql);
    console.log(`📄 ${file}: ${products.length} منتج`);
    allProducts = allProducts.concat(products);
  }
  
  console.log(`\n📦 إجمالي المنتجات: ${allProducts.length}`);
  
  // Insert in batches of 20
  const batchSize = 20;
  let inserted = 0;
  
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const batch = allProducts.slice(i, i + batchSize);
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(batch)
    });
    
    if (res.status === 201) {
      inserted += batch.length;
      console.log(`   ✅ تم إدخال ${inserted}/${allProducts.length}`);
    } else {
      const err = await res.text();
      console.log(`   ❌ خطأ في الدفعة ${Math.floor(i/batchSize)+1}: ${res.status} - ${err}`);
    }
  }
  
  console.log(`\n🎉 تم! تم إدخال ${inserted} منتج بنجاح!`);
}

seedProducts().catch(console.error);
