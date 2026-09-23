---
phase: 1
plan: 4
wave: 1
---

# Plan 1.4: Migrasi Skema Database Supabase

## Objective
Membuat berkas migrasi skema database Supabase (`supabase_schema_sync.sql`) agar struktur tabel di backend (PostgreSQL) sinkron dengan koleksi RxDB lokal.

## Context
- Kebutuhan sinkronisasi data dari RxDB lokal ke Supabase.
- Pengaturan Row Level Security (RLS) di-disable sementara agar `syncEngine` dapat melakukan bypass autentikasi pengguna individual dalam eksekusi data secara *bulk*.

## Tasks

<task type="auto">
  <name>Task 1: Generate Skema SQL Master untuk Supabase</name>
  <files>supabase_schema_sync.sql</files>
  <action>
    1. Buat berkas baru bernama `supabase_schema_sync.sql` di root proyek.
    2. Tulis perintah SQL untuk menghapus tabel lama yang tidak sinkron:
       ```sql
       DROP TABLE IF EXISTS public.transactions CASCADE;
       DROP TABLE IF EXISTS public.products CASCADE;
       DROP TABLE IF EXISTS public.members CASCADE;
       DROP TABLE IF EXISTS public.users CASCADE;
       DROP TABLE IF EXISTS public.supplier_invoices CASCADE;
       DROP TABLE IF EXISTS public.shift_logs CASCADE;
       ```
    3. Tulis `CREATE TABLE` untuk `users` (id, email, name, password_hash, role, status, permissions (JSONB), updated_at).
    4. Tulis `CREATE TABLE` untuk `members` (id, name, unit, join_date, credit_limit (NUMERIC), current_debt (NUMERIC), unpaid_months (NUMERIC), status, mandatory_savings (NUMERIC), unpaid_invoices (JSONB), updated_at).
    5. Tulis `CREATE TABLE` untuk `products` (id, barcode, sku, name, price (NUMERIC), cost_price (NUMERIC), stock (NUMERIC), unit, category, photo_url, updated_at).
    6. Tulis `CREATE TABLE` untuk `transactions` (id, invoice_number, member_id, total_amount (NUMERIC), payment_type, sync_status, timestamp, items (JSONB), is_synced (BOOLEAN), updated_at).
    7. Tulis `CREATE TABLE` untuk `supplier_invoices` (invoice_no, supplier_name, expected_qty (NUMERIC), status, created_at, scanned_items (JSONB), scanned_total_qty (NUMERIC), variance (NUMERIC), verified_at, updated_at).
    8. Tulis `CREATE TABLE` untuk `shift_logs` (shift_id, date, cashier, cashier_id, shift_name, opening_cash (NUMERIC), cash_sales (NUMERIC), credit_sales (NUMERIC), debt_repayments (NUMERIC), refunds (NUMERIC), expected_cash (NUMERIC), actual_cash (NUMERIC), variance (NUMERIC), variance_status, status, void_count (NUMERIC), voids (JSONB), minimized_payload, ai_audit_status, ai_audit_result (JSONB), updated_at).
    9. Tambahkan script untuk mematikan RLS sementara (atau membuat policy public) agar REST API syncEngine kasir dapat langsung melakukan operasi INSERT tanpa halangan:
       ```sql
       ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
       ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
       ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
       ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
       ALTER TABLE public.supplier_invoices DISABLE ROW LEVEL SECURITY;
       ALTER TABLE public.shift_logs DISABLE ROW LEVEL SECURITY;
       ```
  </action>
  <verify>Pastikan file `supabase_schema_sync.sql` terbentuk dan berisi seluruh definisi DDL yang sesuai dengan struktur koleksi RxDB.</verify>
  <done>Berkas SQL siap dieksekusi di Supabase.</done>
</task>

## Success Criteria
- [ ] Berkas `supabase_schema_sync.sql` berisi script DROP dan CREATE TABLE secara lengkap.
- [ ] Berkas script memastikan RLS di non-aktifkan sesuai instruksi.
