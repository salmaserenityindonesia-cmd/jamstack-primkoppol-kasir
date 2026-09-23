---
phase: 1
plan: 6
wave: 1
---

# Plan 1.6: Implementasi Metode forceSync di syncEngine

## Objective
Mengimplementasikan metode forceSync di syncEngine dan menghubungkannya ke tombol UI sesuai protokol GSD.

## Context
- `src/db/syncEngine.js`
- `src/index.js`
- `stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_offline_queue_dan_latensi/code.html`

## Tasks

<task type="auto">
  <name>Task 1: Ekspor Metode forceSync di Engine Sinkronisasi</name>
  <files>src/db/syncEngine.js, src/index.js</files>
  <action>
    1. Buka `src/db/syncEngine.js`.
    2. Buat/perbarui fungsi ekspor `async function forceSync()`:
       - Di dalam fungsi ini, panggil langsung logika pengiriman antrean (`pushPendingQueue` atau fungsi ekuivalennya) tanpa harus menunggu siklus interval `setInterval`.
       - Pancarkan *custom event* `window.dispatchEvent(new CustomEvent('sync:success'))` jika berhasil, atau `sync:error` jika gagal.
    3. Buka `src/index.js`, pastikan `forceSync` dipetakan ke objek global: `window.POS_DB.forceSync = forceSync;`.
    4. Jalankan `npm run build` untuk mengompilasi ulang bundle Vite ke folder `dist`.
  </action>
  <verify>Buka konsol browser (F12) dan ketik `typeof window.POS_DB.forceSync`. Pastikan hasilnya adalah "function".</verify>
  <done>Metode sinkronisasi manual telah tertulis di engine dan terekspos ke lingkungan global.</done>
</task>

<task type="auto">
  <name>Task 2: Sambungkan Tombol UI dan Hapus Alert Placeholder</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_offline_queue_dan_latensi/code.html</files>
  <action>
    1. Buka `code.html` pada modul Status Sinkronisasi PWA.
    2. Cari *event listener* `click` pada tombol "Paksa Sinkron" (Force Sync).
    3. Hapus kode `alert('Fungsi sinkronisasi belum siap.');`.
    4. Ganti dengan implementasi pemanggilan asinkron yang aman:
       ```javascript
       try {
           // Opsional: Ubah teks tombol menjadi "Menyinkronkan..."
           if (typeof window.POS_DB?.forceSync === 'function') {
               await window.POS_DB.forceSync();
               // Tampilkan notifikasi toast hijau sukses
           } else {
               throw new Error("Modul sinkronisasi belum dimuat oleh sistem.");
           }
       } catch (error) {
           // Tampilkan notifikasi toast merah dengan pesan error.message
       } finally {
           // Kembalikan teks/ikon tombol ke keadaan semula
       }
       ```
  </action>
  <verify>Muat ulang halaman Status Sinkronisasi, klik tombol Paksa Sinkron, dan pastikan tidak ada lagi popup alert bawaan peramban yang muncul.</verify>
  <done>Antarmuka pengguna terhubung mulus dengan mesin sinkronisasi RxDB di latar belakang.</done>
</task>

## Success Criteria
- [ ] typeof window.POS_DB.forceSync is "function".
- [ ] Tombol Paksa Sinkron memicu proses sinkronisasi tanpa menampikan alert.
