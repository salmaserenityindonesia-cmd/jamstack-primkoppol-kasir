# Phase 1: PWA Supervisor Dashboard (Fase 6)

## Objective
Mengimplementasikan PWA Supervisor Dashboard untuk Pengawas Koperasi Primkoppol dengan kapabilitas Offline-First, delta caching IndexedDB, dan monitoring real-time kredit anggota.

## Tasks

- [x] **Task 1: Setup Web App Manifest & Service Worker untuk PWA Pengawas**
  - **Files:** `public/manifest.json`, `public/sw.js`, `index.html`
  - **Action:**
    1. Buat berkas `public/manifest.json` yang mendefinisikan identitas PWA Pengawas Koperasi Primkoppol:
       - `name`: "Pengawas Primkoppol Waserda"
       - `short_name`: "Koppol Monitor"
       - `display`: "standalone"
       - `start_url`: "/supervisor"
       - `theme_color`: "#15803d"
       - `icons`: tautkan ikon aplikasi berukuran 192x192 dan 512x512.
    2. Buat Service Worker ringan di `public/sw.js` yang meng-cache shell UI dasbor pengawas untuk kapabilitas Offline-First.
    3. Daftarkan Service Worker dan tautkan `manifest.json` pada header modul pengawas.
  - **Verify:** Jalankan pemeriksaan Lighthouse audit atau verifikasi manifest via DevTools/build log untuk memastikan status PWA terpasang valid.
  - **Completion:** Konfigurasi PWA shell siap dipasang di ponsel atau browser pengawas.

- [x] **Task 2: Antarmuka Dashboard Real-Time & IndexedDB Delta Cache**
  - **Files:** `src/supervisor/dashboard.html`, `src/supervisor/supervisorEngine.js`
  - **Action:**
    1. Buat modul tampilan `src/supervisor/dashboard.html` yang memuat kartu metrik ringkasan:
       - Total Transaksi Hari Ini (Tunai & Kredit Bayar Mundur).
       - Panel Peringatan Stok Kritis (Low Stock Alert).
       - Daftar Anggota Terblokir (Over-Limit Status) beserta nilai tunggakannya.
       - Log Audit Trail Transaksi dan Pelunasan Kasir.
    2. Buat `src/supervisor/supervisorEngine.js` yang berlangganan (subscribe) langsung ke database/Supabase dengan teknik caching lokal IndexedDB:
       - Simpan snapshot data di IndexedDB lokal browser pengawas.
       - Hanya render pembaruan delta data baru untuk menghemat bandwidth.
  - **Verify:** Jalankan build lokal dan uji buka halaman dashboard supervisor. Pastikan metrik ringkasan muncul dan data tersimpan di IndexedDB saat koneksi dimatikan (offline test).
  - **Completion:** Dashboard PWA Pengawas aktif dengan fitur delta caching dan monitoring status kredit anggota.
