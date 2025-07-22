-- Add roles to auth.users metadata and create user_roles table
-- First, let's create a user_roles table for better role management
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  permissions JSONB DEFAULT '{}',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create role types enum for consistency
DO $$ BEGIN
  CREATE TYPE user_role_type AS ENUM ('super_admin', 'admin', 'content_admin', 'moderator', 'premium_user', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column to author_profiles for easier access
ALTER TABLE author_profiles 
ADD COLUMN IF NOT EXISTS role user_role_type DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- Create admin users (these will be the main admin accounts)
INSERT INTO user_roles (user_id, role, permissions, assigned_at) VALUES
-- Super admin (full access)
('00000000-0000-0000-0000-000000000001', 'super_admin', '{
  "manage_users": true,
  "manage_content": true,
  "manage_system": true,
  "view_analytics": true,
  "manage_roles": true,
  "delete_content": true
}', NOW()),
-- Content admin (content management)
('00000000-0000-0000-0000-000000000002', 'content_admin', '{
  "manage_content": true,
  "moderate_content": true,
  "view_analytics": true,
  "manage_articles": true,
  "manage_banners": true
}', NOW()),
-- Moderator (content moderation)
('00000000-0000-0000-0000-000000000003', 'moderator', '{
  "moderate_content": true,
  "view_reports": true,
  "manage_comments": true
}', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Update author_profiles with admin roles
UPDATE author_profiles 
SET 
  role = ur.role::user_role_type,
  is_admin = CASE 
    WHEN ur.role IN ('super_admin', 'admin', 'content_admin', 'moderator') THEN true 
    ELSE false 
  END,
  permissions = ur.permissions
FROM user_roles ur 
WHERE author_profiles.user_id = ur.user_id;

-- Create function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = user_uuid AND is_active = true;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION check_user_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := false;
BEGIN
  SELECT COALESCE((permissions ->> permission_name)::boolean, false) INTO has_permission
  FROM user_roles
  WHERE user_id = user_uuid AND is_active = true;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('super_admin', 'admin')
      AND ur.is_active = true
    )
  );

CREATE POLICY "Super admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
      AND ur.is_active = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_author_profiles_role ON author_profiles(role);
CREATE INDEX IF NOT EXISTS idx_author_profiles_is_admin ON author_profiles(is_admin);

-- Create trigger to update author_profiles when user_roles changes
CREATE OR REPLACE FUNCTION sync_author_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE author_profiles 
  SET 
    role = NEW.role::user_role_type,
    is_admin = CASE 
      WHEN NEW.role IN ('super_admin', 'admin', 'content_admin', 'moderator') THEN true 
      ELSE false 
    END,
    permissions = NEW.permissions,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_author_profile_role
  AFTER INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION sync_author_profile_role();
