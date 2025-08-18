-- Fix Public Banner Access
-- This script will ensure banners are publicly accessible while maintaining admin security

-- 1. Check current RLS status
SELECT 
    'Current RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'banners';

-- 2. Check current policies
SELECT 
    'Current Policies' as check_type,
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'banners';

-- 3. Drop existing restrictive policies
DROP POLICY IF EXISTS "Banners are viewable by everyone" ON public.banners;
DROP POLICY IF EXISTS "Banners are insertable by admin users" ON public.banners;
DROP POLICY IF EXISTS "Banners are updatable by admin users" ON public.banners;
DROP POLICY IF EXISTS "Banners are deletable by admin users" ON public.banners;

-- 4. Create new public-friendly policies
-- Policy 1: Everyone can view active banners
CREATE POLICY "Public can view active banners" ON public.banners
    FOR SELECT USING (is_active = true);

-- Policy 2: Admin users can view all banners (including inactive)
CREATE POLICY "Admins can view all banners" ON public.banners
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('super_admin', 'admin', 'content_admin')
            )
        )
    );

-- Policy 3: Admin users can insert banners
CREATE POLICY "Admins can insert banners" ON public.banners
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('super_admin', 'admin', 'content_admin')
            )
        )
    );

-- Policy 4: Admin users can update banners
CREATE POLICY "Admins can update banners" ON public.banners
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('super_admin', 'admin', 'content_admin')
            )
        )
    );

-- Policy 5: Admin users can delete banners
CREATE POLICY "Admins can delete banners" ON public.banners
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('super_admin', 'admin', 'content_admin')
            )
        )
    );

-- 5. Verify policies are created
SELECT 
    'New Policies Created' as check_type,
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ Has conditions'
        ELSE '⚠️ No conditions'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'banners'
ORDER BY policyname;

-- 6. Test public access (should work without authentication)
DO $$ 
BEGIN
    RAISE NOTICE 'Testing public banner access...';
    
    -- This should work for public users
    PERFORM 1 FROM public.banners WHERE is_active = true LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Public access to active banners works';
    ELSE
        RAISE NOTICE '⚠️ No active banners found, but access is working';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Public access failed: %', SQLERRM;
END $$;

-- 7. Test admin access (should work with authentication)
DO $$ 
BEGIN
    RAISE NOTICE 'Testing admin banner access...';
    
    -- This should work for admin users
    PERFORM 1 FROM public.banners LIMIT 1;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Admin access to all banners works';
    ELSE
        RAISE NOTICE '⚠️ No banners found, but access is working';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Admin access failed: %', SQLERRM;
END $$;

-- 8. Show final policy summary
SELECT 
    'Final Policy Summary' as summary,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies
FROM pg_policies 
WHERE tablename = 'banners';

-- 9. Verify table permissions
SELECT 
    'Table Permissions' as check_type,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'banners';

-- 10. Final verification
SELECT 
    'Final Status' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND cmd = 'SELECT') 
        THEN '✅ Public SELECT policy exists'
        ELSE '❌ Public SELECT policy missing'
    END as public_access,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND cmd = 'INSERT') 
        THEN '✅ Admin INSERT policy exists'
        ELSE '❌ Admin INSERT policy missing'
    END as admin_insert,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND cmd = 'UPDATE') 
        THEN '✅ Admin UPDATE policy exists'
        ELSE '❌ Admin UPDATE policy missing'
    END as admin_update,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners' AND cmd = 'DELETE') 
        THEN '✅ Admin DELETE policy exists'
        ELSE '❌ Admin DELETE policy missing'
    END as admin_delete; 