// insert_coupon.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing config");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking if SAUDI15 exists...");
  const { data: existing } = await supabase.from('coupons').select('*').eq('code', 'SAUDI15').single();
  
  if (existing) {
    console.log("Coupon already exists!", existing);
    process.exit(0);
  }

  console.log("Inserting SAUDI15...");
  const { data, error } = await supabase.from('coupons').insert({
    code: 'SAUDI15',
    discount_percent: 15,
    min_order_amount: 0,
    is_active: true
  }).select();

  if (error) {
    console.error("Error inserting coupon:", error);
  } else {
    console.log("Successfully inserted coupon:", data);
  }
}

run();
