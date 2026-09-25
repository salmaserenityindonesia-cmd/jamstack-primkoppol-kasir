---
phase: 1
plan: 9
wave: 1
---

# Plan 1.9: Memastikan Tombol Force Sync Selalu Aktif

## Objective
Memastikan tombol Force Sync di modul Sync Health PWA selalu aktif (clickable) kapan saja sesuai protokol GSD, meskipun antrean sinkronisasi bernilai 0.

## Context
- `stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_health_mobile_pwa/code.html`

## Tasks

<task type="auto">
  <name>Task 1: Hapus Penguncian Disabled pada Tombol Sync di code.html</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_health_mobile_pwa/code.html</files>
  <action>
    1. Buka `code.html` pada modul status sinkronisasi.
    2. Cari fungsi pengendali tombol (seperti `updateSyncButtonState` atau event listener tombol).
    3. Hapus penetapan `btn.disabled = true;` dan kelas `cursor-not-allowed` / `opacity-70`.
    4. Ubah logika tombol agar selalu aktif:
       - Meskipun `pendingCount === 0`, tombol tetap diizinkan untuk diklik (`btn.disabled = false`).
       - Tampilkan teks tombol: `Paksa Sinkronkan Ulang (Force Sync)`.
    5. Saat tombol diklik:
       - Ubah teks sementara menjadi `Menyinkronkan...` dan nonaktifkan tombol hanya selama proses fetch/sync berlangsung.
       - Panggil `window.POS_DB.forceSync()`.
       - Kembalikan tombol ke keadaan aktif (`btn.disabled = false`) dan teks semula di dalam blok `finally`.
  </action>
  <verify>Buka halaman Sync Health PWA di browser saat pending antrean 0. Pastikan tombol berwarna hijau terang dan dapat diklik bebas.</verify>
  <done>Tombol Force Sync kini selalu siap digunakan untuk memicu sinkronisasi manual kapan saja.</done>
</task>

## Success Criteria
- [x] Tombol Force Sync tetap aktif dan bisa diklik meskipun antrean pending bernilai 0.
- [x] Fungsi klik (triggerManualSync) memicu pemanggilan manual dengan status *loading* sementara dan mereset statusnya di blok `finally`.
