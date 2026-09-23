# Phase 17: Penghapusan Sub-Navbar Sekunder Modul Master Barang & HPP

## Objective
Menghapus sub-navbar navigasi sekunder yang redundan pada modul Master Barang & Update HPP untuk menyederhanakan hierarki navigasi dan membersihkan tata letak antarmuka agar serupa dengan standar modul lainnya.

## Tasks

<task type="auto">
  <name>Task 1: Hapus Kontainer Sub-Navbar Sekunder di Master Barang & HPP</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_inventory_update_hpp_kopos/code.html</files>
  <action>
    1. Buka berkas `code.html` pada modul Master Barang.
    2. Cari blok kontainer `<header>` horizontal berlatar belakang putih di bawah navbar utama yang memuat:
       - Teks/Logo: "PRIMKOPPOL NGAWI", "PRIMKOPPOL POS PRO", badge kasir online.
       - Navigasi tombol: "Terminal Kasir", "Pelunasan Piutang & Setoran", "Master Barang & Restock", "Antrean Transaksi", dan tombol hijau "Rekap Shift".
       - Deretan tombol fungsi kasir: F1 Cari, F4 Anggota, F9 Bayar, F12 Simpan.
       - Jam digital "14:32:08 WIB" serta profil "Rian Pratama (Kasir Aktif)".
    3. Hapus seluruh blok elemen container `<header>` sub-navbar tersebut dari file HTML.
    4. Pastikan 4 kartu ringkasan di bawahnya (Total SKU Terdaftar, SKU Stok Kritis, Restock Hari Ini, Valuasi Persediaan) langsung berada tepat di bawah navbar utama dengan padding/margin atas yang rapi dan konsisten (`pt-space-lg`).
  </action>
  <verify>Muat ulang modul Master Barang & HPP di browser. Pastikan bilah sub-menu putih tersebut sudah bersih dan kartu ringkasan metrik langsung tampil di bawah navbar utama tanpa pergeseran layout.</verify>
  <done>Sub-navbar sekunder berhasil dihapus dari modul Master Barang & HPP.</done>
</task>
