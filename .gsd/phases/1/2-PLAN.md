---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Perbarui Label Tab Filter Inventaris dan Logika RxDB

## Objective
Memperbarui label tab filter inventaris dan menghubungkan logikanya ke RxDB sesuai protokol GSD.

## Context
- .gsd/SPEC.md
- stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_inventory_update_hpp_kopos/code.html

## Tasks

<task type="auto">
  <name>Task 1: Perbarui Teks Label Tombol Filter di HTML Master Barang</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_inventory_update_hpp_kopos/code.html</files>
  <action>
    1. Buka file `code.html` pada modul Master Barang & Restock.
    2. Cari baris container tombol filter inventaris (elemen di samping search bar dan judul Master Data Inventory).
    3. Ubah teks keempat tombol filter tersebut:
       - Tombol 1: tetap "Semua"
       - Tombol 2: tetap "Stok Kritis"
       - Tombol 3: ubah "Sembako" menjadi "Baru Ditambahkan"
       - Tombol 4: ubah "Pangan Pokok" menjadi "Baru di Update"
    4. Berikan atribut penanda (seperti `data-filter="all"`, `data-filter="critical"`, `data-filter="newly_added"`, `data-filter="recently_updated"`) pada masing-masing tombol untuk memudahkan penanganan event JavaScript.
  </action>
  <verify>Buka file HTML atau jalankan preview untuk memastikan teks tombol sudah berubah menjadi "Semua", "Stok Kritis", "Baru Ditambahkan", dan "Baru di Update" dengan styling Tailwind yang tetap presisi.</verify>
  <done>Label tombol filter kategori pada tabel master barang berhasil diperbarui.</done>
</task>

<task type="auto">
  <name>Task 2: Implementasikan Logika Filter Reaktif pada Subscriber RxDB</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_inventory_update_hpp_kopos/code.html</files>
  <action>
    1. Buka script listener tabel master barang di file tersebut.
    2. Pasang event click listener pada masing-masing tombol filter:
       - "Semua": menampilkan seluruh daftar produk tanpa filter.
       - "Stok Kritis": memfilter produk dengan nilai `stock <= 5`.
       - "Baru Ditambahkan": mengurutkan produk berdasarkan timestamp pembuatan terbaru.
       - "Baru di Update": mengurutkan produk berdasarkan timestamp update terbaru.
    3. Perbarui kelas CSS tombol aktif (misalnya latar belakang abu-abu terang / border emerald) saat salah satu filter dipilih.
  </action>
  <verify>Uji klik setiap tombol filter di browser dan pastikan tabel memfilter baris produk RxDB secara dinamis tanpa reload halaman.</verify>
  <done>Filter tabel inventaris berfungsi penuh secara interaktif.</done>
</task>

## Success Criteria
- [ ] Label tombol berubah menjadi "Semua", "Stok Kritis", "Baru Ditambahkan", "Baru di Update".
- [ ] Tombol memiliki attribute `data-filter` untuk JS hooks.
- [ ] JS memiliki state filter aktif (aktifkan styling spesifik saat terpilih).
- [ ] Data RxDB disaring (filtered & sorted) secara reaktif sesuai tombol yang diklik.
