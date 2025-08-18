-- Check Production Database Connection and Banner Data
-- Run this in your production Supabase SQL editor

-- 1. Check current banner data
SELECT 
    'Current Banner Data' as check_type,
    id,
    title,
    image_url,
    is_active,
    display_order,
    created_at,
    updated_at
FROM public.banners 
ORDER BY display_order, created_at;

-- 2. Check if there are any recent updates
SELECT 
    'Recent Updates' as check_type,
    id,
    title,
    updated_at,
    CASE 
        WHEN updated_at > created_at THEN 'Modified'
        ELSE 'Not Modified'
    END as status
FROM public.banners 
WHERE updated_at > created_at
ORDER BY updated_at DESC;

-- 3. Check table structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'banners' 
ORDER BY ordinal_position;

-- 4. Check RLS policies
SELECT 
    'RLS Policies' as check_type,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'banners';

-- 5. Check table permissions
SELECT 
    'Table Permissions' as check_type,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'banners';

-- 6. Test a simple update to see if it works
DO $$ 
DECLARE
    test_banner_id INTEGER;
    update_result TEXT;
BEGIN
    -- Get the first banner ID
    SELECT id INTO test_banner_id FROM public.banners LIMIT 1;
    
    IF test_banner_id IS NOT NULL THEN
        -- Try to update the banner
        UPDATE public.banners 
        SET title = title || ' (Test Update: ' || NOW() || ')',
            updated_at = NOW()
        WHERE id = test_banner_id;
        
        IF FOUND THEN
            update_result := 'Update successful for banner ID: ' || test_banner_id;
        ELSE
            update_result := 'Update failed - no rows affected';
        END IF;
    ELSE
        update_result := 'No banners found to test';
    END IF;
    
    RAISE NOTICE 'Test Update Result: %', update_result;
END $$;

-- 7. Check for any locks or active transactions
SELECT 
    'Active Transactions' as check_type,
    pid,
    state,
    query_start,
    LEFT(query, 100) as query_preview
FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%banners%';

-- 8. Check table statistics
SELECT 
    'Table Statistics' as check_type,
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

-- 9. Verify the test update
SELECT 
    'After Test Update' as check_type,
    id,
    title,
    updated_at
FROM public.banners 
WHERE id = (SELECT MIN(id) FROM public.banners)
ORDER BY updated_at DESC; 