/**
 * supervisorEngine.js
 * Engine delta-cache untuk PWA Pengawas Primkoppol.
 * Menggunakan IndexedDB lokal untuk menyimpan snapshot data
 * dan hanya merender delta perubahan untuk hemat bandwidth.
 */

const DB_NAME = 'koppol_supervisor_cache';
const DB_VERSION = 1;
const STORE_TRANSACTIONS = 'transactions_snapshot';
const STORE_MEMBERS = 'members_snapshot';
const STORE_META = 'sync_meta';

let idb = null;

// ─── IndexedDB Setup ──────────────────────────────────────────────────────────

async function openIDB() {
    if (idb) return idb;
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
                db.createObjectStore(STORE_TRANSACTIONS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_MEMBERS)) {
                db.createObjectStore(STORE_MEMBERS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_META)) {
                db.createObjectStore(STORE_META, { keyPath: 'key' });
            }
        };
        req.onsuccess = (e) => { idb = e.target.result; resolve(idb); };
        req.onerror = () => reject(req.error);
    });
}

async function idbPutAll(storeName, records) {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        records.forEach(r => tx.objectStore(storeName).put(r));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function idbGetAll(storeName) {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const req = tx.objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idbGetMeta(key) {
    const db = await openIDB();
    return new Promise((resolve) => {
        const req = db.transaction(STORE_META, 'readonly').objectStore(STORE_META).get(key);
        req.onsuccess = () => resolve(req.result?.value || null);
        req.onerror = () => resolve(null);
    });
}

async function idbSetMeta(key, value) {
    const db = await openIDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_META, 'readwrite');
        tx.objectStore(STORE_META).put({ key, value });
        tx.oncomplete = () => resolve();
    });
}

// ─── Supabase Data Fetcher ────────────────────────────────────────────────────

let supabaseClient = null;

async function getSupabase() {
    if (supabaseClient) return supabaseClient;
    try {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.116.0');
        const res = await fetch('/api/env');
        const env = await res.json();
        if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
            supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
        }
    } catch (e) {
        console.warn('[SupervisorEngine] Tidak dapat menginisialisasi Supabase:', e.message);
    }
    return supabaseClient;
}

// ─── Delta Sync ───────────────────────────────────────────────────────────────

/**
 * Ambil data dari Supabase, bandingkan dengan snapshot lokal IndexedDB,
 * dan hanya render baris yang berubah (delta).
 */
export async function syncDeltaData() {
    const sb = await getSupabase();
    if (!sb) {
        console.warn('[SupervisorEngine] Offline — menggunakan cache lokal IndexedDB.');
        return { 
            transactions: await idbGetAll(STORE_TRANSACTIONS),
            members: await idbGetAll(STORE_MEMBERS),
            source: 'cache'
        };
    }

    const lastSync = await idbGetMeta('last_sync_at');
    const today = new Date().toISOString().slice(0, 10);

    // Ambil transaksi hari ini saja (delta dari lastSync)
    let txQuery = sb.from('transactions').select('*').gte('timestamp', today + 'T00:00:00').order('timestamp', { ascending: false });
    if (lastSync) txQuery = txQuery.gt('timestamp', lastSync);

    const { data: newTransactions } = await txQuery.limit(200);
    const { data: allMembers } = await sb.from('members').select('id, name, unit, credit_limit, current_debt, status').order('name');

    // Simpan delta ke IndexedDB
    if (newTransactions?.length) await idbPutAll(STORE_TRANSACTIONS, newTransactions);
    if (allMembers?.length) await idbPutAll(STORE_MEMBERS, allMembers);
    await idbSetMeta('last_sync_at', new Date().toISOString());

    const cachedTransactions = await idbGetAll(STORE_TRANSACTIONS);
    return { transactions: cachedTransactions, members: allMembers || [], source: 'cloud+cache' };
}

// ─── Metric Calculators ───────────────────────────────────────────────────────

export function computeMetrics(transactions, members) {
    const today = new Date().toISOString().slice(0, 10);
    const todayTrx = transactions.filter(t => t.timestamp?.startsWith(today));

    const totalCash = todayTrx.filter(t => t.payment_type === 'cash').reduce((s, t) => s + (t.total_amount || 0), 0);
    const totalCredit = todayTrx.filter(t => t.payment_type === 'credit').reduce((s, t) => s + (t.total_amount || 0), 0);
    const totalDebtPayment = todayTrx.filter(t => t.payment_type === 'debt_payment').reduce((s, t) => s + (t.total_amount || 0), 0);

    const blockedMembers = (members || []).filter(m => m.status === 'blocked' || m.current_debt > m.credit_limit);
    const pendingSync = transactions.filter(t => t.sync_status === 'PENDING');

    return {
        totalTransactionsToday: todayTrx.length,
        totalCash,
        totalCredit,
        totalDebtPayment,
        totalRevenueToday: totalCash + totalCredit + totalDebtPayment,
        blockedMembers,
        pendingSync: pendingSync.length,
        auditLog: todayTrx.slice(0, 50)
    };
}

export function formatIDR(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
}
