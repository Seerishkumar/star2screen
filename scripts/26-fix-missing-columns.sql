-- Fix missing columns in author_profiles table
-- This script adds the missing columns that are causing the 500 errors

DO $$
BEGIN
    -- Add profile_picture_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'author_profiles' 
        AND column_name = 'profile_picture_url'
    ) THEN
        ALTER TABLE author_profiles ADD COLUMN profile_picture_url TEXT;
        RAISE NOTICE '✅ Added profile_picture_url column';
    ELSE
        RAISE NOTICE '✅ profile_picture_url column already exists';
    END IF;

    -- Add category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'author_profiles' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE author_profiles ADD COLUMN category TEXT DEFAULT 'Not specified';
        RAISE NOTICE '✅ Added category column';
    ELSE
        RAISE NOTICE '✅ category column already exists';
    END IF;

    -- Add location column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'author_profiles' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE author_profiles ADD COLUMN location TEXT DEFAULT 'Not specified';
        RAISE NOTICE '✅ Added location column';
    ELSE
        RAISE NOTICE '✅ location column already exists';
    END IF;

    -- Add profession column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'author_profiles' 
        AND column_name = 'profession'
    ) THEN
        ALTER TABLE author_profiles ADD COLUMN profession TEXT DEFAULT 'Not specified';
        RAISE NOTICE '✅ Added profession column';
    ELSE
        RAISE NOTICE '✅ profession column already exists';
    END IF;

    -- Update existing records with default values
    UPDATE author_profiles 
    SET category = 'Not specified' 
    WHERE category IS NULL;

    UPDATE author_profiles 
    SET location = 'Not specified' 
    WHERE location IS NULL;

    RAISE NOTICE 'Updated existing records with default values';
END $$;

-- Verify the columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'author_profiles' 
AND column_name IN ('profile_picture_url', 'category', 'location', 'profession')
ORDER BY column_name;

-- Show sample data to verify
SELECT 
    id,
    display_name,
    profile_picture_url,
    category,
    location,
    profession
FROM author_profiles 
LIMIT 5;

RAISE NOTICE '🎉 Database schema fix completed successfully!';
