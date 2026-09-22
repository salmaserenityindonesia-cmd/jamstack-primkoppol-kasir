import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTableAccess(tableName) {
  console.log(`\nTesting table: ${tableName}...`);
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        console.error(`❌ Table '${tableName}' does not exist.`);
      } else {
        console.error(`❌ Error accessing table '${tableName}':`, error.message);
      }
      return false;
    }

    console.log(`✅ Table '${tableName}' exists and is accessible. Row count: ${count}`);
    return true;
  } catch (err) {
    console.error(`❌ Unexpected error accessing table '${tableName}':`, err.message);
    return false;
  }
}

async function runTests() {
  console.log('--- Supabase Schema & RLS Test ---');
  console.log(`Connecting to: ${supabaseUrl}`);

  const tables = ['products', 'transactions', 'members'];
  let allGood = true;

  for (const table of tables) {
    const isGood = await testTableAccess(table);
    if (!isGood) allGood = false;
  }

  if (!allGood) {
    console.log('\n--- Action Required ---');
    console.log('Please execute the following DDL in your Supabase SQL Editor:');
    console.log(`
-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode text UNIQUE NOT NULL,
  sku text NOT NULL,
  name text NOT NULL,
  category text,
  unit text,
  cost_price numeric DEFAULT 0,
  price numeric DEFAULT 0,
  stock integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.products FOR UPDATE USING (true);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id text UNIQUE NOT NULL,
  total_amount numeric DEFAULT 0,
  payment_method text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.transactions FOR INSERT WITH CHECK (true);

-- Members table
CREATE TABLE IF NOT EXISTS public.members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.members FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.members FOR INSERT WITH CHECK (true);
    `);
  } else {
    console.log('\n✅ All specified tables are ready!');
  }
}

runTests();
