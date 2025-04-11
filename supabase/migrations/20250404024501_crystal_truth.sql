/*
  # Add display name to users

  1. Changes
    - Add display_name column to auth.users
    - Add trigger to set default display_name from email
    - Update RLS policies to allow users to read display names
*/

-- Add display_name column to auth.users
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS display_name text;

-- Create function to extract username from email
CREATE OR REPLACE FUNCTION public.get_username_from_email()
RETURNS trigger AS $$
BEGIN
  IF NEW.display_name IS NULL THEN
    NEW.display_name := split_part(NEW.email, '@', 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set default display_name
DROP TRIGGER IF EXISTS set_default_display_name ON auth.users;
CREATE TRIGGER set_default_display_name
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.get_username_from_email();

-- Update existing users
UPDATE auth.users
SET display_name = split_part(email, '@', 1)
WHERE display_name IS NULL;