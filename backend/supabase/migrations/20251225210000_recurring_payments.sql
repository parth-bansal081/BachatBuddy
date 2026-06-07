
-- Create recurring_bills table
CREATE TABLE IF NOT EXISTS public.recurring_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    billing_day INTEGER NOT NULL CHECK (billing_day BETWEEN 1 AND 31),
    category TEXT NOT NULL,
    last_paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Users can manage their own recurring bills" ON public.recurring_bills
    FOR ALL USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER recurring_bills_updated_at
    BEFORE UPDATE ON public.recurring_bills
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
