/**
 * test-credit-queue.mjs
 * Pengujian empiris aturan limit kredit koperasi dan antrean FIFO transaksi.
 * Menggunakan RxDB in-memory storage agar berjalan di Node.js tanpa IndexedDB.
 */

import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';

// ─── Schemas (inline untuk menghindari import chain ke database.js/Dexie) ───

const memberSchema = {
    title: 'member schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        name: { type: 'string' },
        unit: { type: 'string' },
        credit_limit: { type: 'number' },
        current_debt: { type: 'number' },
        mandatory_savings: { type: 'number' },
        status: { type: 'string' },
        updated_at: { type: 'string' }
    },
    required: ['id', 'name', 'unit', 'credit_limit', 'current_debt', 'mandatory_savings', 'status']
};

const transactionSchema = {
    title: 'transaction schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        invoice_number: { type: 'string' },
        member_id: { type: ['string', 'null'] },
        total_amount: { type: 'number' },
        payment_type: { type: 'string' },
        sync_status: { type: 'string' },
        timestamp: { type: 'string' },
        items: { type: 'array', items: { type: 'object' } }
    },
    required: ['id', 'invoice_number', 'total_amount', 'payment_type', 'sync_status', 'timestamp', 'items']
};

// ─── Assert helper ───────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`  ❌ GAGAL: ${message}`);
        failed++;
    } else {
        console.log(`  ✅ LOLOS: ${message}`);
        passed++;
    }
}

// ─── Business Logic (inline, sesuai src/db/creditEngine.js) ──────────────────

async function validateCreditLimit(db, memberId, newPurchaseAmount) {
    const member = await db.members.findOne(memberId).exec();
    if (!member || member.status === 'blocked') {
        return { allowed: false, reason: 'Anggota tidak aktif atau diblokir.' };
    }
    const projectedDebt = member.current_debt + newPurchaseAmount;
    if (projectedDebt > member.credit_limit) {
        return {
            allowed: false,
            reason: 'Limit Kredit Terlampaui',
            current_debt: member.current_debt,
            limit: member.credit_limit,
            projected: projectedDebt
        };
    }
    return { allowed: true, remaining: member.credit_limit - projectedDebt };
}

async function processTransaction(db, payload) {
    const { invoice_number, member_id, total_amount, payment_type, items } = payload;
    if (payment_type === 'credit') {
        const validation = await validateCreditLimit(db, member_id, total_amount);
        if (!validation.allowed) {
            throw new Error(`Validasi gagal: ${validation.reason}`);
        }
    }
    const timestamp = new Date().toISOString();
    const transaction = await db.transactions.insert({
        id: invoice_number,
        invoice_number,
        member_id: member_id || null,
        total_amount,
        payment_type,
        sync_status: 'PENDING',
        timestamp,
        items: items || []
    });
    if (payment_type === 'credit') {
        const member = await db.members.findOne(member_id).exec();
        await member.incrementalPatch({ current_debt: member.current_debt + total_amount });
    }
    return transaction;
}

async function processDebtPayment(db, { memberId, paymentAmount, noteId, savingsAmount = 0 }) {
    const member = await db.members.findOne(memberId).exec();
    if (!member) throw new Error('Anggota tidak ditemukan.');
    const newDebt = Math.max(0, member.current_debt - paymentAmount);
    let newStatus = member.status;
    if (newDebt <= member.credit_limit) newStatus = 'active';
    await member.incrementalPatch({
        current_debt: newDebt,
        mandatory_savings: (member.mandatory_savings || 0) + savingsAmount,
        status: newStatus
    });
    const timestamp = new Date().toISOString();
    const transaction = await db.transactions.insert({
        id: noteId,
        invoice_number: noteId,
        member_id: memberId,
        total_amount: paymentAmount + savingsAmount,
        payment_type: 'debt_payment',
        sync_status: 'PENDING',
        timestamp,
        items: [{ type: 'debt', amount: paymentAmount }, { type: 'savings', amount: savingsAmount }]
    });
    return transaction;
}

// ─── Test Runner ─────────────────────────────────────────────────────────────

