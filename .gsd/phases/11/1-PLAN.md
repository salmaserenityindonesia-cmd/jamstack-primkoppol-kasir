# Phase 11: Perbaikan Matriks Keanggotaan dan Pagination

## Objective
Memperbaiki tampilan kartu nominal tunggakan dan menyederhanakan pagination matriks keanggotaan saat data kosong sesuai dengan kondisi data sebenarnya di RxDB.

## Tasks

<task type="auto">
  <name>Task 1: Perbaiki Nilai Default & Indikator Kartu Nominal Tunggakan</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_status_pembatasan_kredit/code.html</files>
  <action>
    1. Buka file `code.html` pada modul Matriks Tunggakan.
    2. Pada kartu KPI kedua (Total Nominal Tunggakan):
       - Ganti teks tanda hubung `-` statis dengan `<span id="kpi-total-debt">Rp 0</span>`.
       - Berikan ID `kpi-debt-subtitle` pada teks keterangan di bawahnya dan ubah teks defaultnya menjadi: `Akumulasi 0 anggota menunggak simpanan`.
       - Sembunyikan badge persentase fluktuasi `+6.4% MoM` jika riwayat data perbandingan bulan lalu belum ada/masih 0 (gunakan inline class `hidden` atau manipulasi via script).
    3. Pastikan fungsi reaktif `updateKPICards(members)` mengupdate elemen `#kpi-total-debt` dengan format `Rp ${totalDebt.toLocaleString('id-ID')}` dan jika `totalDebt === 0` teks tetap tertulis tegas `Rp 0`.
  </action>
  <verify>Buka file HTML dan pastikan teks default kartu tunggakan adalah Rp 0 dan 0 anggota menunggak.</verify>
  <done>Kartu nominal tunggakan menampilkan Rp 0 secara konsisten saat tidak ada tunggakan atau anggota masih kosong.</done>
</task>

<task type="auto">
  <name>Task 2: Rombak Total Footer Pagination Menjadi Dinamis & Single Page Saat Kosong</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_status_pembatasan_kredit/code.html</files>
  <action>
    1. Cari kontainer baris pagination di bawah tabel matriks:
       - Hapus deretan tombol angka statis `[1] [2] [3] [...] [32]` yang tertulis mentah di HTML.
       - Berikan wadah ID `matrix-pagination-container` untuk kontrol tombol dan `matrix-pagination-info` untuk label info.
    2. Tulis logika rendering pagination pada subscriber RxDB:
       - Hitung `totalMembers = filteredMembers.length`.
       - Jika `totalMembers === 0`:
         * Label teks `#matrix-pagination-info`: "Menampilkan 0 dari 0 Anggota".
         * Kontrol navigasi: Render tombol `<button disabled class="opacity-50">Prev</button><button class="bg-emerald-700 text-white px-3 py-1 rounded">1</button><button disabled class="opacity-50">Next</button>` (hanya angka 1 yang aktif/disabled, tanpa angka berlipat-lipat).
       - Jika `totalMembers > 0`:
         * Hitung `totalPages = Math.ceil(totalMembers / pageSize)`.
         * Render tombol angka sesuai `totalPages` aktual.
    3. Pastikan tidak ada fungsi mockup lain yang mengembalikan teks dummy "320 Anggota".
  </action>
  <verify>Muat ulang halaman Matriks Anggota di browser: pastikan nominal tunggakan tertulis "Rp 0", info pagination tertulis "Menampilkan 0 dari 0 Anggota", dan pagination hanya menampilkan tombol halaman 1.</verify>
  <done>Pagination dan tampilan nominal tunggakan 100% sinkron dengan status data riil database.</done>
</task>
