-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  read_time TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample blog posts
INSERT INTO blog_posts (title, excerpt, content, author, category, published, published_at, image_url, read_time, tags) VALUES
('Breaking into the Film Industry: A Complete Guide', 'Essential tips and strategies for newcomers looking to establish their career in the entertainment industry.', 'The film industry can seem daunting to newcomers, but with the right approach and persistence, you can build a successful career. This comprehensive guide covers everything from networking to portfolio building...', 'Sarah Johnson', 'Career Advice', true, '2024-01-15', '/bustling-film-set.png', '8 min read', ARRAY['Career', 'Tips', 'Industry']),
('The Rise of Independent Cinema in 2024', 'How independent filmmakers are reshaping the industry with innovative storytelling and distribution methods.', 'Independent cinema has experienced unprecedented growth in recent years, with streaming platforms and digital distribution opening new opportunities for filmmakers...', 'Michael Chen', 'Industry News', true, '2024-01-12', '/director-in-discussion.png', '6 min read', ARRAY['Independent', 'Cinema', 'Trends']),
('Networking Events That Changed Careers', 'Real stories from professionals who found their breakthrough opportunities at industry events.', 'Networking remains one of the most powerful tools for career advancement in the entertainment industry. Here are inspiring stories from professionals who transformed their careers through strategic networking...', 'Emma Rodriguez', 'Success Stories', true, '2024-01-10', '/city-cafe-meetup.png', '5 min read', ARRAY['Networking', 'Success', 'Events']),
('Technology Trends Shaping Film Production', 'From AI-assisted editing to virtual production, explore the technologies revolutionizing filmmaking.', 'The film industry is embracing cutting-edge technology at an unprecedented pace. From artificial intelligence in post-production to virtual sets and real-time rendering...', 'David Kim', 'Technology', true, '2024-01-08', '/bustling-city-street.png', '7 min read', ARRAY['Technology', 'Production', 'Innovation']),
('Building Your Portfolio: What Casting Directors Want to See', 'Industry insights on creating a compelling portfolio that gets you noticed by casting professionals.', 'Your portfolio is your calling card in the entertainment industry. Casting directors see hundreds of portfolios every week, so making yours stand out is crucial...', 'Lisa Thompson', 'Portfolio Tips', true, '2024-01-05', '/confident-actress.png', '9 min read', ARRAY['Portfolio', 'Casting', 'Tips']);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for blog posts (public read access)
CREATE POLICY "Anyone can read published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Create policies for admin logs (admin only)
CREATE POLICY "Only admins can read admin logs" ON admin_logs
  FOR SELECT USING (false); -- Will be handled by service role

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
