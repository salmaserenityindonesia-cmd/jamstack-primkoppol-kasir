import { getDatabase } from './db/database.js';
import { validateCreditLimit, processTransaction } from './db/creditEngine.js';
import { processDebtPayment } from './db/settlementEngine.js';
import { syncPendingTransactions, syncProductsToSupabase } from './db/syncEngine.js';

window.POS_DB = {
    getDatabase,
    validateCreditLimit,
    processTransaction,
    processDebtPayment,
    triggerSync: syncPendingTransactions,
    syncProducts: syncProductsToSupabase,

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
