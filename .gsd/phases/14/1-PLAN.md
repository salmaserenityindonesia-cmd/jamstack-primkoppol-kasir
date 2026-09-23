# Phase 14: Penghapusan Sub-Navbar Sekunder Modul Tutup Shift

## Objective
Menghapus sub-navbar sekunder yang redundan pada modul Tutup Shift & Rekonsiliasi Kasir untuk menghilangkan redundansi visual antarmuka dan menyesuaikan padding agar konten utama tetap rapi.

## Tasks

<task type="auto">
  <name>Task 1: Hapus Sub-Navbar Navigasi Sekunder di Halaman Tutup Shift</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/tutup_shift_rekonsiliasi_kasir_kopos/code.html</files>
  <action>
    1. Buka berkas `code.html` pada modul Tutup Shift.
    2. Identifikasi kontainer sub-header putih horizontal (elemen di bawah navbar utama yang memuat logo kecil, teks "PRIMKOPPOL NGAWI POS PRO", tombol tab "Terminal Kasir", "Antrean Transaksi", "Pelunasan Piutang & Setoran", "Master Barang & Restock", tombol hijau "Rekap Shift", shortcut F1-F12, waktu WIB, dan profil kasir).
    3. Hapus seluruh blok elemen container `<div ...>` sub-navbar sekunder tersebut.
    4. Pastikan konten utama di bawahnya (badge status `Akhir Shift Kasir • Shift #01`, judul `Tutup Shift & Rekonsiliasi Kasir`, panel Arus Kas, dan Perhitungan Fisik Aktual) bergeser naik secara rapi dengan padding atas (`pt-*` / `mt-*`) yang konsisten.
  </action>
  <verify>Buka halaman Tutup Shift di browser, verifikasi bilah sub menu duplikat tersebut sudah hilang dan antarmuka langsung menyajikan panel rekonsiliasi kasir secara bersih di bawah navbar utama.</verify>
  <done>Sub-navbar sekunder berhasil dibersihkan, mengeliminasi redundansi visual antarmuka.</done>
</task>
