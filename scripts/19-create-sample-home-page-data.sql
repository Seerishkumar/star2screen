-- Create sample data for home page sections
-- This ensures you have content to display in production

-- Create banners table if it doesn't exist
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  button_text VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table if it doesn't exist
CREATE TABLE IF NOT EXISTS ads (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table if it doesn't exist
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category VARCHAR(100),
  author_name VARCHAR(255),
  author_id UUID,
  status VARCHAR(50) DEFAULT 'published',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reading_time_minutes INTEGER,
  view_count INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(100),
  duration INTEGER,
  view_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample banners
INSERT INTO banners (title, subtitle, image_url, link_url, button_text, display_order) VALUES
('Welcome to FilmConnect', 'Connect with the best professionals in the film industry', '/bustling-film-set.png', '/profiles', 'Browse Profiles', 1),
('Find Your Next Project', 'Discover amazing opportunities and talented individuals', '/director-in-discussion.png', '/jobs', 'View Jobs', 2),
('Join Our Community', 'Be part of the largest film industry network', '/confident-actress.png', '/register', 'Sign Up Now', 3)
ON CONFLICT DO NOTHING;

-- Insert sample ads
INSERT INTO ads (title, description, image_url, link_url, category, sort_order) VALUES
('Professional Headshots', 'Get stunning headshots from top photographers in your area', '/elegant-actress.png', '/categories/photographer', 'photography', 1),
('Casting Call Alert', 'Never miss an audition with our premium notification service', '/confident-actress.png', '/jobs', 'casting', 2),
('Film Equipment Rental', 'Rent professional equipment at affordable rates', '/bustling-film-set.png', '/categories/technician', 'equipment', 3),
('Acting Classes', 'Improve your craft with classes from industry professionals', '/elegant-woman-blue.png', '/categories/actor', 'education', 4)
ON CONFLICT DO NOTHING;

-- Insert sample articles
INSERT INTO articles (title, slug, excerpt, content, featured_image_url, category, author_name, reading_time_minutes, view_count) VALUES
('Breaking into the Film Industry: A Beginner''s Guide', 'breaking-into-film-industry-beginners-guide', 'Essential tips and strategies for newcomers to the film industry', 'The film industry can seem daunting to newcomers, but with the right approach and mindset, anyone can build a successful career. This comprehensive guide covers everything from networking to building your portfolio...', '/bustling-film-set.png', 'Career Advice', 'Sarah Johnson', 8, 1250),
('Top 10 Casting Directors to Follow in 2024', 'top-10-casting-directors-2024', 'Meet the casting directors who are shaping the industry this year', 'Casting directors play a crucial role in bringing stories to life. Here are the top 10 casting directors you should know about in 2024...', '/director-in-discussion.png', 'Industry News', 'Michael Chen', 6, 890),
('The Art of Method Acting: Techniques and Tips', 'art-of-method-acting-techniques-tips', 'Explore the world of method acting and learn from the masters', 'Method acting has produced some of the most memorable performances in cinema history. Learn about the techniques used by legendary actors...', '/confident-actress.png', 'Acting Tips', 'Emma Rodriguez', 10, 2100),
('Behind the Scenes: Life of a Film Producer', 'behind-scenes-life-film-producer', 'What does it really take to produce a successful film?', 'Film producers are the unsung heroes of the movie industry. They handle everything from financing to post-production...', '/confident-businessman.png', 'Career Spotlight', 'David Kim', 7, 675),
('Digital vs Film: The Great Debate Continues', 'digital-vs-film-great-debate', 'Exploring the ongoing discussion between digital and traditional film', 'The debate between digital and film continues to divide filmmakers. Each medium has its unique advantages...', '/bustling-city-street.png', 'Technology', 'Lisa Thompson', 9, 1450),
('Networking Events That Actually Work for Actors', 'networking-events-that-work-actors', 'How to make meaningful connections in the entertainment industry', 'Networking is crucial for actors, but not all events are created equal. Here''s how to identify and make the most of valuable networking opportunities...', '/city-cafe-meetup.png', 'Networking', 'James Wilson', 5, 980)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample videos
INSERT INTO videos (title, description, video_url, thumbnail_url, category, duration, view_count, is_featured) VALUES
('Acting Masterclass: Emotional Range', 'Learn how to expand your emotional range as an actor', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/confident-actress.png', 'Acting', 1800, 15000, true),
('Behind the Camera: Cinematography Basics', 'Essential cinematography techniques every filmmaker should know', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/bustling-film-set.png', 'Cinematography', 2400, 8500, true),
('Director''s Vision: From Script to Screen', 'How directors bring their creative vision to life', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/director-in-discussion.png', 'Directing', 2100, 12000, true),
('The Producer''s Journey', 'Follow a film from development to distribution', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/confident-businessman.png', 'Producing', 1950, 6800, false),
('Casting Call Success Stories', 'Real actors share their breakthrough moments', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/elegant-woman-red.png', 'Casting', 1650, 9200, true)
ON CONFLICT DO NOTHING;

-- Update author_profiles to have some verified profiles
UPDATE author_profiles 
SET is_verified = true 
WHERE id IN (
  SELECT id FROM author_profiles 
  WHERE full_name IS NOT NULL 
  LIMIT 10
);

-- Create some sample user_media entries if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_media') THEN
    -- Insert sample media for existing profiles
    INSERT INTO user_media (user_id, file_url, media_type, is_profile_picture)
    SELECT 
      user_id,
      CASE 
        WHEN category = 'actor' THEN '/confident-actress.png'
        WHEN category = 'director' THEN '/director-in-discussion.png'
        WHEN category = 'producer' THEN '/confident-businessman.png'
        ELSE '/confident-young-professional.png'
      END,
      'image',
      true
    FROM author_profiles 
    WHERE is_verified = true
    AND user_id NOT IN (SELECT DISTINCT user_id FROM user_media WHERE is_profile_picture = true)
    LIMIT 5
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Show summary of created data
SELECT 
  'banners' as table_name, COUNT(*) as record_count FROM banners WHERE is_active = true
UNION ALL
SELECT 
  'ads' as table_name, COUNT(*) as record_count FROM ads WHERE is_active = true
UNION ALL
SELECT 
  'articles' as table_name, COUNT(*) as record_count FROM articles WHERE status = 'published'
UNION ALL
SELECT 
  'videos' as table_name, COUNT(*) as record_count FROM videos WHERE is_active = true
UNION ALL
SELECT 
  'featured_videos' as table_name, COUNT(*) as record_count FROM videos WHERE is_featured = true
UNION ALL
SELECT 
  'verified_profiles' as table_name, COUNT(*) as record_count FROM author_profiles WHERE is_verified = true;
