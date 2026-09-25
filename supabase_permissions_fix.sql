-- Menonaktifkan Row Level Security (RLS) di semua tabel operasi kasir utama
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_invoices DISABLE ROW LEVEL SECURITY;

-- Memberikan hak akses baca/tulis penuh kepada API aplikasi (role anon dan authenticated)
GRANT ALL ON TABLE public.transactions TO anon, authenticated;
GRANT ALL ON TABLE public.products TO anon, authenticated;
GRANT ALL ON TABLE public.members TO anon, authenticated;
GRANT ALL ON TABLE public.users TO anon, authenticated;
GRANT ALL ON TABLE public.shift_logs TO anon, authenticated;
GRANT ALL ON TABLE public.supplier_invoices TO anon, authenticated;
