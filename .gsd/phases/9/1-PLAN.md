---
phase: 9
plan: 1
wave: 1
---

# Plan 9.1: Perbaikan Pagination dan Counter Penunggak Riil

## Objective
Memperbaiki pagination dan counter penunggak pada modul Matriks Keanggotaan agar membaca data riil RxDB secara dinamis.

## Context
- `stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_kopos/code.html`

## Tasks

<task type="auto">
  <name>Task 1: Logika Pagination Dinamis & Perhitungan Tunggakan Riil</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_kopos/code.html</files>
  <action>
    1. Buka file `code.html` pada modul Matriks Tunggakan.
    2. Identifikasi kontainer pagination footer di bawah tabel matriks:
       - Berikan ID `matrix-pagination-info` pada label teks info kuota.
       - Berikan ID `matrix-pagination-controls` pada deretan tombol navigasi halaman.
    3. Buat state pagination lokal di dalam script:
       `let currentPage = 1;`
       `const pageSize = 10;`
    4. Buat fungsi helper `calculateArrears(member)`:
       - Anggota dihitung menunggak jika `member.current_debt > 0` atau `(member.unpaid_months || 0) > 0`.
    5. Perbarui fungsi subscriber data members dari RxDB:
       - Filter anggota sesuai kriteria tab aktif (Semua / Menunggak / Aktif).
       - Hitung `totalRecords = filteredMembers.length`.
       - Hitung `totalPages = Math.ceil(totalRecords / pageSize) || 1`.
       - Ambil slice data untuk halaman aktif: `const pagedData = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize)`.
       - Render baris tabel matriks hanya untuk `pagedData`.
  </action>
  <verify>Pastikan kalkulasi totalPages dan slicing data tidak menghasilkan pembagian nol saat data kosong.</verify>
  <done>Logika pagination lokal terhubung langsung dengan array data anggota RxDB.</done>
</task>

<task type="auto">
  <name>Task 2: Render UI Footer Pagination Dinamis</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_kopos/code.html</files>
  <action>
    1. Perbarui teks `#matrix-pagination-info`:
       - Jika `totalRecords === 0`:
         Tampilkan teks: "Menampilkan 0 dari 0 Anggota yang menunggak" (atau sesuai filter aktif).
       - Jika `totalRecords > 0`:
         Hitung `start = (currentPage - 1) * pageSize + 1` dan `end = Math.min(currentPage * pageSize, totalRecords)`.
         Tampilkan teks: `Menampilkan ${start} - ${end} dari ${totalRecords} Anggota`.
    2. Perbarui tombol kontrol `#matrix-pagination-controls`:
       - Jika `totalRecords === 0`, sembunyikan atau render pagination kosong (hanya disabled Prev & Next).
       - Jika `totalPages > 1`, generate tombol angka halaman secara proporsional sesuai nomor halaman yang aktif.
       - Pasang listener klik pada tombol nomor, Prev, dan Next untuk mengubah `currentPage` dan me-render ulang tabel.
  </action>
  <verify>Buka halaman Matriks Anggota di browser. Saat database memiliki 0 anggota, pastikan teks menampilkan "0 dari 0 Anggota" dan deretan angka dummy 1-32 hilang.</verify>
  <done>Pagination dan label indikator penunggak 100% akurat merefleksikan jumlah data riil RxDB.</done>
</task>

## Success Criteria
- [ ] Tombol prev/next dan angka halaman di footer matriks anggota dikendalikan oleh total data di RxDB, bukan dummy.
- [ ] Angka statistik "Menampilkan X-Y dari Z" dihitung akurat berdasarkan pagination state.
- [ ] Render tabel membatasi diri maksimal sejumlah `pageSize` per halaman.
