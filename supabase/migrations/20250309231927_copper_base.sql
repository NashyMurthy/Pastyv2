/*
  # Create videos table with status enum

  1. New Types
    - `video_status` enum type for tracking video processing state (if not exists)
      - pending: Initial state when video is created
      - processing: Video is being processed
      - completed: Processing finished successfully
      - error: Processing failed

  2. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `youtube_url` (text)
      - `script` (text, nullable)
      - `status` (video_status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Security
    - Enable RLS on videos table
    - Add policies for users to:
      - Create their own videos
      - Read their own videos
      - Update their own videos
*/

-- Create video status enum if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'video_status') THEN
    CREATE TYPE video_status AS ENUM ('pending', 'processing', 'completed', 'error');
  END IF;
END $$;

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  youtube_url text NOT NULL,
  script text,
  status video_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
    -- Create policy for INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'videos' 
        AND policyname = 'Users can create videos'
    ) THEN
        CREATE POLICY "Users can create videos"
            ON videos
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Create policy for SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'videos' 
        AND policyname = 'Users can read own videos'
    ) THEN
        CREATE POLICY "Users can read own videos"
            ON videos
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    -- Create policy for UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'videos' 
        AND policyname = 'Users can update own videos'
    ) THEN
        CREATE POLICY "Users can update own videos"
            ON videos
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;