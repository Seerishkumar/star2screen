-- Fix RLS policies for user_media table to allow service role operations
-- This script ensures that server-side operations can insert/update/delete user_media records

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own media" ON user_media;
DROP POLICY IF EXISTS "Public can view media" ON user_media;

-- Create new policies that work with both user auth and service role
CREATE POLICY "Users can manage their own media" ON user_media 
FOR ALL USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Public can view media" ON user_media 
FOR SELECT USING (true);

-- Also create specific policies for different operations
CREATE POLICY "Users can insert their own media" ON user_media 
FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can update their own media" ON user_media 
FOR UPDATE USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

CREATE POLICY "Users can delete their own media" ON user_media 
FOR DELETE USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

-- Ensure RLS is enabled
ALTER TABLE user_media ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE user_media IS 'User media/portfolio files with RLS policies allowing both user auth and service role operations';