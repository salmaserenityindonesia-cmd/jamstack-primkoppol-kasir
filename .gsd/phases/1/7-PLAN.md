---
phase: 1
plan: 7
wave: 1
---

# Plan 1.7: Perbaikan Bug Infinite Loading pada forceSync

## Objective
Memperbaiki bug *infinite loading* pada fungsi `forceSync` ketika antrean kosong dan menambahkan pengaman *timeout* saat memanggil API Supabase.

## Context
- `src/db/syncEngine.js`
- `src/index.js`
- `stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_offline_queue_dan_latensi/code.html`

## Tasks

<task type="auto">
  <name>Task 1: Perbaiki Penanganan Antrean Kosong & Tambahkan Timeout di syncEngine</name>
  <files>src/db/syncEngine.js, src/index.js</files>
  <action>
    1. Buka `src/db/syncEngine.js`.
    2. Pada fungsi `forceSync()`, evaluasi pengecekan antrean (pending items):
       - Jika jumlah antrean === 0, pastikan fungsi memancarkan `window.dispatchEvent(new CustomEvent('sync:success'))` dan langsung mengeksekusi `return true;` agar tidak menggantung.
    3. Bungkus pemanggilan *fetch* ke Supabase dengan pengaman `Promise.race()` (misal *timeout* 10 detik). Jika Supabase lambat merespons, lemparkan error *timeout* agar fungsi bisa masuk ke blok `catch` dan tombol UI bisa dihentikan.
    4. Jalankan `npm run build` untuk mengompilasi ulang bundle `dist/assets/index.js`.
  </action>
  <verify>Pastikan pemanggilan `window.POS_DB.forceSync()` segera mengembalikan nilai (resolve) ketika antrean di IndexedDB kosong.</verify>
  <done>Mesin sinkronisasi menangani kondisi antrean 0 dengan bersih tanpa menyebabkan deadlock.</done>
</task>

<task type="auto">
  <name>Task 2: Paksa Reset State Tombol di UI pada Blok Finally</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_offline_queue_dan_latensi/code.html</files>
  <action>
    1. Buka `code.html` pada modul Status Sinkronisasi PWA.
    2. Cari *event listener* `click` pada tombol "Paksa Sinkron" (Force Sync).
    3. Simpan referensi tombol ke dalam variabel di awal blok (misal: `const btn = event.currentTarget;`).
    4. Pastikan di dalam blok `finally { ... }` terdapat logika paksa untuk mereset UI:
       `btn.disabled = false;`
       `btn.classList.remove('opacity-50', 'cursor-not-allowed');`
       `btn.innerHTML = 'Paksa Sinkronisasi (Force Sync)';` // Sesuaikan dengan ikon/teks default sebelumnya.
    5. Tambahkan feedback visual (Toast) di dalam blok `try` jika antrean 0: "Sistem sudah tersinkronisasi (0 antrean)".
  </action>
  <verify>Klik tombol Paksa Sinkron saat indikator menunjukkan 0 entri tertahan. Animasi "Menyinkronkan..." hanya akan muncul kurang dari 1 detik lalu tombol kembali normal.</verify>
  <done>Tombol sinkronisasi UI terlindungi dari kondisi loading abadi dan memberikan umpan balik visual yang responsif.</done>
</task>

## Success Criteria
- [ ] Tombol Force Sync mereset tampilannya secara instan ketika dipanggil dalam keadaan sinkron (antrean 0).
- [ ] API Timeout memicu pelemparan Error dan di-handle oleh blok `catch` secara aman.
