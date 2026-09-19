import { getDatabase } from './database.js';

export async function processDebtPayment({ memberId, paymentAmount, noteId, savingsAmount = 0 }) {
    const db = await getDatabase();
    const member = await db.members.findOne(memberId).exec();

    if (!member) {
        throw new Error("Anggota tidak ditemukan.");
    }

    const newDebt = Math.max(0, member.current_debt - paymentAmount);
    
    let newStatus = member.status;
    if (newDebt <= member.credit_limit) {
        newStatus = 'active'; // auto-unblock
    }

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
        items: [
            { type: 'debt', amount: paymentAmount },
            { type: 'savings', amount: savingsAmount }
        ]
    });

    return transaction;
}
