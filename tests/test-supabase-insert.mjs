import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const payload = {
    barcode: '123',
    sku: 'SKU-123',
    name: 'Test',
    category: 'Umum',
    unit: 'Pcs',
    cost_price: 1000,
    price: 2000,
    stock: 10,
    is_active: true
  };

  const { data, error } = await supabase
    .from('products')
    .upsert([payload], { onConflict: 'barcode' });

  if (error) {
    console.error("Supabase Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success:", data);
  }
}

testInsert();
