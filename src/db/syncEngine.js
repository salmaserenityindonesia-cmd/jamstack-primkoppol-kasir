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
