-- Create sample data for home page testing
-- This script creates test data for banners, ads, articles, and videos

-- Insert sample banners
INSERT INTO banners (title, subtitle, image_url, link_url, button_text, is_active, display_order) VALUES
('Welcome to FilmConnect', 'Connect with the best professionals in the film industry', '/hero-illustration.png', '/profiles', 'Browse Profiles', true, 1),
('Find Your Next Project', 'Discover amazing opportunities and talented individuals', '/bustling-film-set.png', '/jobs', 'View Jobs', true, 2),
('Join Our Community', 'Be part of the largest film industry network', '/director-in-discussion.png', '/register', 'Sign Up Now', true, 3)
ON CONFLICT (title) DO UPDATE SET
  subtitle = EXCLUDED.subtitle,
  image_url = EXCLUDED.image_url,
  link_url = EXCLUDED.link_url,
  button_text = EXCLUDED.button_text,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

-- Insert sample ads/promotions
INSERT INTO ads (title, description, image_url, link_url, category, is_active, sort_order) VALUES
('Professional Headshots', 'Get stunning headshots from top photographers', '/confident-actress.png', '/services/photography', 'service', true, 1),
('Acting Workshops', 'Improve your skills with expert-led workshops', '/elegant-actress.png', '/services/training', 'education', true, 2),
('Casting Calls Open', 'New opportunities for actors and performers', '/film-scene-woman.png', '/jobs', 'casting', true, 3),
('Equipment Rental', 'Professional film equipment at affordable rates', '/bustling-city-street.png', '/services/equipment', 'service', true, 4)
ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  link_url = EXCLUDED.link_url,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Insert sample articles
INSERT INTO articles (title, excerpt, content, featured_image_url, category, author_name, status, published_at, reading_time_minutes, view_count) VALUES
('The Future of Independent Filmmaking', 'Exploring new trends and technologies shaping independent cinema', 'Independent filmmaking has evolved dramatically over the past decade. With advances in digital technology, streaming platforms, and social media marketing, independent filmmakers now have more tools than ever to create and distribute their work...', '/inferno-escape.png', 'Industry News', 'Sarah Johnson', 'published', NOW() - INTERVAL ''1 day'', 5, 1250),
('Building Your Acting Portfolio', 'Essential tips for creating a compelling acting portfolio', 'Your acting portfolio is your calling card in the entertainment industry. It should showcase your range, professionalism, and unique qualities that set you apart from other actors...', '/confident-young-professional.png', 'Career Tips', 'Michael Chen', 'published', NOW() - INTERVAL ''3 days'', 7, 890),
('Behind the Scenes: Film Production Insights', 'A deep dive into the film production process', 'Film production is a complex orchestration of creative and technical elements. From pre-production planning to post-production editing, every stage requires careful coordination...', '/bustling-film-set.png', 'Behind the Scenes', 'Emma Rodriguez', 'published', NOW() - INTERVAL ''5 days'', 10, 2100),
('Networking in the Film Industry', 'How to build meaningful professional relationships', 'Networking is crucial in the film industry, but it''s about more than just collecting business cards. Building genuine relationships and maintaining them over time is key to long-term success...', '/city-cafe-meetup.png', 'Career Tips', 'David Kim', 'published', NOW() - INTERVAL ''1 week'', 6, 1500),
('The Rise of Streaming Platforms', 'How streaming services are changing content creation', 'Streaming platforms have revolutionized how we consume and create content. For filmmakers, this represents both opportunities and challenges in reaching audiences...', '/woman-contemplating-window.png', 'Industry News', 'Lisa Thompson', 'published', NOW() - INTERVAL ''10 days'', 8, 1800),
('Cinematography Techniques for Beginners', 'Essential camera techniques every filmmaker should know', 'Great cinematography can elevate any story. Whether you''re working with a smartphone or professional equipment, understanding basic techniques is essential...', '/confident-businessman.png', 'Technical', 'Alex Martinez', 'published', NOW() - INTERVAL ''2 weeks'', 12, 950)
ON CONFLICT (title) DO UPDATE SET
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image_url = EXCLUDED.featured_image_url,
  category = EXCLUDED.category,
  author_name = EXCLUDED.author_name,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  reading_time_minutes = EXCLUDED.reading_time_minutes,
  view_count = EXCLUDED.view_count;

-- Insert sample videos
INSERT INTO videos (title, description, video_url, thumbnail_url, category, duration, view_count, is_active, is_featured) VALUES
('FilmConnect Platform Overview', 'Learn how to use FilmConnect to advance your career', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/hero-illustration.png', 'Tutorial', 180, 5200, true, true),
('Acting Masterclass Preview', 'A preview of our comprehensive acting masterclass', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/elegant-actress.png', 'Education', 240, 3800, true, true),
('Behind the Scenes: Indie Film Production', 'Go behind the scenes of an independent film production', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/bustling-film-set.png', 'Behind the Scenes', 420, 7500, true, true),
('Cinematography Tips and Tricks', 'Professional cinematographers share their secrets', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/director-in-discussion.png', 'Technical', 360, 4200, true, true),
('Success Stories: From FilmConnect to Hollywood', 'Hear from professionals who found success through our platform', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/confident-indian-professional.png', 'Success Stories', 300, 6100, true, true)
ON CONFLICT (title) DO UPDATE SET
  description = EXCLUDED.description,
  video_url = EXCLUDED.video_url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  category = EXCLUDED.category,
  duration = EXCLUDED.duration,
  view_count = EXCLUDED.view_count,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured;

-- Verify the data was inserted
SELECT 'Banners' as table_name, COUNT(*) as count FROM banners WHERE is_active = true
UNION ALL
SELECT 'Ads' as table_name, COUNT(*) as count FROM ads WHERE is_active = true
UNION ALL
SELECT 'Articles' as table_name, COUNT(*) as count FROM articles WHERE status = 'published'
UNION ALL
SELECT 'Videos' as table_name, COUNT(*) as count FROM videos WHERE is_active = true AND is_featured = true;
