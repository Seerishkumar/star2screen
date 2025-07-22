-- Script to set users as admin
-- This script provides multiple ways to assign admin roles to users

-- Method 1: Set admin by email (RECOMMENDED)
-- Replace 'your-email@example.com' with the actual email
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get user ID by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'admin@stars2screen.com';  -- CHANGE THIS EMAIL
    
    IF target_user_id IS NOT NULL THEN
        -- Insert or update user role
        INSERT INTO user_roles (user_id, role, permissions, assigned_at, is_active)
        VALUES (
            target_user_id,
            'super_admin',
            '{
                "manage_users": true,
                "manage_content": true,
                "manage_system": true,
                "view_analytics": true,
                "manage_roles": true,
                "delete_content": true,
                "moderate_content": true,
                "manage_articles": true,
                "manage_banners": true,
                "manage_ads": true,
                "view_reports": true,
                "manage_comments": true
            }',
            NOW(),
            true
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET
            role = EXCLUDED.role,
            permissions = EXCLUDED.permissions,
            updated_at = NOW(),
            is_active = true;
            
        RAISE NOTICE 'Successfully set user % as super_admin', target_user_id;
    ELSE
        RAISE NOTICE 'User with email admin@stars2screen.com not found';
    END IF;
END $$;

-- Method 2: Set multiple users as admin at once
-- Add more emails to this array
DO $$
DECLARE
    admin_emails TEXT[] := ARRAY[
        'admin@stars2screen.com',
        'seerish@stars2screen.com',
        'manager@stars2screen.com'
    ];
    email_addr TEXT;
    target_user_id UUID;
BEGIN
    FOREACH email_addr IN ARRAY admin_emails
    LOOP
        SELECT id INTO target_user_id 
        FROM auth.users 
        WHERE email = email_addr;
        
        IF target_user_id IS NOT NULL THEN
            INSERT INTO user_roles (user_id, role, permissions, assigned_at, is_active)
            VALUES (
                target_user_id,
                'admin',
                '{
                    "manage_users": true,
                    "manage_content": true,
                    "view_analytics": true,
                    "delete_content": true,
                    "moderate_content": true,
                    "manage_articles": true,
                    "manage_banners": true,
                    "manage_ads": true,
                    "view_reports": true,
                    "manage_comments": true
                }',
                NOW(),
                true
            )
            ON CONFLICT (user_id) 
            DO UPDATE SET
                role = EXCLUDED.role,
                permissions = EXCLUDED.permissions,
                updated_at = NOW(),
                is_active = true;
                
            RAISE NOTICE 'Successfully set user % (%) as admin', email_addr, target_user_id;
        ELSE
            RAISE NOTICE 'User with email % not found', email_addr;
        END IF;
    END LOOP;
END $$;

-- Method 3: Create a function to easily set admin roles
CREATE OR REPLACE FUNCTION set_user_admin(user_email TEXT, admin_role TEXT DEFAULT 'admin')
RETURNS BOOLEAN AS $$
DECLARE
    target_user_id UUID;
    role_permissions JSONB;
BEGIN
    -- Get user ID by email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found', user_email;
        RETURN FALSE;
    END IF;
    
    -- Set permissions based on role
    CASE admin_role
        WHEN 'super_admin' THEN
            role_permissions := '{
                "manage_users": true,
                "manage_content": true,
                "manage_system": true,
                "view_analytics": true,
                "manage_roles": true,
                "delete_content": true,
                "moderate_content": true,
                "manage_articles": true,
                "manage_banners": true,
                "manage_ads": true,
                "view_reports": true,
                "manage_comments": true
            }';
        WHEN 'admin' THEN
            role_permissions := '{
                "manage_users": true,
                "manage_content": true,
                "view_analytics": true,
                "delete_content": true,
                "moderate_content": true,
                "manage_articles": true,
                "manage_banners": true,
                "manage_ads": true,
                "view_reports": true,
                "manage_comments": true
            }';
        WHEN 'content_admin' THEN
            role_permissions := '{
                "manage_content": true,
                "moderate_content": true,
                "view_analytics": true,
                "manage_articles": true,
                "manage_banners": true,
                "manage_ads": true,
                "manage_comments": true
            }';
        ELSE
            role_permissions := '{}';
    END CASE;
    
    -- Insert or update user role
    INSERT INTO user_roles (user_id, role, permissions, assigned_at, is_active)
    VALUES (target_user_id, admin_role, role_permissions, NOW(), true)
    ON CONFLICT (user_id) 
    DO UPDATE SET
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        updated_at = NOW(),
        is_active = true;
    
    RAISE NOTICE 'Successfully set user % (%) as %', user_email, target_user_id, admin_role;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Method 4: Quick examples using the function
-- Uncomment and modify these lines to set specific users as admin:

-- SELECT set_user_admin('your-email@example.com', 'super_admin');
-- SELECT set_user_admin('manager@example.com', 'admin');
-- SELECT set_user_admin('editor@example.com', 'content_admin');

-- Method 5: Check current admin users
SELECT 
    u.email,
    ur.role,
    ur.is_active,
    ur.assigned_at,
    ur.permissions
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE ur.role IN ('super_admin', 'admin', 'content_admin', 'moderator')
ORDER BY ur.assigned_at DESC;

-- Method 6: Emergency admin creation (if no admins exist)
-- This creates a temporary admin account - CHANGE THE EMAIL!
INSERT INTO user_roles (user_id, role, permissions, assigned_at, is_active)
SELECT 
    id,
    'super_admin',
    '{
        "manage_users": true,
        "manage_content": true,
        "manage_system": true,
        "view_analytics": true,
        "manage_roles": true,
        "delete_content": true,
        "moderate_content": true,
        "manage_articles": true,
        "manage_banners": true,
        "manage_ads": true,
        "view_reports": true,
        "manage_comments": true
    }',
    NOW(),
    true
FROM auth.users 
WHERE email = 'emergency-admin@stars2screen.com'  -- CHANGE THIS EMAIL
ON CONFLICT (user_id) DO NOTHING;
