-- Create content management tables for banners, articles, news, reviews, ads, and videos
-- This script will create all the missing tables that are causing production issues

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS public.banners CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE;
DROP TABLE IF EXISTS public.videos CASCADE;

-- Create banners table
CREATE TABLE public.banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    button_text VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table
CREATE TABLE public.articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image_url TEXT,
    author_name VARCHAR(100),
    author_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news table
CREATE TABLE public.news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image_url TEXT,
    category VARCHAR(100),
    author_name VARCHAR(100),
    author_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'published',
    read_time VARCHAR(20),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id SERIAL PRIMARY KEY,
    reviewer_name VARCHAR(100) NOT NULL,
    reviewer_role VARCHAR(100),
    reviewer_image_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT NOT NULL,
    project_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table
CREATE TABLE public.ads (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE public.videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample banners data
INSERT INTO public.banners (title, subtitle, image_url, link_url, button_text, display_order) VALUES
('Welcome to Stars2Screen', 'Connect with the best professionals in the film industry', '/bustling-film-set.png', '/profiles', 'Browse Profiles', 1),
('Find Your Next Project', 'Discover amazing opportunities and talented individuals', '/director-in-discussion.png', '/jobs', 'View Jobs', 2),
('Join Our Community', 'Network with industry professionals and grow your career', '/city-cafe-meetup.png', '/register', 'Sign Up Now', 3);

-- Insert sample articles data
INSERT INTO public.articles (title, slug, excerpt, content, featured_image_url, author_name, status, published_at) VALUES
('Breaking into the Film Industry: A Beginner''s Guide', 'breaking-into-film-industry-beginners-guide', 'Essential tips and strategies for newcomers to the film industry', 'The film industry can seem daunting for newcomers, but with the right approach and persistence, you can build a successful career. Here are the key steps to get started...', '/bustling-film-set.png', 'Sarah Johnson', 'published', NOW() - INTERVAL '5 days'),
('Top 10 Casting Directors to Follow in 2024', 'top-10-casting-directors-2024', 'Meet the casting directors who are shaping the industry this year', 'These casting directors are at the forefront of discovering new talent and shaping the future of cinema...', '/director-in-discussion.png', 'Michael Chen', 'published', NOW() - INTERVAL '3 days'),
('The Art of Method Acting: Techniques and Tips', 'art-of-method-acting-techniques-tips', 'Explore the world of method acting and learn from the masters', 'Method acting is one of the most powerful techniques an actor can master. This comprehensive guide covers...', '/confident-actress.png', 'Emma Rodriguez', 'published', NOW() - INTERVAL '1 day');

-- Insert sample news data
INSERT INTO public.news (title, slug, excerpt, content, featured_image_url, category, author_name, read_time, published_at) VALUES
('Stars2Screen Reaches 50,000 Active Users Milestone', 'stars2screen-50k-users-milestone', 'Our platform continues to grow as more film industry professionals discover the power of connected networking.', 'We are thrilled to announce that Stars2Screen has reached 50,000 active users! This milestone represents...', '/bustling-film-set.png', 'Platform Updates', 'Sarah Johnson', '3 min read', NOW() - INTERVAL '2 days'),
('New AI-Powered Matching System Launches', 'ai-powered-matching-system-launch', 'Our latest feature uses advanced algorithms to connect talent with the perfect opportunities.', 'Today we are excited to launch our revolutionary AI-powered matching system that will transform how...', '/director-in-discussion.png', 'Technology', 'Michael Chen', '5 min read', NOW() - INTERVAL '5 days'),
('Independent Film Festival Partnership Announced', 'independent-film-festival-partnership', 'Stars2Screen partners with major independent film festivals to provide exclusive opportunities.', 'We are proud to announce our new partnership with leading independent film festivals across the globe...', '/city-cafe-meetup.png', 'Partnerships', 'Emma Rodriguez', '3 min read', NOW() - INTERVAL '7 days');

-- Insert sample reviews data
INSERT INTO public.reviews (reviewer_name, reviewer_role, reviewer_image_url, rating, title, content, project_type, is_verified, is_featured, helpful_count) VALUES
('Alexandra Martinez', 'Film Director', '/elegant-woman-red.png', 5, 'Life-changing platform for my career', 'Stars2Screen completely transformed how I find crew members for my projects. The quality of professionals on this platform is exceptional, and the matching system is incredibly accurate. I''ve completed three successful projects through connections made here.', 'Independent Drama Film', true, true, 45),
('James Thompson', 'Cinematographer', '/confident-businessman.png', 5, 'Perfect for finding talented professionals', 'As a freelance cinematographer, finding consistent work was always challenging. Stars2Screen changed that completely. The platform''s professional network and project matching have kept me busy with quality projects that match my skills perfectly.', 'Documentary Series', true, true, 38),
('Priya Sharma', 'Actress', '/confident-indian-professional.png', 5, 'Found my breakthrough role here', 'I landed my breakthrough role through Stars2Screen! The platform''s casting opportunities are legitimate and the communication tools make it easy to connect with directors and casting agents. Highly recommend to any aspiring actor.', 'Feature Film', true, true, 29);

-- Insert sample ads data
INSERT INTO public.ads (title, description, image_url, link_url, display_order) VALUES
('Professional Headshots', 'Get stunning headshots from top photographers', '/elegant-actress.png', '/categories/photographer', 1),
('Casting Opportunities', 'Find your next big role in upcoming productions', '/confident-actress.png', '/jobs', 2),
('Film Equipment Rental', 'Professional grade equipment for your next project', '/bustling-film-set.png', '/categories/equipment', 3);

-- Insert sample videos data
INSERT INTO public.videos (title, description, video_url, thumbnail_url, is_featured) VALUES
('Acting Masterclass: Emotional Range', 'Learn how to expand your emotional range as an actor', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/confident-actress.png', true),
('Behind the Scenes: Film Production', 'Get an inside look at professional film production', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/bustling-film-set.png', true),
('Director''s Workshop: Visual Storytelling', 'Master the art of visual storytelling in film', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/director-in-discussion.png', false);

-- Create indexes for better performance
CREATE INDEX idx_banners_active_order ON public.banners(is_active, display_order);
CREATE INDEX idx_articles_status_published ON public.articles(status, published_at DESC);
CREATE INDEX idx_news_status_published ON public.news(status, published_at DESC);
CREATE INDEX idx_reviews_featured_rating ON public.reviews(is_featured, rating DESC);
CREATE INDEX idx_ads_active_order ON public.ads(is_active, display_order);
CREATE INDEX idx_videos_featured_active ON public.videos(is_featured, is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow read access to all, write access to authenticated users)
CREATE POLICY "Allow public read access on banners" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Allow public read access on articles" ON public.articles FOR SELECT USING (status = 'published');
CREATE POLICY "Allow public read access on news" ON public.news FOR SELECT USING (status = 'published');
CREATE POLICY "Allow public read access on reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read access on ads" ON public.ads FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access on videos" ON public.videos FOR SELECT USING (is_active = true);

-- Create policies for authenticated users to manage content
CREATE POLICY "Allow authenticated users to manage banners" ON public.banners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage articles" ON public.articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage news" ON public.news FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage reviews" ON public.reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage ads" ON public.ads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to manage videos" ON public.videos FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.news TO anon, authenticated;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT SELECT ON public.ads TO anon, authenticated;
GRANT SELECT ON public.videos TO anon, authenticated;

GRANT ALL ON public.banners TO authenticated;
GRANT ALL ON public.articles TO authenticated;
GRANT ALL ON public.news TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.ads TO authenticated;
GRANT ALL ON public.videos TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

COMMIT;
