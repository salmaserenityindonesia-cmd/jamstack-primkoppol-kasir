import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { createClient } from '@supabase/supabase-js';
import { memberSchema, transactionSchema } from './schema.js';

// Register Leader Election plugin (BroadcastChannel-based)
addRxPlugin(RxDBLeaderElectionPlugin);

if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    addRxPlugin(RxDBDevModePlugin);
}

export let supabase = null;

let dbPromise = null;

export const initDatabase = async () => {
    if (!dbPromise) {
        dbPromise = (async () => {
            // Fetch credentials dynamically from server
            try {
                const envRes = await fetch('/api/env');
                const env = await envRes.json();
                if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
                    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
                } else {
                    console.warn('Supabase credentials missing from /api/env');
                }
            } catch (err) {
                console.error('Failed to fetch environment variables', err);
            }

            const db = await createRxDatabase({
                name: 'primkoppol_pos_db',
                storage: getRxStorageDexie(),
                multiInstance: true,   // Cross-tab sync via BroadcastChannel
                eventReduce: true      // Optimasi event processing
            });

            await db.addCollections({
                members: { schema: memberSchema },
                transactions: { schema: transactionSchema }
            });

            // Leader Election: hanya tab Leader yang menjalankan sinkronisasi Supabase
            if (supabase) {
                db.waitForLeadership().then(() => {
                    console.log('[RxDB] Leader elected — starting Supabase sync');
                    startMemberSync(db);
                    startTransactionOutbox(db);
                });
            }

            return db;
        })();
    }
    return dbPromise;
};

// Sinkronisasi data Anggota dari Cloud ke Lokal
async function startMemberSync(db) {
    try {
        const { data: remoteMembers } = await supabase.from('members').select('*');
        if (remoteMembers) {
            for (const m of remoteMembers) {
                await db.members.upsert(m);
            }
        }
    } catch (err) {
        console.warn('Mode offline: Menggunakan cache members lokal.', err);
    }
}

// Background Queue: Kirim transaksi lokal (is_synced = false) ke Cloud (FIFO)
async function startTransactionOutbox(db) {
    setInterval(async () => {
        if (!navigator.onLine) return; // Jika internet mati, antrean ditahan[cite: 7, 10]

        const pending = await db.transactions.find({
            selector: { is_synced: false }
        }).exec();

        for (const trx of pending) {
            const payload = trx.toJSON();
            delete payload.is_synced;

            const { error } = await supabase.from('transactions').upsert(payload);
            if (!error) {
                await trx.patch({ is_synced: true }); // Tandai sukses tersinkron[cite: 7]
            }
        }
    }, 10000); // Polling setiap 10 detik
}