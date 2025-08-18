-- Force Refresh Banners in Production
-- This script will clear any cached data and refresh banners

-- 1. First, let's see what we have
SELECT 'Before Refresh - Current Data' as status, COUNT(*) as banner_count FROM public.banners;

-- 2. Clear any potential cached data by updating all banners
UPDATE public.banners 
SET updated_at = NOW()
WHERE updated_at < NOW();

-- 3. Force refresh by updating a specific field
UPDATE public.banners 
SET display_order = display_order
WHERE display_order >= 0;

-- 4. Check if updates are working
SELECT 
    'After Force Update' as status,
    id,
    title,
    updated_at,
    display_order
FROM public.banners 
ORDER BY display_order, updated_at;

-- 5. Test inserting a new banner to verify INSERT works
INSERT INTO public.banners (title, subtitle, image_url, link_url, button_text, is_active, display_order) 
VALUES (
    'Test Banner - ' || TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS'),
    'Test subtitle for production verification',
    '/test-image.jpg',
    '/test-link',
    'Test Button',
    true,
    999
)
RETURNING id, title, created_at, updated_at;

-- 6. Immediately delete the test banner
DELETE FROM public.banners 
WHERE title LIKE 'Test Banner - %'
RETURNING id, title;

-- 7. Final verification
SELECT 
    'Final Status' as status,
    COUNT(*) as total_banners,
    MAX(updated_at) as latest_update,
    MIN(updated_at) as earliest_update
FROM public.banners;

-- 8. Show all banners with their update status
SELECT 
    id,
    title,
    image_url,
    is_active,
    display_order,
    created_at,
    updated_at,
    CASE 
        WHEN updated_at > created_at THEN '✅ Modified'
        ELSE '⏰ Not Modified'
    END as update_status
FROM public.banners 
ORDER BY display_order, updated_at DESC; 