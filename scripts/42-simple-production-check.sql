-- Simple Production Environment Check
-- This script is compatible with all PostgreSQL versions

-- 1. Basic database info
SELECT 
    'Database Info' as check_type,
    current_database() as database_name,
    current_user as current_user,
    version() as postgres_version;

-- 2. Check if banners table exists
SELECT 
    'Table Check' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banners') 
        THEN '✅ Banners table exists'
        ELSE '❌ Banners table does NOT exist'
    END as table_status;

-- 3. Check table structure (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banners') THEN
        RAISE NOTICE 'Banners table structure:';
        RAISE NOTICE 'Columns: %', (
            SELECT string_agg(column_name || ' (' || data_type || ')', ', ')
            FROM information_schema.columns 
            WHERE table_name = 'banners'
        );
    ELSE
        RAISE NOTICE 'Banners table does not exist';
    END IF;
END $$;

-- 4. Check RLS status
SELECT 
    'RLS Status' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'banners') THEN
            CASE 
                WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'banners') THEN '✅ RLS Enabled'
                ELSE '❌ RLS Disabled'
            END
        ELSE '❌ Table not found'
    END as rls_status;

-- 5. Check policies
SELECT 
    'Policies' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners') THEN
            '✅ ' || (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'banners') || ' policies found'
        ELSE '❌ No policies found'
    END as policy_status;

-- 6. Test basic operations
DO $$ 
DECLARE
    banner_count INTEGER;
    can_select BOOLEAN := FALSE;
    can_insert BOOLEAN := FALSE;
    can_update BOOLEAN := FALSE;
    can_delete BOOLEAN := FALSE;
    test_id INTEGER;
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banners') THEN
        RAISE NOTICE '❌ Banners table does not exist - cannot test operations';
        RETURN;
    END IF;
    
    -- Count banners
    SELECT COUNT(*) INTO banner_count FROM public.banners;
    RAISE NOTICE '📊 Found % banners in the table', banner_count;
    
    -- Test SELECT
    BEGIN
        PERFORM 1 FROM public.banners LIMIT 1;
        can_select := TRUE;
        RAISE NOTICE '✅ SELECT operation works';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ SELECT operation failed: %', SQLERRM;
    END;
    
    -- Test INSERT (only if we have banners to work with)
    IF banner_count > 0 THEN
        BEGIN
            INSERT INTO public.banners (title, image_url, is_active, display_order) 
            VALUES ('Test Banner - ' || NOW(), '/test.jpg', true, 9999);
            GET DIAGNOSTICS test_id = RESULT_OID;
            can_insert := TRUE;
            RAISE NOTICE '✅ INSERT operation works (created ID: %)', test_id;
            
            -- Clean up test banner
            DELETE FROM public.banners WHERE id = test_id;
            RAISE NOTICE '🧹 Test banner cleaned up';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ INSERT operation failed: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '⚠️ Cannot test INSERT - no existing banners to reference';
    END IF;
    
    -- Test UPDATE
    IF banner_count > 0 THEN
        BEGIN
            UPDATE public.banners 
            SET title = title || ' (Test Update)'
            WHERE id = (SELECT MIN(id) FROM public.banners);
            can_update := TRUE;
            RAISE NOTICE '✅ UPDATE operation works';
            
            -- Revert change
            UPDATE public.banners 
            SET title = REPLACE(title, ' (Test Update)', '')
            WHERE title LIKE '%(Test Update)%';
            RAISE NOTICE '🔄 UPDATE reverted';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ UPDATE operation failed: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '⚠️ Cannot test UPDATE - no existing banners';
    END IF;
    
    -- Test DELETE
    BEGIN
        DELETE FROM public.banners 
        WHERE title = 'Non-existent Test Banner';
        can_delete := TRUE;
        RAISE NOTICE '✅ DELETE operation works (no rows affected as expected)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ DELETE operation failed: %', SQLERRM;
    END;
    
    -- Summary
    RAISE NOTICE '';
    RAISE NOTICE '📋 Operation Test Summary:';
    RAISE NOTICE '  SELECT: %', CASE WHEN can_select THEN '✅' ELSE '❌' END;
    RAISE NOTICE '  INSERT: %', CASE WHEN can_insert THEN '✅' ELSE '❌' END;
    RAISE NOTICE '  UPDATE: %', CASE WHEN can_update THEN '✅' ELSE '❌' END;
    RAISE NOTICE '  DELETE: %', CASE WHEN can_delete THEN '✅' ELSE '❌' END;
    
END $$;

-- 7. Show current banner data (if table exists)
SELECT 
    'Current Data' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banners') THEN
            'Found ' || (SELECT COUNT(*) FROM public.banners) || ' banners'
        ELSE 'Table does not exist'
    END as data_status;

-- 8. Final summary
SELECT 
    'Final Summary' as summary,
    current_database() as database,
    current_user as user,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banners') 
        THEN '✅ Banners table accessible'
        ELSE '❌ Banners table not accessible'
    END as table_access,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banners') 
        THEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'banners')
        ELSE 0
    END as policy_count,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'banners') 
        THEN (SELECT COUNT(*) FROM public.banners)
        ELSE 0
    END as banner_count; 