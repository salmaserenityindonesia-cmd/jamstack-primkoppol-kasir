# Phase 15: Penghapusan Sub-Navbar Sekunder Modul Matriks Tunggakan

## Objective
Menghapus sub-navbar navigasi sekunder yang redundan pada modul Matriks Tunggakan & Keanggotaan agar antarmuka menjadi lebih bersih dan fokus pada kartu KPI serta tabel audit, sesuai dengan struktur layout baru yang tidak lagi membutuhkan sub-header tersebut.

## Tasks

<task type="auto">
  <name>Task 1: Hapus Sub-Navbar Navigasi Sekunder di Matriks Tunggakan</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_kopos/code.html</files>
  <action>
    1. Buka berkas `code.html` pada modul Matriks Tunggakan.
    2. Temukan blok kontainer `<div>` sub-header horizontal yang memuat:
       - Teks/Logo: "PRIMKOPPOL NGAWI Logo", "Koperasi Polres Ngawi POS Suite"
       - Menu sekunder: "Kasir Register", "Keanggotaan & Tunggakan", "Riwayat Transaksi", "Sinkronisasi Online System"
       - Indikator waktu: "14:32:08 WIB"
       - Breadcrumb path: "PRIMKOPPOL NGAWI / Modul Koperasi / Keanggotaan & Tunggakan" dan badge "POS Engine v4.8 • Real-time Sync Active"
    3. Hapus seluruh elemen kontainer sub-navbar tersebut dari DOM.
    4. Pastikan area judul utama "Matriks Tunggakan & Keanggotaan (AUDIT 2026)" beserta kartu ringkasan KPI langsung berada di bawah navbar utama dengan margin dan padding atas yang proporsional.
  </action>
  <verify>Muat ulang halaman Matriks Anggota di browser dan pastikan sub-navbar putih tersebut hilang, menyisakan tata letak yang bersih langsung ke kartu KPI dan tabel audit.</verify>
  <done>Sub-navbar sekunder berhasil dibersihkan dari modul Matriks Tunggakan.</done>
</task>
