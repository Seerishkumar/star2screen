-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    button_text VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ads table
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create categories table for articles
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category_id UUID REFERENCES public.categories(id),
    category VARCHAR(100),
    author_name VARCHAR(255),
    author_id UUID,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    reading_time_minutes INTEGER,
    view_count INTEGER DEFAULT 0,
    tags TEXT[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category VARCHAR(100),
    duration INTEGER, -- in seconds
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert sample banners
INSERT INTO public.banners (title, subtitle, image_url, link_url, button_text, display_order) VALUES
('Discover Amazing Talent', 'Connect with top professionals in the film industry', 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop', '/profiles', 'Browse Profiles', 1),
('Latest Film Reviews', 'Read expert reviews and industry insights', 'https://images.unsplash.com/photo-1489599904472-af35ff2c7c3f?w=1200&h=600&fit=crop', '/articles', 'Read Reviews', 2),
('Join Our Community', 'Network with industry professionals worldwide', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=600&fit=crop', '/register', 'Sign Up Now', 3),
('Premium Services', 'Unlock exclusive features and opportunities', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop', '/premium', 'Go Premium', 4),
('Industry News', 'Stay updated with the latest film industry news', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&h=600&fit=crop', '/articles', 'Read News', 5);

-- Insert sample ads
INSERT INTO public.ads (title, description, image_url, link_url, category) VALUES
('Featured Actor: John Smith', 'Award-winning actor available for new projects. 15+ years experience in drama and action films.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', '/profiles/john-smith', 'profile'),
('Casting Call: Indie Film', 'Seeking talented actors for upcoming independent film. Multiple roles available.', 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=300&fit=crop', '/jobs/indie-film-casting', 'casting'),
('Professional Photography', 'High-quality headshots and portfolio photography for actors and models.', 'https://images.unsplash.com/photo-1554048612-b6a482b224b1?w=400&h=300&fit=crop', '/services/photography', 'service'),
('Film Equipment Rental', 'Professional grade cameras, lighting, and sound equipment for rent.', 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=300&fit=crop', '/services/equipment', 'service'),
('Acting Workshop', 'Intensive 3-day workshop with industry professionals. Limited seats available.', 'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=400&h=300&fit=crop', '/workshops/acting', 'education'),
('Director Spotlight', 'Meet acclaimed director Sarah Johnson and her latest project insights.', 'https://images.unsplash.com/photo-1494790108755-2616c9c0b8d3?w=400&h=300&fit=crop', '/profiles/sarah-johnson', 'profile');

-- Insert sample categories
INSERT INTO public.categories (name, slug, description) VALUES
('Film Reviews', 'film-reviews', 'In-depth reviews of latest films and cinema'),
('Industry News', 'industry-news', 'Latest news and updates from the film industry'),
('Interviews', 'interviews', 'Exclusive interviews with industry professionals'),
('Behind the Scenes', 'behind-the-scenes', 'Behind the scenes content and production insights'),
('Career Tips', 'career-tips', 'Career advice and tips for film industry professionals'),
('Technology', 'technology', 'Latest technology trends in filmmaking');

-- Insert sample articles
INSERT INTO public.articles (title, slug, excerpt, content, featured_image_url, category, author_name, reading_time_minutes, view_count, tags) VALUES
('The Rise of Independent Cinema in 2024', 'rise-of-independent-cinema-2024', 'Independent films are making a significant impact on the industry with innovative storytelling and fresh perspectives.', 'Independent cinema has experienced a remarkable renaissance in 2024, with filmmakers pushing creative boundaries and audiences embracing diverse narratives. This year has seen breakthrough performances from emerging talent and innovative distribution strategies that are reshaping how we consume film content. From intimate character studies to bold experimental works, independent films are proving that compelling storytelling doesn''t require massive budgets. The democratization of filmmaking technology has enabled more voices to enter the conversation, resulting in a rich tapestry of stories that reflect our diverse world. Streaming platforms have become crucial partners in this movement, providing global reach for films that might have struggled to find theatrical distribution just a few years ago.', 'https://images.unsplash.com/photo-1489599904472-af35ff2c7c3f?w=800&h=400&fit=crop', 'Film Reviews', 'Sarah Mitchell', 8, 1250, ARRAY['independent film', 'cinema', '2024', 'storytelling']),

('Mastering Method Acting: A Complete Guide', 'mastering-method-acting-guide', 'Dive deep into the techniques and principles of method acting with insights from industry professionals.', 'Method acting remains one of the most powerful and transformative approaches to performance, requiring actors to draw from their own experiences and emotions to create authentic characters. This comprehensive guide explores the fundamental principles established by Constantin Stanislavski and later developed by Lee Strasberg at the Actors Studio. We examine how contemporary actors like Daniel Day-Lewis, Meryl Streep, and Joaquin Phoenix have used method techniques to deliver career-defining performances. The article covers practical exercises for emotional memory, sense memory, and character development, while also addressing the psychological considerations and potential challenges of this intensive approach. Whether you''re a seasoned professional or an aspiring actor, understanding method acting can significantly enhance your craft and bring depth to your performances.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop', 'Career Tips', 'Michael Rodriguez', 12, 2100, ARRAY['method acting', 'acting techniques', 'performance', 'stanislavski']),

('Behind the Scenes: Creating Epic Action Sequences', 'behind-scenes-epic-action-sequences', 'Explore the intricate process of choreographing and filming high-octane action scenes in modern cinema.', 'Creating memorable action sequences requires a perfect blend of choreography, cinematography, and post-production magic. This behind-the-scenes look reveals the meticulous planning that goes into every punch, explosion, and chase scene. We speak with stunt coordinators, directors, and VFX supervisors who share their insights on safety protocols, camera techniques, and the evolution of action filmmaking. From the practical effects of classic films to today''s CGI-enhanced spectacles, we explore how technology has transformed the genre while maintaining the importance of skilled performers and careful planning. The article includes case studies from recent blockbusters, examining how different approaches to action can serve story and character development. We also discuss the growing recognition of stunt performers and their crucial contribution to cinema.', 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&h=400&fit=crop', 'Behind the Scenes', 'Jennifer Chen', 10, 1800, ARRAY['action sequences', 'stunts', 'filmmaking', 'behind the scenes']),

('The Evolution of Film Distribution in the Digital Age', 'evolution-film-distribution-digital-age', 'How streaming platforms and digital technology are revolutionizing how films reach audiences worldwide.', 'The film distribution landscape has undergone a seismic shift in the past decade, with traditional theatrical releases now competing with streaming premieres and hybrid distribution models. This comprehensive analysis examines how platforms like Netflix, Amazon Prime, and Disney+ have disrupted established patterns while creating new opportunities for filmmakers and audiences alike. We explore the economics of digital distribution, the impact on independent films, and the changing role of film festivals in the discovery process. The article features interviews with distributors, exhibitors, and filmmakers who share their experiences navigating this new landscape. We also look ahead to emerging technologies like virtual reality and interactive content that may further transform how stories are told and consumed. The democratization of distribution has opened doors for diverse voices while challenging traditional gatekeepers in the industry.', 'https://images.unsplash.com/photo-1489599904472-af35ff2c7c3f?w=800&h=400&fit=crop', 'Industry News', 'David Park', 15, 3200, ARRAY['film distribution', 'streaming', 'digital age', 'industry trends']),

('Cinematography Trends Shaping Modern Filmmaking', 'cinematography-trends-modern-filmmaking', 'Discover the latest visual techniques and technologies that are defining contemporary cinema aesthetics.', 'Contemporary cinematography is experiencing a period of unprecedented innovation, with new technologies and artistic approaches creating visually stunning experiences for audiences. This exploration of current trends examines the resurgence of film formats, the creative use of LED volumes, and the integration of virtual production techniques pioneered by productions like The Mandalorian. We analyze how cinematographers are balancing traditional craftsmanship with cutting-edge technology to serve story and emotion. The article features insights from award-winning directors of photography who discuss their approach to color grading, lighting design, and camera movement in the digital era. We also explore how social media and streaming platforms are influencing visual storytelling, with filmmakers adapting their techniques for different viewing environments and aspect ratios.', 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800&h=400&fit=crop', 'Technology', 'Lisa Thompson', 11, 1950, ARRAY['cinematography', 'visual effects', 'technology', 'filmmaking trends']),

('Building a Successful Career as a Film Producer', 'building-successful-career-film-producer', 'Essential strategies and insights for aspiring producers looking to make their mark in the entertainment industry.', 'The role of a film producer encompasses creative vision, business acumen, and exceptional project management skills, making it one of the most challenging yet rewarding careers in entertainment. This comprehensive guide outlines the various paths to becoming a successful producer, from starting as an assistant to developing your own projects from scratch. We examine the different types of producers - executive, line, associate, and co-producers - and their specific responsibilities throughout the filmmaking process. The article includes practical advice on building industry relationships, securing financing, and navigating the complex legal and business aspects of film production. Successful producers share their experiences, discussing both triumphs and setbacks that shaped their careers. We also explore emerging opportunities in streaming content, international co-productions, and the growing importance of diversity and inclusion in production decisions.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop', 'Career Tips', 'Robert Kim', 13, 2750, ARRAY['film producer', 'career advice', 'entertainment industry', 'business']);

-- Insert sample videos
INSERT INTO public.videos (title, description, video_url, thumbnail_url, category, duration, view_count, is_featured) VALUES
('Behind the Scenes: Action Movie Magic', 'Exclusive behind-the-scenes footage showing how epic action sequences are created', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=225&fit=crop', 'behind-scenes', 480, 15420, true),
('Actor Interview: Method Acting Techniques', 'In-depth interview with award-winning actor discussing method acting approaches', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop', 'interview', 720, 8930, true),
('Film Festival Highlights 2024', 'Best moments and award-winning films from this year''s major film festivals', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1489599904472-af35ff2c7c3f?w=400&h=225&fit=crop', 'festival', 600, 12350, true),
('Cinematography Masterclass', 'Professional cinematographer shares advanced lighting and camera techniques', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400&h=225&fit=crop', 'education', 900, 6780, true),
('Indie Film Trailer: "City Dreams"', 'Official trailer for the critically acclaimed independent drama', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=225&fit=crop', 'trailer', 150, 25600, true),
('Director''s Commentary: Creative Process', 'Renowned director discusses the creative decisions behind their latest film', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=225&fit=crop', 'commentary', 540, 4290, true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banners_active_order ON public.banners(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_ads_active_dates ON public.ads(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_featured_active ON public.videos(is_featured, is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to banners" ON public.banners FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to ads" ON public.ads FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to articles" ON public.articles FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public read access to videos" ON public.videos FOR SELECT USING (is_active = true);
