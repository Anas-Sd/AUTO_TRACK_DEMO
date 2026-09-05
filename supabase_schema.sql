-- =========================================================================
-- SpendPulse Financial Ecosystem - Supabase Database Schema
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Vault Sessions Table (device pairing & zero-knowledge sync)
CREATE TABLE IF NOT EXISTS vault_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_code VARCHAR(20) UNIQUE NOT NULL,
    user_name VARCHAR(100) NOT NULL DEFAULT 'Anas',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    vault_code VARCHAR(20) REFERENCES vault_sessions(vault_code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Tag',
    color VARCHAR(30) DEFAULT '#10b981',
    monthly_limit NUMERIC DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    vault_code VARCHAR(20) REFERENCES vault_sessions(vault_code) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'expense', -- 'expense' | 'income'
    category VARCHAR(100) NOT NULL,
    date VARCHAR(20) NOT NULL,
    time VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'UPI',
    merchant VARCHAR(100),
    notes TEXT,
    is_auto_captured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Enable Realtime Broadcasting on Tables
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE vault_sessions;

-- 6. Row Level Security (RLS) Policies - Public Access for Vault Pairing
ALTER TABLE vault_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access to vault_sessions" ON vault_sessions FOR ALL USING (true);
CREATE POLICY "Allow public full access to categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow public full access to transactions" ON transactions FOR ALL USING (true);
