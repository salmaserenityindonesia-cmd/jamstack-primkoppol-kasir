export const memberSchema = {
    title: 'member schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 50 },
        name: { type: 'string' },
        work_unit: { type: 'string' },
        credit_limit: { type: 'number' },
        current_debt: { type: 'number' },
        status: { type: 'string' },
        updated_at: { type: 'string' }
    },
    required: ['id', 'name', 'credit_limit', 'current_debt', 'status']
};

export const transactionSchema = {
    title: 'transaction schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 50 },
        receipt_no: { type: 'string' },
        member_id: { type: 'string' },
        total_amount: { type: 'number' },
        payment_method: { type: 'string' },
        items: { type: 'array' },
        cashier_name: { type: 'string' },
        is_synced: { type: 'boolean' },
        created_at: { type: 'string' },
        updated_at: { type: 'string' }
    },
    required: ['id', 'receipt_no', 'total_amount', 'payment_method', 'is_synced']
};