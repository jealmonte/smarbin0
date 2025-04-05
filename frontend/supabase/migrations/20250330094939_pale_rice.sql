/*
  # Fix RLS policies for profiles table

  1. Changes
    - Drop and recreate RLS policies with correct permissions
    - Add policy for profile creation during signup
    - Ensure service role has full access

  2. Security
    - Enable RLS
    - Allow authenticated users to manage their own profiles
    - Allow service role full access for system operations
*/

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

-- Create policies with proper permissions
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role full access for system operations
CREATE POLICY "Service role can manage all profiles"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);