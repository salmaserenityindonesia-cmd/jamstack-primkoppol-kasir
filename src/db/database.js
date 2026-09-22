import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { memberSchema, transactionSchema, productSchema } from './schemas.js';
import { startPeriodicSync, pullInitialProductsFromSupabase } from './syncEngine.js';

addRxPlugin(RxDBLeaderElectionPlugin);

let dbInstance = null;

// Seeder: masukkan data produk awal jika koleksi masih kosong
async function seedProducts(db) {
    const existing = await db.products.find().exec();
    if (existing.length > 0) return;

    const now = new Date().toISOString();
    const seedData = [
        {
            barcode: '899987654',
            sku: 'BRS-PRM-5KG',
            name: 'Beras Premium 5kg',
            price: 65000,
            cost_price: 60000,
            stock: 45,
            unit: 'Pcs',
            category: 'Pangan Pokok',
            updated_at: now
        },
        {
            barcode: '899123456',
            sku: 'MYK-GRG-2L',
            name: 'Minyak Goreng 2L',
            price: 35000,
            cost_price: 32000,
            stock: 2,
            unit: 'Pcs',
            category: 'Sembako',
            updated_at: now
        },
        {
            barcode: '899345678',
            sku: 'GLP-KRS-1KG',
            name: 'Gula Pasir Kristal 1kg',
            price: 16000,
            cost_price: 14500,
            stock: 80,
            unit: 'Pcs',
            category: 'Sembako',
            updated_at: now
        },
        {
            barcode: '899456789',
            sku: 'TPG-TRG-1KG',
            name: 'Tepung Terigu Serbaguna 1kg',
            price: 13000,
            cost_price: 11000,
            stock: 3,
            unit: 'Pcs',
            category: 'Bahan Kue',
            updated_at: now
        }
    ];

    for (const product of seedData) {
        try {
            await db.products.insert(product);
        } catch (err) {
            console.error('[RxDB] Gagal insert produk seeder:', product.name, err);
        }
    }
    console.log('[RxDB] Seeder: 4 produk awal selesai diproses.');
}

export async function getDatabase() {
    if (!dbInstance) {
        dbInstance = await createRxDatabase({
            name: 'primkoppol_pos_db',
            storage: getRxStorageDexie(),
            multiInstance: true,
            eventReduce: true
        });

        await dbInstance.addCollections({
            members: {
                schema: memberSchema
            },
            transactions: {
                schema: transactionSchema
            },
            products: {
                schema: productSchema
            }
        });

        // Tarik data awal dari Supabase
        await pullInitialProductsFromSupabase(dbInstance);
        // Jalankan seeder produk awal (hanya akan berjalan jika koleksi masih kosong)
        await seedProducts(dbInstance);

        // Tunggu kepemimpinan secara asinkron tanpa memblokir dbInstance
        dbInstance.waitForLeadership().then(() => {
            console.log('[RxDB] Tab ini menjadi Leader. Memulai background sync...');
            startPeriodicSync(dbInstance);
        }).catch(err => console.error('[RxDB] Leader election error:', err));

        return dbInstance;
    }

    return dbInstance;
}
