/*
  # Add foreign key relationship between model_files and users

  1. Changes
    - Add foreign key relationship between model_files.user_id and users.id
    - This enables proper joins between the tables for querying user information

  2. Security
    - No changes to RLS policies
    - Existing policies remain in effect
*/

-- Add foreign key relationship between model_files and users
ALTER TABLE model_files
DROP CONSTRAINT IF EXISTS model_files_user_id_fkey;

ALTER TABLE model_files
ADD CONSTRAINT model_files_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);