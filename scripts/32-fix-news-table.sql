-- Fix the news table by adding the missing is_featured column
ALTER TABLE news ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Update some existing news items to be featured
UPDATE news SET is_featured = true WHERE id IN (
  SELECT id FROM news ORDER BY published_at DESC LIMIT 3
);

-- Ensure the table has proper indexes
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(is_featured);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);

-- Make sure RLS is properly configured
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to news" ON news;

-- Create permissive policy for public read access
CREATE POLICY "Allow public read access to news" ON news
  FOR SELECT USING (true);

-- Grant necessary permissions
GRANT SELECT ON news TO anon;
GRANT SELECT ON news TO authenticated;
