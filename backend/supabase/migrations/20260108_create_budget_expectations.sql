-- Create budget_expectations table
CREATE TABLE IF NOT EXISTS public.budget_expectations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    category TEXT NOT NULL,
    expected_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE public.budget_expectations ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own expectations
CREATE POLICY "Users can manage their own budget expectations" 
ON public.budget_expectations
FOR ALL 
USING (auth.uid() = user_id);
