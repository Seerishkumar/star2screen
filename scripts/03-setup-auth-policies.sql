-- Enable RLS on auth.users (if not already enabled)
-- Note: This is handled by Supabase automatically

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create an author profile for new users
  INSERT INTO public.author_profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create author profile on user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for author_profiles
DROP POLICY IF EXISTS "Users can view all author profiles" ON author_profiles;
CREATE POLICY "Users can view all author profiles" 
ON author_profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update their own author profile" ON author_profiles;
CREATE POLICY "Users can update their own author profile" 
ON author_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM author_profiles 
    WHERE author_profiles.user_id = is_admin.user_id 
    AND author_profiles.is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin column to author_profiles if it doesn't exist
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Update articles policies to allow admins to manage all articles
DROP POLICY IF EXISTS "Authors can manage their own articles" ON articles;
CREATE POLICY "Authors can manage their own articles" 
ON articles FOR ALL 
USING (
  auth.uid() = author_id OR 
  public.is_admin(auth.uid())
);

-- Allow admins to manage categories
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" 
ON categories FOR ALL 
USING (public.is_admin(auth.uid()));

-- Allow admins to manage comments
DROP POLICY IF EXISTS "Admins can manage all comments" ON comments;
CREATE POLICY "Admins can manage all comments" 
ON comments FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create admin user (replace with your email)
-- You'll need to run this after creating your account
-- UPDATE author_profiles SET is_admin = true WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com');
