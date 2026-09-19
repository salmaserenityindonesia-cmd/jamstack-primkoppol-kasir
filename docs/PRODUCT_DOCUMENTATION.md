# 📘 Dokumentasi Produk — PRIMKOPPOL NGAWI POS & Ekosistem Koperasi

> **Versi**: 2.4.0  
> **Terakhir diperbarui**: 20 September 2026  
> **Organisasi**: Primer Koperasi Kepolisian Resor Ngawi — Jawa Timur  
> **Repository**: `jamstack-primkoppol-kasir`

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Target Pengguna & Persona](#2-target-pengguna--persona)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
   - 3.1 [Arsitektur Tingkat Tinggi](#31-arsitektur-tingkat-tinggi)
   - 3.2 [Arsitektur Multi-Page Application (MPA)](#32-arsitektur-multi-page-application-mpa)
   - 3.3 [Strategi Data: Offline-First / Local-First](#33-strategi-data-offline-first--local-first)
   - 3.4 [Strategi Sinkronisasi Cloud](#34-strategi-sinkronisasi-cloud)
   - 3.5 [Deployment Architecture](#35-deployment-architecture)
4. [Peta Modul & Fitur](#4-peta-modul--fitur)
   - 4.1 [Terminal POS Kasir Waserda](#41-terminal-pos-kasir-waserda)
   - 4.2 [Pelunasan Piutang & Instant Unblock](#42-pelunasan-piutang--instant-unblock)
   - 4.3 [Dual-State Restocking (3 Tahap)](#43-dual-state-restocking-3-tahap)
   - 4.4 [Retur Konsumen & Alokasi Klaim Produsen](#44-retur-konsumen--alokasi-klaim-produsen)
   - 4.5 [Tutup Shift & Rekonsiliasi Kasir](#45-tutup-shift--rekonsiliasi-kasir)
   - 4.6 [Master Barang & Update HPP](#46-master-barang--update-hpp)
   - 4.7 [Matriks Tunggakan Keanggotaan](#47-matriks-tunggakan-keanggotaan)
   - 4.8 [Suite Pelaporan & Analitik Bisnis](#48-suite-pelaporan--analitik-bisnis)
   - 4.9 [Cetak Struk Termal](#49-cetak-struk-termal)
   - 4.10 [AI Audit Operasional (Gemini Sentinel)](#410-ai-audit-operasional-gemini-sentinel)
   - 4.11 [Sync Health PWA Monitor](#411-sync-health-pwa-monitor)
   - 4.12 [Dashboard Supervisor / Pengawas](#412-dashboard-supervisor--pengawas)
   - 4.13 [Google Drive Spreadsheet Export Hub](#413-google-drive-spreadsheet-export-hub)
   - 4.14 [Scheduled Export Manager (Background Worker)](#414-scheduled-export-manager-background-worker)
5. [Alur Bisnis Proses (Business Process Flow)](#5-alur-bisnis-proses)
   - 5.1 [Alur Transaksi POS Harian](#51-alur-transaksi-pos-harian)
   - 5.2 [Alur Kredit & Pelunasan Anggota](#52-alur-kredit--pelunasan-anggota)
   - 5.3 [Alur Penerimaan Barang (Restocking)](#53-alur-penerimaan-barang-restocking)
   - 5.4 [Alur Penutupan Shift Kasir](#54-alur-penutupan-shift-kasir)
   - 5.5 [Alur AI Audit Pasca-Shift](#55-alur-ai-audit-pasca-shift)
6. [Technology Stack](#6-technology-stack)
7. [Struktur Direktori Proyek](#7-struktur-direktori-proyek)
8. [Data Model & Schema](#8-data-model--schema)
9. [API Endpoints](#9-api-endpoints)
10. [Standar Desain & Visual Identity](#10-standar-desain--visual-identity)
11. [KPI & Indikator Keberhasilan](#11-kpi--indikator-keberhasilan)

---

## 1. Ringkasan Eksekutif

**PRIMKOPPOL NGAWI POS & Ecosystem** adalah platform terintegrasi sistem kasir (*Point of Sale*) dan manajemen koperasi modern yang dirancang khusus untuk Koperasi Waserda (Warung Serba Ada) Kepolisian Resor Ngawi, Jawa Timur.

### Misi Utama

| # | Misi | Solusi Teknis |
|---|------|---------------|
| 1 | **Zero Data Loss** — Transaksi kasir tidak boleh hilang meskipun internet putus | Arsitektur **Local-First** dengan RxDB/IndexedDB + background sync |
| 2 | **Eliminasi Piutang Macet** — Cegah kredit melampaui batas plafon anggota | Sistem **Auto-Blocking** real-time di mesin kasir |
| 3 | **Integritas Inventori** — Nol selisih stok antara fisik dan sistem | Alur **Dual-State Restocking** 3 tahap dengan validasi otomatis |
| 4 | **Deteksi Anomali Cepat** — Fraud/selisih kas teridentifikasi segera | **AI Audit** dengan Gemini + Heuristic Rule Engine |
| 5 | **Pelaporan Otomatis** — Laporan keuangan terkirim ke Google Drive tanpa intervensi manual | **Scheduled Export** ke Google Sheets via Firebase Auth |

### Fitur Unik yang Membedakan

- **Proteksi kredit anggota koperasi otomatis** — bukan hanya POS biasa, tetapi terintegrasi logika keanggotaan dan plafon simpan-pinjam.
- **Restock 3 tahap** — menyelesaikan masalah klasik selisih fisik gudang vs faktur supplier.
- **AI-powered audit** — menggunakan Google Gemini untuk mendeteksi pola anomali shift kasir secara otomatis.
- **Offline-first** — tidak bergantung pada koneksi internet untuk operasional kasir.

---

## 2. Target Pengguna & Persona

| Persona | Peran Utama | Kebutuhan Utama | Modul Utama |
|---------|-------------|-----------------|-------------|
| **Kasir Waserda** | Checkout transaksi harian | Kecepatan input (keyboard F1–F12), proteksi plafon kredit instan | Terminal POS, Cetak Struk |
| **Petugas Gudang** | Penerimaan barang, opname, sortasi retur | Input barcode/SKU, kartu stok real-time | Dual-State Restock, Master Barang, Mutasi |
| **Bendahara / Admin** | Keuangan, piutang, dan manajemen | Pelunasan piutang, pelaporan omzet & margin, ekspor Google Drive | Pelunasan Piutang, Laporan, Drive Export |
| **Supervisor / Auditor** | Otorisasi, audit strategis | Dashboard monitor, AI Audit anomali, otorisasi Berita Acara | Dashboard Supervisor, AI Audit |

---

## 3. Arsitektur Sistem

### 3.1 Arsitektur Tingkat Tinggi

```
┌──────────────────────────────────────────────────────────────────┐
│                     BROWSER (Client Side)                        │
│                                                                  │
│  ┌────────────┐  ┌────────────────┐  ┌───────────────────────┐  │
│  │ index.html │  │  22 Modul UI   │  │ Supervisor Dashboard  │  │
│  │ (App Shell)│  │ (MPA Pages)    │  │ (PWA)                 │  │
│  └─────┬──────┘  └───────┬────────┘  └───────────┬───────────┘  │
│        │                 │                        │              │
│  ┌─────┴─────────────────┴────────────────────────┴───────────┐  │
│  │              kopos-db.js (Reactive Storage Engine)          │  │
│  │              localStorage + CustomEvent Broadcasting        │  │
│  └─────┬──────────────────────────────────────────────────────┘  │
│        │                                                         │
│  ┌─────┴──────────────────────────────────────────────────────┐  │
│  │              src/db/ (RxDB Layer — Dexie/IndexedDB)        │  │
│  │  creditEngine │ settlementEngine │ syncEngine │ schemas     │  │
│  └─────┬──────────────────────────────────────────────────────┘  │
│        │                                                         │
│  ┌─────┴──────────────────────────────────────────────────────┐  │
│  │    Google Drive Service │ Scheduled Export Manager/Worker   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────┬───────────────────────┬───────────────────────────┘
               │                       │
               ▼                       ▼
┌──────────────────────────┐  ┌────────────────────────────────────┐
│   Express Server (API)   │  │         Cloud Services             │
│   ─────────────────────  │  │  ┌──────────┐  ┌───────────────┐  │
│   /api/env               │  │  │ Supabase │  │ Google GenAI  │  │
│   /api/ai-audit          │  │  │ (DB Sync)│  │ (Gemini 2.5)  │  │
│   /api/sync/push         │  │  └──────────┘  └───────────────┘  │
│   /api/modules           │  │  ┌──────────┐  ┌───────────────┐  │
│   /api/health            │  │  │ Firebase │  │ Google Drive  │  │
│                          │  │  │ (Auth)   │  │ API v3        │  │
└──────────────────────────┘  │  └──────────┘  └───────────────┘  │
                              └────────────────────────────────────┘
```

### 3.2 Arsitektur Multi-Page Application (MPA)

Aplikasi menggunakan pola **MPA (Multi-Page Application)** dengan arsitektur *iframe embedding*:

1. **App Shell** (`index.html`) — bertindak sebagai container utama dengan top navigation bar dan iframe workspace.
2. **22 Modul UI** — masing-masing adalah halaman HTML mandiri (*self-contained*) yang berada di dalam folder `stitch_primkoppol_ngawi_pos_desktop_interface/`.
3. **Navigasi** — modul dimuat ke dalam iframe utama melalui fungsi `switchView(path)`. Setiap modul terdaftar sebagai route di Express server.

**Keunggulan arsitektur ini:**
- Setiap modul bisa dikembangkan dan ditest secara independen.
- Isolasi error — crash di satu modul tidak mempengaruhi modul lain.
- Performa — hanya modul aktif yang dimuat ke memori.

### 3.3 Strategi Data: Offline-First / Local-First

Sistem menggunakan **dua layer penyimpanan lokal** yang bekerja saling melengkapi:

```
┌───────────────────────────────────────────────────────────────┐
│ Layer 1: kopos-db.js (Legacy/Presentational)                  │
│ ─────────────────────────────────────────────                 │
│ • Storage: localStorage                                       │
│ • Target: UI modules (22 halaman MPA)                        │
│ • Cross-tab: CustomEvent + StorageEvent broadcasting          │
│ • Query: Sub-5ms (in-memory find)                            │
│ • Fitur: Credit check, settlement, restocking, shift closing │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ Layer 2: src/db/ (RxDB — Production Replication Layer)        │
│ ─────────────────────────────────────────────────             │
│ • Storage: IndexedDB (via Dexie adapter)                      │
│ • Target: Replication & sync operations                       │
│ • Cross-tab: BroadcastChannel + RxDB Leader Election         │
│ • Fitur: FIFO sync queue, PENDING→SENT lifecycle             │
│ • Build: Vite Library Mode → dist/assets/index.js             │
└───────────────────────────────────────────────────────────────┘
```

### 3.4 Strategi Sinkronisasi Cloud

```
                    ┌──────────────────┐
                    │  Browser Tab 1   │───┐
                    │  (Kasir POS)     │   │
                    └──────────────────┘   │
                    ┌──────────────────┐   │  RxDB Leader
                    │  Browser Tab 2   │───┤  Election
                    │  (Laporan)       │   │  (BroadcastChannel)
                    └──────────────────┘   │
                    ┌──────────────────┐   │        ┌────────────┐
                    │  Browser Tab 3   │───┘        │            │
                    │  (Gudang)        │            │  Supabase  │
                    └──────────────────┘            │  Cloud DB  │
                             │                      │            │
                     Hanya TAB LEADER               └─────▲──────┘
                     yang menjalankan                      │
                     sinkronisasi                          │
                             │                             │
                             ▼                             │
                    ┌──────────────────┐                   │
                    │  syncEngine.js   │───────────────────┘
                    │  (FIFO Queue)    │  INSERT per record
                    │  10s polling     │  PENDING → SENT
                    │  + online event  │
                    └──────────────────┘
```

**Prinsip Kunci:**
- **Leader Election** — hanya satu tab browser yang ditunjuk sebagai *leader* untuk menjalankan sinkronisasi ke Supabase. Mencegah duplikasi insert.
- **FIFO Queue** — transaksi dikirim berurutan berdasarkan timestamp (ascending). Jika satu gagal, proses berhenti dan dicoba lagi di siklus berikutnya.
- **Graceful Error Handling** — error konektivitas ditangani tanpa crash UI.
- **Event-driven Resume** — saat koneksi online kembali, sinkronisasi langsung dipicu.

### 3.5 Deployment Architecture

| Target | Teknologi | Catatan |
|--------|-----------|---------|
| **Lokal (Dev)** | Express.js `server.js` | `npm run dev` → port 3000 |
| **Production (Static)** | Netlify / Cloudflare Pages | Custom `build.js` → `dist/` |
| **PWA** | Service Worker (`sw.js`) | Stale-While-Revalidate caching |
| **Static API** | `dist/api/env.json` | Env variables di-bake saat build |

---

## 4. Peta Modul & Fitur

### 4.1 Terminal POS Kasir Waserda

| Aspek | Detail |
|-------|--------|
| **Route** | `/pos` |
| **Kategori** | Kasir & Transaksi |
| **Keyboard Shortcuts** | `F1` Cari Produk, `F2` Ganti Anggota, `F4` Plafon, `F9` Bayar Cepat, `F10` Hold Nota, `F12` Simpan Transaksi |

**Fitur Utama:**
- Scan barcode / input manual dengan auto-focus scanner.
- Kalkulasi otomatis subtotal, PPN, dan total belanja.
- **Proteksi Plafon Kredit Otomatis (Auto-Blocking)**:
  - Real-time check batas plafon saat mode belanja kredit.
  - Jika akumulasi tagihan + nota baru > limit, atau tunggakan simpanan > 2 bulan → tombol `[Kredit Anggota]` otomatis **terkunci (disabled)** dengan badge `STATUS: TERBLOKIR`.
  - Kasir diarahkan ke tombol `[Bayar Tunai (F9)]`.

**Business Logic** (dari `kopos-db.js` → `checkCreditEligibility()`):
```
Eligible IF:
  - status ≠ BLOCKED
  - (current_debt + new_cart_total) ≤ credit_limit
  - unpaid_months < 2
```

---

### 4.2 Pelunasan Piutang & Instant Unblock

| Aspek | Detail |
|-------|--------|
| **Route** | `/pelunasan` |
| **Kategori** | Piutang & Anggota |
| **Modul Pendukung** | `/modal-detail-transaksi`, `/modal-sukses-unblock` |

**Fitur Utama:**
- Input ID Anggota, rincian nota piutang tempo, dan angsuran simpanan wajib.
- **Instant Unblock** — begitu pelunasan divalidasi, status blokir anggota langsung dicabut secara otomatis.
- Pembayaran dialokasikan ke nota piutang tertua terlebih dahulu (FIFO).
- Cetak Bukti Kas Masuk (BKM) via struk termal.

**Business Logic** (dari `kopos-db.js` → `processDebtSettlement()` dan `settlementEngine.js` → `processDebtPayment()`):
```
1. new_debt = max(0, current_debt - amount_paid)
2. IF new_debt ≤ credit_limit → status = 'ACTIVE' (auto-unblock)
3. Alokasi FIFO ke unpaid_invoices[]
4. Record transaksi tipe 'PELUNASAN_PIUTANG'
5. Queue ke outbox untuk sync
```

---

### 4.3 Dual-State Restocking (3 Tahap)

Menyelesaikan masalah klasik **selisih antara faktur supplier dan fisik barang** yang diterima di gudang.

#### Tahap 1: Pre-Input Faktur Supplier

| Aspek | Detail |
|-------|--------|
| **Route** | `/restock-tahap-1` |
| **Pengguna** | Bendahara / Admin |

- Mencatat nomor faktur, nama supplier, dan estimasi kuantitas total.
- Status awal faktur: `PENDING`.

#### Tahap 2: Input Berbasis SKU oleh Gudang

| Aspek | Detail |
|-------|--------|
| **Route** | `/restock-tahap-2` |
| **Pengguna** | Petugas Gudang |

- Pemindaian fisik riil per SKU (scanner/manual `+` / `-`).
- Bekerja **offline** (IndexedDB) — tetap lancar meski koneksi gudang putus.
- Kalkulasi otomatis `scanned_total_qty` dan `variance` (selisih terhadap ekspektasi faktur).

#### Tahap 3: Validasi Otomatis & Penggabungan Stok

| Aspek | Detail |
|-------|--------|
| **Route** | `/restock-tahap-3` |
| **Pengguna** | Sistem (otomatis) |

- Pencocokan otomatis kuantitas Tahap 1 vs Tahap 2.
- **Jika variance ≠ 0**: tombol *Simpan & Update Stok* **terkunci**. Sistem menerbitkan Berita Acara Selisih.
- **Jika variance = 0**: merge stok dieksekusi dengan **Moving Average HPP**:

```
New HPP = ((Old_Stock × Old_HPP) + (Incoming_Qty × Incoming_Cost)) / (Old_Stock + Incoming_Qty)
```

---

### 4.4 Retur Konsumen & Alokasi Klaim Produsen

| Aspek | Detail |
|-------|--------|
| **Route** | `/retur-barang` |
| **Kategori** | Gudang & Retur |

**Sortir Alokasi Kondisi Fisik Ganda:**

| Kondisi | Alokasi | Dampak |
|---------|---------|--------|
| **Layak Jual** (kemasan utuh / salah varian) | Kembali ke etalase Waserda | Tambah stok aktif |
| **Rusak / Cacat Segel** (bocor / cacat pabrik) | Karantina produsen | Klaim penggantian / potong faktur PO |

**Kompensasi Fleksibel**: pemulihan limit plafon, tukar barang sejenis, atau cash refund kasir.

---

### 4.5 Tutup Shift & Rekonsiliasi Kasir

| Aspek | Detail |
|-------|--------|
| **Route** | `/tutup-shift` |
| **Kategori** | Kasir & Transaksi |

**Formula Rekonsiliasi:**
```
Expected_Cash = Opening_Cash + Cash_Sales + Debt_Repayments - Refunds
Variance      = Actual_Cash_Drawer - Expected_Cash
Status        = BALANCED (0) | SURPLUS (>0) | DEFISIT (<0)
```

**Fitur:**
- Deteksi variansi otomatis dengan kolom justifikasi alasan kasir.
- Kompilasi **minimized JSON payload** shift untuk AI Audit.
- Cetak slip rekap tutup shift 80mm.
- Penguncian sesi transaksi kasir lokal.

---

### 4.6 Master Barang & Update HPP

| Aspek | Detail |
|-------|--------|
| **Route** | `/master-barang` |
| **Kategori** | Gudang & Retur |

Manajemen katalog produk: barcode, SKU, nama, harga jual, HPP (Harga Pokok Penjualan), stok, satuan, dan kategori.

---

### 4.7 Matriks Tunggakan Keanggotaan

| Aspek | Detail |
|-------|--------|
| **Route** | `/matriks-tunggakan` |
| **Kategori** | Piutang & Anggota |

Visualisasi matriks penuaan piutang (*Aging Schedule*) seluruh anggota koperasi — menampilkan status aktif/terblokir, persentase pemakaian plafon, dan jumlah bulan tunggakan.

---

### 4.8 Suite Pelaporan & Analitik Bisnis

Sistem menyediakan **6 jenis laporan** yang komprehensif:

| # | Laporan | Route | Isi Utama |
|---|---------|-------|-----------|
| 1 | **Penjualan Barang** | `/laporan-penjualan` | Volume penjualan per periode, per kategori |
| 2 | **Keuangan & Piutang** | `/laporan-keuangan` | Omzet, Tunai vs Kredit, Margin SHU, Aging Schedule |
| 3 | **Top 20 Fast-Moving** | `/laporan-fast-moving` | 20 komoditas teratas by frekuensi struk, run-out days, valuasi |
| 4 | **Mutasi & Kartu Stok** | `/laporan-mutasi` | Arus 4 arah: Masuk Restock, Masuk Retur, Keluar POS, Keluar Klaim |
| 5 | **Pembelian Restock** | `/laporan-pembelian` | Riwayat pembelian dari supplier per faktur |
| 6 | **Retur & Klaim Supplier** | `/laporan-retur` | Rasio pemulihan etalase vs klaim garansi vendor |

---

### 4.9 Cetak Struk Termal

| Format | Route | Kegunaan |
|--------|-------|----------|
| **80mm (lengkap)** | `/struk-80mm` | Struk transaksi penuh + QR audit |
| **58mm (ringkas)** | `/struk-58mm` | Bukti Kas Masuk (BKM) ringkas pelunasan |

---

### 4.10 AI Audit Operasional (Gemini Sentinel)

| Aspek | Detail |
|-------|--------|
| **Route UI** | `/ai-audit` |
| **API** | `POST /api/ai-audit` |
| **AI Model** | Gemini 2.5 Flash (via `@google/genai`) |
| **Fallback** | Heuristic Rule Engine (tanpa API key) |

**4 Ranah Anomali yang Dievaluasi:**
1. **Fraud Kasir & Selisih Kas Fisik** — Defisit / Surplus kas laci.
2. **Kebocoran Margin** — Diskon ilegal / pembatalan beruntun (Void).
3. **Kepatuhan Plafon Kredit** — Pola pembelian anggota tidak wajar + Auto-Block compliance.
4. **Deviasi Mutasi Stok** — Selisih fisik vs faktur.

**Output JSON Schema:**
```json
{
  "health_score": 0-100,
  "risk_level": "RENDAH | SEDANG | TINGGI",
  "executive_summary": "...",
  "anomalies": [{ "title": "...", "severity": "LOW|MEDIUM|HIGH", "description": "..." }],
  "root_cause": "...",
  "corrective_actions": ["...", "..."]
}
```

**Fallback Heuristic Engine** — aktif saat API key tidak tersedia:
- Deficit > Rp 50.000 → risk = TINGGI, health = 65
- Deficit ≤ Rp 50.000 → risk = SEDANG, health = 82
- Consecutive Void ≥ 3 → anomali tambahan
- Selalu memeriksa kepatuhan Auto-Block dan integritas Dual-State

---

### 4.11 Sync Health PWA Monitor

| Aspek | Detail |
|-------|--------|
| **Route** | `/sync-health` |
| **Kategori** | Mobile & Audit |

Monitoring status sinkronisasi:
- Antrean pending payload RxDB lokal.
- Latensi WebSocket / polling.
- Tombol *Force Sync* manual.

---

### 4.12 Dashboard Supervisor / Pengawas

| Aspek | Detail |
|-------|--------|
| **Route** | `/supervisor` |
| **Tipe** | Progressive Web App (PWA) |
| **Service Worker** | Stale-While-Revalidate caching |

**Fitur Dashboard:**
- **4 Metric Cards**: Transaksi Hari Ini, Total Kas Tunai, Kredit Berjalan, Anggota Terblokir.
- **Panel Anggota Terblokir** — daftar anggota over-limit dengan persentase pemakaian plafon.
- **Audit Trail Transaksi Kasir** — log real-time dengan badge tipe pembayaran dan status sync.
- **AI Audit On-Demand** — tombol untuk memicu analisis AI langsung dari dashboard.
- **Sync Indicator** — status koneksi cloud real-time.
- **Auto-Refresh** — data dimuat ulang setiap 60 detik.
- **Install as App** — mendukung instalasi PWA di perangkat mobile pengawas.

**Delta Sync Engine** (`supervisorEngine.js`):
- Menggunakan IndexedDB lokal sebagai snapshot cache.
- Hanya mengambil data yang berubah sejak sync terakhir (*delta*).
- Offline-capable: menyajikan data dari cache saat tidak ada koneksi.

---

### 4.13 Google Drive Spreadsheet Export Hub

| Aspek | Detail |
|-------|--------|
| **File** | `google-drive-service.js` |
| **Auth** | Firebase Auth + Google OAuth (popup) |
| **API** | Google Drive API v3 (multipart conversion) |

**Fitur:**
- Login dengan akun Google organisasi.
- Ekspor laporan (Inventaris, Penjualan, Keuangan, Mutasi, dll.) sebagai **Google Spreadsheet** langsung ke Google Drive.
- Pilih folder tujuan di Drive.
- Riwayat ekspor tersimpan.
- Token akses di-cache **in-memory saja** — tidak pernah disimpan di localStorage.

---

### 4.14 Scheduled Export Manager (Background Worker)

| Aspek | Detail |
|-------|--------|
| **Files** | `scheduled-export-manager.js`, `scheduled-export-worker.js` |
| **Storage** | localStorage (`primkoppol_scheduled_exports_v1`) |

**Jadwal Default:**

| Jadwal | Interval | Waktu | Report Types |
|--------|----------|-------|--------------|
| Ekspor Harian Kasir & Inventaris | Daily | 18:00 | inventory, sales, shift |
| Audit Mingguan Keuangan & Mutasi Stok | Weekly (Senin) | 08:00 | finance, mutasi |

- Koordinasi via Web Worker untuk eksekusi background non-blocking.
- Fallback timer jika Worker tidak tersedia.
- Log riwayat eksekusi dengan status success/error.

---

## 5. Alur Bisnis Proses

### 5.1 Alur Transaksi POS Harian

```
Kasir Buka Shift
       │
       ▼
┌─ Scan Barcode / Input Manual ──┐
│                                 │
│  ┌───────────────────┐         │
│  │ Mode: TUNAI       │◄────────┤ (Default)
│  └────────┬──────────┘         │
│           │                    │
│  ┌────────▼──────────┐         │
│  │ Mode: KREDIT      │◄────────┤ (Jika anggota)
│  │ ┌────────────────┐│         │
│  │ │ Check Plafon   ││         │
│  │ │ ≤ Limit? ──────┤│         │
│  │ │ Ya → Lanjut    ││         │
│  │ │ Tidak → BLOCK  ││         │
│  │ └────────────────┘│         │
│  └───────────────────┘         │
│                                 │
└────────────┬───────────────────┘
             │
             ▼
   Record Transaksi (RxDB)
   status: PENDING
             │
             ▼
   [Leader Tab] ── syncEngine ──▶ Supabase
                   PENDING → SENT
```

### 5.2 Alur Kredit & Pelunasan Anggota

```
Anggota Belanja Kredit
         │
         ▼
   current_debt += total_belanja
         │
         ▼
   ┌─────────────────────────┐
   │ current_debt > limit?   │
   │ ATAU unpaid_months ≥ 2? │
   └─────────┬───────────────┘
             │
        Ya ──┤── Tidak
             │       │
      ┌──────▼──┐  ┌─▼────────────┐
      │ BLOCKED │  │ ACTIVE       │
      │ Kasir   │  │ Bisa belanja │
      │ tidak   │  │ kredit lagi  │
      │ bisa    │  └──────────────┘
      │ proses  │
      │ kredit  │
      └────┬────┘
           │
    ┌──────▼───────────┐
    │ Pelunasan Piutang │
    │ (Bendahara/Kasir) │
    └──────┬───────────┘
           │
           ▼
    new_debt = max(0, old_debt - bayar)
           │
           ▼
    ┌──────────────────────┐
    │ new_debt ≤ limit?    │
    └──────┬───────────────┘
           │
      Ya ──┤
           │
    ┌──────▼────────────────┐
    │ INSTANT UNBLOCK       │
    │ status → ACTIVE       │
    │ Bisa belanja lagi ✓   │
    └───────────────────────┘
```

### 5.3 Alur Penerimaan Barang (Restocking)

```
                Bendahara                    Gudang                      Sistem
                   │                           │                           │
    ┌──────────────▼──────────────┐             │                           │
    │ TAHAP 1: Pre-Input Faktur  │             │                           │
    │ • No. Faktur               │             │                           │
    │ • Supplier                 │             │                           │
    │ • Estimasi Qty Total       │             │                           │
    │ Status: PENDING            │             │                           │
    └──────────────┬─────────────┘             │                           │
                   │                           │                           │
                   │────── Kirim Draft ───────▶│                           │
                   │                           │                           │
                   │             ┌─────────────▼──────────────┐            │
                   │             │ TAHAP 2: Scan Fisik SKU    │            │
                   │             │ • Barcode per item          │            │
                   │             │ • +/- qty manual            │            │
                   │             │ • OFFLINE CAPABLE           │            │
                   │             │ Hitung: scanned_total_qty   │            │
                   │             └─────────────┬──────────────┘            │
                   │                           │                           │
                   │                           │────── Submit ────────────▶│
                   │                           │                           │
                   │                           │        ┌──────────────────▼──────┐
                   │                           │        │ TAHAP 3: Validasi       │
                   │                           │        │ variance = scanned - exp │
                   │                           │        │                          │
                   │                           │        │ IF variance = 0:         │
                   │                           │        │   ✅ Merge Stok + HPP    │
                   │                           │        │   status → VERIFIED      │
                   │                           │        │                          │
                   │                           │        │ IF variance ≠ 0:         │
                   │                           │        │   🔒 Tombol Terkunci     │
                   │                           │        │   Berita Acara Selisih   │
                   │                           │        └──────────────────────────┘
```

### 5.4 Alur Penutupan Shift Kasir

```
Kasir Tekan "Tutup Shift"
            │
            ▼
┌──────────────────────────┐
│ Input Fisik Kas Laci     │
│ (Hitung uang riil)      │
└──────────┬───────────────┘
           │
           ▼
   Kalkulasi Otomatis:
   Expected = Open + Cash + Pelunasan - Refund
   Variance = Actual - Expected
           │
           ▼
   ┌───────────────────┐
   │ Variance = 0?     │
   ├── Ya → BALANCED   │
   ├── > 0 → SURPLUS   │
   └── < 0 → DEFISIT ──┤
                        │
           ┌────────────▼────────────────┐
           │ Input Justifikasi Kasir     │
           │ (wajib jika DEFISIT)        │
           └────────────┬────────────────┘
                        │
                        ▼
           Compile Minimized JSON Payload
                        │
                        ▼
           Queue ke Outbox Sync
                        │
                        ▼
           status: CLOSED
           ai_audit_status: PENDING
```

### 5.5 Alur AI Audit Pasca-Shift

```
Shift Ditutup (ai_audit_status: PENDING)
           │
           ▼
┌──────────────────────────────────┐
│ POST /api/ai-audit               │
│ Payload: shift_data + void log  │
└──────────┬───────────────────────┘
           │
     ┌─────┴───────┐
     │ API Key ada? │
     └─────┬───────┘
           │
      Ya ──┤── Tidak
           │       │
    ┌──────▼──┐  ┌─▼──────────────────┐
    │ Gemini  │  │ Heuristic Engine   │
    │ 2.5     │  │ Rule-Based         │
    │ Flash   │  │ Fallback           │
    └────┬────┘  └─────┬──────────────┘
         │             │
         └──────┬──────┘
                │
                ▼
        ┌───────────────────┐
        │ Hasil Audit JSON  │
        │ • health_score    │
        │ • risk_level      │
        │ • anomalies[]     │
        │ • corrective_acts │
        └───────────────────┘
                │
                ▼
        ai_audit_status: AUDITED
        Tampilkan di Dashboard
```

---

## 6. Technology Stack

### Runtime & Framework

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **Node.js** | 20+ | Runtime server |
| **Express.js** | 5.2.1 | HTTP server & API routes |
| **Vite** | 8.3.0 | Build tool (Library Mode untuk RxDB bundle) |

### Frontend

| Teknologi | Fungsi |
|-----------|--------|
| **HTML5** (Multi-Page) | Struktur 22+ halaman mandiri |
| **Tailwind CSS** | Styling (CDN mode + custom theme) |
| **Material Symbols** | Ikon UI |
| **Hanken Grotesk + Space Grotesk** | Tipografi |
| **ES Modules** | JavaScript module system |

### Database & Storage

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| **RxDB** | 17.5.0 | Reactive local database (IndexedDB/Dexie) |
| **RxJS** | 7.8.2 | Reactive programming (RxDB dependency) |
| **Supabase** | 2.116.0 | Cloud database & sync target |
| **localStorage** | — | Legacy presentational storage (kopos-db.js) |
| **IndexedDB** | — | Supervisor delta-cache & RxDB storage |

### Cloud Services

| Service | Provider | Fungsi |
|---------|----------|--------|
| **Supabase** | Supabase | Cloud PostgreSQL + Real-Time sync |
| **Gemini AI** | Google | AI Audit anomali operasional |
| **Firebase Auth** | Google | OAuth untuk Google Drive |
| **Google Drive API v3** | Google | Export spreadsheet laporan |

### DevOps & Build

| Teknologi | Fungsi |
|-----------|--------|
| **Custom `build.js`** | Static site generator (copy + redirect rules) |
| **Netlify / Cloudflare Pages** | Hosting static |
| **Service Worker** | PWA offline caching |
| **PostCSS + Autoprefixer** | CSS processing |

---

## 7. Struktur Direktori Proyek

```
jamstack-primkoppol-kasir/
│
├── index.html                          # App Shell utama (MPA container + iframe)
├── server.js                           # Express server (dev + API)
├── build.js                            # Custom static build script → dist/
├── vite.config.js                      # Vite Library Mode config (RxDB bundle)
├── package.json                        # Dependencies & scripts
│
├── kopos-db.js                         # KoposDatabase — Reactive localStorage engine
├── google-drive-service.js             # Firebase Auth + Google Drive API v3
├── scheduled-export-manager.js         # Scheduled export coordinator
├── scheduled-export-worker.js          # Background Web Worker
├── tailwind-theme.js                   # Custom Tailwind design tokens
│
├── src/
│   ├── index.js                        # POS_DB entry point (window.POS_DB)
│   ├── index.css                       # Global styles
│   ├── db/
│   │   ├── database.js                 # RxDB instance + Leader Election
│   │   ├── schemas.js                  # RxDB collection schemas
│   │   ├── schema.js                   # Alt schema definitions
│   │   ├── index.js                    # Alt DB init + Supabase sync
│   │   ├── creditEngine.js             # Validasi plafon kredit + proses transaksi
│   │   ├── settlementEngine.js         # Pelunasan piutang + auto-unblock
│   │   └── syncEngine.js              # FIFO sync queue → Supabase
│   └── supervisor/
│       ├── dashboard.html              # Supervisor PWA dashboard
│       ├── supervisorEngine.js         # Delta-cache sync + metric calculators
│       └── aiAuditEngine.js            # On-demand AI Audit (Gemini REST API)
│
├── stitch_primkoppol_ngawi_pos_desktop_interface/
│   ├── pos_terminal_kasir_koperasi/        # Terminal POS Kasir
│   ├── pelunasan_piutang_setoran.../       # Pelunasan Piutang
│   ├── tahap_1_pre_input_faktur.../        # Restock Tahap 1
│   ├── tahap_2_input_berbasis_sku.../      # Restock Tahap 2
│   ├── tahap_3_validasi_otomatis.../       # Restock Tahap 3
│   ├── retur_barang_pelanggan.../          # Retur & Klaim
│   ├── tutup_shift_rekonsiliasi.../        # Tutup Shift
│   ├── matriks_tunggakan.../              # Matriks Tunggakan
│   ├── master_barang_restock.../          # Master Barang
│   ├── laporan_penjualan.../              # Lap. Penjualan
│   ├── laporan_keuangan.../               # Lap. Keuangan
│   ├── laporan_sisa_barang.../            # Lap. Fast-Moving
│   ├── laporan_mutasi.../                 # Lap. Mutasi Stok
│   ├── laporan_pembelian.../              # Lap. Pembelian
│   ├── laporan_retur.../                  # Lap. Retur
│   ├── cetak_struk_termal_80mm.../        # Struk 80mm
│   ├── cetak_struk_termal_ringkas_58mm.../ # Struk 58mm
│   ├── status_sinkronisasi.../            # Sync Health PWA
│   ├── ai_audit_operasional.../           # AI Audit PWA
│   ├── modal_detail_transaksi.../         # Modal Detail
│   ├── modal_sukses_pelunasan.../         # Modal Unblock
│   ├── logo_primkoppol_ngawi/             # Logo & Brand
│   └── prd_master_brief.md               # PRD Master Brief
│
├── public/
│   ├── sw.js                              # Service Worker
│   ├── manifest.json                      # PWA Manifest
│   ├── manifest.webmanifest              # Alt manifest
│   ├── icon-192.png                       # PWA icon
│   └── icon-512.png                       # PWA icon
│
├── tests/
│   ├── test-ai-audit.mjs                 # Test AI Audit
│   ├── test-credit-queue.mjs             # Test Credit Queue
│   └── test-leader-election.mjs          # Test Leader Election
│
├── adapters/                              # Platform adapters
├── scripts/                               # Utility scripts
├── docs/                                  # Documentation
├── dist/                                  # Build output
│
├── .env                                   # Environment variables
├── .env.example                           # Env template
├── netlify.toml                          # Netlify config
├── firebase-applet-config.json           # Firebase config
└── metadata.json                          # Project metadata
```

---

## 8. Data Model & Schema

### Members (Anggota Koperasi)

```
┌────────────────────────────────────────────────────┐
│                    members                          │
├──────────────────┬─────────┬───────────────────────┤
│ Field            │ Type    │ Keterangan            │
├──────────────────┼─────────┼───────────────────────┤
│ id (PK)          │ string  │ Format: ANG-XXXX      │
│ name             │ string  │ Nama lengkap anggota  │
│ unit             │ string  │ Satuan / Divisi       │
│ join_date        │ string  │ Tanggal bergabung     │
│ credit_limit     │ number  │ Batas plafon kredit   │
│ current_debt     │ number  │ Hutang berjalan       │
│ unpaid_months    │ number  │ Tunggakan simpanan    │
│ status           │ string  │ ACTIVE | BLOCKED      │
│ mandatory_savings│ number  │ Simpanan wajib        │
│ unpaid_invoices  │ array   │ Daftar nota belum     │
│                  │         │ lunas (FIFO)          │
│ updated_at       │ string  │ Timestamp update      │
└──────────────────┴─────────┴───────────────────────┘
```

### Transactions (Transaksi)

```
┌────────────────────────────────────────────────────┐
│                  transactions                       │
├──────────────────┬─────────┬───────────────────────┤
│ Field            │ Type    │ Keterangan            │
├──────────────────┼─────────┼───────────────────────┤
│ id (PK)          │ string  │ ID transaksi / nota   │
│ invoice_number   │ string  │ Nomor nota            │
│ member_id        │ string? │ Nullable (tunai)      │
│ total_amount     │ number  │ Total Rupiah          │
│ payment_type     │ string  │ cash | credit |       │
│                  │         │ debt_payment          │
│ sync_status      │ string  │ PENDING | SENT        │
│ timestamp        │ string  │ ISO 8601              │
│ items            │ array   │ Detail item belanja   │
│ is_synced        │ boolean │ Flag sync (alt)       │
└──────────────────┴─────────┴───────────────────────┘
```

### Products (Produk / Katalog)

```
┌────────────────────────────────────────────────────┐
│                   products                          │
├──────────────────┬─────────┬───────────────────────┤
│ Field            │ Type    │ Keterangan            │
├──────────────────┼─────────┼───────────────────────┤
│ barcode          │ string  │ Barcode EAN           │
│ sku              │ string  │ Stock Keeping Unit    │
│ name             │ string  │ Nama produk lengkap   │
│ price            │ number  │ Harga jual (Rp)       │
│ cost_price       │ number  │ HPP (Rp)              │
│ stock            │ number  │ Stok saat ini         │
│ unit             │ string  │ Satuan (Pch/Bks/Sak)  │
│ category         │ string  │ Kategori              │
│ photo_url        │ string  │ URL foto produk       │
└──────────────────┴─────────┴───────────────────────┘
```

### Supplier Invoices (Faktur Supplier)

```
┌────────────────────────────────────────────────────┐
│              supplier_invoices                      │
├──────────────────┬─────────┬───────────────────────┤
│ Field            │ Type    │ Keterangan            │
├──────────────────┼─────────┼───────────────────────┤
│ invoice_no       │ string  │ Nomor faktur          │
│ supplier_name    │ string  │ Nama supplier         │
│ expected_qty     │ number  │ Qty ekspektasi        │
│ status           │ string  │ PENDING | VERIFIED    │
│ created_at       │ string  │ Timestamp pembuatan   │
│ scanned_items    │ array   │ Item hasil scan       │
│ scanned_total_qty│ number  │ Total scan            │
│ variance         │ number  │ Selisih (scan - exp)  │
│ verified_at      │ string  │ Timestamp verifikasi  │
└──────────────────┴─────────┴───────────────────────┘
```

### Shift Logs (Log Shift Kasir)

```
┌────────────────────────────────────────────────────┐
│                  shift_logs                         │
├──────────────────┬─────────┬───────────────────────┤
│ Field            │ Type    │ Keterangan            │
├──────────────────┼─────────┼───────────────────────┤
│ shift_id         │ string  │ ID shift              │
│ date             │ string  │ Tanggal shift         │
│ cashier          │ string  │ Nama kasir            │
│ cashier_id       │ string  │ ID kasir              │
│ shift_name       │ string  │ Nama shift            │
│ opening_cash     │ number  │ Modal awal laci       │
│ cash_sales       │ number  │ Penjualan tunai       │
│ credit_sales     │ number  │ Penjualan kredit      │
│ debt_repayments  │ number  │ Pelunasan piutang     │
│ refunds          │ number  │ Pengembalian          │
│ expected_cash    │ number  │ Kas ekspektasi        │
│ actual_cash      │ number  │ Kas fisik aktual      │
│ variance         │ number  │ Selisih               │
│ variance_status  │ string  │ BALANCED|SURPLUS|      │
│                  │         │ DEFISIT               │
│ status           │ string  │ OPEN | CLOSED         │
│ void_count       │ number  │ Jumlah void           │
│ voids            │ array   │ Detail void           │
│ minimized_payload│ string  │ JSON untuk AI audit   │
│ ai_audit_status  │ string  │ PENDING | AUDITED     │
│ ai_audit_result  │ object  │ Hasil audit AI        │
└──────────────────┴─────────┴───────────────────────┘
```

---

## 9. API Endpoints

Server berjalan di Express.js (`server.js`) pada port 3000 (default).

| Method | Endpoint | Fungsi | Response |
|--------|----------|--------|----------|
| `GET` | `/api/health` | Health check status sistem | `{ status, system, version, timestamp }` |
| `GET` | `/api/env` | Environment variables untuk frontend | `{ SUPABASE_URL, SUPABASE_ANON_KEY, GEMINI_API_KEY }` |
| `POST` | `/api/ai-audit` | AI Audit Operasional (Gemini + Heuristic) | `{ health_score, risk_level, anomalies[], ... }` |
| `POST` | `/api/sync/push` | Push replication endpoint | `{ success, synced_items_count, timestamp }` |
| `GET` | `/api/modules` | Daftar semua modul terdaftar | `Module[]` |
| `GET` | `/{module-path}` | Serve HTML modul dari stitch directory | HTML file |
| `GET` | `/supervisor` | Dashboard Supervisor PWA | HTML file |
| `GET` | `/` | Main App Shell | `index.html` |

### Detail: `POST /api/ai-audit`

**Request Body:**
```json
{
  "shift_id": "SHIFT-01",
  "cashier": "Budi Santoso",
  "opening_float": 300000,
  "expected_cash": 5250000,
  "actual_cash_drawer": 5225000,
  "variance": -25000,
  "cashier_memo": "Kembalian receh kurang",
  "transactions": []
}
```

**Response (Gemini AI):**
```json
{
  "health_score": 82,
  "risk_level": "SEDANG",
  "executive_summary": "Audit Sentinel shift SHIFT-01...",
  "anomalies": [{ "title": "...", "severity": "MEDIUM", "description": "..." }],
  "root_cause": "...",
  "corrective_actions": ["...", "..."],
  "source": "Gemini 2.5 Flash Sentinel AI",
  "audited_at": "2026-09-20T..."
}
```

---

## 10. Standar Desain & Visual Identity

### Brand

| Elemen | Spesifikasi |
|--------|-------------|
| **Nama Brand** | PRIMKOPPOL NGAWI |
| **Sub-brand** | Primer Koperasi Kepolisian Resor Ngawi |
| **Versi** | Waserda & POS v2.4 |

### Tipografi

| Font | Penggunaan |
|------|------------|
| **Space Grotesk** | Headings, metrics, angka KPI |
| **Hanken Grotesk** | Body text, label, deskripsi |
| **Monospaced (angka)** | Nominal Rupiah, barcode |
| **Material Symbols Outlined** | Ikon seluruh UI |

### Palet Warna

| Token | Hex | Penggunaan |
|-------|-----|------------|
| **Primary Emerald** | `#059669` | Aksi utama, verifikasi, tombol sukses |
| **Corporate Blue** | `#1e40af` / `#2563eb` | Navigasi admin, alur input faktur |
| **Soft Amber / Warning** | `#d97706` / `#fef3c7` | Status pending, buffer menipis, peringatan |
| **Critical Red** | `#dc2626` / `#fee2e2` | Auto-block, piutang macet, defisit |
| **Surface Base** | `#f8f9ff` / `#ffffff` | Background light mode |

### Prinsip UI/UX

- **Light mode kontras tinggi** — ramah mata operator kasir yang bekerja seharian.
- **Touch-friendly** — tombol besar untuk input kasir di layar sentuh.
- **Keyboard-first** — shortcut F1–F12 untuk workflow kasir cepat.
- **Information density** — dashboard ringkas dengan metric cards.
- **Status visibility** — badge warna untuk setiap status (ACTIVE/BLOCKED, PENDING/SENT, dll.).

---

## 11. KPI & Indikator Keberhasilan

| # | KPI | Target | Mekanisme Pengukuran |
|---|-----|--------|---------------------|
| 1 | **Waktu Checkout Kasir** | < 20 detik per transaksi | Timer rata-rata dari scan → simpan |
| 2 | **Zero Data Loss** | 100% tersinkronisasi | Monitoring `sync_status: PENDING → SENT` |
| 3 | **Penurunan Piutang Macet** | Reduksi > 85% | Rasio BLOCKED members sebelum & sesudah Auto-Block |
| 4 | **Integritas Inventori** | Deviasi mendekati 0% | Variance tracking di Dual-State Restocking |
| 5 | **Kecepatan Deteksi Anomali** | < 5 detik setelah Tutup Shift | Response time API `/api/ai-audit` |

---

> **Dokumen ini dihasilkan berdasarkan analisis lengkap source code repository `jamstack-primkoppol-kasir` pada 20 September 2026.**
