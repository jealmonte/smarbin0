/*
  # Fix profile fetch issues

  1. Changes
    - Add default values for first_name and last_name
    - Add NOT NULL constraint to email
    - Add trigger for automatic profile creation
    - Update RLS policies

  2. Security
    - Enable RLS
    - Allow authenticated users to manage their own profiles
    - Allow service role full access
*/

-- Add NOT NULL constraint to email if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
      AND column_name = 'email' 
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;

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

-- Create or replace function for handling new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (NEW.id, NEW.email, '', '')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log other errors but don't fail
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE handle_new_user();