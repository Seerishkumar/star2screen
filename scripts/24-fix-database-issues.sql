-- Fix missing RPC functions and policy issues

-- Drop existing problematic functions if they exist
DROP FUNCTION IF EXISTS get_user_conversation_ids(uuid);
DROP FUNCTION IF EXISTS get_conversation_participants(uuid[]);

-- Create simple, working RPC functions
CREATE OR REPLACE FUNCTION get_user_conversation_ids(p_user uuid)
RETURNS TABLE(conversation_id uuid)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT cp.conversation_id
  FROM conversation_participants cp
  WHERE cp.user_id = p_user 
    AND cp.is_active = true;
$$;

CREATE OR REPLACE FUNCTION get_conversation_participants(p_ids uuid[])
RETURNS TABLE(
  conversation_id uuid,
  user_id uuid,
  display_name text,
  stage_name text,
  full_name text,
  profile_picture_url text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    cp.conversation_id,
    cp.user_id,
    ap.display_name,
    ap.stage_name,
    ap.full_name,
    ap.profile_picture_url
  FROM conversation_participants cp
  LEFT JOIN author_profiles ap ON ap.user_id = cp.user_id
  WHERE cp.conversation_id = ANY(p_ids);
$$;

-- Fix RLS policies to prevent recursion
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for authenticated users" ON conversations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON conversation_participants
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON author_profiles
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_conversation_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversation_participants(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_conversation_ids(uuid) TO anon;
GRANT EXECUTE ON FUNCTION get_conversation_participants(uuid[]) TO anon;

-- Ensure tables have proper permissions
GRANT SELECT ON author_profiles TO authenticated;
GRANT SELECT ON author_profiles TO anon;
GRANT SELECT ON conversations TO authenticated;
GRANT SELECT ON conversation_participants TO authenticated;
GRANT SELECT ON messages TO authenticated;
