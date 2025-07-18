-- Enhanced author_profiles table with all film industry fields
ALTER TABLE public.author_profiles 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS stage_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS known_for TEXT,
ADD COLUMN IF NOT EXISTS height VARCHAR(20),
ADD COLUMN IF NOT EXISTS body_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS age_range VARCHAR(20),
ADD COLUMN IF NOT EXISTS representation VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS profile_video_url TEXT,
ADD COLUMN IF NOT EXISTS demo_reel_url TEXT,
ADD COLUMN IF NOT EXISTS imdb_url TEXT,
ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS public_contact BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'available',
ADD COLUMN IF NOT EXISTS primary_roles TEXT[],
ADD COLUMN IF NOT EXISTS languages TEXT[],
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS social_media_links JSONB,
ADD COLUMN IF NOT EXISTS resume_bio TEXT,
ADD COLUMN IF NOT EXISTS demo_scenes JSONB,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Filmography table
CREATE TABLE IF NOT EXISTS public.filmography (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100),
    role VARCHAR(255) NOT NULL,
    year INTEGER,
    director VARCHAR(255),
    production_house VARCHAR(255),
    language VARCHAR(100),
    genre VARCHAR(100),
    description TEXT,
    project_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Awards table
CREATE TABLE IF NOT EXISTS public.awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    award_name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    year INTEGER,
    organization VARCHAR(255),
    project_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_filmography_user_id ON public.filmography(user_id);
CREATE INDEX IF NOT EXISTS idx_filmography_year ON public.filmography(year DESC);
CREATE INDEX IF NOT EXISTS idx_filmography_featured ON public.filmography(user_id, is_featured);

CREATE INDEX IF NOT EXISTS idx_awards_user_id ON public.awards(user_id);
CREATE INDEX IF NOT EXISTS idx_awards_year ON public.awards(year DESC);

-- Enable RLS
ALTER TABLE public.filmography ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for filmography
CREATE POLICY "Users can view all filmography" ON public.filmography FOR SELECT USING (true);
CREATE POLICY "Users can insert their own filmography" ON public.filmography FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own filmography" ON public.filmography FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own filmography" ON public.filmography FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for awards
CREATE POLICY "Users can view all awards" ON public.awards FOR SELECT USING (true);
CREATE POLICY "Users can insert their own awards" ON public.awards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own awards" ON public.awards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own awards" ON public.awards FOR DELETE USING (auth.uid() = user_id);
