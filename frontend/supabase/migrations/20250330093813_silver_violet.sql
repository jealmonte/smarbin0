/*
  # Create authentication schema with error handling

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile

  3. Triggers
    - Add error handling to user creation trigger
    - Add updated_at timestamp trigger
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE
  ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create or replace trigger function for new user handling with error handling
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

-- Create trigger for new user handling if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE handle_new_user();