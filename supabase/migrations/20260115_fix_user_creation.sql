-- Migration: Fix User Creation & RLS Policies
-- Date: 2026-01-15
-- Description: Adds a trigger to automatically create user_profiles and updates RLS to prevent 409 conflicts.

-- 1. Create/Update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, user_id, full_name, monthly_income, monthly_savings_target, currency)
  VALUES (
    new.id, -- Use the same ID as auth.users to keep 1:1 integrity
    new.id,
    new.raw_user_meta_data->>'full_name',
    0,
    0,
    '₹'
  )
  ON CONFLICT (user_id) DO NOTHING; -- Safe fallthrough if exists
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the trigger to auth.users
-- Drop if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Update RLS Policies for user_profiles

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts/shadowing
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create comprehensive policies

-- VIEW: Users can see their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can insert their own profile (useful if trigger failed or for manual recovery)
CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);
