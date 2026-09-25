---
phase: 1
plan: 8
wave: 1
---

# Plan 1.8: Generate Skrip SQL Hak Akses Anonim Supabase

## Objective
Membuat skrip perbaikan hak akses role anonim di Supabase sesuai protokol GSD dengan menonaktifkan RLS dan memberikan akses ke tabel-tabel utama.

## Context
- `supabase_permissions_fix.sql` (File baru yang akan dibuat)

## Tasks

<task type="auto">
  <name>Task 1: Generate Skrip SQL untuk Hak Akses (Grants) Supabase</name>
  <files>supabase_permissions_fix.sql</files>
  <action>
    1. Buat berkas baru bernama `supabase_permissions_fix.sql` di root proyek.
    2. Tulis perintah SQL berikut untuk memastikan RLS benar-benar mati di semua tabel operasi kasir:
       `ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;`
       `ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;`
       `ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;`
       `ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;`
       `ALTER TABLE public.shift_logs DISABLE ROW LEVEL SECURITY;`
       `ALTER TABLE public.supplier_invoices DISABLE ROW LEVEL SECURITY;`
    3. Tulis perintah SQL berikut untuk memberikan hak akses baca/tulis penuh kepada API aplikasi (role anon):
       `GRANT ALL ON TABLE public.transactions TO anon, authenticated;`
       `GRANT ALL ON TABLE public.products TO anon, authenticated;`
       `GRANT ALL ON TABLE public.members TO anon, authenticated;`
       `GRANT ALL ON TABLE public.users TO anon, authenticated;`
       `GRANT ALL ON TABLE public.shift_logs TO anon, authenticated;`
       `GRANT ALL ON TABLE public.supplier_invoices TO anon, authenticated;`
  </action>
  <verify>Pastikan berkas `supabase_permissions_fix.sql` terbentuk dan berisi perintah GRANT untuk keenam tabel utama.</verify>
  <done>Berkas skrip SQL perbaikan hak akses siap untuk dieksekusi di Dasbor Supabase.</done>
</task>

## Success Criteria
- [x] Berkas `supabase_permissions_fix.sql` terbentuk di root proyek dengan pernyataan ALTER dan GRANT yang tepat.
