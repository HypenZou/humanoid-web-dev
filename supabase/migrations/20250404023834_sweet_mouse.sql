/*
  # Add Foreign Key Relationship to Auth Users

  1. Changes
    - Add foreign key constraint to model_files.user_id referencing auth.users.id
    - Update RLS policies to use auth.uid() for user verification

  2. Security
    - Maintain existing RLS policies
    - Ensure proper user access control
*/

ALTER TABLE model_files
DROP CONSTRAINT IF EXISTS model_files_user_id_fkey,
ADD CONSTRAINT model_files_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);