import { getDatabase } from './db/database.js';
import { validateCreditLimit, processTransaction } from './db/creditEngine.js';
import { processDebtPayment } from './db/settlementEngine.js';
import { syncPendingTransactions } from './db/syncEngine.js';

window.POS_DB = {
    getDatabase,
    validateCreditLimit,
    processTransaction,
    processDebtPayment,
    triggerSync: syncPendingTransactions
};
