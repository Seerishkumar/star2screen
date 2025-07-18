-- Debug script to check Seerish's profile and all profiles with/without images

-- 1. Check all profiles and their basic info
SELECT 
    user_id,
    full_name,
    display_name,
    stage_name,
    city,
    profession,
    avatar_url,
    is_verified,
    created_at
FROM author_profiles 
ORDER BY created_at DESC;

-- 2. Check all media files and their associations
SELECT 
    user_id,
    title,
    media_type,
    is_profile_picture,
    blob_url,
    file_url,
    created_at
FROM user_media 
ORDER BY user_id, created_at DESC;

-- 3. Find profiles without any media
SELECT 
    ap.user_id,
    ap.full_name,
    ap.display_name,
    COUNT(um.id) as media_count
FROM author_profiles ap
LEFT JOIN user_media um ON ap.user_id = um.user_id
GROUP BY ap.user_id, ap.full_name, ap.display_name
ORDER BY media_count ASC, ap.full_name;

-- 4. Find profiles with media but no profile picture set
SELECT 
    ap.user_id,
    ap.full_name,
    COUNT(um.id) as total_media,
    COUNT(CASE WHEN um.is_profile_picture = true THEN 1 END) as profile_pictures
FROM author_profiles ap
LEFT JOIN user_media um ON ap.user_id = um.user_id AND um.media_type = 'image'
GROUP BY ap.user_id, ap.full_name
HAVING COUNT(um.id) > 0 AND COUNT(CASE WHEN um.is_profile_picture = true THEN 1 END) = 0
ORDER BY ap.full_name;

-- 5. Search for Seerish specifically (case insensitive)
SELECT 
    ap.*,
    COUNT(um.id) as media_count,
    COUNT(CASE WHEN um.is_profile_picture = true THEN 1 END) as profile_picture_count
FROM author_profiles ap
LEFT JOIN user_media um ON ap.user_id = um.user_id
WHERE 
    LOWER(ap.full_name) LIKE '%seerish%' 
    OR LOWER(ap.display_name) LIKE '%seerish%'
    OR LOWER(ap.stage_name) LIKE '%seerish%'
GROUP BY ap.user_id, ap.full_name, ap.display_name, ap.stage_name, ap.bio, ap.city, ap.location, ap.experience_years, ap.primary_roles, ap.profession, ap.avatar_url, ap.is_verified, ap.created_at, ap.updated_at, ap.id;

-- 6. Show Seerish's media files if found
SELECT um.*
FROM user_media um
JOIN author_profiles ap ON um.user_id = ap.user_id
WHERE 
    LOWER(ap.full_name) LIKE '%seerish%' 
    OR LOWER(ap.display_name) LIKE '%seerish%'
    OR LOWER(ap.stage_name) LIKE '%seerish%'
ORDER BY um.created_at DESC;

-- 7. Update query to set profile picture for users with images but no profile picture set
-- (Uncomment to run)
/*
UPDATE user_media 
SET is_profile_picture = true 
WHERE id IN (
    SELECT DISTINCT ON (user_id) id
    FROM user_media 
    WHERE media_type = 'image' 
    AND user_id IN (
        SELECT user_id 
        FROM user_media 
        GROUP BY user_id 
        HAVING COUNT(CASE WHEN is_profile_picture = true THEN 1 END) = 0
    )
    ORDER BY user_id, created_at DESC
);
*/
