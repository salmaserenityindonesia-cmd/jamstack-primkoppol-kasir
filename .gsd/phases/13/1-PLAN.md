# Phase 13: Restrukturisasi Layout Modal Anggota

## Objective
Memperbaiki tata letak responsif dan visibilitas tombol aksi pada Modal Tambah/Edit Anggota, memastikan tombol "Simpan" selalu terlihat tanpa perlu scrolling layar utama dengan menerapkan layout grid 2 kolom dan sticky footer.

## Tasks

<task type="auto">
  <name>Task 1: Restrukturisasi Modal Anggota (Grid 2 Kolom & Sticky Action Footer)</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/manajemen_anggota/code.html</files>
  <action>
    1. Buka file `code.html` pada modul Manajemen Anggota.
    2. Temukan kontainer dialog modal `#modal-member` (atau modal form anggota terkait).
    3. Bungkus kartu modal dengan batasan viewport:
       - Tambahkan kelas: `max-w-2xl w-full max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden`.
    4. Ubah struktur body form menjadi sistem grid 2 kolom dengan scroll area internal:
       - Tambahkan wrapper form: `flex-1 overflow-y-auto p-6 space-y-4`.
       - Baris 1: ID Anggota (kolom 1) | Nama Lengkap (kolom 2).
       - Baris 2: NRP (kolom 1) | Unit/Divisi (kolom 2).
       - Baris 3: Nama Bank (kolom 1) | Nomor Rekening (kolom 2).
       - Baris 4: Plafon Kredit (kolom 1) | Simpanan Wajib per Bulan (kolom 2).
       - Baris 5: Status Keanggotaan (full width col-span-2).
    5. Pisahkan area footer tombol aksi ke luar scroll body:
       - Buat kontainer footer: `sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 z-10`.
       - Pastikan tombol "Batal" dan tombol utama "Simpan Anggota" (Emerald) berada di kontainer footer ini.
  </action>
  <verify>Buka halaman Manajemen Anggota di browser pada zoom 100% (kondisi normal tanpa full screen), klik tombol "+ Tambah Anggota Baru", dan pastikan tombol "Simpan Anggota" terlihat jelas di bagian bawah modal.</verify>
  <done>Modal form keanggotaan tampil proporsional dan tombol simpan selalu terlihat di resolusi standar desktop.</done>
</task>
