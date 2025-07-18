-- First, let's see what columns actually exist
-- Check the current structure of author_profiles table
DO $$
BEGIN
    -- Add profession column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'author_profiles' AND column_name = 'profession') THEN
        ALTER TABLE author_profiles ADD COLUMN profession VARCHAR(100);
        RAISE NOTICE 'Added profession column';
    END IF;

    -- Add is_featured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'author_profiles' AND column_name = 'is_featured') THEN
        ALTER TABLE author_profiles ADD COLUMN is_featured BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_featured column';
    END IF;

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'author_profiles' AND column_name = 'is_active') THEN
        ALTER TABLE author_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column';
    END IF;
END $$;

-- Set default values for existing records
UPDATE author_profiles 
SET profession = 'Professional'
WHERE profession IS NULL;

-- Set some profiles as featured for testing
UPDATE author_profiles 
SET is_featured = true 
WHERE id IN (
  SELECT id FROM author_profiles 
  ORDER BY created_at DESC 
  LIMIT 3
);

-- Ensure all profiles are active by default
UPDATE author_profiles 
SET is_active = true 
WHERE is_active IS NULL;

-- Insert some sample data if table is empty
INSERT INTO author_profiles (full_name, profession, location, experience_years, is_featured, is_active)
SELECT * FROM (VALUES
  ('John Actor', 'Actor', 'Mumbai', 5, true, true),
  ('Jane Director', 'Director', 'Delhi', 8, true, true),
  ('Mike Producer', 'Producer', 'Bangalore', 10, true, true),
  ('Sarah Actress', 'Actress', 'Chennai', 3, false, true),
  ('David Cinematographer', 'Cinematographer', 'Hyderabad', 7, false, true)
) AS sample_data(full_name, profession, location, experience_years, is_featured, is_active)
WHERE NOT EXISTS (SELECT 1 FROM author_profiles LIMIT 1);
