-- Debug Banner Production Issues
-- Run this script to diagnose what's wrong with banner updates in production

-- 1. Check if banners table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banners') 
        THEN '✅ Banners table exists' 
        ELSE '❌ Banners table does NOT exist' 
    END as table_status;

-- 2. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('id', 'title', 'image_url', 'is_active', 'created_at', 'updated_at') 
        THEN 'Required' 
        ELSE 'Optional' 
    END as importance
FROM information_schema.columns 
WHERE table_name = 'banners' 
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled' 
        ELSE '❌ RLS Disabled' 
    END as rls_status
FROM pg_tables 
WHERE tablename = 'banners';

-- 4. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'banners';

-- 5. Check table permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'banners';

-- 6. Check sequence permissions (for auto-increment)
SELECT 
    sequence_name,
    grantee,
    privilege_type
FROM information_schema.role_usage_grants 
WHERE sequence_name = 'banners_id_seq';

-- 7. Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'banners';

-- 8. Check current banner data
SELECT 
    id,
    title,
    image_url,
    is_active,
    display_order,
    created_at,
    updated_at
FROM public.banners 
ORDER BY display_order;

-- 9. Check for any constraints or foreign keys
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'banners';

-- 10. Check for any locks on the table
SELECT 
    pid,
    mode,
    granted,
    query
FROM pg_locks l
JOIN pg_stat_activity a ON l.pid = a.pid
WHERE l.relation = 'banners'::regclass;

-- 11. Test basic operations (run these one by one to see where it fails)

-- Test SELECT
SELECT 'Testing SELECT operation...' as test;
SELECT COUNT(*) as banner_count FROM public.banners;

-- Test INSERT (comment out if you don't want to add test data)
-- SELECT 'Testing INSERT operation...' as test;
-- INSERT INTO public.banners (title, image_url, is_active, display_order) 
-- VALUES ('Test Banner', '/test-image.jpg', true, 999)
-- RETURNING id, title;

-- Test UPDATE (comment out if you don't want to modify existing data)
-- SELECT 'Testing UPDATE operation...' as test;
-- UPDATE public.banners 
-- SET title = title || ' (Updated)', updated_at = NOW()
-- WHERE id = (SELECT MIN(id) FROM public.banners)
-- RETURNING id, title, updated_at;

-- 12. Check for any error logs or recent activity
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE tablename = 'banners';

-- 13. Check if there are any pending transactions
SELECT 
    pid,
    state,
    query_start,
    query
FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%banners%';

-- 14. Summary of findings
SELECT 
    'Banner Table Status Summary' as summary,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banners') 
        THEN 'Table exists' 
        ELSE 'Table missing' 
    END as table_status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'banners') as column_count,
    (SELECT COUNT(*) FROM public.banners) as data_count,
    (SELECT rowsecurity FROM pg_tables WHERE tablename = 'banners') as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'banners') as policy_count; 