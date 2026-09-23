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
