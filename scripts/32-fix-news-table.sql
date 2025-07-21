-- Fix news table by adding missing columns and ensuring proper structure
DO $$ 
BEGIN
    -- Add is_featured column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'is_featured'
    ) THEN
        ALTER TABLE news ADD COLUMN is_featured BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_featured column to news table';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'status'
    ) THEN
        ALTER TABLE news ADD COLUMN status VARCHAR(20) DEFAULT 'published';
        RAISE NOTICE 'Added status column to news table';
    END IF;

    -- Add published_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'published_at'
    ) THEN
        ALTER TABLE news ADD COLUMN published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added published_at column to news table';
    END IF;

    -- Add author_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'author_name'
    ) THEN
        ALTER TABLE news ADD COLUMN author_name VARCHAR(255);
        RAISE NOTICE 'Added author_name column to news table';
    END IF;

    -- Add featured_image_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'featured_image_url'
    ) THEN
        ALTER TABLE news ADD COLUMN featured_image_url TEXT;
        RAISE NOTICE 'Added featured_image_url column to news table';
    END IF;

    -- Add excerpt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'excerpt'
    ) THEN
        ALTER TABLE news ADD COLUMN excerpt TEXT;
        RAISE NOTICE 'Added excerpt column to news table';
    END IF;
END $$;

-- Update existing records to have proper values
UPDATE news SET 
    status = 'published' WHERE status IS NULL,
    published_at = NOW() WHERE published_at IS NULL,
    is_featured = true WHERE is_featured IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_news_status_published ON news(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(is_featured, published_at DESC);

-- Ensure RLS policy allows public read access
DROP POLICY IF EXISTS "Allow public read access to news" ON news;
CREATE POLICY "Allow public read access to news" ON news FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT ON news TO anon;
GRANT SELECT ON news TO authenticated;

RAISE NOTICE 'News table structure updated successfully';
