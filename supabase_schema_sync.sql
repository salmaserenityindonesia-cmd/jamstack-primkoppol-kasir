-- Hapus tabel lama yang tidak sinkron
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.members CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.supplier_invoices CASCADE;
DROP TABLE IF EXISTS public.shift_logs CASCADE;

-- Buat Tabel users
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    password_hash TEXT,
    role TEXT,
    status TEXT,
    permissions JSONB,
    updated_at TEXT
);

-- Buat Tabel members
CREATE TABLE public.members (
    id TEXT PRIMARY KEY,
    name TEXT,
    unit TEXT,
    join_date TEXT,
    credit_limit NUMERIC,
    current_debt NUMERIC,
    unpaid_months NUMERIC,
    status TEXT,
    mandatory_savings NUMERIC,
    unpaid_invoices JSONB,
    updated_at TEXT
);

-- Buat Tabel products
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    barcode TEXT,
    sku TEXT,
    name TEXT,
    price NUMERIC,
    cost_price NUMERIC,
    stock NUMERIC,
    unit TEXT,
    category TEXT,
    photo_url TEXT,
    updated_at TEXT
);

-- Buat Tabel transactions
CREATE TABLE public.transactions (
    id TEXT PRIMARY KEY,
    invoice_number TEXT,
    member_id TEXT,
    total_amount NUMERIC,
    payment_type TEXT,
    sync_status TEXT,
    timestamp TEXT,
    items JSONB,
    is_synced BOOLEAN,
    updated_at TEXT
);

-- Buat Tabel supplier_invoices
CREATE TABLE public.supplier_invoices (
    invoice_no TEXT PRIMARY KEY,
    supplier_name TEXT,
    expected_qty NUMERIC,
    status TEXT,
    created_at TEXT,
    scanned_items JSONB,
    scanned_total_qty NUMERIC,
    variance NUMERIC,
    verified_at TEXT,
    updated_at TEXT
);

-- Buat Tabel shift_logs
CREATE TABLE public.shift_logs (
    shift_id TEXT PRIMARY KEY,
    date TEXT,
    cashier TEXT,
    cashier_id TEXT,
    shift_name TEXT,
    opening_cash NUMERIC,
    cash_sales NUMERIC,
    credit_sales NUMERIC,
    debt_repayments NUMERIC,
    refunds NUMERIC,
    expected_cash NUMERIC,
    actual_cash NUMERIC,
    variance NUMERIC,
    variance_status TEXT,
    status TEXT,
    void_count NUMERIC,
    voids JSONB,
    minimized_payload TEXT,
    ai_audit_status TEXT,
    ai_audit_result JSONB,
    updated_at TEXT
);

-- Matikan RLS sementara agar REST API syncEngine dapat langsung melakukan INSERT
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_logs DISABLE ROW LEVEL SECURITY;
