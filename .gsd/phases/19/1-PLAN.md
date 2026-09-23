# Phase 19: Penghapusan Sub-Navbar Sekunder Modul Sync Health PWA

## Objective
Menghapus sub-navbar sekunder yang redundan pada modul Sync Health PWA agar desain antarmuka menjadi lebih konsisten, langsung menampilkan metrik dan status konektivitas tanpa redundansi identitas header.

## Tasks

<task type="auto">
  <name>Task 1: Hapus Kontainer Sub-Navbar Sekunder di Modul Sync Health PWA</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_health_mobile_pwa/code.html</files>
  <action>
    1. Buka berkas `code.html` pada modul Status Sinkronisasi / Sync Health (`status_sinkronisasi_sistem_health_mobile_pwa`).
    2. Cari blok kontainer `<div>` (atau `<header>`) horizontal berlatar belakang putih di bawah navbar utama yang memuat:
       - Teks/Logo: "PRIMKOPPOL NGAWI", "KOPERASI POLRES NGAWI Sinkronisasi"
       - Ikon bel notifikasi dan avatar profil kasir/pengawas
       - Jalur teks: "PRIMKOPPOL NGAWI • OUTLET WASERDA PRIMKOPPOL NGAWI"
       - Badge status pill hijau "Cloud: Connected"
    3. Hapus seluruh blok elemen kontainer sub-navbar tersebut dari file HTML.
    4. Pastikan baris judul halaman ("Status Sinkronisasi Sistem" beserta badge "v2.4 PWA") dan hero banner hijau ("RXDB ENGINE ONLINE / Koneksi Toko: ONLINE & STABIL") langsung berada tepat di bawah navbar utama dengan padding/margin atas yang rapi (`pt-space-lg`).
  </action>
  <verify>Muat ulang modul Sync Health PWA di browser, pastikan bilah sub-menu putih tersebut sudah bersih dan kartu monitor koneksi langsung tampil di bawah navbar utama tanpa pergeseran layout.</verify>
  <done>Sub-navbar sekunder berhasil dibersihkan dari modul Sync Health PWA.</done>
</task>
