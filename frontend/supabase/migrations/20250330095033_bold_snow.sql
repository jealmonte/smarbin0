/*
  # Fix profile creation and RLS policies

  1. Changes
    - Add proper RLS policies for profile management
    - Ensure service role has full access
    - Add policy for profile creation during signup
    - Add trigger for automatic profile creation

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

-- Create trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
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