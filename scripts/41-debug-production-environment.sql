-- Debug Production Environment
-- This script will help identify environment and connection issues

-- 1. Check current database connection
SELECT 
    'Database Connection' as check_type,
    current_database() as database_name,
    current_user as current_user,
    session_user as session_user,
    inet_server_addr() as server_address,
    inet_server_port() as server_port;

-- 2. Check if we're in the right schema
SELECT 
    'Schema Check' as check_type,
    current_schema() as current_schema;

-- 3. Check table ownership and permissions
SELECT 
    'Table Ownership' as check_type,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'banners';

-- 4. Check if the banners table is accessible
SELECT 
    'Table Accessibility' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banners') 
        THEN '✅ Table exists and accessible'
        ELSE '❌ Table not accessible'
    END as status;

-- 5. Check RLS status and policies
SELECT 
    'RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'banners';

-- 6. Check if policies are working
SELECT 
    'Policy Check' as check_type,
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ Policy has conditions'
        ELSE '⚠️ Policy has no conditions'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'banners';

-- 7. Test basic permissions
DO $$ 
DECLARE
    can_select BOOLEAN;
    can_insert BOOLEAN;
    can_update BOOLEAN;
    can_delete BOOLEAN;
BEGIN
    -- Test SELECT permission
    BEGIN
        PERFORM 1 FROM public.banners LIMIT 1;
        can_select := TRUE;
    EXCEPTION WHEN OTHERS THEN
        can_select := FALSE;
    END;
    
    -- Test INSERT permission
    BEGIN
        INSERT INTO public.banners (title, image_url, is_active, display_order) 
        VALUES ('Permission Test', '/test.jpg', true, 9999);
        can_insert := TRUE;
        -- Clean up
        DELETE FROM public.banners WHERE title = 'Permission Test';
    EXCEPTION WHEN OTHERS THEN
        can_insert := FALSE;
    END;
    
    -- Test UPDATE permission
    BEGIN
        UPDATE public.banners 
        SET title = title || ' (Permission Test)'
        WHERE id = (SELECT MIN(id) FROM public.banners);
        can_update := TRUE;
        -- Revert change
        UPDATE public.banners 
        SET title = REPLACE(title, ' (Permission Test)', '')
        WHERE title LIKE '%(Permission Test)%';
    EXCEPTION WHEN OTHERS THEN
        can_update := FALSE;
    END;
    
    -- Test DELETE permission
    BEGIN
        DELETE FROM public.banners 
        WHERE title = 'Permission Test Delete';
        can_delete := TRUE;
    EXCEPTION WHEN OTHERS THEN
        can_delete := FALSE;
    END;
    
    RAISE NOTICE 'Permission Test Results:';
    RAISE NOTICE '  SELECT: %', can_select;
    RAISE NOTICE '  INSERT: %', can_insert;
    RAISE NOTICE '  UPDATE: %', can_update;
    RAISE NOTICE '  DELETE: %', can_delete;
END $$;

-- 8. Check for any active sessions or locks
SELECT 
    'Active Sessions' as check_type,
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%banners%';

-- 9. Check table statistics and recent activity
SELECT 
    'Table Activity' as check_type,
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    CASE 
        WHEN last_vacuum IS NOT NULL THEN '✅ Recently maintained'
        ELSE '⚠️ Needs maintenance'
    END as maintenance_status
FROM pg_stat_user_tables 
WHERE tablename = 'banners';

-- 10. Summary of findings
SELECT 
    'Environment Summary' as summary,
    current_database() as database,
    current_user as user,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banners') 
        THEN '✅ Banners table accessible'
        ELSE '❌ Banners table not accessible'
    END as table_access,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'banners') as policy_count,
    (SELECT COUNT(*) FROM public.banners) as banner_count; 