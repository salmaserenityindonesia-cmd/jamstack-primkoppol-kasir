# Product Requirement Document (PRD) & Master Project Brief
**Sistem Aplikasi POS & Ekosistem Manajemen Koperasi PRIMKOPPOL NGAWI**
*(Primer Koperasi Kepolisian Resor Ngawi — Jawa Timur)*

---

## 1. Executive Summary & Visi Produk

**PRIMKOPPOL NGAWI POS & Ecosystem** adalah platform sistem kasir (*Point of Sale*) terintegrasi dan manajemen koperasi modern yang dirancang khusus untuk memenuhi kebutuhan operasional toko serba ada (Waserda Koperasi), permodalan/simpan pinjam anggota, logistik gudang, rekonsiliasi kasir shift, hingga pengawasan berbasis AI.

Sistem dirancang dengan arsitektur **Local-First / Offline-First** (memastikan transaksi kasir tetap dapat berjalan 100% tanpa hambatan koneksi internet lokal), didukung penegakan batas kredit (*auto-blocking* plafon piutang) serta alur restock dua tahap (*Dual-State Restocking*) yang mengeliminasi kebocoran inventori dan selisih faktur vendor.

---

## 2. Target Pengguna & Persona

| Persona | Peran Utama | Kebutuhan Utama |
|---|---|---|
| **Kasir Waserda (Operator POS)** | Transaksi checkout kasir harian | Kecepatan input scanner (keyboard shortcuts F1–F12), proteksi plafon kredit instan, dan penghitungan fisik uang laci saat tutup shift (*cash drawer closing*). |
| **Petugas Gudang & Logistik** | Penerimaan barang, mutasi, opname & sortasi retur | Input berbasis SKU/barcode faktur, pemilahan barang retur (layak jual vs karantina klaim), dan kartu stok real-time. |
| **Bendahara & Admin Koperasi** | Keuangan, piutang, dan restock manajemen | Pre-input faktur supplier, pelunasan tunggakan piutang anggota (*instant unblock*), serta pelaporan omzet, margin SHU, dan aging schedule piutang. |
| **Pimpinan / Supervisor & Auditor (Kapuskop/Kapolres)** | Otorisasi, audit, dan evaluasi strategis | Dashboard analitik top 20 fast-moving products, AI Audit anomali shift (*void fraud & variance analysis*), dan otorisasi berita acara selisih. |

---

## 3. Arsitektur Modul & Spesifikasi Fitur

### A. Terminal POS Desktop Kasir Waserda
1. **Shortcut Keyboard & Auto-Focus Scanner**:
   - Pemetaan hotkeys kasir cepat: `F1` (Cari Produk), `F2` (Ganti Anggota), `F4` (Plafon), `F9` (Bayar Cepat), `F10` (Hold Nota), `F12` (Simpan Transaksi).
2. **Proteksi Plafon Kredit Anggota Otomatis (*Auto-Blocking*)**:
   - Pengecekan real-time batas maksimal plafon kredit (contoh: batas Rp 1.000.000).
   - Jika akumulasi tagihan nota baru melampaui limit atau anggota memiliki tunggakan simpanan wajib >2 bulan berturut-turut, opsi tombol `[ Kredit Anggota ]` otomatis terkunci (*disabled*) dengan badge merah `STATUS: TERBLOKIR`.
   - Kasir otomatis diarahkan untuk menyelesaikan via tombol hijau `[ Bayar Tunai (F9) ]`.

### B. Modul Pelunasan Piutang & Setoran Tunggakan
1. **Formulir Pembayaran Cepat**:
   - Input ID Anggota, rincian nota piutang tempo, dan angsuran tunggakan simpanan wajib.
2. **Otomatisasi Instant Unblock**:
   - Begitu transaksi pelunasan divalidasi kasir/bendahara, status blokir anggota langsung dicabut secara otomatis (*Instant Unblock*), mengembalikan kuota plafon belanja di kasir.
3. **Cetak Bukti Kas Masuk (BKM)**:
   - Dukungan cetak struk termal format **80mm** (lengkap dengan QR audit) dan format ringkas **58mm roll**.

### C. Alur Dual-State Restocking & Penerimaan Barang
1. **Tahap 1: Pre-Input Faktur Supplier (Manajemen / Bendahara)**:
   - Pencatatan dokumen faktur supplier (*Invoice Number*, *Supplier/Distributor*, *Estimasi Kuantitas Item Total*).
   - Pengiriman draft ekspektasi ke terminal gudang logistik dengan status awal `PENDING`.
2. **Tahap 2: Input Berbasis SKU oleh Staf Gudang (Tablet / Desktop)**:
   - Pemindaian fisik riil per SKU menggunakan scanner atau input manual (`+` / `-` taktil).
   - Beroperasi secara lokal (IndexedDB) sehingga tetap lancar meski koneksi gudang terputus.
