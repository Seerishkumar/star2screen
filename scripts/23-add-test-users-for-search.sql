-- Add test users for search functionality
-- First, let's create some test auth users and their profiles

-- Insert test users into author_profiles for search testing
INSERT INTO author_profiles (
  user_id,
  display_name,
  stage_name,
  full_name,
  bio,
  location,
  category,
  experience_level,
  profile_picture_url,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'Sudeep Kumar',
  'Sudeep',
  'Sudeep Kumar Singh',
  'Experienced actor with 10+ years in Bollywood',
  'Mumbai, Maharashtra',
  'actor',
  'professional',
  '/placeholder.svg?height=100&width=100&text=SK',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Sudha Sharma',
  'Sudha',
  'Sudha Sharma Patel',
  'Talented actress specializing in dramatic roles',
  'Delhi, India',
  'actress',
  'intermediate',
  '/placeholder.svg?height=100&width=100&text=SS',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Suresh Patel',
  'Suresh',
  'Suresh Kumar Patel',
  'Award-winning director with multiple hit films',
  'Chennai, Tamil Nadu',
  'director',
  'professional',
  '/placeholder.svg?height=100&width=100&text=SP',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Sunita Rao',
  'Sunita',
  'Sunita Rao Gupta',
  'Versatile producer with experience in regional cinema',
  'Bangalore, Karnataka',
  'producer',
  'professional',
  '/placeholder.svg?height=100&width=100&text=SR',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Rajesh Kumar',
  'Rajesh',
  'Rajesh Kumar Verma',
  'Cinematographer with expertise in action sequences',
  'Hyderabad, Telangana',
  'technician',
  'intermediate',
  '/placeholder.svg?height=100&width=100&text=RK',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Priya Singh',
  'Priya',
  'Priya Singh Chauhan',
  'Music director specializing in classical fusion',
  'Kolkata, West Bengal',
  'music',
  'professional',
  '/placeholder.svg?height=100&width=100&text=PS',
  NOW(),
  NOW()
);

-- Add some additional test data for better search results
INSERT INTO author_profiles (
  user_id,
  display_name,
  stage_name,
  full_name,
  bio,
  location,
  category,
  experience_level,
  profile_picture_url,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'Amit Sharma',
  'Amit',
  'Amit Sharma Joshi',
  'Character actor with theater background',
  'Pune, Maharashtra',
  'actor',
  'beginner',
  '/placeholder.svg?height=100&width=100&text=AS',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Neha Gupta',
  'Neha',
  'Neha Gupta Agarwal',
  'Dance choreographer for film industry',
  'Mumbai, Maharashtra',
  'choreographer',
  'intermediate',
  '/placeholder.svg?height=100&width=100&text=NG',
  NOW(),
  NOW()
);
