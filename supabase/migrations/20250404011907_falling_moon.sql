/*
  # Model Files Schema

  1. New Tables
    - `model_files`
      - `id` (uuid, primary key)
      - `name` (text, model file name)
      - `description` (text, model description)
      - `file_path` (text, path in storage bucket)
      - `size` (bigint, file size in bytes)
      - `checksum` (text, file hash for verification)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)
      - `metadata` (jsonb, additional model metadata)
      - `downloads` (integer, download count)
      - `is_public` (boolean, visibility status)

  2. Security
    - Enable RLS on `model_files` table
    - Add policies for:
      - Users can read public models
      - Authenticated users can read their own private models
      - Authenticated users can create models
      - Users can update and delete their own models
*/

CREATE TABLE model_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  file_path text NOT NULL,
  size bigint NOT NULL,
  checksum text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  downloads integer DEFAULT 0,
  is_public boolean DEFAULT false
);

ALTER TABLE model_files ENABLE ROW LEVEL SECURITY;

-- Policy for reading public models
CREATE POLICY "Anyone can read public models"
  ON model_files
  FOR SELECT
  USING (is_public = true);

-- Policy for users reading their own models
CREATE POLICY "Users can read own models"
  ON model_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for creating models
CREATE POLICY "Authenticated users can upload models"
  ON model_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating own models
CREATE POLICY "Users can update own models"
  ON model_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for deleting own models
CREATE POLICY "Users can delete own models"
  ON model_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);