import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { memberSchema, transactionSchema, productSchema, userSchema } from './schemas.js';
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

// Seeder: buat akun admin default jika koleksi users masih kosong
async function seedAdminUser(db) {
    const existing = await db.users.find().exec();
    if (existing.length > 0) return;

    // Hash 'primkoppol' via SubtleCrypto
    const encoder = new TextEncoder();
    const data = encoder.encode('primkoppol');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    try {
        await db.users.insert({
            id            : 'admin-001',
            email         : 'salmaserenityindonesia@gmail.com',
            name          : 'Super Administrator',
            password_hash : passwordHash,
            role          : 'admin',
            status        : 'active',
            permissions   : [],
            updated_at    : new Date().toISOString()
        });
        console.log('[RxDB] Seeder: akun admin default berhasil dibuat.');
    } catch (err) {
        console.error('[RxDB] Gagal insert admin seeder:', err);
    }
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
            },
            users: {
                schema: userSchema
            }
        });

        // Tarik data awal dari Supabase
        await pullInitialProductsFromSupabase(dbInstance);
        // Jalankan seeder produk awal (hanya akan berjalan jika koleksi masih kosong)
        await seedProducts(dbInstance);
        // Jalankan seeder admin (hanya jika koleksi users masih kosong)
        await seedAdminUser(dbInstance);

        // Tunggu kepemimpinan secara asinkron tanpa memblokir dbInstance
        dbInstance.waitForLeadership().then(() => {
            console.log('[RxDB] Tab ini menjadi Leader. Memulai background sync...');
            startPeriodicSync(dbInstance);
        }).catch(err => console.error('[RxDB] Leader election error:', err));

        return dbInstance;
    }

    return dbInstance;
}
