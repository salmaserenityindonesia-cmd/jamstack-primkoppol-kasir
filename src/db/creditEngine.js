import { getDatabase } from './database.js';

export async function validateCreditLimit(memberId, newPurchaseAmount) {
    const db = await getDatabase();
    const member = await db.members.findOne(memberId).exec();

    if (!member || member.status === 'blocked') {
        return { allowed: false, reason: "Anggota tidak aktif atau diblokir." };
    }

    const projectedDebt = member.current_debt + newPurchaseAmount;

    if (projectedDebt > member.credit_limit) {
        return { 
            allowed: false, 
            reason: "Limit Kredit Terlampaui", 
            current_debt: member.current_debt, 
            limit: member.credit_limit, 
            projected: projectedDebt 
        };
    }

    return { allowed: true, remaining: member.credit_limit - projectedDebt };
}

export async function processTransaction(payload) {
    const { invoice_number, member_id, total_amount, payment_type, items } = payload;
    
    if (payment_type === 'credit') {
        const validation = await validateCreditLimit(member_id, total_amount);
        if (!validation.allowed) {
            throw new Error(`Validasi gagal: ${validation.reason}`);
        }
    }

    const db = await getDatabase();
    
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
        await member.incrementalPatch({
            current_debt: member.current_debt + total_amount
        });
    }

    return transaction;
}
