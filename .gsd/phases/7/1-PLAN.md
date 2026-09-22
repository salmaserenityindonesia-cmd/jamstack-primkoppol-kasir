---
phase: 7
plan: 1
wave: 1
---

# Plan 7.1: CRUD Manajemen Keanggotaan pada Matriks Tunggakan

## Objective
Mengimplementasikan modul CRUD Manajemen Keanggotaan pada halaman Matriks Tunggakan beserta sinkronisasi databasenya menggunakan RxDB.

## Context
- `src/index.js`
- `src/db/database.js`
- `stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_status_pembatasan_kredit/code.html`

## Tasks

<task type="auto">
  <name>Task 1: Helper CRUD Members & Reaktivitas Database di src/index.js</name>
  <files>src/index.js, src/db/database.js</files>
  <action>
    1. Buka `src/index.js` dan tambahkan fungsi manajemen koleksi `members`:
       - `getMembers(filter = {})`: mengembalikan daftar anggota dengan opsi status (active/inactive/all).
       - `subscribeMembers(callback)`: langganan reaktif dokumen RxDB untuk pembaruan instan tabel keanggotaan.
       - `upsertMember(memberData)`: menambah anggota baru atau memperbarui data anggota (id, name, unit, credit_limit, current_debt, mandatory_savings, status, updated_at).
       - `deactivateMember(memberId)`: mengubah status anggota menjadi 'inactive' / 'exited'.
       - `reactivateMember(memberId)`: mengembalikan status anggota menjadi 'active'.
    2. Ekspos fungsi-fungsi tersebut ke objek `window.POS_DB`.
  </action>
  <verify>Jalankan `npm run build` untuk memverifikasi bundle library JS terkompilasi bersih tanpa error skema.</verify>
  <done>Fungsi CRUD koleksi anggota terekspos di window.POS_DB.</done>
</task>

<task type="auto">
  <name>Task 2: Modal Form Tambah & Edit Anggota serta Integrasi Tabel Matriks</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_status_pembatasan_kredit/code.html</files>
  <action>
    1. Buka berkas `code.html` pada modul Matriks Tunggakan.
    2. Pastikan tag `<script type="module" src="/assets/index.js"></script>` terpasang di `<head>`.
    3. Tambahkan tombol "+ Tambah Anggota" di header halaman di samping tombol "Impor Data CSV".
    4. Tambahkan markup modal dialog:
       - `#modal-member-form`: Form untuk tambah/edit (ID Anggota, Nama Lengkap, Unit/Divisi, Plafon Kredit Rp, Simpanan Wajib Rp, Status).
       - Di dalam modal edit, sediakan tombol sekunder merah: "Non-Aktifkan Anggota (Keluar)".
    5. Tambahkan tombol toggle filter di atas tabel: "Anggota Aktif" dan "Anggota Non-Aktif/Keluar".
    6. Hubungkan rendering tabel matriks dan KPI Cards (Total Anggota Aktif, Total Tunggakan, Anggota Terblokir) secara reaktif menggunakan `window.POS_DB.subscribeMembers()`.
    7. Berikan aksi klik tombol "Edit" di setiap baris tabel untuk membuka modal modifikasi data anggota.
  </action>
  <verify>Buka halaman Matriks Tunggakan di browser: uji penambahan 1 anggota baru, ubah plafon kreditnya via modal edit, non-aktifkan anggota tersebut, dan periksa apakah metrik KPI terhitung secara otomatis dari RxDB.</verify>
  <done>Fitur manajemen keanggotaan (tambah, edit, non-aktif, reaktivasi) berjalan penuh dengan data riil RxDB.</done>
</task>

## Success Criteria
- [ ] CRUD anggota berfungsi dari database RxDB dan terekspos secara global.
- [ ] Halaman Matriks Tunggakan dapat menambah/edit anggota dan bereaksi secara instan pada pembaruan RxDB.
- [ ] Status anggota (Aktif/Non-Aktif) dapat difilter di halaman.
