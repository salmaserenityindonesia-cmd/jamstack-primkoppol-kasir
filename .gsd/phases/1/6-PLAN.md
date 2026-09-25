---
phase: 1
plan: 6
wave: 1
---

# Plan 1.6: Sentralisasi State Rendering Tombol Sinkronisasi

## Objective
Memperbaiki DOM race condition pada tombol Force Sync agar state UI sinkron dengan jumlah antrean sesuai protokol GSD.

## Context
- `stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_health_mobile_pwa/code.html`

## Tasks

<task type="auto">
  <name>Task 1: Sentralisasi State Rendering Tombol Sinkronisasi</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_health_mobile_pwa/code.html</files>
  <action>
    1. Buka berkas `code.html` pada modul Status Sinkronisasi PWA.
    2. Cari blok *event listener* tombol "Paksa Sinkron". Hapus baris pembaruan teks statis (misalnya `text.textContent = 'Paksa Sinkronkan Ulang (Force Sync)';`) dari dalam blok `finally` agar tidak menimpa pembaruan otomatis dari mesin latar belakang.
    3. Buat satu fungsi pengendali UI tunggal, misalnya `updateSyncButtonState(pendingCount)`:
       - Jika `pendingCount === 0`:
         * Set teks tombol: `Sinkronisasi Selesai (0 pending)`.
         * Nonaktifkan tombol agar tidak diklik berulang: `btn.disabled = true;` serta berikan kelas visual pasif (misal: `opacity-70 cursor-not-allowed`).
       - Jika `pendingCount > 0`:
         * Set teks tombol: `Paksa Sinkronisasi (Force Sync)`.
         * Aktifkan kembali tombol: `btn.disabled = false;` dan hapus kelas pasif.
    4. Panggil fungsi `updateSyncButtonState(count)` ini HANYA di dalam *subscriber* RxDB (yang mendengarkan perubahan koleksi antrean) dan setelah event `sync:success` mengembalikan nilai antrean terbaru.
  </action>
  <verify>Muat ulang halaman Status Sinkronisasi. Saat antrean menunjukkan angka 0, pastikan tombol stabil bertuliskan "Sinkronisasi Selesai (0 pending)", dalam kondisi redup/disabled, dan sama sekali tidak berkedip.</verify>
  <done>Race condition pada manipulasi DOM tombol telah dieliminasi dan UI merespons state antrean secara deterministik.</done>
</task>

## Success Criteria
- [x] Tombol Force Sync stabil menunjukkan state yang benar tanpa berkedip.
- [x] Tombol nonaktif jika tidak ada antrean (0 pending).
