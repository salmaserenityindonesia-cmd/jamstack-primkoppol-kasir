import { getDatabase } from './db/database.js';
import { validateCreditLimit, processTransaction } from './db/creditEngine.js';
import { processDebtPayment } from './db/settlementEngine.js';
import { syncPendingTransactions, syncProductsToSupabase } from './db/syncEngine.js';
import { authEngine } from './auth/authEngine.js';
// Ekspos Auth Engine ke global scope
window.POS_AUTH = authEngine;

window.POS_DB = {
    getDatabase,
    validateCreditLimit,
    processTransaction,
    processDebtPayment,
    triggerSync: syncPendingTransactions,
    syncProducts: syncProductsToSupabase,

    // === Member helpers ===

    async getMembers(filter = {}) {
        const db = await getDatabase();
        const query = {};
        if (filter.status && filter.status !== 'all') {
            query.status = filter.status;
        }
        return db.members.find({ selector: query }).exec();
    },

    async subscribeMembers(callback) {
        const db = await getDatabase();
        return db.members.find().$.subscribe(members => callback(members));
    },

    async upsertMember(memberData) {
        const db = await getDatabase();
        const doc = await db.members.upsert({
            ...memberData,
            updated_at: new Date().toISOString()
        });
        return doc;
    },

    async deactivateMember(memberId) {
        const db = await getDatabase();
        const member = await db.members.findOne(memberId).exec();
        if (member) {
            return member.patch({
                status: 'inactive',
                updated_at: new Date().toISOString()
            });
        }
        return null;
    },

    async reactivateMember(memberId) {
        const db = await getDatabase();
        const member = await db.members.findOne(memberId).exec();
        if (member) {
            return member.patch({
                status: 'active',
                updated_at: new Date().toISOString()
            });
        }
        return null;
    },

    // === Product helpers ===

    // Ambil semua produk (one-shot)
    async getProducts() {
        const db = await getDatabase();
        return db.products.find().exec();
    },

    // Langganan reaktif — callback dipanggil setiap kali koleksi berubah
    async subscribeProducts(callback) {
        const db = await getDatabase();
        return db.products.find().$.subscribe(products => callback(products));
    },

    // Insert-or-update produk
    async upsertProduct(productData) {
        const db = await getDatabase();
        const doc = await db.products.upsert({
            ...productData,
            updated_at: new Date().toISOString()
        });
        
        // Asynchronously sync to Supabase (fire and forget)
        syncProductsToSupabase();
        
        return doc;
    }
};



// ── Init Step Dispatcher ──────────────────────────────────────────────────
function _emitInit(step, percent, message) {
    window.dispatchEvent(new CustomEvent('pos:init-step', {
        detail: { step, percent, message }
    }));
}

// Bootstrap asinkron — emit step events selama inisialisasi
(async function bootstrap() {
    try {
        _emitInit('start', 10, 'Memuat bundle JavaScript & modul RxDB...');

        // Step 1: Inisialisasi database RxDB
        _emitInit('db-open', 30, 'Membuka database lokal (IndexedDB/Dexie)...');
        try {
            await getDatabase();
            _emitInit('db-ready', 60, 'Database lokal siap.');
        } catch (dbErr) {
            console.error("[Bootstrap] Database Engine Crash:", dbErr);
            window.__POS_INIT_ERROR__ = dbErr.message || String(dbErr);
            throw new Error(`Gagal membuka database lokal: ${window.__POS_INIT_ERROR__}`);
        }

        // Step 2: Auth engine sudah ready (sinkron)
        _emitInit('auth-ready', 80, 'Menyiapkan autentikasi & akun default...');

        // Step 3: Cek konektivitas (fire-and-forget, tidak blocking)
        _emitInit('cloud-check', 90, 'Memeriksa konektivitas cloud...');
        // (sync engine sudah dihandle via waitForLeadership di database.js)

        // Final: sistem siap
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
