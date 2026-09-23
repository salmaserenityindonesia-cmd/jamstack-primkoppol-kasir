---
phase: 8
plan: 1
wave: 1
---

# Plan 8.1: Penambahan Atribut NRP dan Rekening Bank Anggota

## Objective
Menambahkan atribut NRP, Nomor Rekening Bank, dan Nama Bank ke skema anggota RxDB serta antarmuka form Matriks Keanggotaan.

## Context
- `src/db/schemas.js`
- `src/index.js`
- `stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_kopos/code.html`

## Tasks

<task type="auto">
  <name>Task 1: Perbarui Skema Members RxDB dan Helper Ekspor</name>
  <files>src/db/schemas.js, src/index.js</files>
  <action>
    1. Buka file `src/db/schemas.js`.
    2. Pada `memberSchema`, tambahkan field opsional/string baru:
       - nrp: { type: "string" }
       - bank_account_number: { type: "string" }
       - bank_name: { type: "string" }
    3. Buka file `src/index.js` dan pastikan payload fungsi `upsertMember(memberData)` meneruskan field `nrp`, `bank_account_number`, dan `bank_name` ke dalam dokumen RxDB.
    4. Pastikan data seeder anggota (jika ada) menyertakan sampel data NRP dan perbankan (misal: Bank BRI / Bank Mandiri).
  </action>
  <verify>Jalankan `npm run build` untuk memverifikasi bundle JS library terkompilasi bersih tanpa error validasi skema JSON.</verify>
  <done>Skema anggota lokal RxDB mendukung pencatatan NRP dan data perbankan anggota Polri.</done>
</task>

<task type="auto">
  <name>Task 2: Penambahan Input NRP & Rekening Bank di Modal dan Kolom Tabel Matriks</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_kopos/code.html</files>
  <action>
    1. Buka berkas `code.html` pada modul Matriks Tunggakan.
    2. Pada formulir modal tambah/edit anggota (`#modal-member-form`):
       - Tambahkan input text: "NRP (Nomor Registrasi Pokok)" di bawah Nama Anggota.
       - Tambahkan baris 2 kolom untuk perbankan:
         * "Nama Bank" (Dropdown/Input: BRI, Mandiri, BNI, BCA, Jatim, Lainnya).
         * "Nomor Rekening Bank" (Text/Number input).
    3. Perbarui handler submit form agar membaca nilai `nrp`, `bank_name`, dan `bank_account_number` lalu menyimpannya via `window.POS_DB.upsertMember`.
    4. Perbarui rendering baris tabel matriks atau detail popover anggota agar menampilkan identitas NRP di samping/bawah nama anggota serta badge bank.
  </action>
  <verify>Buka modul Matriks Keanggotaan di browser: klik Tambah/Edit Anggota, isi NRP dan data Rekening Bank, simpan data, lalu pastikan tersimpan utuh di RxDB/IndexedDB.</verify>
  <done>Antarmuka Matriks Keanggotaan menampilkan dan mencatat NRP serta rekening bank anggota secara reaktif.</done>
</task>

## Success Criteria
- [ ] Skema RxDB dapat menyimpan NRP, nama bank, dan nomor rekening.
- [ ] Form modal anggota di antarmuka HTML Matriks memiliki kolom isian tersebut.
- [ ] Render tabel keanggotaan berhasil menampilkan informasi NRP/Bank.
