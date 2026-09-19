export const memberSchema = {
    title: 'member schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        name: {
            type: 'string'
        },
        unit: {
            type: 'string'
        },
        credit_limit: {
            type: 'number'
        },
        current_debt: {
            type: 'number'
        },
        mandatory_savings: {
            type: 'number'
        },
        status: {
            type: 'string' // active/blocked
        },
        updated_at: {
            type: 'string'
        }
    },
    required: ['id', 'name', 'unit', 'credit_limit', 'current_debt', 'mandatory_savings', 'status']
};

export const transactionSchema = {
    title: 'transaction schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        invoice_number: {
            type: 'string'
        },
        member_id: {
            type: ['string', 'null'] // nullable
        },
        total_amount: {
            type: 'number'
        },
        payment_type: {
            type: 'string' // cash/credit/debt_payment
        },
        sync_status: {
            type: 'string' // PENDING/SENT
        },
        timestamp: {
            type: 'string'
        },
        items: {
            type: 'array',
            items: {
                type: 'object'
            }
        }
    },
    required: ['id', 'invoice_number', 'total_amount', 'payment_type', 'sync_status', 'timestamp', 'items']
};
