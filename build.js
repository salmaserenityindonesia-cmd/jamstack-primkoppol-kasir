import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy index.html to dist
if (fs.existsSync(path.join(__dirname, 'index.html'))) {
  fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
}

// Copy client JS files to dist
const jsFiles = [
  'kopos-db.js',
  'google-drive-service.js',
  'scheduled-export-worker.js',
  'scheduled-export-manager.js',
  'tailwind-theme.js'
];

jsFiles.forEach(file => {
  const src = path.join(__dirname, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, file));
  }
});

// Copy stitch_primkoppol_ngawi_pos_desktop_interface to dist
const sourceStitch = path.join(__dirname, 'stitch_primkoppol_ngawi_pos_desktop_interface');
const targetStitch = path.join(distDir, 'stitch_primkoppol_ngawi_pos_desktop_interface');

if (fs.existsSync(sourceStitch)) {
  fs.cpSync(sourceStitch, targetStitch, { recursive: true });
}

// Copy src directory to dist
const sourceSrc = path.join(__dirname, 'src');
const targetSrc = path.join(distDir, 'src');

if (fs.existsSync(sourceSrc)) {
  fs.cpSync(sourceSrc, targetSrc, { recursive: true });
}

const redirectsContent = `
/pos /stitch_primkoppol_ngawi_pos_desktop_interface/pos_terminal_kasir_koperasi/code.html 200
/pelunasan /stitch_primkoppol_ngawi_pos_desktop_interface/pelunasan_piutang_setoran_tunggakan_kopos/code.html 200
/modal-detail-transaksi /stitch_primkoppol_ngawi_pos_desktop_interface/modal_detail_transaksi_pelunasan_piutang_primkoppol_ngawi/code.html 200
/modal-sukses-unblock /stitch_primkoppol_ngawi_pos_desktop_interface/modal_sukses_pelunasan_piutang_auto_unblock_primkoppol_ngawi/code.html 200
/restock-tahap-1 /stitch_primkoppol_ngawi_pos_desktop_interface/tahap_1_pre_input_faktur_supplier_manajemen_dual_state_restocking_pos/code.html 200
/restock-tahap-2 /stitch_primkoppol_ngawi_pos_desktop_interface/tahap_2_input_berbasis_sku_oleh_gudang_dual_state_restocking_pos/code.html 200
/restock-tahap-3 /stitch_primkoppol_ngawi_pos_desktop_interface/tahap_3_validasi_otomatis_penggabungan_stok_dual_state_restocking_pos/code.html 200
/retur-barang /stitch_primkoppol_ngawi_pos_desktop_interface/retur_barang_pelanggan_alokasi_produsen_primkoppol_ngawi/code.html 200
/tutup-shift /stitch_primkoppol_ngawi_pos_desktop_interface/tutup_shift_rekonsiliasi_kasir_kopos/code.html 200
/matriks-tunggakan /stitch_primkoppol_ngawi_pos_desktop_interface/matriks_tunggakan_keanggotaan_kopos/code.html 200
/master-barang /stitch_primkoppol_ngawi_pos_desktop_interface/master_barang_restock_inventory_update_hpp_kopos/code.html 200
/laporan-penjualan /stitch_primkoppol_ngawi_pos_desktop_interface/laporan_penjualan_barang_per_periode_primkoppol_ngawi/code.html 200
/laporan-keuangan /stitch_primkoppol_ngawi_pos_desktop_interface/laporan_keuangan_piutang_anggota_primkoppol_ngawi/code.html 200
/laporan-fast-moving /stitch_primkoppol_ngawi_pos_desktop_interface/laporan_sisa_barang_top_20_fast_moving_products_primkoppol_ngawi/code.html 200
/laporan-mutasi /stitch_primkoppol_ngawi_pos_desktop_interface/laporan_mutasi_barang_gudang_kartu_stok_primkoppol_ngawi/code.html 200
/laporan-pembelian /stitch_primkoppol_ngawi_pos_desktop_interface/laporan_pembelian_restock_barang_primkoppol_ngawi/code.html 200
/laporan-retur /stitch_primkoppol_ngawi_pos_desktop_interface/laporan_retur_barang_klaim_produsen_primkoppol_ngawi/code.html 200
/struk-80mm /stitch_primkoppol_ngawi_pos_desktop_interface/cetak_struk_termal_80mm_pelunasan_piutang_primkoppol_ngawi/code.html 200
/struk-58mm /stitch_primkoppol_ngawi_pos_desktop_interface/cetak_struk_termal_ringkas_58mm_pelunasan_piutang_primkoppol_ngawi/code.html 200
/sync-health /stitch_primkoppol_ngawi_pos_desktop_interface/status_sinkronisasi_sistem_health_mobile_pwa/code.html 200
/ai-audit /stitch_primkoppol_ngawi_pos_desktop_interface/ai_audit_operasional_kopos_pwa/code.html 200
/logo /stitch_primkoppol_ngawi_pos_desktop_interface/logo_primkoppol_ngawi/code.html 200
/pelunasan-piutang /stitch_primkoppol_ngawi_pos_desktop_interface/pelunasan_piutang_setoran_tunggakan_kopos/code.html 200
/api/env /api/env.json 200
/* /index.html 200
`;


fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent.trim());

// Generate static /api/env.json for Netlify
const apiDir = path.join(distDir, 'api');
if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });
fs.writeFileSync(path.join(apiDir, 'env.json'), JSON.stringify({
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
}));

console.log('Build completed successfully: dist directory populated with _redirects and static env.json');