3. **Tahap 3: Validasi Otomatis & Penggabungan Stok (System Resolution)**:
   - Pencocokan otomatis antara kuantitas faktur Tahap 1 vs hasil scan Tahap 2.
   - Deteksi selisih otomatis (*variance detection*): Bila jumlah tidak cocok, tombol *Simpan & Update Stok* terkunci dan sistem menerbitkan Berita Acara Selisih Pengiriman Supplier. Otorisasi supervisor dimungkinkan dengan bypass klaim tagihan vendor.

### D. Penanganan Retur Konsumen & Alokasi Klaim Produsen
1. **Sortir Alokasi Kondisi Fisik Ganda**:
   - **Layak Jual (Etalase Toko)**: Kemasan utuh/salah ambil varian → langsung menambah kembali stok aktif waserda tanpa belanja modal baru.
   - **Rusak/Cacat Segel (Karantina Produsen)**: Bocor mikro/cacat pabrik → masuk ke area karantina untuk diajukan penggantian barang baru atau potong faktur PO ke distributor rekanan.
2. **Kompensasi Fleksibel**:
   - Pemulihan limit plafon belanja gaji anggota, penukaran barang sejenis di kasir, atau *cash refund* kasir.

### E. Tutup Shift Kasir & Rekonsiliasi Laci Kas (*Shift Closing*)
- Rekonsiliasi ganda: Modal awal laci kasir + akumulasi penjualan tunai + pelunasan piutang tunai - pengembalian retur kasir.
- Deteksi variansi otomatis (Surplus / Defisit) dengan kolom justifikasi alasan kasir.
- Cetak slip rekap tutup shift termal 80mm dan penguncian sesi transaksi kasir lokal.

### F. Pelaporan & Analitik Bisnis Waserda
1. **Laporan Keuangan & Piutang Anggota**:
   - Rekapitulasi Omzet Kotor (*Gross Sales*), Penjualan Tunai vs Kredit Plafon, Omzet Bersih, HPP Beli, Estimasi Laba Kotor (*Margin %*), serta Matriks Penuaan Piutang (*Aging Schedule*).
2. **Laporan Top 20 Fast-Moving Products & Sisa Stok**:
   - 20 komoditas teratas terurut berdasarkan frekuensi struk kasir, rasio perputaran (*run-out days*), valuasi sisa aset, dan margin keuntungan SHU.
3. **Laporan Mutasi Barang Gudang & Kartu Stok**:
   - Rincian arus 4 arah: Masuk Pengadaan Restock, Masuk Retur Konsumen, Keluar Penjualan POS, dan Keluar Retur Klaim Produsen.
4. **Laporan Retur Barang & Status Klaim Supplier**:
   - Pemantauan rasio pemulihan etalase toko vs tingkat keberhasilan klaim garansi vendor rekanan.

### G. Mobile PWA: Status Sinkronisasi & AI Operational Audit
1. **Mobile Sync Health (Offline-First Monitor)**:
   - Pemantauan antrean pending payload RxDB lokal, latensi WebSocket, dan tombol *Force Sync*.
2. **AI Shift Audit (Gemini Engine)**:
   - Evaluasi anomali transaksi kasir pasca tutup shift: deteksi pola pembatalan berturut-turut (*consecutive void log*), ketidakwajaran rasio defisit kas fisik, dan kepatuhan plafon kredit.
   - Rekomendasi otomatis pembuatan Berita Acara dan eskalasi pimpinan.

---

## 4. Standar Desain & Visual Identity

- **Brand Name**: PRIMKOPPOL NGAWI *(Primer Koperasi Kepolisian Resor Ngawi)*.
- **Tipografi**: Space Grotesk (Headings & Metrics) dipadukan dengan font angka monospaced berdaya baca tinggi untuk nominal Rupiah.
- **Palet Warna Utama**:
  - `Primary Emerald`: `#059669` (Transparansi koperasi, tombol sukses/aksi utama, verifikasi valid).
  - `Corporate Interactive Blue`: `#1e40af` / `#2563eb` (Navigasi admin, alur input faktur).
  - `Soft Amber / Warning`: `#d97706` / `#fef3c7` (Status pending, buffer menipis, peringatan selisih).
  - `Critical Red`: `#dc2626` / `#fee2e2` (Auto-block transaksi, piutang macet, selisih hitung fisik).
  - `Surface Base`: `#f8f9ff` / `#ffffff` (Light mode kontras tinggi ramah mata operator).

---

## 5. Indikator Keberhasilan (Key Performance Indicators / KPI)

1. **Waktu Checkout Kasir**: Rata-rata < 20 detik per transaksi retail sembako.
2. **Zero Data Loss**: 100% data transaksi tersinkronisasi sempurna begitu koneksi internet pulih.
3. **Penurunan Piutang Macet (NPL)**: Target reduksi piutang macet hingga > 85% melalui mekanisme *auto-blocking* otomatis di mesin kasir.
4. **Integritas Inventori & HPP**: Deviasi pencatatan stok fisik vs sistem mendekati 0% berkat sistem alur *Dual-State Restocking* dan pemilahan retur.
5. **Kecepatan Deteksi Anomali Kasir**: Audit otomatis selesai dalam waktu < 5 detik setelah kasir menekan tombol Tutup Shift.
