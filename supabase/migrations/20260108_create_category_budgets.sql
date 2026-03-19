CREATE TABLE IF NOT EXISTS category_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    category TEXT NOT NULL,
    budget_limit DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see and manage their own budgets
CREATE POLICY "Users can manage their own category budgets"
ON category_budgets
FOR ALL
USING (auth.uid() = user_id);
