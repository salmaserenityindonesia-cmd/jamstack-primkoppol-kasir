---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Integrasi Pencarian Barcode & Keranjang Belanja Dinamis di Terminal POS

## Objective
Mengaktifkan pencarian barcode/SKU dan integrasi keranjang belanja reaktif menggunakan RxDB pada modul Terminal POS.

## Context
- `stitch_primkoppol_ngawi_pos_desktop_interface/pos_terminal_kasir_koperasi/code.html`
- `src/index.js`

## Tasks

<task type="auto">
  <name>Task 1: Handler Pencarian Barcode & Scanner Input di Terminal POS</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/pos_terminal_kasir_koperasi/code.html, src/index.js</files>
  <action>
    1. Pastikan tag `<script type="module" src="/assets/index.js"></script>` terpasang di `<head>` modul Terminal POS agar `window.POS_DB` tersedia.
    2. Identifikasi elemen input pencarian: `Scan barcode / ketik SKU (Contoh: 899100122222, 899234567890)...` dan berikan ID `pos-barcode-input`.
    3. Buat listener event `keydown` pada `#pos-barcode-input`:
       - Saat kasir menekan tombol `Enter` (atau scanner barcode menembakkan kode EAN/SKU):
         * Ambil nilai barcode/SKU yang diketik dan bersihkan spasi (trim).
         * Cari produk secara instan di RxDB lokal: `const product = await db.products.findOne({ selector: { barcode: query } }).exec();` (atau cari berdasarkan SKU jika barcode tidak cocok).
         * Jika produk ditemukan dan berstatus aktif (`is_active !== false`): panggil fungsi `addItemToCart(product)` dan bersihkan input text.
         * Jika tidak ditemukan atau stok kosong: tampilkan notifikasi toast atau alert "Produk tidak ditemukan atau tidak aktif!".
    4. Pasang shortcut keyboard tombol `F1` untuk otomatis memfokuskan kursor ke kotak `#pos-barcode-input`.
  </action>
  <verify>Buka Terminal POS di browser, ketik salah satu barcode riil yang ada di database RxDB (misal barcode Beras atau Minyak), tekan Enter, dan pastikan item tersebut berhasil ditemukan tanpa error.</verify>
  <done>Kotak scanner barcode dan pencarian SKU aktif mendeteksi input kasir.</done>
</task>

<task type="auto">
  <name>Task 2: Integrasi Keranjang Belanja Dinamis & Hitung Total Otomatis</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/pos_terminal_kasir_koperasi/code.html</files>
  <action>
    1. Kosongkan baris item statis (Beras Premium & Minyak Goreng dummy) di kontainer daftar belanja keranjang kasir.
    2. Buat state keranjang lokal (`cartItems = []`) dan fungsi `renderCart()`:
       - Render setiap item belanja secara dinamis: Nama Produk, Barcode, Kategori, tombol `- / +` jumlah qty, harga satuan, dan subtotal.
       - Sediakan tombol hapus item (ikon tong sampah) per baris.
    3. Perbarui elemen ringkasan secara reaktif:
       - "Total Tagihan Belanja" (format Rupiah dinamis).
       - Badge jumlah item di header "Keranjang Belanja (X item)".
    4. Hubungkan tombol cepat (Quick Buttons: Indomie, Gula, Kopi, Teh Sosro) di bawah search bar agar saat diklik langsung memicu pencarian barcode/nama produk ke RxDB dan masuk ke keranjang belanja.
  </action>
  <verify>Scan/masukkan beberapa barang berbeda, uji penambahan kuantitas dengan tombol (+/-), dan pastikan total tagihan belanja terhitung akurat sesuai harga riil di RxDB.</verify>
  <done>Keranjang belanja Terminal POS berfungsi penuh secara dinamis menggunakan data katalog RxDB.</done>
</task>

## Success Criteria
- [ ] Modul POS Terminal terhubung ke RxDB.
- [ ] Tombol pintas F1 otomatis memfokuskan pencarian barcode.
- [ ] Pencarian dari scanner barcode dengan diakhiri enter otomatis menambahkan produk ke keranjang.
- [ ] State keranjang di-render dinamis, menggantikan *hard-coded dummy data*.
- [ ] Total tagihan dan jumlah barang diperbarui seketika dan akurat.
