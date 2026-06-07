-- Migration: Add has_onboarded column to user_profiles

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS has_onboarded BOOLEAN DEFAULT FALSE;

-- Optional: Update existing users who have income set to be 'onboarded'
UPDATE user_profiles 
SET has_onboarded = TRUE 
WHERE monthly_income > 0;
