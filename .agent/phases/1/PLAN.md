# Phase 1: Architecture & Dead-Code Audit

## Objective
Melakukan audit kesesuaian arsitektur (Architecture & Dead-Code Audit) guna memastikan tidak ada dependensi atau sisa kode SPA yang menjadi bloatware di arsitektur Multi-Page Application (MPA) Primkoppol Kasir.

## Tasks

- [x] **Task 1: Audit Dependensi package.json dan Struktur Routing**
  - **Files:** `package.json`, `src/`
  - **Action:**
    1. Periksa `package.json` pada dependencies dan devDependencies:
       - Pastikan tidak ada pustaka SPA routing yang tidak terpakai seperti `react-router`, `react-router-dom`, atau state manager berlebihan.
       - Pastikan dependensi yang ada murni mendukung build toolchain (Vite, Tailwind, PostCSS, Autoprefixer) dan layer database (RxDB, Dexie storage, RxDB leader election, @supabase/supabase-js).
    2. Periksa folder `src/` untuk memastikan tidak ada sisa file mock router SPA kosong (seperti App.jsx atau routes.jsx yang merusak layout kemarin) yang tertinggal dan berpotensi membebani proses build.
  - **Verify:** Jalankan pemeriksaan dependensi dan list file src/ untuk memastikan direktori bersih dari sisa modul SPA non-fungsional.
  - **Completion:** Daftar dependensi terverifikasi bersih dari bloatware framework SPA.

- [x] **Task 2: Validasi Konfigurasi Hosting Cloudflare & Entry Point MPA**
  - **Files:** `public/_redirects`, `vite.config.js`, `build.js`
  - **Action:**
    1. Buka `public/_redirects` dan verifikasi bahwa tidak ada aturan SPA catch-all (`/* /index.html 200`) yang menyebabkan infinite loop di Cloudflare Pages.
    2. Periksa konfigurasi `vite.config.js` untuk memastikan setup bundle disiapkan sebagai library/script standalone (atau MPA multi-page input) yang bisa disematkan langsung via script tag ke HTML modul Stitch (Terminal POS & Pelunasan Piutang).
    3. Pastikan tidak ada teknik client-side navigation buatan yang menghalangi lifecycle reload antar-halaman MPA.
  - **Verify:** Jalankan `npm run build` di terminal lokal dan pastikan build berhasil menghasilkan aset statis tanpa error circular redirect atau entrypoint missing.
  - **Completion:** Konfigurasi build dan hosting dipastikan 100% selaras dengan arsitektur MPA statis yang stabil.
