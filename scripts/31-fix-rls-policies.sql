-- Fix RLS policies to allow public read access for content tables
-- This script fixes the 401 authentication errors

-- Disable RLS temporarily to fix policies
ALTER TABLE IF EXISTS banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS news DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS videos DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for banners" ON banners;
DROP POLICY IF EXISTS "Public read access for ads" ON ads;
DROP POLICY IF EXISTS "Public read access for articles" ON articles;
DROP POLICY IF EXISTS "Public read access for news" ON news;
DROP POLICY IF EXISTS "Public read access for reviews" ON reviews;
DROP POLICY IF EXISTS "Public read access for videos" ON videos;

-- Re-enable RLS
ALTER TABLE IF EXISTS banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS news ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS videos ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for public read access
CREATE POLICY "Public read access for banners" ON banners
  FOR SELECT USING (true);

CREATE POLICY "Public read access for ads" ON ads
  FOR SELECT USING (true);

CREATE POLICY "Public read access for articles" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Public read access for news" ON news
  FOR SELECT USING (true);

CREATE POLICY "Public read access for reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Public read access for videos" ON videos
  FOR SELECT USING (true);

-- Grant public access to tables
GRANT SELECT ON banners TO anon;
GRANT SELECT ON ads TO anon;
GRANT SELECT ON articles TO anon;
GRANT SELECT ON news TO anon;
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON videos TO anon;

-- Grant authenticated user access
GRANT SELECT ON banners TO authenticated;
GRANT SELECT ON ads TO authenticated;
GRANT SELECT ON articles TO authenticated;
GRANT SELECT ON news TO authenticated;
GRANT SELECT ON reviews TO authenticated;
GRANT SELECT ON videos TO authenticated;

-- Verify the policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('banners', 'ads', 'articles', 'news', 'reviews', 'videos');
