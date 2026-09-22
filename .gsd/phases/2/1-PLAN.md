---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Modal Edit Barang, Deaktivasi, & Reaktivasi SKU

## Objective
Mengimplementasikan Modal Edit Barang, fitur Deaktivasi/Non-Aktifkan SKU, serta Modal Daftar Barang Non-Aktif dengan fitur Aktivasi Kembali pada modul Master Barang.

## Context
- .gsd/SPEC.md
- stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_inventory_update_hpp_kopos/code.html

## Tasks

<task type="auto">
  <name>Task 1: Modal Edit SKU & Integrasi Tombol Non-Aktifkan</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_inventory_update_hpp_kopos/code.html</files>
  <action>
    1. Buka file `code.html` pada modul Master Barang & Restock.
    2. Tambahkan markup Modal Dialog dengan ID `modal-edit-sku` (hidden secara default):
       - Header: Judul "Edit Data SKU / Barang Waserda" dan tombol close (✕).
       - Form input terisi otomatis: Barcode/SKU (read-only), Nama Barang, Kategori, Satuan, Harga Beli (HPP), Harga Jual, dan Stok Fisik.
       - Footer Aksi:
         * Tombol bahaya merah di sisi kiri: "Non-Aktifkan Barang Ini" (mengubah status produk menjadi inactive/archived).
         * Tombol aksi di sisi kanan: "Batal" dan "Simpan Perubahan" (Emerald).
    3. Hubungkan setiap tombol [Edit] pada baris tabel barang aktif agar membuka `modal-edit-sku` dan mengisi form dengan data produk RxDB yang bersangkutan.
    4. Implementasikan handler tombol "Simpan Perubahan" untuk memanggil `window.POS_DB.upsertProduct` dengan data terkini dan timestamp `updated_at`.
    5. Implementasikan handler tombol "Non-Aktifkan Barang Ini" (konfirmasi dialog, lalu set field `is_active: false` pada dokumen produk di RxDB Dexie).
  </action>
  <verify>Jalankan pratinjau browser, klik tombol Edit pada salah satu barang, pastikan modal muncul dengan nilai awal yang akurat, ubah harga jual, lalu simpan dan pastikan tabel langsung memperbarui datanya.</verify>
  <done>Tombol edit berfungsi membuka modal modifikasi dan modul deaktivasi barang siap digunakan.</done>
</task>

<task type="auto">
  <name>Task 2: Tombol & Modal Daftar SKU Non-Aktif serta Fitur Reaktivasi</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_inventory_update_hpp_kopos/code.html</files>
  <action>
    1. Pada bagian header tabel (sejajar dengan tombol "Tambah SKU" dan "Ekspor Excel"), tambahkan tombol sekunder baru: "📦 Barang Non-Aktif" dengan indikator badge jumlah barang arsip.
    2. Tambahkan markup Modal Dialog dengan ID `modal-barang-nonaktif` (hidden secara default):
       - Header: Judul "Daftar SKU / Barang Non-Aktif" dan tombol close (✕).
       - Tabel daftar arsip: Barcode, Nama Produk, Kategori, Harga Jual, dan Kolom Aksi.
       - Pada setiap baris, sediakan tombol aksi: "Aktifkan Kembali" (warna Emerald/Biru).
    3. Hubungkan tombol "📦 Barang Non-Aktif" untuk membuka modal dan memuat seluruh produk dari RxDB yang memiliki status `is_active === false`.
    4. Pasang handler pada tombol "Aktifkan Kembali": mengubah nilai `is_active: true` pada dokumen produk di RxDB Dexie, menghapus item dari tabel arsip, dan secara otomatis memunculkannya kembali ke tabel utama Master Data Inventory.
    5. Pastikan query tabel utama hanya menampilkan produk yang berstatus `is_active !== false` (aktif).
  </action>
  <verify>Buka halaman di browser: non-aktifkan satu produk via Modal Edit, verifikasi produk tersebut hilang dari tabel utama, buka modal "Barang Non-Aktif", lalu klik "Aktifkan Kembali" dan pastikan produk kembali muncul di tabel utama.</verify>
  <done>Siklus pengelolaan siklus hidup produk (edit, non-aktifkan, dan reaktivasi) berjalan lengkap secara reaktif di RxDB Dexie.</done>
</task>

## Success Criteria
- [ ] Modal Edit UI berfungsi dengan baik untuk mengupdate field data produk ke RxDB.
- [ ] Tombol non-aktifkan barang di modal Edit merubah attribute `is_active` produk menjadi false, dan produk menghilang dari tabel utama.
- [ ] Tombol "Barang Non-Aktif" (Arsip) membuka modal yang berisi daftar barang di mana `is_active === false`.
- [ ] Tombol "Aktifkan Kembali" merubah barang menjadi aktif kembali (`is_active: true`), meremovenya dari tabel arsip, dan mengembalikannya ke tabel utama.
