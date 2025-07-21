-- This script checks for and creates missing content tables in the database
-- It's safe to run multiple times as it only creates tables that don't exist

-- Check if banners table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'banners') THEN
        CREATE TABLE public.banners (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            subtitle TEXT,
            image_url TEXT NOT NULL,
            link_url TEXT,
            is_active BOOLEAN DEFAULT true,
            priority INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert sample data
        INSERT INTO public.banners (title, subtitle, image_url, link_url, is_active, priority)
        VALUES 
            ('Welcome to Stars2Screen', 'Connect with film industry professionals', '/bustling-film-set.png', '/categories', true, 10),
            ('Discover New Talent', 'Find the perfect cast for your next project', '/elegant-woman-red.png', '/profiles', true, 20),
            ('Industry Insights', 'Latest news and trends in filmmaking', '/director-in-discussion.png', '/articles', true, 30);

        -- Set RLS policies
        ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON public.banners FOR SELECT USING (true);
        CREATE POLICY "Allow authenticated insert" ON public.banners FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Allow authenticated update" ON public.banners FOR UPDATE USING (auth.role() = 'authenticated');
        
        RAISE NOTICE 'Created banners table with sample data';
    ELSE
        RAISE NOTICE 'Banners table already exists';
    END IF;
END
$$;

-- Check if articles table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'articles') THEN
        CREATE TABLE public.articles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            content TEXT NOT NULL,
            excerpt TEXT,
            featured_image TEXT,
            author_id UUID REFERENCES auth.users(id),
            category TEXT,
            tags TEXT[],
            published_at TIMESTAMP WITH TIME ZONE,
            is_published BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert sample data
        INSERT INTO public.articles (title, slug, content, excerpt, featured_image, category, tags, published_at, is_published)
        VALUES 
            ('The Future of Independent Filmmaking', 'future-of-independent-filmmaking', 'Content about independent filmmaking trends...', 'How technology is changing indie film production', '/director-in-discussion.png', 'Production', ARRAY['filmmaking', 'indie', 'technology'], NOW(), true),
            ('Breaking into Hollywood: A Guide for Newcomers', 'breaking-into-hollywood', 'Detailed guide for newcomers...', 'Essential tips for aspiring actors and filmmakers', '/confident-actress.png', 'Career', ARRAY['hollywood', 'acting', 'career'], NOW(), true),
            ('The Art of Cinematography', 'art-of-cinematography', 'Deep dive into cinematography techniques...', 'Exploring visual storytelling through the camera lens', '/bustling-film-set.png', 'Technical', ARRAY['cinematography', 'visual', 'camera'], NOW(), true);

        -- Set RLS policies
        ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON public.articles FOR SELECT USING (is_published = true OR auth.uid() = author_id);
        CREATE POLICY "Allow authenticated insert" ON public.articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Allow author update" ON public.articles FOR UPDATE USING (auth.uid() = author_id OR auth.role() = 'service_role');
        
        RAISE NOTICE 'Created articles table with sample data';
    ELSE
        RAISE NOTICE 'Articles table already exists';
    END IF;
END
$$;

