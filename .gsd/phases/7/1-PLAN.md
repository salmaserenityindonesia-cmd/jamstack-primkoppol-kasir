---
phase: 7
plan: 7
wave: 7
---

# Plan 7.7: Rombak Urutan Injeksi POS_AUTH & Diagnostic Error Catcher

## Goal Description

Meningkatkan ketahanan (resilience) layar login saat terjadi *fatal error* pada engine database lokal (IndexedDB) atau dependensi lainnya. Fokus perombakan adalah menginjeksi `window.POS_AUTH` seawal mungkin (sebelum proses asinkron database dimulai) agar modul UI di `index.html` tidak *crashing* atau *timeout* secara pasif, serta menambahkan *Diagnostic Error Catcher* yang meneruskan pesan error asli ke UI agar mempermudah *debugging*.

---

## Status Audit Saat Ini

| Komponen | Status |
|---|---|
| Injeksi `window.POS_AUTH` di `src/index.js` | ⚠️ Berada di baris atas, tetapi masih setelah impor `getDatabase()` dan modul lainnya yang bisa melempar error saat evaluasi. |
| Try-Catch di `bootstrap()` | ⚠️ Hanya `getDatabase()` yang di-*catch*, error di level atas modul tidak tertangkap. |
| Pesan Error di Login Screen | ⚠️ Masih *generic* ("Sistem gagal dimuat..."). |

---

## Proposed Changes

---

### Task 1: Injeksi Dini POS_AUTH & Isolasi Crash di Database Engine

#### [MODIFY] [src/index.js](file:///c:/jamstack-primkoppol-kasir/src/index.js)

**Perubahan:**
1. Ekspor `window.POS_AUTH` dilakukan **secara absolut di baris pertama**, sebelum impor modul database dan sinkronisasi.
2. Proses inisialisasi yang berat dibungkus lebih aman dan menetapkan variabel `window.__POS_INIT_ERROR__` jika terjadi *crash*.

```javascript
// INJEKSI DINI (Harus paling atas!)
import { authEngine } from './auth/authEngine.js';
window.POS_AUTH = authEngine;

// Impor lainnya di bawahnya
import { getDatabase } from './db/database.js';
import { validateCreditLimit, processTransaction } from './db/creditEngine.js';
import { processDebtPayment } from './db/settlementEngine.js';
import { syncPendingTransactions, syncProductsToSupabase } from './db/syncEngine.js';

window.POS_DB = { /* ... helper db ... */ };

// ── Init Step Dispatcher ──────────────────────────────────────────────────
function _emitInit(step, percent, message) {
    window.dispatchEvent(new CustomEvent('pos:init-step', {
        detail: { step, percent, message }
    }));
}

// Bootstrap asinkron
(async function bootstrap() {
    try {
        _emitInit('start', 10, 'Memuat bundle JavaScript & modul RxDB...');

        // Step 1: Buka Database lokal
        _emitInit('db-open', 30, 'Membuka database lokal (IndexedDB/Dexie)...');
        try {
            await getDatabase();
            _emitInit('db-ready', 60, 'Database lokal siap.');
        } catch (dbErr) {
            console.error("[Bootstrap] Database Engine Crash:", dbErr);
            window.__POS_INIT_ERROR__ = dbErr.message || String(dbErr);
            throw new Error(`Gagal membuka database lokal: ${window.__POS_INIT_ERROR__}`);
        }

        // Step 2: Auth Ready
        _emitInit('auth-ready', 80, 'Menyiapkan autentikasi & akun default...');

        // Step 3: Cloud Check (tidak blocking)
        _emitInit('cloud-check', 90, 'Memeriksa konektivitas cloud...');

        // Final: SISTEM SIAP
        _emitInit('ready', 100, 'Sistem siap. Silakan masuk.');
        window.__POS_SYSTEM_READY__ = true;
        window.dispatchEvent(new CustomEvent('pos:ready'));
        
    } catch (err) {
        window.__POS_INIT_ERROR__ = err.message || String(err);
        window.dispatchEvent(new CustomEvent('pos:init-error', {
            detail: { message: window.__POS_INIT_ERROR__ }
        }));
    }
})();
```

Jalankan `npm run build` setelah mengubah file ini.

---

### Task 2: Diagnostic Error Catcher di `index.html`

#### [MODIFY] [index.html](file:///c:/jamstack-primkoppol-kasir/index.html)

**Perubahan:**
1. Tambahkan mekanisme di `index.html` untuk menangkap variabel `window.__POS_INIT_ERROR__` dan menampilkannya di `#init-error-detail` agar teknisi bisa langsung melihat letak masalahnya tanpa membuka DevTools.
2. Pastikan error handler langsung mengambil alih tampilan jika error terjadi lebih awal dari batas 8 detik.

```javascript
// ... di dalam script inisialisasi login modal ...

    // Tangkap pos:init-error — tampilkan panel error + tombol reload
    window.addEventListener('pos:init-error', function(e) {
      // Jika sistem sebenarnya sudah siap, abaikan error init
      if (window.__POS_SYSTEM_READY__) return;
      
      const bar = document.getElementById('init-progress-bar');
      if (bar) { bar.style.width = '100%'; bar.classList.remove('bg-primary'); bar.classList.add('bg-red-500'); }
      const spinner = document.getElementById('init-spinner');
      if (spinner) { spinner.textContent = 'error'; spinner.classList.remove('animate-spin','text-primary'); spinner.classList.add('text-red-500'); }
      const txt = document.getElementById('init-status-text');
      if (txt) { txt.textContent = 'Inisialisasi gagal.'; txt.classList.add('text-red-600'); }
      const panel = document.getElementById('init-error-panel');
      if (panel) panel.classList.remove('hidden');
      
      const detail = document.getElementById('init-error-detail');
      // Utamakan pesan error asli dari engine
      const errorMessage = window.__POS_INIT_ERROR__ || e.detail?.message || 'Unknown fatal error.';
      if (detail) detail.textContent = errorMessage;
    });

    // ── Timeout 8 detik — jika sistem tidak siap, tampilkan error ────────
    (function initTimeout() {
      setTimeout(function() {
        if (!window.__POS_SYSTEM_READY__) {
          const timeoutMessage = window.__POS_INIT_ERROR__ || 'Timeout: modul tidak merespons dalam 8 detik. Cek koneksi atau IndexedDB browser.';
          window.dispatchEvent(new CustomEvent('pos:init-error', {
            detail: { message: timeoutMessage }
          }));
        }
      }, 8000);
    })();
```

---

## Verification Plan

1. **Uji Sukses:** Muat ulang aplikasi, pastikan sistem berjalan mulus dan form masuk langsung aktif.
2. **Uji Simulasi Error:** Blokir akses ke IndexedDB melalui DevTools (Atau paksa lemparkan error di dalam `getDatabase()`) untuk melihat apakah form login menangkap pesan error diagnostiknya dan menampilkannya di panel merah.

---

*Plan dikunci. Tunggu persetujuan pengguna sebelum implementasi kode dimulai.*
