# Phase 1: PWA Supervisor Dashboard (Fase 6)

## Objective
Mengimplementasikan PWA Supervisor Dashboard sesuai spesifikasi PRD Primkoppol dengan protokol GSD.

## Tasks

- [x] **Task 1: Setup Shell PWA (Manifest & Service Worker Caching)**
  - **Files:** `public/manifest.webmanifest`, `public/sw.js`, `public/supervisor.html`
  - **Action:**
    1. Buat berkas `public/manifest.webmanifest` dengan konfigurasi PWA:
       - name: "Pengawas Primkoppol Waserda"
       - short_name: "Koppol Monitor"
       - start_url: "/supervisor.html"
       - display: "standalone"
       - theme_color: "#15803d"
       - background_color: "#f8fafc"
    2. Buat Service Worker di `public/sw.js` dengan strategi caching shell UI (Stale-While-Revalidate) agar dasbor dapat dibuka saat minim sinyal.
    3. Buat file tampilan `public/supervisor.html` berbasis Tailwind yang memuat navigasi ringkasan toko dan pendaftaran Service Worker.
  - **Verify:** Jalankan pemeriksaan lokal (`npm run build`) dan verifikasi berkas terdaftar pada folder build.
  - **Completion:** Shell PWA mandiri untuk pengawas siap dijalankan secara offline-first.

- [x] **Task 2: Engine Supervisor & Delta Caching IndexedDB**
  - **Files:** `src/supervisor/supervisorEngine.js`, `public/supervisor.html`
  - **Action:**
    1. Buat `src/supervisor/supervisorEngine.js` yang memanfaatkan Dexie/IndexedDB lokal khusus pengawas (`supervisor_cache_db`):
       - Simpan cache metrik transaksi, inventori stok, dan daftar anggota.
       - Buat fungsi sinkronisasi delta ke Supabase/RxDB untuk mengunduh pembaruan terbaru.
    2. Tampilkan metrik ringkasan pada `public/supervisor.html`:
       - Ringkasan Penjualan Harian (Tunai & Kredit).
       - Indikator Peringatan Stok Kritis (Low Stock Alert).
       - Daftar Anggota Over-Limit beserta tunggakannya.
       - Log Audit Trail pelunasan kasir.
  - **Verify:** Buka `/supervisor.html` di server lokal, pastikan metrik kartu terbaca dan cache IndexedDB terbentuk di DevTools.
  - **Completion:** Dashboard pengawas aktif dengan kemampuan delta caching dan monitoring status kredit anggota.
