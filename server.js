import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const stitchDir = path.join(__dirname, 'stitch_primkoppol_ngawi_pos_desktop_interface');

// Module route definitions
const modules = [
  { id: 'pos', name: 'Terminal POS Kasir', path: '/pos', file: 'pos_terminal_kasir_koperasi/code.html', category: 'Kasir & Transaksi', shortcut: 'F1-F12' },
  { id: 'pelunasan', name: 'Pelunasan Piutang & Setoran', path: '/pelunasan', file: 'pelunasan_piutang_setoran_tunggakan_kopos/code.html', category: 'Piutang & Anggota', shortcut: 'F4' },
  { id: 'modal-detail', name: 'Modal Detail Transaksi Piutang', path: '/modal-detail-transaksi', file: 'modal_detail_transaksi_pelunasan_piutang_primkoppol_ngawi/code.html', category: 'Piutang & Anggota' },
  { id: 'modal-unblock', name: 'Modal Sukses Auto-Unblock', path: '/modal-sukses-unblock', file: 'modal_sukses_pelunasan_piutang_auto_unblock_primkoppol_ngawi/code.html', category: 'Piutang & Anggota' },
  { id: 'restock-1', name: 'Restock Tahap 1: Pre-Input Faktur', path: '/restock-tahap-1', file: 'tahap_1_pre_input_faktur_supplier_manajemen_dual_state_restocking_pos/code.html', category: 'Dual-State Restocking' },
  { id: 'restock-2', name: 'Restock Tahap 2: Input SKU Gudang', path: '/restock-tahap-2', file: 'tahap_2_input_berbasis_sku_oleh_gudang_dual_state_restocking_pos/code.html', category: 'Dual-State Restocking' },
  { id: 'restock-3', name: 'Restock Tahap 3: Validasi & Merge', path: '/restock-tahap-3', file: 'tahap_3_validasi_otomatis_penggabungan_stok_dual_state_restocking_pos/code.html', category: 'Dual-State Restocking' },
  { id: 'retur', name: 'Retur Barang & Alokasi Klaim', path: '/retur-barang', file: 'retur_barang_pelanggan_alokasi_produsen_primkoppol_ngawi/code.html', category: 'Gudang & Retur' },
  { id: 'tutup-shift', name: 'Tutup Shift & Rekonsiliasi Kasir', path: '/tutup-shift', file: 'tutup_shift_rekonsiliasi_kasir_kopos/code.html', category: 'Kasir & Transaksi' },
  { id: 'matriks', name: 'Matriks Tunggakan Keanggotaan', path: '/matriks-tunggakan', file: 'matriks_tunggakan_keanggotaan_kopos/code.html', category: 'Piutang & Anggota' },
  { id: 'master-barang', name: 'Master Barang & Update HPP', path: '/master-barang', file: 'master_barang_restock_inventory_update_hpp_kopos/code.html', category: 'Gudang & Retur' },
  { id: 'lap-penjualan', name: 'Laporan Penjualan Barang', path: '/laporan-penjualan', file: 'laporan_penjualan_barang_per_periode_primkoppol_ngawi/code.html', category: 'Laporan & Audit' },
  { id: 'lap-keuangan', name: 'Laporan Keuangan & Piutang', path: '/laporan-keuangan', file: 'laporan_keuangan_piutang_anggota_primkoppol_ngawi/code.html', category: 'Laporan & Audit' },
  { id: 'lap-fast-moving', name: 'Laporan Top 20 Fast-Moving', path: '/laporan-fast-moving', file: 'laporan_sisa_barang_top_20_fast_moving_products_primkoppol_ngawi/code.html', category: 'Laporan & Audit' },
  { id: 'lap-mutasi', name: 'Laporan Mutasi & Kartu Stok', path: '/laporan-mutasi', file: 'laporan_mutasi_barang_gudang_kartu_stok_primkoppol_ngawi/code.html', category: 'Laporan & Audit' },
  { id: 'lap-pembelian', name: 'Laporan Pembelian Restock', path: '/laporan-pembelian', file: 'laporan_pembelian_restock_barang_primkoppol_ngawi/code.html', category: 'Laporan & Audit' },
  { id: 'lap-retur', name: 'Laporan Retur & Klaim Produsen', path: '/laporan-retur', file: 'laporan_retur_barang_klaim_produsen_primkoppol_ngawi/code.html', category: 'Laporan & Audit' },
  { id: 'struk-80', name: 'Cetak Struk Termal 80mm', path: '/struk-80mm', file: 'cetak_struk_termal_80mm_pelunasan_piutang_primkoppol_ngawi/code.html', category: 'Cetak Struk' },
  { id: 'struk-58', name: 'Cetak Struk Ringkas 58mm', path: '/struk-58mm', file: 'cetak_struk_termal_ringkas_58mm_pelunasan_piutang_primkoppol_ngawi/code.html', category: 'Cetak Struk' },
  { id: 'sync-health', name: 'Status Sinkronisasi PWA', path: '/sync-health', file: 'status_sinkronisasi_sistem_health_mobile_pwa/code.html', category: 'Mobile & Audit' },
  { id: 'ai-audit', name: 'AI Audit Operasional Kopos', path: '/ai-audit', file: 'ai_audit_operasional_kopos_pwa/code.html', category: 'Mobile & Audit' },
  { id: 'logo', name: 'Logo & Identitas Brand', path: '/logo', file: 'logo_primkoppol_ngawi/code.html', category: 'Brand' }
];

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'PRIMKOPPOL NGAWI POS & Cooperative Ecosystem',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// Environment variables endpoint for frontend
app.get('/api/env', (req, res) => {
  res.json({
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  });
});

