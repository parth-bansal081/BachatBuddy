-- Migration: Fix User Creation Trigger & Backfill Missing Profiles
-- Date: 2026-01-15
-- Description: Updates handle_new_user to strictly match schema (no email) and backfills missing profiles.

-- 1. Update the handle_new_user function (STRICT SCHEMA MATCHING)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, user_id, full_name, monthly_income, monthly_savings_target, currency)
  VALUES (
    new.id, -- Use auth.users.id as primary key to prevent mismatch
    new.id, -- Foreign key to auth.users
    new.raw_user_meta_data->>'full_name',
    0,
    0,
    '₹'
  )
  ON CONFLICT (user_id) DO NOTHING; -- Idempotent
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Re-bind the trigger (Ensure it's active)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. AUTO-REPAIR / BACKFILL SCRIPT
-- This block will find all users in auth.users who DO NOT have a matching entry in public.user_profiles
-- and insert a default profile for them. This fixes the "Foreign Key Violation" for existing users.

INSERT INTO public.user_profiles (id, user_id, full_name, monthly_income, monthly_savings_target, currency, has_onboarded)
SELECT 
  id, 
  id, 
  raw_user_meta_data->>'full_name', 
  0, 
  0, 
  '₹',
  FALSE -- Default to false so they go through onboarding if needed (or true if you honestly don't care)
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Ensure RLS is open enough for the specific "upsert" that Supabase Auth sometimes does? 
-- Actually, the previous migration handled RLS. We'll trust it. 
-- But just in case, let's make sure the sequence/PK is fine. 
-- Since we force ID = UserID, we don't rely on a sequence.

