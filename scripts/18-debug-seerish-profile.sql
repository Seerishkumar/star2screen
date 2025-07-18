-- Debug script to check Seerish's profile and media
-- Run this to see what's in the database for Seerish

-- Check if there's a profile with name containing "seerish" (case insensitive)
SELECT 
    user_id,
    full_name,
    display_name,
    stage_name,
    bio,
    avatar_url,
    created_at
FROM author_profiles 
WHERE LOWER(full_name) LIKE '%seerish%' 
   OR LOWER(display_name) LIKE '%seerish%' 
   OR LOWER(stage_name) LIKE '%seerish%';

-- Check media files for users with "seerish" in their profile
WITH seerish_users AS (
    SELECT user_id, full_name
    FROM author_profiles 
    WHERE LOWER(full_name) LIKE '%seerish%' 
       OR LOWER(display_name) LIKE '%seerish%' 
       OR LOWER(stage_name) LIKE '%seerish%'
)
SELECT 
    su.full_name,
    um.user_id,
    um.title,
    um.media_type,
    um.file_url,
    um.blob_url,
    um.is_profile_picture,
    um.is_featured,
    um.created_at
FROM seerish_users su
JOIN user_media um ON su.user_id = um.user_id
ORDER BY um.created_at DESC;

-- Check all profiles to see which ones have media
SELECT 
    ap.full_name,
    ap.user_id,
    COUNT(um.id) as media_count,
    COUNT(CASE WHEN um.is_profile_picture = true THEN 1 END) as profile_pictures,
    COUNT(CASE WHEN um.media_type = 'image' THEN 1 END) as images
FROM author_profiles ap
LEFT JOIN user_media um ON ap.user_id = um.user_id
GROUP BY ap.user_id, ap.full_name
ORDER BY media_count DESC;

-- Show recent profiles and their media status
SELECT 
    ap.full_name,
    ap.user_id,
    ap.avatar_url,
    um.blob_url as profile_picture_blob,
    um.file_url as profile_picture_file,
    um.is_profile_picture,
    ap.created_at
FROM author_profiles ap
LEFT JOIN user_media um ON ap.user_id = um.user_id AND um.is_profile_picture = true
ORDER BY ap.created_at DESC
LIMIT 10;
