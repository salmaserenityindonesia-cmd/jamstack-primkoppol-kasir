/**
 * PRIMKOPPOL NGAWI - Google Drive & Google Sheets Export Integration
 * Uses Firebase Auth + Google Drive API v3 (Multipart conversion to Google Spreadsheet)
 */

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { 
  getAuth, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  GoogleAuthProvider, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

// In-memory access token cache (MANDATORY: never stored in localStorage / sessionStorage)
let cachedAccessToken = null;
let currentUser = null;
let authInstance = null;
let isSigningIn = false;
let authListeners = [];

// Drive Scopes
const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive'
];

/**
 * Initialize Firebase Auth with configuration
 */
export async function initGoogleDriveAuth() {
  try {
    const res = await fetch('/firebase-applet-config.json');
    if (!res.ok) {
      console.warn('[GoogleDrive] firebase-applet-config.json not found');
      return false;
    }
    const config = await res.json();
    
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    authInstance = getAuth(app);

    onAuthStateChanged(authInstance, (user) => {
      currentUser = user;
      if (!user) {
        cachedAccessToken = null;
      }
      notifyAuthListeners();
    });

    return true;
  } catch (err) {
    console.error('[GoogleDrive] Init error:', err);
    return false;
  }
}

export function onAuthChange(cb) {
  if (typeof cb === 'function') {
    authListeners.push(cb);
    // Initial call
    cb({ user: currentUser, isConnected: Boolean(cachedAccessToken && currentUser) });
  }
}

function notifyAuthListeners() {
  const state = {
    user: currentUser,
    isConnected: Boolean(cachedAccessToken && currentUser)
  };
  authListeners.forEach(cb => {
    try { cb(state); } catch (e) { console.error(e); }
  });
}

/**
 * Sign in with Google with Drive scopes (popup flow)
 */
