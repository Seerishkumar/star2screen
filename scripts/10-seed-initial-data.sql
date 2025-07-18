-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, description, price, billing_cycle, features, limits) VALUES
('Free', 'free', 'Basic features for getting started', 0.00, 'monthly', 
 '["Basic Profile", "Browse Jobs", "Apply to 5 Jobs/Month", "Basic Messaging"]',
 '{"max_job_applications": 5, "max_media_uploads": 10, "max_portfolio_items": 5}'
),
('Basic', 'basic', 'Enhanced features for active professionals', 499.00, 'monthly',
 '["Enhanced Profile", "Unlimited Job Applications", "Priority Support", "Advanced Messaging", "Basic Analytics"]',
 '{"max_job_applications": -1, "max_media_uploads": 50, "max_portfolio_items": 20}'
),
('Premium', 'premium', 'Full access for serious professionals', 999.00, 'monthly',
 '["Premium Profile Badge", "Featured Listings", "Advanced Analytics", "Video Portfolio", "Priority Job Matching", "Custom Portfolio URL"]',
 '{"max_job_applications": -1, "max_media_uploads": 200, "max_portfolio_items": 100, "featured_listings": true}'
),
('Enterprise', 'enterprise', 'Complete solution for agencies and production houses', 2999.00, 'monthly',
 '["Multi-user Management", "Team Collaboration", "Advanced Reporting", "API Access", "Custom Branding", "Dedicated Support"]',
 '{"max_users": 50, "max_job_posts": -1, "api_access": true, "custom_branding": true}'
);

-- Insert job categories
INSERT INTO job_categories (name, slug, description, icon) VALUES
('Acting', 'acting', 'Lead roles, supporting roles, character actors', 'user'),
('Direction', 'direction', 'Directors, assistant directors, script supervisors', 'video'),
('Production', 'production', 'Producers, line producers, production managers', 'briefcase'),
('Cinematography', 'cinematography', 'Directors of photography, camera operators', 'camera'),
('Sound', 'sound', 'Sound engineers, boom operators, sound designers', 'volume-2'),
('Editing', 'editing', 'Video editors, sound editors, colorists', 'scissors'),
('Art Department', 'art-department', 'Production designers, art directors, set decorators', 'palette'),
('Costume & Makeup', 'costume-makeup', 'Costume designers, makeup artists, hair stylists', 'shirt'),
('Music', 'music', 'Music directors, composers, playback singers', 'music'),
('Writing', 'writing', 'Screenwriters, dialogue writers, story writers', 'pen-tool'),
('Stunts', 'stunts', 'Stunt coordinators, stunt performers', 'zap'),
('Visual Effects', 'visual-effects', 'VFX artists, 3D animators, compositors', 'layers');

-- Update author_profiles with default values for new columns
UPDATE author_profiles SET 
  subscription_plan = 'free',
  profile_completion_score = 25,
  last_active_at = NOW()
WHERE subscription_plan IS NULL;
