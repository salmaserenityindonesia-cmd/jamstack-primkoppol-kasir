---
phase: 10
plan: 1
wave: 1
---

# Plan 10.1: Penghapusan Teks Dummy Statis & Reaktivitas Kartu KPI

## Objective
Menghapus teks dummy statis pada kartu KPI Matriks Keanggotaan dan mengikat perhitungannya secara reaktif ke RxDB.

## Context
- `stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_kopos/code.html`

## Tasks

<task type="auto">
  <name>Task 1: Pasang ID Unik dan Default Kosong pada Kartu KPI Matriks</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_kopos/code.html</files>
  <action>
    1. Buka file `code.html` pada modul Matriks Keanggotaan.
    2. Temukan ketiga kartu ringkasan KPI di bagian atas:
       - Kartu 1 (Total Anggota Aktif): Ganti teks statis "2.450 Anggota" dengan `<span id="kpi-total-members">-</span>`.
       - Kartu 2 (Total Nominal Tunggakan): Ganti teks statis "Rp 45.000.000" dengan `<span id="kpi-total-debt">-</span>`.
       - Kartu 3 (Anggota Terblokir): Ganti teks statis "32 Anggota" dengan `<span id="kpi-blocked-members">-</span>`.
    3. Hapus atau beri ID dinamis pada teks indikator kecil di bawahnya:
       - ID `kpi-debt-subtitle` untuk keterangan akumulasi penunggak.
    4. Pastikan tag `<script type="module" src="/assets/index.js"></script>` terpasang di bagian `<head>`.
  </action>
  <verify>Buka file HTML dan pastikan angka dummy 2.450, 45 juta, dan 32 sudah tidak tertulis mentah di file HTML.</verify>
  <done>Elemen KPI memiliki ID yang siap dimanipulasi oleh skrip reaktif.</done>
</task>

<task type="auto">
  <name>Task 2: Perbarui Fungsi Kalkulasi KPI dari Koleksi RxDB</name>
  <files>stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_kopos/code.html</files>
  <action>
    1. Pada skrip subscriber RxDB di file tersebut, buat atau perbarui fungsi `updateKPIs()` (ganti menjadi `updateKPICards(members)` atau manfaatkan `currentMembers` yang ada):
       - const totalActive = members.filter(m => m.status === 'active').length;
       - const totalBlocked = members.filter(m => m.status === 'blocked').length;
       - const totalDebt = members.reduce((sum, m) => sum + (Number(m.current_debt) || 0), 0);
       - const arrearsCount = members.filter(m => (Number(m.current_debt) || 0) > 0).length;
    2. Render nilai hasil perhitungan ke DOM:
       - document.getElementById('kpi-total-members').textContent = `${totalActive} Anggota`;
       - document.getElementById('kpi-total-debt').textContent = `Rp ${totalDebt.toLocaleString('id-ID')}`;
       - document.getElementById('kpi-blocked-members').textContent = `${totalBlocked} Anggota`;
       - document.getElementById('kpi-debt-subtitle').textContent = `Akumulasi ${arrearsCount} anggota menunggak simpanan`;
    3. Panggil fungsi ini di dalam subscriber `window.POS_DB.subscribeMembers()`.
  </action>
  <verify>Buka halaman di browser. Saat database memiliki 0 anggota, ketiga kartu harus menampilkan 0 Anggota, Rp 0, dan 0 Anggota tanpa kembali ke data dummy setelah reload.</verify>
  <done>Kartu KPI terhubung penuh ke data RxDB dan bebas dari nilai dummy template.</done>
</task>

## Success Criteria
- [ ] Angka-angka dummy (2.450, 45.000.000, 32) tidak lagi di-*hardcode* di HTML.
- [ ] Kartu KPI menampilkan nilai yang konsisten dengan jumlah data di koleksi `members` RxDB.
- [ ] Reaktivitas berfungsi: jika ada perubahan anggota, KPI segera *update*.
