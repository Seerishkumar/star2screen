-- Create banners table for homepage carousel
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  button_text VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table for promotional content
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  category VARCHAR(100), -- 'profile', 'film', 'service', etc.
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table for video showcase
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL, -- YouTube, Vimeo, or direct video URL
  thumbnail_url TEXT,
  category VARCHAR(100), -- 'trailer', 'interview', 'behind-scenes', etc.
  duration INTEGER, -- in seconds
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample banner data
INSERT INTO banners (title, subtitle, image_url, link_url, button_text, sort_order) VALUES
('Discover Amazing Talent', 'Connect with the best professionals in the film industry', '/bustling-film-set.png', '/profiles', 'Browse Profiles', 1),
('Latest Film Reviews', 'Read expert reviews and insights from industry professionals', '/director-in-discussion.png', '/articles', 'Read Reviews', 2),
('Join Our Community', 'Become part of the largest film industry network', '/confident-actress.png', '/register', 'Join Now', 3),
('Premium Services', 'Unlock exclusive features and connect with top talent', '/elegant-actress.png', '/subscription', 'Go Premium', 4),
('Film Industry News', 'Stay updated with the latest news and trends', '/bustling-city-street.png', '/articles', 'Read News', 5);

-- Insert sample ads data
INSERT INTO ads (title, description, image_url, link_url, category, sort_order) VALUES
('Featured Actor: Sarah Johnson', 'Award-winning actress available for new projects', '/elegant-woman-red.png', '/profiles/1', 'profile', 1),
('New Film: City Lights', 'Upcoming thriller movie - Now casting for supporting roles', '/city-cafe-meetup.png', '/jobs', 'film', 2),
('Professional Photography', 'High-quality headshots and portfolio photography services', '/confident-young-professional.png', '/services', 'service', 3),
('Casting Call: Action Movie', 'Seeking stunt performers and action specialists', '/inferno-escape.png', '/jobs', 'casting', 4),
('Film Equipment Rental', 'Professional cameras, lighting, and sound equipment', '/bustling-film-set.png', '/services', 'equipment', 5);

-- Insert sample videos data
INSERT INTO videos (title, description, video_url, thumbnail_url, category, is_featured) VALUES
('Behind the Scenes: Action Sequence', 'Exclusive look at how we filmed the car chase scene', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/bustling-film-set.png', 'behind-scenes', true),
('Actor Interview: Method Acting', 'In-depth discussion about character preparation', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/director-in-discussion.png', 'interview', true),
('Film Trailer: Midnight Dreams', 'Official trailer for the upcoming psychological thriller', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/woman-contemplating-window.png', 'trailer', true),
('Cinematography Masterclass', 'Learn advanced camera techniques from industry experts', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/confident-businessman.png', 'educational', false);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banners_active_sort ON banners(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_ads_active_sort ON ads(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_videos_featured_active ON videos(is_featured, is_active);
