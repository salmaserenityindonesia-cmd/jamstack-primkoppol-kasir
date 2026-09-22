import { createClient } from '@supabase/supabase-js';
import { getDatabase } from './database.js';

// Setup Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function syncPendingTransactions() {
    try {
        if (!navigator.onLine) {
            console.log('[SyncEngine] Offline. Menunggu koneksi pulih...');
            return;
        }

        const db = await getDatabase();
        
        // Find pending transactions (FIFO via timestamp asc)
        const pendingDocs = await db.transactions.find({
            selector: {
                sync_status: 'PENDING'
            },
            sort: [{ timestamp: 'asc' }]
        }).exec();

        if (pendingDocs.length === 0) {
            return;
        }

        console.log(`[SyncEngine] Ditemukan ${pendingDocs.length} transaksi PENDING. Memulai sinkronisasi...`);

        for (const doc of pendingDocs) {
            const payload = doc.toJSON();
            const { id, invoice_number, member_id, total_amount, payment_type, timestamp, items } = payload;
            
            const { error } = await supabase
                .from('transactions')
                .insert([{
                    id, 
                    invoice_number, 
                    member_id, 
                    total_amount, 
                    payment_type, 
                    timestamp, 
                    items
                }]);

            if (error) {
                console.error(`[SyncEngine] Gagal sinkronisasi transaksi ${id}:`, error.message);
                // Berhenti sejenak, akan dicoba lagi siklus berikutnya untuk menjamin urutan FIFO
                break; 
            } else {
                console.log(`[SyncEngine] Transaksi ${id} berhasil dikirim.`);
                await doc.incrementalPatch({
                    sync_status: 'SENT'
                });
            }
        }
    } catch (err) {
        console.warn('[SyncEngine] Network/Sync error terselesaikan secara graceful:', err);
    }
}

export async function syncProductsToSupabase() {
    try {
        if (!navigator.onLine) {
            console.log('[SyncEngine] Offline. Menunggu koneksi pulih...');
            return;
        }

        const db = await getDatabase();
        const products = await db.products.find().exec();

        if (products.length === 0) {
            return;
        }

        console.log(`[SyncEngine] Memulai sinkronisasi ${products.length} produk ke Supabase...`);

        const payload = products.map(doc => {
            const data = doc.toJSON();
            return {
                barcode: data.barcode,
                sku: data.sku,
                name: data.name,
                category: data.category || null,
                unit: data.unit || null,
                cost_price: data.cost_price || 0,
                price: data.price || 0,
                stock: data.stock || 0,
                is_active: data.is_active !== false
            };
        });

        const { error } = await supabase
            .from('products')
            .upsert(payload, { onConflict: 'barcode' });

        if (error) {
            console.error('[SyncEngine] Gagal sinkronisasi produk:', error.message);
        } else {
            console.log('[SyncEngine] Sinkronisasi produk berhasil!');
        }
    } catch (err) {
        console.error('[SyncEngine] Terjadi kesalahan saat sinkronisasi produk:', err);
    }
}

export async function pullInitialProductsFromSupabase(db) {
    try {
        if (!navigator.onLine) {
            console.log('[SyncEngine] Offline. Menunda pull initial products.');
            return;
        }

        const existingCount = await db.products.find().exec();
        if (existingCount.length > 0) {
            console.log('[SyncEngine] Koleksi lokal sudah ada. Skip initial pull.');
            return;
        }

        console.log('[SyncEngine] Koleksi lokal kosong. Menarik data awal dari Supabase...');
        const { data, error } = await supabase.from('products').select('*');

        if (error) {
            console.error('[SyncEngine] Gagal pull data dari Supabase:', error.message);
            return;
        }

        if (data && data.length > 0) {
            const formattedData = data.map(item => ({
                barcode: item.barcode,
                sku: item.sku,
                name: item.name,
                category: item.category,
                unit: item.unit,
                cost_price: item.cost_price,
                price: item.price,
                stock: item.stock,
                is_active: item.is_active,
                updated_at: item.updated_at || new Date().toISOString()
            }));

            await db.products.bulkUpsert(formattedData);
            console.log(`[SyncEngine] Berhasil mengimpor ${formattedData.length} produk ke lokal.`);
        } else {
            console.log('[SyncEngine] Tidak ada data produk di Supabase untuk diimpor.');
        }
    } catch (err) {
        console.error('[SyncEngine] Terjadi kesalahan saat initial pull produk:', err);
    }
}

let syncInterval = null;

export function startPeriodicSync(intervalMs = 10000) {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    // Initial Sync
    syncPendingTransactions();

    // Loop interval
    syncInterval = setInterval(() => {
        syncPendingTransactions();
    }, intervalMs);

    // Event listener jika online kembali
    window.addEventListener('online', () => {
        console.log('[SyncEngine] Koneksi online kembali. Memicu sinkronisasi instan...');
        syncPendingTransactions();
    });
}