-- Check if news table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'news') THEN
        CREATE TABLE public.news (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            source TEXT,
            source_url TEXT,
            category TEXT,
            is_featured BOOLEAN DEFAULT false,
            published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert sample data
        INSERT INTO public.news (title, content, image_url, source, category, is_featured)
        VALUES 
            ('Major Studio Announces New Film Slate', 'Details about upcoming films and productions...', '/bustling-film-set.png', 'Film Industry News', 'Industry', true),
            ('Award-Winning Director Starts Casting for New Project', 'Information about the casting process...', '/director-in-discussion.png', 'Entertainment Weekly', 'Casting', true),
            ('Film Festival Announces Lineup', 'Details about this year''s selected films...', '/city-cafe-meetup.png', 'Festival Daily', 'Events', false),
            ('New Technology Revolutionizes Post-Production', 'How AI is changing editing workflows...', '/confident-young-professional.png', 'Tech in Film', 'Technology', false),
            ('Streaming Platform Signs Major Deal with Indie Filmmakers', 'Details of the new partnership...', '/woman-contemplating-window.png', 'Streaming News', 'Business', true);

        -- Set RLS policies
        ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON public.news FOR SELECT USING (true);
        CREATE POLICY "Allow authenticated insert" ON public.news FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Allow authenticated update" ON public.news FOR UPDATE USING (auth.role() = 'authenticated');
        
        RAISE NOTICE 'Created news table with sample data';
    ELSE
        RAISE NOTICE 'News table already exists';
    END IF;
END
$$;

-- Check if reviews table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews') THEN
        CREATE TABLE public.reviews (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id),
            reviewer_name TEXT NOT NULL,
            reviewer_title TEXT,
            reviewer_image TEXT,
            content TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            is_featured BOOLEAN DEFAULT false,
            is_verified BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert sample data
        INSERT INTO public.reviews (reviewer_name, reviewer_title, reviewer_image, content, rating, is_featured, is_verified)
        VALUES 
            ('Sarah Johnson', 'Casting Director', '/confident-actress.png', 'This platform has completely transformed how I find talent for my productions. The quality of profiles and the ease of communication make it my go-to resource.', 5, true, true),
            ('Michael Chen', 'Independent Filmmaker', '/confident-young-professional.png', 'As an indie director, I''ve found incredible collaborators through this platform. The categorization by specialty makes it easy to find exactly who I need.', 5, true, true),
            ('Priya Patel', 'Producer', '/elegant-woman-blue.png', 'The messaging system and profile verification give me confidence when reaching out to new talent. Highly recommended for serious industry professionals.', 4, true, true),
            ('James Wilson', 'Actor', '/confident-businessman.png', 'I''ve landed three roles through connections made on this platform. The interface is intuitive and the community is supportive and professional.', 5, false, true),
            ('Emma Rodriguez', 'Cinematographer', '/woman-contemplating-window.png', 'Great platform for networking and showcasing my portfolio. I appreciate the industry-specific features that other platforms lack.', 4, false, true);

        -- Set RLS policies
        ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON public.reviews FOR SELECT USING (true);
        CREATE POLICY "Allow authenticated insert" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Allow author update" ON public.reviews FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');
        
        RAISE NOTICE 'Created reviews table with sample data';
    ELSE
        RAISE NOTICE 'Reviews table already exists';
    END IF;
END
$$;

-- Check if ads table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ads') THEN
        CREATE TABLE public.ads (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            image_url TEXT NOT NULL,
            link_url TEXT NOT NULL,
            start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            end_date TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT true,
            placement TEXT DEFAULT 'sidebar',
            priority INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert sample data
        INSERT INTO public.ads (title, description, image_url, link_url, placement, priority)
        VALUES 
            ('Film Workshop', 'Join our exclusive filmmaking workshop', '/bustling-film-set.png', 'https://example.com/workshop', 'homepage', 10),
            ('New Camera Release', 'The latest in cinematography technology', '/camera.png', 'https://example.com/camera', 'sidebar', 20),
            ('Acting Classes', 'Learn from industry professionals', '/confident-actress.png', 'https://example.com/classes', 'article', 30);

        -- Set RLS policies
        ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON public.ads FOR SELECT USING (true);
        CREATE POLICY "Allow authenticated insert" ON public.ads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Allow authenticated update" ON public.ads FOR UPDATE USING (auth.role() = 'authenticated');
        
        RAISE NOTICE 'Created ads table with sample data';
    ELSE
        RAISE NOTICE 'Ads table already exists';
    END IF;
END
$$;

-- Check if videos table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'videos') THEN
        CREATE TABLE public.videos (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            thumbnail_url TEXT,
            video_url TEXT NOT NULL,
            duration INTEGER, -- in seconds
            category TEXT,
            tags TEXT[],
            is_featured BOOLEAN DEFAULT false,
            view_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Insert sample data
        INSERT INTO public.videos (title, description, thumbnail_url, video_url, duration, category, tags, is_featured)
        VALUES 
            ('Behind the Scenes: Inferno Escape', 'Go behind the scenes of this action thriller', '/inferno-escape.png', 'https://example.com/video1', 360, 'Behind the Scenes', ARRAY['action', 'filmmaking'], true),
            ('Lighting Techniques for Indie Filmmakers', 'Learn essential lighting on a budget', '/bustling-film-set.png', 'https://example.com/video2', 720, 'Tutorial', ARRAY['lighting', 'tutorial'], false),
            ('Interview with Award-Winning Director', 'Exclusive interview about storytelling', '/director-in-discussion.png', 'https://example.com/video3', 540, 'Interview', ARRAY['director', 'storytelling'], true);

        -- Set RLS policies
        ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow public read access" ON public.videos FOR SELECT USING (true);
        CREATE POLICY "Allow authenticated insert" ON public.videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        CREATE POLICY "Allow authenticated update" ON public.videos FOR UPDATE USING (auth.role() = 'authenticated');
        
        RAISE NOTICE 'Created videos table with sample data';
    ELSE
        RAISE NOTICE 'Videos table already exists';
    END IF;
END
$$;

-- Check if author_profiles table has the required columns
DO $$
BEGIN
    -- Check if profile_picture_url column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'author_profiles' 
        AND column_name = 'profile_picture_url'
    ) THEN
        ALTER TABLE public.author_profiles ADD COLUMN profile_picture_url TEXT;
        RAISE NOTICE 'Added profile_picture_url column to author_profiles table';
    ELSE
        RAISE NOTICE 'profile_picture_url column already exists in author_profiles table';
    END IF;

    -- Check if location column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'author_profiles' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.author_profiles ADD COLUMN location TEXT;
        RAISE NOTICE 'Added location column to author_profiles table';
    ELSE
        RAISE NOTICE 'location column already exists in author_profiles table';
    END IF;

    -- Check if category column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'author_profiles' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE public.author_profiles ADD COLUMN category TEXT;
        RAISE NOTICE 'Added category column to author_profiles table';
    ELSE
        RAISE NOTICE 'category column already exists in author_profiles table';
    END IF;
END
$$;

-- Final status message
DO $$
BEGIN
    RAISE NOTICE 'Database content tables check complete. All required tables and columns are now available.';
END
$$;
