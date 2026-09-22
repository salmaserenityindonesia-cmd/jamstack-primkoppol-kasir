---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Supabase Synchronization & Schema Verification

## Objective
Memverifikasi kesiapan skema Supabase dan mengaktifkan sinkronisasi dua arah untuk koleksi `products` ke cloud.

## Context
- Kredensial Supabase di `.env`
- Konfigurasi RxDB di `src/db/syncEngine.js` dan `src/index.js`

## Tasks

<task type="auto">
  <name>Task 1: Skrip Uji Verifikasi Skema & Izin RLS Tabel Supabase</name>
  <files>tests/test-supabase-schema.mjs</files>
  <action>
    1. Buat skrip `tests/test-supabase-schema.mjs`.
    2. Impor Supabase client menggunakan variabel kredensial dari `.env` (URL & Anon Key).
    3. Lakukan pengujian koneksi dan izin tulis (dry-run insert/upsert atau select count) ke tabel:
       - `products`
       - `transactions`
       - `members`
    4. Jika tabel belum ada atau terhalang RLS policy (error 404 / 42P01 / 401), tampilkan petunjuk DDL SQL yang perlu dijalankan pengguna di SQL Editor dasbor Supabase.
  </action>
  <verify>Jalankan `node tests/test-supabase-schema.mjs` di terminal lokal dan laporkan status keterbacaan setiap tabel.</verify>
  <done>Kesiapan skema Supabase terpetakan dengan bukti status izin akses yang jelas.</done>
</task>

<task type="auto">
  <name>Task 2: Integrasikan Sinkronisasi Koleksi Products ke Supabase</name>
  <files>src/db/syncEngine.js, src/index.js</files>
  <action>
    1. Buka `src/db/syncEngine.js`.
    2. Tambahkan fungsi async `syncProductsToSupabase()`:
       - Baca seluruh data produk dari RxDB lokal.
       - Kirim batch upsert ke tabel `products` di Supabase (mencocokkan kolom barcode, sku, name, price, cost_price, stock, category).
    3. Sambungkan fungsi sinkronisasi produk ini ke dalam trigger tab Leader atau ekspos via `window.POS_DB.syncProducts()` agar tombol restock / tambah SKU bisa memicu sinkronisasi seketika.
  </action>
  <verify>Jalankan uji pengiriman 1 sampel produk dari RxDB ke Supabase dan verifikasi data tersimpan di Supabase.</verify>
  <done>Sinkronisasi master barang antara RxDB lokal dan Supabase Cloud berjalan aktif.</done>
</task>

## Success Criteria
- [ ] Skrip `tests/test-supabase-schema.mjs` berhasil dibuat dan mampu memvalidasi eksistensi tabel dan policy RLS di Supabase.
- [ ] Terdapat mekanisme jelas (fungsi tersendiri) pada `syncEngine.js` yang mem-push data dari RxDB ke Supabase.
- [ ] Pemanggilan global `window.POS_DB.syncProducts()` berjalan tanpa error.
