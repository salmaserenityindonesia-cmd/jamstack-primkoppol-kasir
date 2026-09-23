# Phase 12: Pembuatan Modul Manajemen Anggota & Penyesuaian Matriks

## Objective
Membuat antarmuka mandiri "Manajemen Anggota" untuk CRUD Data Anggota Koperasi, serta membersihkan fungsi pendaftaran dari halaman Matriks Tunggakan agar fokus pada audit penuaan piutang.

## Tasks

<task type="auto">
  <name>Task 1: Buat Halaman Mandiri Modul Manajemen Anggota</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/manajemen_anggota/code.html, server.js, index.html</files>
  <action>
    1. Buat folder dan berkas `stitch_primkoppol_ngawi_pos_desktop_interface/manajemen_anggota/code.html`.
    2. Bangun antarmuka Manajemen Anggota Koperasi (styling Tailwind CSS serasi dengan Master Barang):
       - Header: Judul "Manajemen Keanggotaan Primkoppol", kolom pencarian (Cari Nama, NRP, ID), dan tombol utama "+ Tambah Anggota Baru".
       - Filter Tabs: "Semua Anggota", "Anggota Aktif", dan "Anggota Non-Aktif / Keluar".
       - Tabel Data Anggota:
         * Kolom: ID Anggota, NRP, Nama Anggota, Unit/Divisi, Bank & No. Rekening, Limit Plafon, Total Piutang, Status, dan Tombol Aksi.
         * Tombol Aksi per baris: [Edit] dan [Non-Aktifkan] (atau [Aktifkan Kembali] untuk tab non-aktif).
       - Modal Dialog `#modal-member`: Form input ID Anggota, NRP, Nama Lengkap, Unit/Divisi, Nama Bank, Nomor Rekening, Plafon Kredit (Rp), dan Simpanan Wajib (Rp).
    3. Sambungkan event listener modal dan tombol aksi ke fungsi `window.POS_DB.upsertMember()`, `window.POS_DB.deactivateMember()`, dan `window.POS_DB.reactivateMember()`.
    4. Daftarkan menu "Manajemen Anggota" pada navigasi bar atas di `index.html` dan tambahkan rutenya ke `server.js`.
  </action>
  <verify>Jalankan build atau preview lokal. Buka modul Manajemen Anggota, uji penambahan 1 anggota baru lengkap dengan NRP dan Rekening, lalu verifikasi data langsung muncul di tabel.</verify>
  <done>Modul Manajemen Anggota berdiri mandiri dengan fungsionalitas CRUD, nonaktifkan, dan aktivasi ulang.</done>
</task>

<task type="auto">
  <name>Task 2: Bersihkan Tombol Tambah Anggota dari Modul Matriks Tunggakan</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_status_pembatasan_kredit/code.html</files>
  <action>
    1. Buka berkas `code.html` pada modul Matriks Tunggakan.
    2. Hapus tombol "+ Tambah Anggota" (outline biru pada header) dari halaman ini agar matriks murni bertugas menampilkan audit penuaan piutang & simpanan 12 bulan.
    3. Pastikan tombol yang tersisa di header kanan hanya tombol audit: "[ Impor Data CSV ]" dan "[ Cetak Lembar Penagihan ]".
    4. Pastikan tabel matriks 12 bulan tetap membaca data anggota yang terdaftar di RxDB secara otomatis.
  </action>
  <verify>Buka halaman Matriks Anggota di browser dan pastikan tombol "+ Tambah Anggota" sudah bersih, menyisakan tata letak audit simpanan yang rapi.</verify>
  <done>Halaman Matriks Tunggakan terfokus pada audit dan bersih dari tombol pendaftaran anggota.</done>
</task>
