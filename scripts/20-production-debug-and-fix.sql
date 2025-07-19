-- Production Debug and Fix Script
-- Run this to ensure all tables exist and have sample data

-- Check if tables exist and create them if missing
DO $$
BEGIN
    -- Create banners table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'banners') THEN
        CREATE TABLE banners (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            subtitle TEXT,
            image_url VARCHAR(500) NOT NULL,
            link_url VARCHAR(500),
            button_text VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert sample banner data
        INSERT INTO banners (title, subtitle, image_url, link_url, button_text, sort_order) VALUES
        ('Welcome to Stars2Screen', 'Connect with the best professionals in the film industry', '/bustling-film-set.png', '/profiles', 'Browse Profiles', 1),
        ('Find Your Next Project', 'Discover amazing opportunities and talented individuals', '/director-in-discussion.png', '/jobs', 'View Jobs', 2);
        
        RAISE NOTICE 'Created banners table with sample data';
    END IF;

    -- Create ads table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ads') THEN
        CREATE TABLE ads (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            image_url VARCHAR(500) NOT NULL,
            link_url VARCHAR(500),
            category VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert sample ads data
        INSERT INTO ads (title, description, image_url, link_url, category, sort_order) VALUES
        ('Professional Headshots', 'Get stunning headshots from top photographers', '/elegant-actress.png', '/categories/photographer', 'photography', 1),
        ('Casting Call Alert', 'Never miss an audition with our premium service', '/confident-actress.png', '/jobs', 'casting', 2),
        ('Film Equipment Rental', 'Rent professional equipment at affordable rates', '/bustling-film-set.png', '/categories/technician', 'equipment', 3);
        
        RAISE NOTICE 'Created ads table with sample data';
    END IF;

    -- Create articles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'articles') THEN
        CREATE TABLE articles (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            excerpt TEXT,
            content TEXT,
            featured_image_url VARCHAR(500),
            author_name VARCHAR(255),
            author_id UUID,
            category VARCHAR(100),
            status VARCHAR(50) DEFAULT 'published',
            published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            reading_time_minutes INTEGER,
            view_count INTEGER DEFAULT 0,
            tags TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert sample articles data
        INSERT INTO articles (title, slug, excerpt, featured_image_url, author_name, category, reading_time_minutes) VALUES
        ('Breaking into the Film Industry: A Beginner''s Guide', 'breaking-into-film-industry-beginners-guide', 'Essential tips and strategies for newcomers to the film industry', '/bustling-film-set.png', 'Sarah Johnson', 'career', 8),
        ('Top 10 Casting Directors to Follow in 2024', 'top-10-casting-directors-2024', 'Meet the casting directors who are shaping the industry this year', '/director-in-discussion.png', 'Michael Chen', 'industry', 6),
        ('The Art of Method Acting: Techniques and Tips', 'art-of-method-acting-techniques-tips', 'Explore the world of method acting and learn from the masters', '/confident-actress.png', 'Emma Rodriguez', 'acting', 10);
        
        RAISE NOTICE 'Created articles table with sample data';
    END IF;

    -- Create videos table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'videos') THEN
        CREATE TABLE videos (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            video_url VARCHAR(500) NOT NULL,
            thumbnail_url VARCHAR(500),
            category VARCHAR(100),
            duration INTEGER,
            view_count INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            is_featured BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert sample videos data
        INSERT INTO videos (title, description, video_url, thumbnail_url, category, is_featured, duration, view_count) VALUES
        ('Acting Masterclass: Emotional Range', 'Learn how to expand your emotional range as an actor', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/confident-actress.png', 'acting', true, 1200, 1500),
        ('Behind the Camera: Cinematography Basics', 'Essential cinematography techniques every filmmaker should know', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/bustling-film-set.png', 'cinematography', true, 900, 2300),
        ('Director''s Vision: From Script to Screen', 'How directors bring their creative vision to life', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/director-in-discussion.png', 'directing', true, 1500, 1800);
        
        RAISE NOTICE 'Created videos table with sample data';
    END IF;

END $$;

-- Enable RLS on all tables
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Public can view active banners" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active ads" ON ads FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view published articles" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view active videos" ON videos FOR SELECT USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banners_active_order ON banners(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_ads_active_order ON ads(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_active_featured ON videos(is_active, is_featured, created_at DESC);

-- Output summary
SELECT 
    'banners' as table_name, 
    COUNT(*) as record_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM banners
UNION ALL
SELECT 
    'ads' as table_name, 
    COUNT(*) as record_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM ads
UNION ALL
SELECT 
    'articles' as table_name, 
    COUNT(*) as record_count,
    COUNT(*) FILTER (WHERE status = 'published') as active_count
FROM articles
UNION ALL
SELECT 
    'videos' as table_name, 
    COUNT(*) as record_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM videos;
