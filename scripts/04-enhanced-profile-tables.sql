-- Enhanced User Profiles with Premium Features
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable'));
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'INR';
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS languages TEXT[];
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS certifications JSONB;
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(255);
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS resume_url VARCHAR(255);
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise'));
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS verification_documents JSONB;
ALTER TABLE author_profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Professional Experience Table
CREATE TABLE IF NOT EXISTS professional_experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  project_name VARCHAR(255),
  project_type VARCHAR(100), -- film, tv-series, web-series, commercial, etc.
  role_type VARCHAR(100), -- lead, supporting, cameo, etc.
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  skills_used TEXT[],
  media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education Table
CREATE TABLE IF NOT EXISTS education (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255),
  field_of_study VARCHAR(255),
  start_year INTEGER,
  end_year INTEGER,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Media/Portfolio Table
CREATE TABLE IF NOT EXISTS user_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document')),
  file_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  file_size BIGINT,
  mime_type VARCHAR(100),
  is_profile_picture BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Availability Calendar
CREATE TABLE IF NOT EXISTS user_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'blocked')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, start_time)
);
