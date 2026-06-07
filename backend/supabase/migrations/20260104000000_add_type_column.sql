-- Add type column to transactions table to distinguish between income and expense
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('income', 'expense')) DEFAULT 'expense';

-- Optional: Update existing records to have a type based on amount sign (if needed for migration)
-- UPDATE transactions SET type = CASE WHEN amount < 0 THEN 'expense' ELSE 'income' END;
-- UPDATE transactions SET amount = ABS(amount); -- Make all positive after type assignment
