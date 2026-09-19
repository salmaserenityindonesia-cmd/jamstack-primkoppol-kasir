import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { memberSchema, transactionSchema } from './schemas.js';
import { startPeriodicSync } from './syncEngine.js';

addRxPlugin(RxDBLeaderElectionPlugin);

let dbInstance = null;

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
            }
        });

        dbInstance.waitForLeadership().then(() => {
            console.log('[RxDB] Tab ini terpilih sebagai LEADER. Memulai worker sinkronisasi Supabase...');
            startPeriodicSync();
        });
    }

    return dbInstance;
}