async function run() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' GSD ► TEST: Limit Kredit & Antrean FIFO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const db = await createRxDatabase({
        name: 'test_credit_db',
        storage: getRxStorageMemory(),
        multiInstance: false
    });
    await db.addCollections({
        members: { schema: memberSchema },
        transactions: { schema: transactionSchema }
    });

    // Seed data dummy anggota
    await db.members.insert({
        id: 'ANG-0012',
        name: 'Budi Santoso',
        unit: 'Divisi Logistik',
        credit_limit: 1000000,
        current_debt: 800000,
        mandatory_savings: 0,
        status: 'active'
    });
    console.log('[Setup] Anggota ANG-0012 diinisialisasi: limit Rp 1.000.000, piutang Rp 800.000, status: active\n');

    // ─── Skenario 1: Belanja kredit Rp 300.000 → HARUS DITOLAK (800.000 + 300.000 = 1.100.000 > 1.000.000)
    console.log('[Skenario 1] Belanja kredit Rp 300.000 — seharusnya DITOLAK (over limit)');
    let scenario1Error = null;
    try {
        await processTransaction(db, {
            invoice_number: 'INV-001',
            member_id: 'ANG-0012',
            total_amount: 300000,
            payment_type: 'credit',
            items: [{ name: 'Sembako', qty: 1, price: 300000 }]
        });
    } catch (err) {
        scenario1Error = err;
    }
    assert(scenario1Error !== null, 'Transaksi Rp 300.000 berhasil diblokir (auto-reject).');
    assert(
        scenario1Error && scenario1Error.message.includes('Limit Kredit Terlampaui'),
        `Pesan error sesuai: "${scenario1Error?.message}"`
    );

    // ─── Skenario 2: Belanja kredit Rp 150.000 → HARUS DITERIMA (800.000 + 150.000 = 950.000 ≤ 1.000.000)
    console.log('\n[Skenario 2] Belanja kredit Rp 150.000 — seharusnya DITERIMA');
    let successTrx = null;
    try {
        successTrx = await processTransaction(db, {
            invoice_number: 'INV-002',
            member_id: 'ANG-0012',
            total_amount: 150000,
            payment_type: 'credit',
            items: [{ name: 'Minyak', qty: 1, price: 150000 }]
        });
    } catch (err) {
        console.error('  ❌ Error tidak terduga:', err.message);
    }
    assert(successTrx !== null, 'Transaksi Rp 150.000 berhasil diproses.');
    assert(successTrx?.sync_status === 'PENDING', 'Transaksi masuk antrean dengan sync_status: PENDING (FIFO).');

    const memberAfterPurchase = await db.members.findOne('ANG-0012').exec();
    assert(memberAfterPurchase.current_debt === 950000, `Piutang terupdate menjadi Rp 950.000 (aktual: Rp ${memberAfterPurchase.current_debt})`);

    // ─── Skenario 3: Pelunasan Rp 500.000 → piutang berkurang, limit pulih
    console.log('\n[Skenario 3] Pelunasan piutang Rp 500.000 — piutang harus berkurang dan limit pulih');
    let paymentTrx = null;
    try {
        paymentTrx = await processDebtPayment(db, {
            memberId: 'ANG-0012',
            paymentAmount: 500000,
            noteId: 'NOTA-PAY-001',
            savingsAmount: 0
        });
    } catch (err) {
        console.error('  ❌ Error tidak terduga:', err.message);
    }
    assert(paymentTrx !== null, 'Transaksi pelunasan Rp 500.000 berhasil diproses.');
    assert(paymentTrx?.sync_status === 'PENDING', 'Pelunasan masuk antrean dengan sync_status: PENDING.');

    const memberAfterPayment = await db.members.findOne('ANG-0012').exec();
    assert(memberAfterPayment.current_debt === 450000, `Piutang berkurang menjadi Rp 450.000 (aktual: Rp ${memberAfterPayment.current_debt})`);
    assert(memberAfterPayment.status === 'active', 'Status anggota tetap/kembali active setelah pelunasan (auto-unblock).');

    // ─── Verifikasi Antrean FIFO ───────────────────────────────────────────
    console.log('\n[Verifikasi Antrean FIFO] Periksa urutan transaksi PENDING...');
    const pendingTrx = await db.transactions.find({
        selector: { sync_status: 'PENDING' },
        sort: [{ timestamp: 'asc' }]
    }).exec();
    assert(pendingTrx.length === 2, `2 transaksi PENDING ditemukan di antrean (aktual: ${pendingTrx.length}).`);
    assert(pendingTrx[0].id === 'INV-002', `Transaksi pertama di antrean FIFO: ${pendingTrx[0].id} (seharusnya INV-002).`);
    assert(pendingTrx[1].id === 'NOTA-PAY-001', `Transaksi kedua di antrean FIFO: ${pendingTrx[1].id} (seharusnya NOTA-PAY-001).`);

    await db.close();

    // ─── Laporan Akhir ───────────────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(` Hasil: ${passed} lolos, ${failed} gagal`);
    if (failed > 0) {
        console.log(' ❌ ADA SKENARIO GAGAL');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        process.exit(1);
    } else {
        console.log(' ✅ SEMUA SKENARIO LIMIT KREDIT & FIFO LOLOS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
}

run().catch(err => {
    console.error('❌ Error tidak terduga:', err);
    process.exit(1);
});
