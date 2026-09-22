---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: Komponen Autocomplete Dropdown & Keyboard Navigation pada Terminal POS

## Objective
Membuat komponen Autocomplete Dropdown & Keyboard Navigation pada kolom pencarian Terminal POS.

## Context
- `stitch_primkoppol_ngawi_pos_desktop_interface/pos_terminal_kasir_koperasi/code.html`

## Tasks

<task type="auto">
  <name>Task 1: Markup Dropdown Autocomplete & Wadah Hasil Filter</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/pos_terminal_kasir_koperasi/code.html</files>
  <action>
    1. Buka berkas `code.html` pada Terminal POS.
    2. Pada elemen pembungkus input pencarian (`#pos-barcode-input`), pastikan posisinya relatif (`relative`).
    3. Tambahkan elemen kontainer dropdown mengambang di bawah input dengan ID `pos-search-dropdown`:
       - Berikan kelas Tailwind: `absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50 hidden`.
       - Siapkan template item hasil (`pos-suggestion-item`) yang memuat: Barcode (font mono), Nama Barang, Kategori/Satuan, Harga Jual, dan Ketersediaan Stok.
  </action>
  <verify>Periksa tata letak DOM agar posisi dropdown mengambang di atas elemen keranjang belanja tanpa menggeser layout.</verify>
  <done>Elemen dropdown autocomplete terpasang di bawah kotak input pencarian.</done>
</task>

<task type="auto">
  <name>Task 2: Integrasi Live Fuzzy Filtering RxDB & Navigasi Arrow Keyboard</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/pos_terminal_kasir_koperasi/code.html</files>
  <action>
    1. Buat state lokal `selectedIndex = -1` dan `filteredSuggestions = []`.
    2. Pasang event listener `input` pada `#pos-barcode-input`:
       - Ambil nilai ketikan pengguna secara realtime (misal: "111").
       - Jika panjang karakter >= 1, lakukan kueri parsial/substring terhadap koleksi `products` RxDB yang aktif (`is_active !== false`):
         Cocokkan apakah `barcode.toLowerCase().includes(query)` ATAU `name.toLowerCase().includes(query)`.
       - Render daftar saran ke `#pos-search-dropdown` (tampilkan hingga 8 item paling relevan) dan hilangkan kelas `hidden`.
       - Jika input kosong atau tidak ada produk yang cocok, sembunyikan dropdown.
    3. Pasang event listener `keydown` pada `#pos-barcode-input` untuk kontrol keyboard:
       - `ArrowDown`: naikkan `selectedIndex`, beri highlight visual (misal latar `bg-emerald-50 text-emerald-800`), dan scroll item ke viewport.
       - `ArrowUp`: turunkan `selectedIndex`, update highlight visual.
       - `Enter`: 
         * Jika `selectedIndex >= 0` dan dropdown terbuka, pilih item yang sedang disorot, masukkan ke keranjang belanja via `addItemToCart()`, bersihkan input, dan tutup dropdown.
         * Jika tidak ada yang disorot, cari kecocokan persis (*exact match*) dari string yang diketik.
       - `Escape`: tutup dropdown dan kembalikan fokus.
    4. Pasang event click listener pada masing-masing item dropdown agar pengguna juga bisa memilih langsung menggunakan kursor mouse.
  </action>
  <verify>Ketik "111" di kotak pencarian, pastikan saran produk ("1111", "1112", "1111 /3") muncul di dropdown, tekan panah bawah untuk memilih salah satu, tekan Enter, dan pastikan produk tersebut langsung masuk ke keranjang belanja.</verify>
  <done>Pencarian fleksibel dengan autocompletion dan navigasi keyboard panah atas/bawah aktif sepenuhnya.</done>
</task>

## Success Criteria
- [ ] Dropdown UI tertampil elegan di bawah _search bar_.
- [ ] Pencarian parsial (_fuzzy search_) nama produk atau SKU merespons seketika memanfaatkan array filter atau Regex di memori setelah menarik dari RxDB.
- [ ] Kasir dapat sepenuhnya menggunakan panah (*Up/Down*) dan *Enter* tanpa harus menggunakan *mouse* / menyentuh layar.
