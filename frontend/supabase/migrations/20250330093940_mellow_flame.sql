/*
  # Fix RLS policies for profiles table

  1. Changes
    - Add INSERT policy to allow profile creation during signup
    - Add policy for service role to manage profiles
    - Ensure policies use correct auth functions

  2. Security
    - Maintain existing RLS policies for SELECT and UPDATE
    - Add new INSERT policy for authenticated users
    - Add service role bypass for system operations
*/

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

-- Recreate policies with proper permissions
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
  TO service_role
  USING (true)
  WITH CHECK (true);