# Phase 1: Implementasi RxDB Dexie Storage + Leader Election (MPA)

## Objective
Mengimplementasikan modul database RxDB berbasis Dexie.js Storage Engine dengan Leader Election pada arsitektur MPA Primkoppol Kasir. Hanya tab Leader yang menjalankan sinkronisasi Supabase, menghindari race condition antar-tab.

## Kondisi Awal (Temuan Audit)

File yang sudah ada dan relevan:

| File | Status | Catatan |
|------|--------|---------|
| [`package.json`](file:///c:/jamstack-primkoppol-kasir/package.json) | ✅ `rxdb` ^17.5.0, `rxjs` ^7.8.2, `@supabase/supabase-js` ^2.116.0 sudah terdaftar | Tidak perlu install ulang paket inti |
| [`src/db/index.js`](file:///c:/jamstack-primkoppol-kasir/src/db/index.js) | ⚠️ Sudah menggunakan `getRxStorageDexie()` tapi **belum ada** Leader Election, multi-instance, atau eventReduce | Perlu refactor |
| [`src/db/schema.js`](file:///c:/jamstack-primkoppol-kasir/src/db/schema.js) | ✅ Skema `members` dan `transactions` sudah lengkap | Tidak perlu diubah |

## Tasks

- [x] **Task 1: Verifikasi Paket Inti RxDB, Dexie Storage, dan Leader Election**
  - **Files:** `package.json`
  - **Action:**
    1. Periksa `package.json` — konfirmasi bahwa `rxdb`, `rxjs`, dan `@supabase/supabase-js` sudah terdaftar di dependencies.
    2. Verifikasi bahwa plugin `rxdb/plugins/storage-dexie` dan `rxdb/plugins/leader-election` tersedia sebagai sub-path export dari paket `rxdb` (tidak perlu install terpisah).
    3. Pastikan tidak ada plugin berbayar (seperti `rxdb-premium`, `memory-synced`, atau `shared-worker` storage) yang dimasukkan.
  - **Verify:** Jalankan `npm ls rxdb rxjs @supabase/supabase-js` untuk konfirmasi ketersediaan paket.
  - **Completion:** Dependensi RxDB gratis dan mesin Dexie terdaftar di `package.json`.

- [x] **Task 2: Refactor Database Singleton dengan Leader Election & Multi-Instance**
  - **Files:** [`src/db/index.js`](file:///c:/jamstack-primkoppol-kasir/src/db/index.js)
  - **Action:**
    1. Tambahkan import dan registrasi `RxDBLeaderElectionPlugin` melalui `addRxPlugin()`.
    2. Tambahkan opsi pada `createRxDatabase()`:
       - `name`: `'primkoppol_pos_db'` (ganti dari `primkoppol_pos_local`)
       - `multiInstance`: `true` — agar beberapa tab browser berbagi state via BroadcastChannel
       - `eventReduce`: `true` — untuk optimasi event processing
    3. Bungkus logika sinkronisasi Supabase (`startMemberSync` dan `startTransactionOutbox`) di dalam blok `db.waitForLeadership()` agar **hanya tab Leader** yang menjalankan sync, mencegah race condition dan duplikasi write.
    4. Ekspor `initDatabase()` sebagai singleton agar dapat diakses dari script halaman MPA mana pun via `<script type="module">`.
    5. Pertahankan pola singleton `dbPromise` yang sudah ada — hanya memperkaya konfigurasi, bukan menulis ulang dari nol.
  - **Verify:** Jalankan `npm run build` untuk memastikan build berhasil. Buka dua tab browser ke halaman yang sama dan verifikasi di console bahwa hanya satu tab yang melaporkan "Leader elected — starting sync".
  - **Completion:** Database RxDB Dexie aktif dengan multi-instance support dan manajemen Leader Election berjalan otomatis.

## Catatan Penting

> [!IMPORTANT]
> Plugin `rxdb/plugins/storage-dexie` dan `rxdb/plugins/leader-election` adalah **sub-path export** dari paket `rxdb` — mereka sudah tersedia tanpa instalasi terpisah selama `rxdb` terdaftar di `package.json`.

> [!WARNING]
> Skema di `schema.js` **tidak diubah** dalam phase ini. Perubahan skema memerlukan migrasi RxDB dan harus direncanakan di phase terpisah.
