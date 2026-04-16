-- ============================================================
-- BrandyBot Feature Upgrade: New Tables Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. CHAT SESSIONS
-- Groups messages into conversation sessions per user
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL DEFAULT 'New Chat',
    brand_context JSONB NULL DEFAULT '{}',
    logo_id UUID NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chat_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chat_sessions_logo_id_fkey FOREIGN KEY (logo_id) REFERENCES logo_history(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id_created_at
    ON public.chat_sessions USING btree (user_id, created_at DESC);

-- Auto-update updated_at
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. CHAT MESSAGES
-- Individual messages within a session
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',  -- 'user' | 'ai'
    content TEXT NOT NULL,
    action VARCHAR(50) NULL,                   -- 'generate_logo' | 'show_guidelines' | null
    metadata JSONB NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
    CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chat_messages_role_check CHECK (role IN ('user', 'ai'))
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id_created_at
    ON public.chat_messages USING btree (session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id
    ON public.chat_messages USING btree (user_id);

-- ============================================================
-- 3. USER CREDITS
-- Credit balance per user (one row per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    balance INTEGER NOT NULL DEFAULT 50,
    total_purchased INTEGER NOT NULL DEFAULT 0,
    total_used INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_credits_pkey PRIMARY KEY (id),
    CONSTRAINT user_credits_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT user_credits_balance_check CHECK (balance >= 0)
);

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id
    ON public.user_credits USING btree (user_id);

-- Auto-create credit row when a new user is inserted
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (NEW.id, 50)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_created_add_credits
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_credits();

-- ============================================================
-- 4. CREDIT TRANSACTIONS
-- Audit log of every credit change
-- ============================================================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(30) NOT NULL,       -- 'use' | 'purchase' | 'refund' | 'bonus'
    amount INTEGER NOT NULL,         -- positive = gain, negative = spend
    description TEXT NULL,
    reference_id UUID NULL,          -- e.g. logo_history.id for 'use' transactions
    created_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT credit_transactions_pkey PRIMARY KEY (id),
    CONSTRAINT credit_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT credit_transactions_type_check CHECK (type IN ('use', 'purchase', 'refund', 'bonus'))
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id_created_at
    ON public.credit_transactions USING btree (user_id, created_at DESC);

-- ============================================================
-- 5. GUEST SESSIONS
-- Tracks one-time free logo generation for anonymous visitors
-- ============================================================
CREATE TABLE IF NOT EXISTS public.guest_sessions (
    id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    fingerprint VARCHAR(255) UNIQUE NOT NULL,
    logo_id UUID NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT guest_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT guest_sessions_logo_id_fkey FOREIGN KEY (logo_id) REFERENCES logo_history(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_guest_sessions_fingerprint
    ON public.guest_sessions USING btree (fingerprint);

-- ============================================================
-- Backfill: Give existing users their 50 credits
-- ============================================================
INSERT INTO public.user_credits (user_id, balance)
SELECT id, 50 FROM public.users
ON CONFLICT (user_id) DO NOTHING;
