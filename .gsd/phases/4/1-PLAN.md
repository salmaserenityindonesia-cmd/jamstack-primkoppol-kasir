---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Initial Data Pull/Hydration dari Supabase ke RxDB

## Objective
Menambahkan modul Pull/Hydration data awal dari Supabase ke RxDB lokal saat aplikasi dibuka di domain baru.

## Context
- `src/db/syncEngine.js`
- `src/db/database.js`

## Tasks

<task type="auto">
  <name>Task 1: Buat Modul Pull Initial Data dari Supabase</name>
  <files>src/db/syncEngine.js, src/db/database.js</files>
  <action>
    1. Buka file `src/db/syncEngine.js`.
    2. Buat fungsi async `pullInitialProductsFromSupabase(db)`:
       - Periksa koleksi produk lokal di RxDB. Jika sudah ada data, lewati proses pull.
       - Jika koleksi lokal kosong (count === 0), lakukan query SELECT ke tabel `products` di Supabase.
       - Masukkan (bulkUpsert) seluruh data produk yang didapat dari Supabase ke dalam RxDB lokal Dexie.
    3. Hubungkan fungsi ini ke modul inisialisasi di `src/db/database.js` agar terpanggil otomatis saat database pertama kali terbentuk di browser.
  </action>
  <verify>Jalankan pemeriksaan build `npm run build` untuk memastikan bundle library JS tidak menghasilkan syntax error.</verify>
  <done>RxDB lokal otomatis mengimpor data produk master dari Supabase saat dibuka pada browser/domain baru.</done>
</task>

<task type="auto">
  <name>Task 2: Commit dan Push Pembaruan ke GitHub</name>
  <files>src/db/syncEngine.js, src/db/database.js, STATE.md</files>
  <action>
    1. Catat status implementasi data hydration ke STATE.md.
    2. Lakukan staging dan commit: `git add -A && git commit -m "feat(sync): implement initial pull data from supabase to rxdb"`.
    3. Dorong pembaruan ke GitHub: `git push origin main`.
  </action>
  <verify>Verifikasi commit terakhir dengan `git log -1` dan pastikan pipeline deploy Cloudflare Pages terpicu.</verify>
  <done>Kode terunggah ke repositori GitHub dan Cloudflare Pages memicu build baru.</done>
</task>

## Success Criteria
- [ ] Fungsi `pullInitialProductsFromSupabase` berhasil mengimpor data otomatis jika lokal kosong.
- [ ] Inisialisasi awal pada _client browser_ dapat menarik _source of truth_ dari Supabase.
- [ ] Kode berhasil didorong ke repositori jarak jauh di branch `main`.
