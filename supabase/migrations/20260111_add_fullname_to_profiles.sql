-- Add full_name column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update RLS if necessary (usually not needed for just adding a column if generic update policy exists)
-- Ensure the column is accessible
GRANT ALL ON TABLE user_profiles TO authenticated;
GRANT ALL ON TABLE user_profiles TO service_role;
