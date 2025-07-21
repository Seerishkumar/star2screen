-- Production Database Setup Script
-- This script ensures all required tables exist with proper structure and sample data
-- Safe to run multiple times - will only create missing tables/data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ads table with all required columns
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author_id UUID,
    category TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create news table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    category TEXT,
    author TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reviewer_name TEXT NOT NULL,
    reviewer_title TEXT,
    reviewer_image TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    category TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns to author_profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'author_profiles' AND column_name = 'profile_picture_url') THEN
        ALTER TABLE author_profiles ADD COLUMN profile_picture_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'author_profiles' AND column_name = 'location') THEN
        ALTER TABLE author_profiles ADD COLUMN location TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'author_profiles' AND column_name = 'category') THEN
        ALTER TABLE author_profiles ADD COLUMN category TEXT;
    END IF;
END $$;

-- Insert sample data only if tables are empty

-- Sample ads data
INSERT INTO public.ads (title, description, image_url, link_url, is_active, sort_order)
SELECT * FROM (VALUES
    ('Premium Casting Opportunities', 'Get featured in top film projects', '/confident-actress.png', '/categories/actress', true, 1),
    ('Director Spotlight', 'Showcase your directorial vision', '/director-in-discussion.png', '/categories/director', true, 2),
    ('Producer Network', 'Connect with industry producers', '/confident-businessman.png', '/categories/producer', true, 3)
) AS v(title, description, image_url, link_url, is_active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.ads);

-- Sample banners data
INSERT INTO public.banners (title, subtitle, image_url, link_url, is_active, sort_order)
SELECT * FROM (VALUES
    ('Welcome to Stars2Screen', 'Connecting talent with opportunity in the film industry', '/hero-illustration.png', '/categories', true, 1),
    ('Find Your Next Role', 'Browse thousands of casting opportunities', '/bustling-film-set.png', '/search', true, 2),
    ('Showcase Your Talent', 'Create a professional profile and get discovered', '/confident-actress.png', '/register', true, 3)
) AS v(title, subtitle, image_url, link_url, is_active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.banners);

-- Sample articles data
INSERT INTO public.articles (title, slug, content, excerpt, featured_image, category, is_published)
SELECT * FROM (VALUES
    ('Breaking into the Film Industry', 'breaking-into-film-industry', 'The film industry can seem daunting to newcomers...', 'Essential tips for aspiring filmmakers and actors', '/bustling-film-set.png', 'Career', true),
    ('The Art of Method Acting', 'art-of-method-acting', 'Method acting is a technique that has produced some of the most memorable performances...', 'Exploring the depths of character immersion', '/confident-actress.png', 'Acting', true),
    ('Independent Film Production Guide', 'independent-film-production-guide', 'Creating an independent film requires careful planning and resourcefulness...', 'A comprehensive guide to indie filmmaking', '/director-in-discussion.png', 'Production', true)
) AS v(title, slug, content, excerpt, featured_image, category, is_published)
WHERE NOT EXISTS (SELECT 1 FROM public.articles);

-- Sample videos data
INSERT INTO public.videos (title, description, video_url, thumbnail_url, is_active, sort_order)
SELECT * FROM (VALUES
    ('Acting Masterclass Preview', 'Learn from industry professionals', 'https://example.com/video1', '/confident-actress.png', true, 1),
    ('Behind the Scenes: Film Production', 'See how movies are made', 'https://example.com/video2', '/bustling-film-set.png', true, 2),
    ('Director Interview Series', 'Insights from successful directors', 'https://example.com/video3', '/director-in-discussion.png', true, 3)
) AS v(title, description, video_url, thumbnail_url, is_active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.videos);

-- Sample news data
INSERT INTO public.news (title, content, excerpt, featured_image, category, author, is_published)
SELECT * FROM (VALUES
    ('New Film Studio Opens in Mumbai', 'A state-of-the-art film studio has opened its doors in Mumbai...', 'Major investment in Indian film infrastructure', '/bustling-film-set.png', 'Industry News', 'Film Reporter', true),
    ('Casting Call: Major Production Seeks Talent', 'A major upcoming production is now casting for multiple roles...', 'Opportunities for actors of all experience levels', '/confident-actress.png', 'Casting News', 'Casting Director', true),
    ('Film Festival Announces Winners', 'The annual independent film festival has announced this years winners...', 'Celebrating excellence in independent cinema', '/director-in-discussion.png', 'Awards', 'Festival Organizer', true),
    ('Technology in Modern Filmmaking', 'How digital technology is revolutionizing the film industry...', 'The future of cinema production', '/bustling-city-street.png', 'Technology', 'Tech Writer', true),
    ('Actor Spotlight: Rising Stars', 'Meet the emerging talents making waves in the industry...', 'New faces to watch in upcoming films', '/confident-young-professional.png', 'Profiles', 'Entertainment Writer', true)
) AS v(title, content, excerpt, featured_image, category, author, is_published)
WHERE NOT EXISTS (SELECT 1 FROM public.news);

-- Sample reviews data
INSERT INTO public.reviews (reviewer_name, reviewer_title, reviewer_image, rating, review_text, category, is_featured)
SELECT * FROM (VALUES
    ('Sarah Johnson', 'Film Director', '/confident-actress.png', 5, 'Stars2Screen helped me find the perfect cast for my independent film. The platform is intuitive and the talent pool is impressive.', 'Director', true),
    ('Michael Chen', 'Producer', '/confident-businessman.png', 5, 'As a producer, I need reliable talent quickly. This platform delivers every time with professional, verified profiles.', 'Producer', true),
    ('Emma Rodriguez', 'Actress', '/elegant-actress.png', 4, 'Great platform for finding auditions and connecting with industry professionals. Highly recommended for actors.', 'Actor', true),
    ('David Kumar', 'Cinematographer', '/confident-indian-professional.png', 5, 'The networking opportunities here are fantastic. I have connected with so many talented filmmakers.', 'Crew', false),
    ('Lisa Thompson', 'Casting Director', '/elegant-woman-blue.png', 4, 'This platform streamlines the casting process significantly. The search filters are particularly useful.', 'Casting', false)
) AS v(reviewer_name, reviewer_title, reviewer_image, rating, review_text, category, is_featured)
WHERE NOT EXISTS (SELECT 1 FROM public.reviews);

-- Enable RLS on all tables
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public read access
CREATE POLICY IF NOT EXISTS "Public read access for ads" ON public.ads FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access for banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access for articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access for videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access for news" ON public.news FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access for reviews" ON public.reviews FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ads_active_sort ON public.ads (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_banners_active_sort ON public.banners (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles (is_published, created_at);
CREATE INDEX IF NOT EXISTS idx_videos_active_sort ON public.videos (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news (is_published, created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON public.reviews (is_featured, rating);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update triggers for all tables
DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_banners_updated_at ON public.banners;
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_videos_updated_at ON public.videos;
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_news_updated_at ON public.news;
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
