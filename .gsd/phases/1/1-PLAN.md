---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Modal Form Tambah SKU Baru dan Integrasi RxDB

## Objective
Membuat Modal Form Tambah SKU Baru dan menghubungkannya ke RxDB pada modul Master Barang.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_pencetakan_kiosk/code.html
- src/index.js

## Tasks

<task type="auto">
  <name>Task 1: Markup Modal Dialog Tambah SKU Baru</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_pencetakan_kiosk/code.html</files>
  <action>
    1. Buka file `code.html` pada modul Master Barang.
    2. Tambahkan markup Modal Dialog tersembunyi (hidden/fixed backdrop Tailwind) dengan ID `modal-tambah-sku`:
       - Header: Judul "Tambah SKU / Barang Baru Waserda" dan tombol close (✕).
       - Field Form:
         * Barcode / SKU (Text input)
         * Nama Produk Lengkap (Text input)
         * Kategori (Dropdown: Sembako, Pangan Pokok, Bahan Kue, Minuman, Kebersihan, Umum)
         * Satuan (Dropdown: Pcs, Karton, Sak, Bks, Botol)
         * Harga Beli Pokok / HPP (Number input)
         * Harga Jual Kasir (Number input)
         * Stok Awal Fisik (Number input)
       - Footer: Tombol "Batal" dan tombol aksi utama "Simpan ke Database" (warna Emerald `#059669`).
  </action>
  <verify>Periksa struktur HTML modal agar tidak merusak tata letak kontainer tabel utama.</verify>
  <done>Elemen antarmuka formulir modal tambah barang terpasang rapi sesuai tema desain Primkoppol.</done>
</task>

<task type="auto">
  <name>Task 2: Integrasikan Handler Tombol Tambah SKU ke RxDB</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_pencetakan_kiosk/code.html, src/index.js</files>
  <action>
    1. Hapus fungsi pembuatan data acak (dummy generator `Produk Baru 325`) yang menempel pada tombol "Tambah SKU".
    2. Hubungkan tombol "Tambah SKU" (outline biru) untuk membuka `modal-tambah-sku` (menghapus kelas `hidden`).
    3. Pasang event handler pada tombol "Simpan ke Database":
       - Validasi bahwa input Barcode, Nama Produk, dan Harga tidak boleh kosong.
       - Buat payload produk: { barcode, sku, name, category, unit, cost_price: Number, price: Number, stock: Number }.
       - Panggil `window.POS_DB.upsertProduct(payload)` untuk menyimpan produk langsung ke RxDB Dexie.
       - Reset formulir, tutup modal, dan biarkan subscriber RxDB memperbarui tabel daftar barang secara reaktif.
  </action>
  <verify>Buka halaman di browser: klik tombol "Tambah SKU", pastikan modal muncul, isi data barang riil, lalu tekan Simpan. Pastikan barang baru muncul di tabel tanpa perlu refresh halaman.</verify>
  <done>Fitur penambahan barang baru berfungsi normal menggunakan data input riil pengguna.</done>
</task>

## Success Criteria
- [ ] Modal dialog UI terpasang tanpa merusak layout tabel utama.
- [ ] Fitur tambah barang menyimpan data riil ke RxDB.
- [ ] Tabel list barang otomatis terupdate (reaktif) setelah barang ditambahkan.