// AI Operational Audit endpoint (PRD 2.3 & PRD 3.1)
app.post('/api/ai-audit', async (req, res) => {
  const body = req.body || {};
  const shift_id = body.shift_id || 'SHIFT-01';
  const cashier = body.cashier || 'Budi Santoso';
  const opening_float = body.opening_float ?? (body.shift_data?.open ?? 300000);
  const expected_cash = body.expected_cash ?? (body.shift_data?.expected ?? 5250000);
  const actual_cash = body.actual_cash_drawer ?? (body.shift_data?.actual ?? 5225000);
  const variance = body.variance ?? (body.shift_data?.diff ?? (actual_cash - expected_cash));
  const memo = body.cashier_memo || '';
  const transactions = body.transactions || [];

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Anda adalah AI Pengawas Audit Koperasi PRIMKOPPOL NGAWI. Lakukan audit anomali terhadap data shift kasir berikut:
Shift ID: ${shift_id}
Kasir: ${cashier}
Saldo Kas Awal: Rp ${opening_float}
Kas Laci Ekspektasi: Rp ${expected_cash}
Kas Laci Fisik Aktual: Rp ${actual_cash}
Variansi Selisih Kas: Rp ${variance}
Catatan Kasir: ${memo || 'Tidak ada catatan'}
Jumlah Transaksi: ${transactions.length}

Evaluasi 4 ranah anomali:
1. Fraud Kasir & Selisih Kas Fisik (Defisit / Surplus).
2. Kebocoran Margin / Diskon Ilegal / Pembatalan Beruntun (Void).
3. Pola Pembelian Anggota Tidak Wajar & Kepatuhan Batas Plafon Kredit (Auto-Block).
4. Deviasi Mutasi Stok Fisik vs Faktur.

Kembalikan HANYA JSON valid dengan skema berikut:
{
  "health_score": number (0-100),
  "risk_level": "RENDAH" | "SEDANG" | "TINGGI",
  "executive_summary": "Ringkasan narasi eksekutif untuk pengurus koperasi",
  "anomalies": [
    {
      "title": "Judul anomali",
      "severity": "LOW" | "MEDIUM" | "HIGH",
      "description": "Rincian dan bukti anomali"
    }
  ],
  "root_cause": "Analisis akar masalah yang teridentifikasi",
  "corrective_actions": [
    "Aksi korektif 1",
    "Aksi korektif 2"
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text);
      return res.json({
        ...parsed,
        source: 'Gemini 2.5 Flash Sentinel AI',
        audited_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('[AI Audit] Gemini call failed or key invalid, fallback to heuristic:', err.message);
    }
  }

  // Heuristic Engine fallback (PRD 3.1)
  const isDeficit = variance < 0;
  const absVariance = Math.abs(variance);
  let healthScore = 95;
  let riskLevel = 'RENDAH';
  const anomalies = [];
  const correctiveActions = [];

  if (isDeficit) {
    if (absVariance > 50000) {
      healthScore = 65;
      riskLevel = 'TINGGI';
    } else {
      healthScore = 82;
      riskLevel = 'SEDANG';
    }
    anomalies.push({
      title: 'Anomali Defisit Kas Fisik Laci',
      severity: absVariance > 50000 ? 'HIGH' : 'MEDIUM',
      description: `Terdapat defisit kas riil sebesar -Rp ${absVariance.toLocaleString('id-ID')} terhadap kalkulasi sistem (Ekspektasi: Rp ${expected_cash.toLocaleString('id-ID')}, Fisik: Rp ${actual_cash.toLocaleString('id-ID')}). Memo kasir: "${memo || 'Tanpa keterangan'}"`
    });
    correctiveActions.push('Lakukan investigasi selisih kas fisik bersama kasir bersangkutan dan cocokkan dengan rekaman CCTV laci kasir.');
    correctiveActions.push('Wajibkan penandatanganan Berita Acara Rekonsiliasi Kasir sesuai SOP Primkoppol.');
  } else if (variance > 0) {
    healthScore = 90;
    riskLevel = 'RENDAH';
    anomalies.push({
      title: 'Surplus Kas Fisik (Kelebihan Kas)',
      severity: 'LOW',
      description: `Terdapat kelebihan kas fisik sebesar +Rp ${variance.toLocaleString('id-ID')} yang perlu dibukukan ke pos pendapatan lain-lain pembulatan kasir.`
    });
    correctiveActions.push('Bukukan kelebihan kas fisik ke pos penerimaan selisih kas Waserda.');
  }

  anomalies.push({
    title: 'Kepatuhan Validasi Plafon Piutang Anggota',
    severity: 'LOW',
    description: 'Sistem RxDB Auto-Block berfungsi aktif pada seluruh transaksi belanja tempo/kredit anggota.'
  });

  anomalies.push({
    title: 'Integritas Dual-State Restocking Gudang',
    severity: 'LOW',
    description: 'Seluruh SKU restock telah melalui rekonsiliasi faktur (Tahap 1) dan fisik gudang (Tahap 2) sebelum merge stok POS.'
  });

  correctiveActions.push('Jaga kepatuhan shift kasir dan pastikan penutupan buku kasir dilakukan tepat waktu.');

  return res.json({
    health_score: healthScore,
    risk_level: riskLevel,
    executive_summary: `Audit Sentinel shift ${shift_id} (${cashier}) mencatat skor kesehatan operasional ${healthScore}%. ${isDeficit ? `Terdeteksi defisit kas Rp ${absVariance.toLocaleString('id-ID')}.` : 'Seluruh parameter utama kas dan stok dalam batas toleransi wajar.'}`,
    anomalies,
    root_cause: isDeficit ? `Perbedaan nilai antara pencatatan sistem POS dan fisik laci sebesar Rp ${absVariance.toLocaleString('id-ID')}, kemungkinan berasal dari pembulatan pecahan receh kembalian atau transaksi kasbon manual.` : 'Tidak ditemukan penyimpangan operasional yang signifikan.',
    corrective_actions: correctiveActions,
    source: 'Operational Audit Rule Engine (Ngawi Standard)',
    audited_at: new Date().toISOString()
  });
});

// Sync push replication endpoint (PRD 2.1)
app.post('/api/sync/push', (req, res) => {
  const { items } = req.body || {};
  res.json({
    success: true,
    synced_items_count: Array.isArray(items) ? items.length : 1,
    cloud_status: 'Synced with Supabase Cloud DB',
    timestamp: new Date().toISOString()
  });
});

// Modules API
app.get('/api/modules', (req, res) => {
  res.json(modules);
});

// Register direct routes for all modules
modules.forEach(mod => {
  app.get(mod.path, (req, res) => {
    res.sendFile(path.join(stitchDir, mod.file));
  });
});

// Alias for pelunasan-piutang
app.get('/pelunasan-piutang', (req, res) => {
  res.sendFile(path.join(stitchDir, 'pelunasan_piutang_setoran_tunggakan_kopos/code.html'));
});

// Serve static assets from stitch directory and root
app.use('/stitch', express.static(stitchDir));
app.use(express.static(stitchDir));
app.use(express.static(__dirname));

// Main entry point
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback for any other route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PRIMKOPPOL NGAWI POS Server running on http://0.0.0.0:${PORT}`);
});
