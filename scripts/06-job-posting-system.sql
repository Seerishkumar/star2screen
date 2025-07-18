-- Job Categories
CREATE TABLE IF NOT EXISTS job_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Posts
CREATE TABLE IF NOT EXISTS job_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  posted_by UUID REFERENCES auth.users(id),
  category_id UUID REFERENCES job_categories(id),
  job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('casting', 'crew', 'freelance', 'full-time', 'part-time', 'contract')),
  project_type VARCHAR(100), -- film, tv-series, web-series, commercial, etc.
  location VARCHAR(255),
  is_remote BOOLEAN DEFAULT false,
  budget_min DECIMAL(12,2),
  budget_max DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'INR',
  payment_type VARCHAR(20) CHECK (payment_type IN ('hourly', 'daily', 'weekly', 'monthly', 'project', 'revenue_share')),
  experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'intermediate', 'senior', 'expert')),
  skills_required TEXT[],
  application_deadline DATE,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'closed', 'filled')),
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES job_posts(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  portfolio_urls TEXT[],
  resume_url VARCHAR(500),
  expected_rate DECIMAL(10,2),
  availability_start DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
  notes TEXT, -- Internal notes by employer
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(job_id, applicant_id)
);

-- Job Bookmarks/Saved Jobs
CREATE TABLE IF NOT EXISTS job_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES job_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Job Views (for analytics)
CREATE TABLE IF NOT EXISTS job_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES job_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL for anonymous views
  ip_address INET,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
