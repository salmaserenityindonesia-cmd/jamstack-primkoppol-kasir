---
phase: 1
plan: 5
wave: 1
---

# Plan 1.5: Pemasangan Diagnostik Transparan dan Force Sync PWA

## Objective
Memasang diagnostik transparan pada `syncEngine` untuk menangkap error secara spesifik saat push ke Supabase, serta mengaktifkan tombol "Force Sync" manual pada antarmuka Sync Health PWA untuk menghindari kegagalan sinkronisasi yang tersembunyi.

## Context
- Saat ini error pada engine sinkronisasi gagal secara diam-diam.
- User/kasir memerlukan cara untuk memaksa sinkronisasi dan melihat hasil error jaringan/database secara langsung di UI, bukan hanya di background.

## Tasks

<task type="auto">
  <name>Task 1: Perkuat Pelaporan Galat di syncEngine.js</name>
  <files>src/db/syncEngine.js</files>
  <action>
    1. Buka `src/db/syncEngine.js`.
    2. Cari fungsi utama yang mengeksekusi push antrean (biasanya bernama `pushPendingQueue` atau `syncToSupabase`).
    3. Modifikasi blok `try...catch` saat melakukan `fetch` atau pemanggilan ke klien Supabase:
       - Pastikan response dari Supabase diperiksa: `if (!response.ok) throw new Error(await response.text());`
       - Pada blok `catch (error)`, tambahkan logging yang agresif: 
         `console.error("[SYNC ENGINE ERROR] Gagal mengirim data:", error.message);`
         `window.dispatchEvent(new CustomEvent('sync:error', { detail: error.message }));`
    4. Pastikan interval sinkronisasi otomatis (polling) disetel dengan benar, misalnya setiap 10 detik.
  </action>
  <verify>Buka Developer Tools (F12) > Console di browser. Jika Supabase menolak data, pesan error merah yang menjelaskan alasan penolakannya (misal: "column does not exist" atau "RLS policy") akan langsung terlihat.</verify>
  <done>Sync engine kini melaporkan galat jaringan atau database secara transparan alih-alih gagal dalam diam.</done>
</task>

<task type="auto">
  <name>Task 2: Aktifkan Tombol "Force Sync" di Modul Sync Health PWA</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_offline_queue_dan_latensi/code.html</files>
  <action>
    1. Buka berkas `code.html` pada modul Sync Health PWA (pastikan path disesuaikan dengan file `status_sinkronisasi_sistem_health_mobile_pwa/code.html` jika path berbeda di source code aktual).
    2. Temukan atau buat tombol "Paksa Sinkronisasi" (Force Sync).
    3. Pasang event listener pada tombol tersebut untuk mem-bypass antrean waktu dan Leader Election:
       - Saat diklik, tombol langsung memanggil fungsi `window.POS_DB.forceSync()` atau men-trigger event lokal yang ditangkap oleh `syncEngine.js`.
       - Tampilkan toast notification: "Sedang mencoba mendorong data ke cloud...".
    4. Tangkap event `sync:error` (dari Task 1) untuk menampilkan pesan gagal di UI, dan event `sync:success` untuk merender ulang angka "Pending Payload Antrean" menjadi 0.
  </action>
  <verify>Buka menu Status Sinkronisasi, klik tombol Paksa Sinkron. Periksa apakah angka antrean berhasil turun menjadi 0, atau muncul popup error yang menunjukkan penyebab gagalnya.</verify>
  <done>Tombol Force Sync berfungsi penuh untuk memicu sinkronisasi manual saat background worker tertidur.</done>
</task>

## Success Criteria
- [ ] Pesan galat dari server tertangkap oleh `syncEngine` dan diteruskan ke event window `sync:error`.
- [ ] Tombol Force Sync (Paksa Sinkron) di UI Status Sinkronisasi terhubung dan merespons klik.
- [ ] Status pending payload antrean terupdate otomatis mengikuti *success* / *error* dispatch event.
