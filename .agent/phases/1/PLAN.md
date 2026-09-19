# Phase 1: Replikasi Supabase dengan Proteksi Leader Election

## Objective
Mengimplementasikan modul replikasi Supabase dengan proteksi Leader Election pada arsitektur MPA Primkoppol Kasir sesuai protokol GSD.

## Tasks

- [x] **Task 1: Inisialisasi Supabase Client & FIFO Sync Worker**
  - **Files:** `src/db/syncEngine.js`, `src/db/database.js`
  - **Action:**
    1. Buat file `src/db/syncEngine.js`.
    2. Inisialisasi Supabase Client menggunakan kredensial publik dari environment variables atau config (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`).
    3. Buat fungsi async `syncPendingTransactions()`:
       - Query koleksi `transactions` di RxDB lokal dengan kondisi `sync_status: 'PENDING'` terurut berdasarkan timestamp (FIFO).
       - Untuk setiap transaksi, kirim payload ke tabel `transactions` di Supabase.
       - Jika insert Supabase berhasil, perbarui status dokumen di RxDB lokal menjadi `sync_status: 'SENT'`.
       - Tangani kondisi offline (network error) secara graceful tanpa melempar fatal exception ke UI.
    4. Buat fungsi `startPeriodicSync(intervalMs = 10000)` yang menjalankan `syncPendingTransactions` berkala dan mendengarkan event online browser (`window.addEventListener('online')`).
  - **Verify:** Validasi sintaks `syncEngine.js` via Node CLI atau build check untuk memastikan ekspor modul berjalan bersih.
  - **Completion:** Fungsi sync worker FIFO ke Supabase berhasil dibuat dan siap diaktifkan.

- [x] **Task 2: Kaitkan Sync Worker Eksklusif ke RxDB Leader Election**
  - **Files:** `src/db/database.js`, `src/index.js`
  - **Action:**
    1. Buka `src/db/database.js`.
    2. Impor `startPeriodicSync` dan `syncPendingTransactions` dari `./syncEngine.js`.
    3. Di dalam inisialisasi database, manfaatkan API leader election RxDB:
       ```javascript
       db.waitForLeadership().then(() => {
         console.log('[RxDB] Tab ini terpilih sebagai LEADER. Memulai worker sinkronisasi Supabase...');
         startPeriodicSync();
       });
       ```
    4. Pada `src/index.js`, ekspos helper pemicu manual `window.POS_DB.triggerSync = syncPendingTransactions;` agar kasir atau aksi checkout dapat langsung memicu sinkronisasi tanpa jeda interval.
  - **Verify:** Jalankan `npm run build` di terminal lokal. Pastikan aset build terkompilasi ke `dist/` tanpa error modul Supabase atau RxDB.
  - **Completion:** Worker sinkronisasi Supabase terkunci khusus pada tab Leader, mencegah duplikasi koneksi dan menjamin data offline terkirim aman secara FIFO.
