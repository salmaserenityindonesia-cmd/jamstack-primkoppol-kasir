// Database schemas for the POS application

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
        nrp: {
            type: 'string'
        },
        bank_name: {
            type: 'string'
        },
        bank_account_number: {
            type: 'string'
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

export const productSchema = {
    title: 'product schema',
    version: 0,
    primaryKey: 'barcode',
    type: 'object',
    properties: {
        barcode: {
            type: 'string',
            maxLength: 50
        },
        sku: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        price: {
            type: 'number'
        },
        cost_price: {
            type: 'number'
        },
        stock: {
            type: 'number'
        },
        unit: {
            type: 'string'
        },
        category: {
            type: 'string'
        },
        updated_at: {
            type: 'string'
        }
    },
    required: ['barcode', 'name', 'price', 'cost_price', 'stock', 'unit', 'category']
};

// User schema for authentication and RBAC
export const userSchema = {
    title: 'user schema',
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 100 },
        email: { type: 'string', format: 'email' },
        name: { type: 'string' },
        password_hash: { type: 'string' },
        role: { type: 'string', enum: ['admin', 'pengawas', 'kasir'] },
        status: { type: 'string', enum: ['active', 'inactive'] },
        permissions: { type: 'array', items: { type: 'string' } },
        updated_at: { type: 'string' }
    },
    required: ['id', 'email', 'name', 'password_hash', 'role', 'status'],
    indexes: []
};
