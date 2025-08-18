-- Fix Production Banner Issues
-- This script will ensure all necessary tables and columns exist for banner management

-- Check if banners table exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'banners') THEN
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
        
        -- Create indexes for better performance
        CREATE INDEX idx_banners_is_active ON public.banners(is_active);
        CREATE INDEX idx_banners_display_order ON public.banners(display_order);
        CREATE INDEX idx_banners_created_at ON public.banners(created_at);
        
        RAISE NOTICE 'Created banners table';
    ELSE
        RAISE NOTICE 'Banners table already exists';
    END IF;
END $$;

-- Check and add missing columns to existing banners table
DO $$ 
BEGIN
    -- Add title column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'title') THEN
        ALTER TABLE public.banners ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Untitled Banner';
        RAISE NOTICE 'Added title column';
    END IF;
    
    -- Add subtitle column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'subtitle') THEN
        ALTER TABLE public.banners ADD COLUMN subtitle TEXT;
        RAISE NOTICE 'Added subtitle column';
    END IF;
    
    -- Add image_url column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'image_url') THEN
        ALTER TABLE public.banners ADD COLUMN image_url TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Added image_url column';
    END IF;
    
    -- Add link_url column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'link_url') THEN
        ALTER TABLE public.banners ADD COLUMN link_url TEXT;
        RAISE NOTICE 'Added link_url column';
    END IF;
    
    -- Add button_text column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'button_text') THEN
        ALTER TABLE public.banners ADD COLUMN button_text VARCHAR(100);
        RAISE NOTICE 'Added button_text column';
    END IF;
    
    -- Add is_active column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'is_active') THEN
        ALTER TABLE public.banners ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_active column';
    END IF;
    
    -- Add display_order column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'display_order') THEN
        ALTER TABLE public.banners ADD COLUMN display_order INTEGER DEFAULT 0;
        RAISE NOTICE 'Added display_order column';
    END IF;
    
    -- Add created_at column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'created_at') THEN
        ALTER TABLE public.banners ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;
    
    -- Add updated_at column if missing
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'banners' AND column_name = 'updated_at') THEN
        ALTER TABLE public.banners ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;
END $$;

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_banners_updated_at') THEN
        CREATE TRIGGER update_banners_updated_at
            BEFORE UPDATE ON public.banners
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created updated_at trigger for banners table';
    ELSE
        RAISE NOTICE 'Updated_at trigger already exists for banners table';
    END IF;
END $$;

-- Set up RLS (Row Level Security) policies for banners table
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Banners are viewable by everyone" ON public.banners;
DROP POLICY IF EXISTS "Banners are insertable by authenticated users" ON public.banners;
DROP POLICY IF EXISTS "Banners are updatable by admin users" ON public.banners;
DROP POLICY IF EXISTS "Banners are deletable by admin users" ON public.banners;

-- Create new RLS policies
CREATE POLICY "Banners are viewable by everyone" ON public.banners
    FOR SELECT USING (true);

CREATE POLICY "Banners are insertable by admin users" ON public.banners
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('super_admin', 'admin', 'content_admin')
            )
        )
    );

CREATE POLICY "Banners are updatable by admin users" ON public.banners
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('super_admin', 'admin', 'content_admin')
            )
        )
    );

CREATE POLICY "Banners are deletable by admin users" ON public.banners
    FOR DELETE USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('super_admin', 'admin', 'content_admin')
            )
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.banners TO authenticated;
GRANT USAGE ON SEQUENCE public.banners_id_seq TO authenticated;

-- Insert sample banner data if table is empty
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.banners LIMIT 1) THEN
        INSERT INTO public.banners (title, subtitle, image_url, link_url, button_text, is_active, display_order) VALUES
        ('Welcome to Stars2Screen', 'Your gateway to the film industry', '/public/hero-illustration.png', '/profiles', 'Explore Profiles', true, 1),
        ('Find Your Next Project', 'Connect with industry professionals', '/public/bustling-film-set.png', '/jobs', 'View Jobs', true, 2),
        ('Industry Insights', 'Stay updated with latest trends', '/public/city-cafe-meetup.png', '/articles', 'Read Articles', true, 3);
        
        RAISE NOTICE 'Inserted sample banner data';
    ELSE
        RAISE NOTICE 'Banners table already contains data';
    END IF;
END $$;

-- Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'banners' 
ORDER BY ordinal_position;

-- Show current banner data
SELECT * FROM public.banners ORDER BY display_order; 