/*
  # Add video status tracking

  1. Changes
    - Add status column to videos table with enum type
    - Set default status to 'pending'
    - Add status enum type for video processing states
  
  2. Security
    - Maintain existing RLS policies
*/

-- Create enum for video status
CREATE TYPE video_status AS ENUM ('pending', 'processing', 'completed', 'error');

-- Add status column to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS status video_status DEFAULT 'pending';

-- Update existing rows to have the default status
UPDATE videos SET status = 'pending' WHERE status IS NULL;