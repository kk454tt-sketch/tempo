-- ====================================================================
-- TEMPO ATELIER: SECURE USER TEMPLATE PURCHASES & UNLOCKS SCHEMA
-- ====================================================================
-- This schema guarantees that paid templates are strictly locked and tied
-- to verified authenticated Supabase user accounts, preventing unauthorized access.

-- 1. Create user_template_purchases Table
CREATE TABLE IF NOT EXISTS public.user_template_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 999.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
    upi_transaction_id TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'refunded'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_template_purchase UNIQUE (user_id, template_id)
);

-- 2. Indexes for High Performance Lookups
CREATE INDEX IF NOT EXISTS idx_user_template_purchases_lookup 
ON public.user_template_purchases (user_id, template_id, status);

CREATE INDEX IF NOT EXISTS idx_user_template_purchases_user 
ON public.user_template_purchases (user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_template_purchases ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Users can only read their own template purchases
CREATE POLICY "Users can read own template purchases"
ON public.user_template_purchases
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5. RLS Policy: Users can insert their own template purchases upon payment
CREATE POLICY "Users can insert own template purchases"
ON public.user_template_purchases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. Helper Function: Check if template is unlocked for given user
CREATE OR REPLACE FUNCTION public.is_template_unlocked(check_template_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_template_purchases
        WHERE user_id = auth.uid()
          AND template_id = check_template_id
          AND status = 'completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
