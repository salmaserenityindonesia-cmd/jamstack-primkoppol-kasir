# Phase 1: AI Audit Layer On-Demand (Fase 7)

## Objective
Mengimplementasikan layanan AI Audit Anomali Shift menggunakan Google AI Studio / Gemini API pada Supervisor Dashboard sesuai protokol GSD.

## Tasks

- [x] **Task 1: Service Audit Anomali Shift Berbasis Gemini API**
  - **Files:** `src/supervisor/aiAuditEngine.js`, `.env.example`
  - **Action:**
    1. Buat file `src/supervisor/aiAuditEngine.js`.
    2. Siapkan fungsi `analyzeShiftTransactions(transactionsSummary)` yang memanggil endpoint Gemini (Google AI Studio) menggunakan `VITE_GEMINI_API_KEY`:
       - Format prompt ringkas terstruktur untuk mendeteksi anomali: diskon manual yang tidak wajar, pola pembatalan/void berulang pada jam sibuk, atau potensi manipulasi saldo limit piutang.
       - Terapkan skema prompt padat token (token-efficient) agar pemanggilan shift hanya mengonsumsi payload JSON agregat, bukan log per baris mentah.
    3. Tambahkan dokumentasi variabel `VITE_GEMINI_API_KEY` pada `.env.example`.
  - **Verify:** Jalankan uji fungsi isolasi di Node CLI untuk memastikan payload prompt terformat valid dan parser respons JSON siap digunakan.
  - **Completion:** Service AI audit anomali siap dipanggil secara on-demand.

- [x] **Task 2: Integrasi Tombol Analisis Shift di UI Supervisor**
  - **Files:** `public/supervisor.html`, `src/supervisor/supervisorEngine.js`
  - **Action:**
    1. Buka antarmuka dasbor pengawas dan tambahkan komponen tombol "Analisis Ringkasan Shift (AI)" di samping kartu metrik harian.
    2. Hubungkan tombol tersebut ke `aiAuditEngine.js` dengan indikator pemrosesan (loading spinner).
    3. Tampilkan kartu hasil audit berisi poin temuan risiko: status anomali (Aman/Waspada), ringkasan perilaku kasir, dan rekomendasi tindak lanjut bagi pengawas.
  - **Verify:** Jalankan build Vite dan pastikan tidak ada error kompilasi pada modul supervisor.
  - **Completion:** Panel audit AI shift selesai terintegrasi di dashboard pengawas dan siap diuji.
