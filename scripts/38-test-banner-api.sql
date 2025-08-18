-- Test Banner API Functionality
-- This script will test all CRUD operations for banners

-- 1. Test SELECT (should work for everyone)
SELECT 'Testing SELECT operation...' as test_step;
SELECT COUNT(*) as total_banners FROM public.banners;

-- 2. Test INSERT (should work for admin users)
SELECT 'Testing INSERT operation...' as test_step;
INSERT INTO public.banners (title, subtitle, image_url, link_url, button_text, is_active, display_order) 
VALUES ('Test Banner - ' || NOW(), 'Test subtitle', '/test-image.jpg', '/test-link', 'Test Button', true, 999)
RETURNING id, title, created_at;

-- 3. Test UPDATE (should work for admin users)
SELECT 'Testing UPDATE operation...' as test_step;
UPDATE public.banners 
SET title = title || ' (Updated at ' || NOW() || ')', 
    updated_at = NOW()
WHERE id = (SELECT MAX(id) FROM public.banners)
RETURNING id, title, updated_at;

-- 4. Test DELETE (should work for admin users)
SELECT 'Testing DELETE operation...' as test_step;
DELETE FROM public.banners 
WHERE id = (SELECT MAX(id) FROM public.banners)
RETURNING id, title;

-- 5. Verify final state
SELECT 'Verifying final state...' as test_step;
SELECT 
    id,
    title,
    image_url,
    is_active,
    display_order,
    created_at,
    updated_at
FROM public.banners 
ORDER BY display_order, created_at;

-- 6. Check table structure
SELECT 'Checking table structure...' as test_step;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'banners' 
ORDER BY ordinal_position;

-- 7. Check RLS policies
SELECT 'Checking RLS policies...' as test_step;
SELECT 
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'banners';

-- 8. Summary
SELECT 'Test Summary' as summary,
    (SELECT COUNT(*) FROM public.banners) as current_banner_count,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'banners') as column_count,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'banners') as policy_count; 