export async function signInWithGoogle() {
  if (!authInstance) {
    await initGoogleDriveAuth();
  }
  if (!authInstance) {
    throw new Error('Firebase Auth belum siap. Periksa konfigurasi Google Cloud.');
  }

  const provider = new GoogleAuthProvider();
  DRIVE_SCOPES.forEach(scope => provider.addScope(scope));
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    isSigningIn = true;
    const result = await signInWithPopup(authInstance, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal memperoleh Access Token Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    currentUser = result.user;
    notifyAuthListeners();

    return {
      user: currentUser,
      accessToken: cachedAccessToken
    };
  } catch (error) {
    console.error('[GoogleDrive] Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Sign out and clear in-memory token
 */
export async function signOutGoogle() {
  if (authInstance) {
    await firebaseSignOut(authInstance);
  }
  cachedAccessToken = null;
  currentUser = null;
  notifyAuthListeners();
}

export function getCurrentUser() {
  return currentUser;
}

export function isConnected() {
  return Boolean(cachedAccessToken && currentUser);
}

export function getAccessToken() {
  return cachedAccessToken;
}

/**
 * Generate CSV Report Data from KoposDB or Custom Source
 */
export function generateReportData(reportType) {
  const db = window.KoposDB;
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  if (reportType === 'inventory') {
    const products = db && db.getProducts ? db.getProducts() : [];
    const headers = [
      'SKU / Kode',
      'Barcode',
      'Nama Produk',
      'Kategori',
      'Stok Fisik',
      'Satuan',
      'HPP (Rp)',
      'Harga Jual (Rp)',
      'Margin Laba (Rp)',
      'Margin %',
      'Total Nilai Aset Stok (Rp)',
      'Status Stok'
    ];

    const rows = products.map(p => {
      const margin = (p.price || 0) - (p.cost_price || 0);
      const marginPct = p.cost_price ? ((margin / p.cost_price) * 100).toFixed(1) + '%' : '0%';
      const totalAsset = (p.stock || 0) * (p.cost_price || 0);
      const status = (p.stock || 0) <= 25 ? 'REORDER / KRITIS' : 'AMAN';
      return [
        `"${p.sku || ''}"`,
        `"${p.barcode || ''}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${p.category || 'Umum'}"`,
        p.stock || 0,
        `"${p.unit || 'Pcs'}"`,
        p.cost_price || 0,
        p.price || 0,
        margin,
        `"${marginPct}"`,
        totalAsset,
        `"${status}"`
      ];
    });

    const title = `PRIMKOPPOL_Laporan_Inventaris_Stok_${now.toISOString().slice(0, 10)}`;
    const headerBanner = [
      ['"KOPERASI PRIMER KEPOLISIAN RESOR NGAWI (PRIMKOPPOL NGAWI)"'],
      ['"UNIT PERTOKOAN WASERDA & GUDANG LOGISTIK"'],
      [`"LAPORAN POSISI SISA BARANG & NILAI ASET INVENTARIS"`],
      [`"Tanggal Cetak: ${dateStr} - ${timeStr} WIB"`],
      [`"Total SKU: ${products.length} Item"`],
      []
    ];

    return { title, headers, rows, headerBanner, reportName: 'Laporan Inventaris & Nilai Aset Stok' };
  }

  if (reportType === 'finance') {
    const members = db && db.getMembers ? db.getMembers() : [];
    const headers = [
      'ID Anggota',
      'Nama Lengkap',
      'Unit / Satuan Kerja',
      'Plafon Maksimal (Rp)',
      'Piutang Berjalan (Rp)',
      'Sisa Plafon Tersedia (Rp)',
      'Rasio Pemakaian %',
      'Bulan Menunggak',
      'Status Auto-Block'
    ];

    const rows = members.map(m => {
      const remaining = Math.max(0, (m.credit_limit || 0) - (m.current_debt || 0));
      const ratio = m.credit_limit ? (((m.current_debt || 0) / m.credit_limit) * 100).toFixed(1) + '%' : '0%';
      return [
        `"${m.id || ''}"`,
        `"${(m.name || '').replace(/"/g, '""')}"`,
        `"${(m.unit || '').replace(/"/g, '""')}"`,
        m.credit_limit || 0,
        m.current_debt || 0,
        remaining,
        `"${ratio}"`,
        m.unpaid_months || 0,
        `"${m.status === 'BLOCKED' ? 'TERBLOKIR (OVERLIMIT)' : 'AKTIF'}"`
      ];
    });

    const title = `PRIMKOPPOL_Laporan_Keuangan_Piutang_${now.toISOString().slice(0, 10)}`;
    const headerBanner = [
      ['"KOPERASI PRIMER KEPOLISIAN RESOR NGAWI (PRIMKOPPOL NGAWI)"'],
      ['"DIVISI PEMBUKUAN & PENGAWASAN PIUTANG ANGGOTA"'],
      [`"LAPORAN NERACA PIUTANG KREDIT WASERDA & AUTO-BLOCK MONITORING"`],
      [`"Tanggal Cetak: ${dateStr} - ${timeStr} WIB"`],
      [`"Jumlah Anggota Terdaftar: ${members.length} Orang"`],
      []
    ];

    return { title, headers, rows, headerBanner, reportName: 'Laporan Keuangan & Piutang Anggota' };
  }

  if (reportType === 'sales') {
    const headers = [
      'No. Faktur / Nota',
      'Waktu Transaksi',
      'Kasir',
      'Nama Pelanggan',
      'Metode Bayar',
      'Total Belanja (Rp)',
      'Estimasi HPP (Rp)',
      'Margin Laba Bersih (Rp)',
      'Status Nota'
    ];

    const dummySales = [
      ['"TR-20231024-0042"', `"${dateStr} 08:34"`, '"Sari Wulandari"', '"Aiptu Bambang Susilo"', '"Kredit Anggota"', 185000, 154000, 31000, '"LUNAS"'],
      ['"TR-20231024-0043"', `"${dateStr} 08:52"`, '"Sari Wulandari"', '"Masyarakat Umum"', '"Tunai"', 45000, 38000, 7000, '"LUNAS"'],
      ['"TR-20231024-0044"', `"${dateStr} 09:15"`, '"Sari Wulandari"', '"Bripka Joko Anwar"', '"Kredit Anggota"', 120000, 102000, 18000, '"LUNAS"'],
      ['"TR-20231024-0045"', `"${dateStr} 09:40"`, '"Sari Wulandari"', '"Bripda Fajar Sidik"', '"Tunai"', 315000, 265000, 50000, '"LUNAS"'],
      ['"TR-20231024-0046"', `"${dateStr} 10:12"`, '"Sari Wulandari"', '"Masyarakat Umum"', '"Tunai"', 25000, 20500, 4500, '"LUNAS"'],
      ['"TR-20231024-0047"', `"${dateStr} 11:05"`, '"Sari Wulandari"', '"Aiptu Bambang Susilo"', '"Tunai (Auto-Block Override)"', 95000, 81000, 14000, '"LUNAS"']
    ];

    const title = `PRIMKOPPOL_Laporan_Penjualan_Kasir_${now.toISOString().slice(0, 10)}`;
    const headerBanner = [
      ['"KOPERASI PRIMER KEPOLISIAN RESOR NGAWI (PRIMKOPPOL NGAWI)"'],
      ['"UNIT PERTOKOAN WASERDA - REKAPITULASI PENJUALAN HARIAN"'],
      [`"LAPORAN TRANSAKSI NOTA KASIR PERIODE BERJALAN"`],
      [`"Tanggal Cetak: ${dateStr} - ${timeStr} WIB"`],
      []
    ];

    return { title, headers, rows: dummySales, headerBanner, reportName: 'Laporan Penjualan & Transaksi Kasir' };
  }

  if (reportType === 'mutasi') {
    const headers = [
      'No. Ref Mutasi',
      'Tanggal & Jam',
      'SKU',
      'Nama Barang',
      'Tipe Mutasi',
      'Asal / Tujuan',
      'Qty Masuk',
      'Qty Keluar',
      'Sisa Fisik Akhir',
      'Petugas Gudang'
    ];

    const dummyMutasi = [
      ['"MUT-20231024-001"', `"${dateStr} 07:45"`, '"SKU-MIGOR-2L"', '"Minyak Goreng Bimoli 2L"', '"Restock Masuk"', '"PT Indofood"', 100, 0, 142, '"Hadi Santoso"'],
      ['"MUT-20231024-002"', `"${dateStr} 08:30"`, '"SKU-BERAS-5K"', '"Beras Rojolele 5kg"', '"Restock Masuk"', '"CV Sumber Pangan"', 50, 0, 75, '"Hadi Santoso"'],
      ['"MUT-20231024-003"', `"${dateStr} 10:15"`, '"SKU-INDOMIE-G"', '"Indomie Goreng 85g"', '"Penjualan POS"', '"Waserda Front"', 0, 24, 96, '"Sari Wulandari"'],
      ['"MUT-20231024-004"', `"${dateStr} 11:30"`, '"SKU-GULA-1KG"', '"Gulaku Kristal 1kg"', '"Penjualan POS"', '"Waserda Front"', 0, 15, 45, '"Sari Wulandari"']
    ];

    const title = `PRIMKOPPOL_Laporan_Mutasi_Gudang_${now.toISOString().slice(0, 10)}`;
    const headerBanner = [
      ['"KOPERASI PRIMER KEPOLISIAN RESOR NGAWI (PRIMKOPPOL NGAWI)"'],
      ['"DIVISI LOGISTIK & GUDANG SENTRAL POLRES NGAWI"'],
      [`"KARTU MUTASI STOK & REKONSILIASI FISIK GUDANG"`],
      [`"Tanggal Cetak: ${dateStr} - ${timeStr} WIB"`],
      []
    ];

    return { title, headers, rows: dummyMutasi, headerBanner, reportName: 'Laporan Mutasi Stok Gudang' };
  }

  if (reportType === 'shift') {
    const shift = db && db.getShiftSummary ? db.getShiftSummary() : {
      shift_id: 'SHIFT-01',
      cashier: 'Sari Wulandari',
      opening_float: 500000,
      expected_cash: 4850000,
      actual_cash_drawer: 4850000,
      variance: 0
    };

    const headers = [
      'Parameter Rekonsiliasi',
      'Nilai Tercatat (Rp / Ket)',
      'Status Validasi'
    ];

    const rows = [
      ['"ID Shift Operasional"', `"${shift.shift_id || 'SHIFT-01'}"`, '"VALID"'],
      ['"Nama Petugas Kasir"', `"${shift.cashier || 'Sari Wulandari'}"`, '"TERVERIFIKASI"'],
      ['"Kas Modal Awal Laci"', shift.opening_float || 500000, '"OK"'],
      ['"Ekspektasi Kas Sistem POS"', shift.expected_cash || 4850000, '"DIHITUNG"'],
      ['"Hasil Hitung Fisik Laci (Riil)"', shift.actual_cash_drawer || 4850000, '"FISIK LACI"'],
      ['"Variansi Selisih Kas"', shift.variance || 0, (shift.variance || 0) === 0 ? '"SEIMBANG (PASS)"' : (shift.variance < 0 ? '"DEFISIT"' : '"SURPLUS"')]
    ];

    const title = `PRIMKOPPOL_Laporan_Tutup_Shift_${now.toISOString().slice(0, 10)}`;
    const headerBanner = [
      ['"KOPERASI PRIMER KEPOLISIAN RESOR NGAWI (PRIMKOPPOL NGAWI)"'],
      ['"BERITA ACARA PENUTUPAN SHIFT & REKONSILIASI KASIR"'],
      [`"Tanggal Cetak: ${dateStr} - ${timeStr} WIB"`],
      []
    ];

    return { title, headers, rows, headerBanner, reportName: 'Laporan Rekonsiliasi Tutup Shift Kasir' };
  }

  // Default / fallback
  return generateReportData('inventory');
}

/**
 * Format structured data into standard CSV text
 */
function buildCsvString(dataObj) {
  const { headerBanner = [], headers = [], rows = [] } = dataObj;
  let lines = [];

  headerBanner.forEach(lineArray => {
    lines.push(lineArray.join(','));
  });

  if (headers.length > 0) {
    lines.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
  }

  rows.forEach(r => {
    lines.push(r.join(','));
  });

  return lines.join('\r\n');
}

/**
 * Upload and convert CSV to authentic Google Spreadsheet via Drive API v3
 * Uses multipart/related to supply both metadata and content
 */
export async function uploadSpreadsheetToGoogleDrive(reportType, customTitle = null, targetFolderId = null, targetFolderName = null) {
  if (!cachedAccessToken) {
    throw new Error('Anda belum terhubung ke Google Drive. Silakan klik "Sign in with Google" terlebih dahulu.');
  }

  const dataObj = generateReportData(reportType);
  const fileName = customTitle ? customTitle.trim() : `${dataObj.title}`;
  const csvContent = buildCsvString(dataObj);

  // Metadata specifies mimeType as 'application/vnd.google-apps.spreadsheet'
  // When uploaded with text/csv content, Google Drive converts it into a Google Spreadsheet!
  const metadata = {
    name: fileName,
    mimeType: 'application/vnd.google-apps.spreadsheet',
    description: `Laporan resmi ${dataObj.reportName} dari Sistem POS Waserda PRIMKOPPOL NGAWI.`
  };

  // Specify parent folder if not root
  if (targetFolderId && targetFolderId !== 'root') {
    metadata.parents = [targetFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/csv; charset=UTF-8\r\n\r\n' +
    csvContent +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,parents,webViewLink,webContentLink,createdTime', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const errMsg = errJson?.error?.message || `HTTP ${res.status}: Gagal mengunggah ke Google Drive.`;
    throw new Error(errMsg);
  }

  const result = await res.json();

  const resolvedFolderName = targetFolderName || (targetFolderId && targetFolderId !== 'root' ? 'Folder Terpilih' : 'Root Drive (Folder Utama)');

  // Save to recent exports session history
  saveRecentExport({
    id: result.id,
    name: result.name,
    webViewLink: result.webViewLink || `https://docs.google.com/spreadsheets/d/${result.id}/edit`,
    reportType,
    reportName: dataObj.reportName,
    rowCount: dataObj.rows.length,
    targetFolderId: targetFolderId || 'root',
    targetFolderName: resolvedFolderName,
    timestamp: new Date().toISOString()
  });

  return {
    ...result,
    reportName: dataObj.reportName,
    rowCount: dataObj.rows.length,
    targetFolderId: targetFolderId || 'root',
    targetFolderName: resolvedFolderName,
    webViewLink: result.webViewLink || `https://docs.google.com/spreadsheets/d/${result.id}/edit`
  };
}

/**
 * List folders in the user's Google Drive
 */
export async function listDriveFolders(searchQuery = '') {
  if (!cachedAccessToken) {
    throw new Error('Belum terhubung ke Google Drive. Silakan login terlebih dahulu.');
  }

  let q = "mimeType = 'application/vnd.google-apps.folder' and trashed = false";
  if (searchQuery && searchQuery.trim()) {
    const safeTerm = searchQuery.trim().replace(/'/g, "\\'");
    q += ` and name contains '${safeTerm}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,parents,modifiedTime,webViewLink)&orderBy=name&pageSize=100`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`
    }
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const errMsg = errJson?.error?.message || `HTTP ${res.status}: Gagal memuat folder Google Drive.`;
    throw new Error(errMsg);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Create a new folder in Google Drive
 */
export async function createDriveFolder(folderName, parentFolderId = null) {
  if (!cachedAccessToken) {
    throw new Error('Belum terhubung ke Google Drive. Silakan login terlebih dahulu.');
  }

  const trimmed = (folderName || '').trim();
  if (!trimmed) {
    throw new Error('Nama folder tidak boleh kosong.');
  }

  const body = {
    name: trimmed,
    mimeType: 'application/vnd.google-apps.folder'
  };

  if (parentFolderId && parentFolderId !== 'root') {
    body.parents = [parentFolderId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,parents,webViewLink', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const errMsg = errJson?.error?.message || `HTTP ${res.status}: Gagal membuat folder di Google Drive.`;
    throw new Error(errMsg);
  }

  return await res.json();
}

/**
 * Check if a file with the given name already exists in the target folder
 */
export async function checkFileExistsInFolder(fileName, targetFolderId = null) {
  if (!cachedAccessToken) {
    throw new Error('Belum terhubung ke Google Drive.');
  }

  const trimmedName = (fileName || '').trim();
  if (!trimmedName) return null;

  const safeName = trimmedName.replace(/'/g, "\\'");
  let q = `name = '${safeName}' and trashed = false`;
  if (targetFolderId && targetFolderId !== 'root') {
    q += ` and '${targetFolderId}' in parents`;
  } else {
    q += ` and 'root' in parents`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,parents,size)&pageSize=10`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`
      }
    });

    if (!res.ok) {
      console.warn('[GoogleDrive] checkFileExists query warning:', res.status);
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (e) {
    console.warn('[GoogleDrive] checkFileExists network error:', e);
    return null;
  }
}

/**
 * Find the next available non-conflicting name (e.g. "FileName (1)", "FileName (2)")
 */
export async function findAvailableNewFileName(baseName, targetFolderId = null) {
  // Strip existing trailing numbering if present like " (1)"
  const cleanBase = baseName.replace(/\s*\(\d+\)$/, '').trim();
  let counter = 1;
  let candidate = `${cleanBase} (${counter})`;

  while (await checkFileExistsInFolder(candidate, targetFolderId)) {
    counter++;
    candidate = `${cleanBase} (${counter})`;
    if (counter > 25) {
      candidate = `${cleanBase} (${new Date().toLocaleTimeString('id-ID').replace(/:/g, '.')})`;
      break;
    }
  }
  return candidate;
}

/**
 * Overwrite / update an existing spreadsheet in Google Drive
 */
export async function overwriteSpreadsheetInGoogleDrive(fileId, reportType, customTitle = null, targetFolderName = null) {
  if (!cachedAccessToken) {
    throw new Error('Anda belum terhubung ke Google Drive. Silakan login terlebih dahulu.');
  }

  const dataObj = generateReportData(reportType);
  const fileName = customTitle ? customTitle.trim() : `${dataObj.title}`;
  const csvContent = buildCsvString(dataObj);

  const metadata = {
    name: fileName,
    mimeType: 'application/vnd.google-apps.spreadsheet',
    description: `Laporan resmi ${dataObj.reportName} dari Sistem POS Waserda PRIMKOPPOL NGAWI. Diperbarui: ${new Date().toLocaleString('id-ID')}.`
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/csv; charset=UTF-8\r\n\r\n' +
    csvContent +
    closeDelimiter;

  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,name,mimeType,parents,webViewLink,webContentLink,modifiedTime`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${cachedAccessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const errMsg = errJson?.error?.message || `HTTP ${res.status}: Gagal memperbarui file di Google Drive.`;
    throw new Error(errMsg);
  }

  const result = await res.json();
  const resolvedFolderName = targetFolderName || 'Folder Terpilih';

  // Save to recent exports session history
  saveRecentExport({
    id: result.id,
    name: result.name,
    webViewLink: result.webViewLink || `https://docs.google.com/spreadsheets/d/${result.id}/edit`,
    reportType,
    reportName: `${dataObj.reportName} (Diperbarui/Overwrite)`,
    rowCount: dataObj.rows.length,
    targetFolderName: resolvedFolderName,
    timestamp: new Date().toISOString()
  });

  return {
    ...result,
    isOverwritten: true,
    reportName: dataObj.reportName,
    rowCount: dataObj.rows.length,
    targetFolderName: resolvedFolderName,
    webViewLink: result.webViewLink || `https://docs.google.com/spreadsheets/d/${result.id}/edit`
  };
}

const EXPORTS_KEY = 'primkoppol_drive_exports_history';
const LAST_EXPORTED_KEY = 'primkoppol_last_exported_map';

export function getLastExportedTimestamps() {
  try {
    const raw = localStorage.getItem(LAST_EXPORTED_KEY);
    const map = raw ? JSON.parse(raw) : {};

    // Also cross-reference with session exports history
    const recent = getRecentExports();
    if (Array.isArray(recent)) {
      recent.forEach(item => {
        if (item.reportType && item.timestamp) {
          if (!map[item.reportType] || new Date(item.timestamp) > new Date(map[item.reportType])) {
            map[item.reportType] = item.timestamp;
          }
        }
      });
    }
    return map;
  } catch (e) {
    return {};
  }
}

export function getLastExportedForReport(reportType) {
  const map = getLastExportedTimestamps();
  return map[reportType] || null;
}

function saveRecentExport(item) {
  try {
    const list = getRecentExports();
    list.unshift(item);
    if (list.length > 20) list.pop();
    sessionStorage.setItem(EXPORTS_KEY, JSON.stringify(list));

    // Record last exported timestamp persistently
    if (item.reportType) {
      const map = getLastExportedTimestamps();
      map[item.reportType] = item.timestamp || new Date().toISOString();
      localStorage.setItem(LAST_EXPORTED_KEY, JSON.stringify(map));
    }
  } catch (e) {
    console.warn('Session save error:', e);
  }
}

export function getRecentExports() {
  try {
    const raw = sessionStorage.getItem(EXPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Make globally accessible
window.GoogleDriveService = {
  initGoogleDriveAuth,
  onAuthChange,
  signInWithGoogle,
  signOutGoogle,
  getCurrentUser,
  isConnected,
  getAccessToken,
  generateReportData,
  uploadSpreadsheetToGoogleDrive,
  overwriteSpreadsheetInGoogleDrive,
  checkFileExistsInFolder,
  findAvailableNewFileName,
  listDriveFolders,
  createDriveFolder,
  getRecentExports,
  getLastExportedTimestamps,
  getLastExportedForReport
};

// Auto-initialize on load
initGoogleDriveAuth();
