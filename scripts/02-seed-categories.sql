-- Seed initial categories
INSERT INTO categories (name, slug, description, color, icon, sort_order) VALUES
('Industry News', 'industry-news', 'Latest news from the film industry', '#2B5AA7', 'newspaper', 1),
('Movie Reviews', 'movie-reviews', 'Professional movie reviews and critiques', '#E67E22', 'star', 2),
('Interviews', 'interviews', 'Exclusive interviews with industry professionals', '#8E44AD', 'mic', 3),
('Behind the Scenes', 'behind-the-scenes', 'Making of movies and production insights', '#27AE60', 'camera', 4),
('Career Guidance', 'career-guidance', 'Tips and advice for film industry careers', '#C0392B', 'briefcase', 5),
('Technology', 'technology', 'Latest technology in filmmaking', '#3498DB', 'cpu', 6);

-- Add subcategories
INSERT INTO categories (name, slug, description, parent_id, sort_order) VALUES
('Box Office Reports', 'box-office-reports', 'Box office performance and analysis', 
  (SELECT id FROM categories WHERE slug = 'industry-news'), 1),
('Industry Updates', 'industry-updates', 'Updates on industry trends and changes', 
  (SELECT id FROM categories WHERE slug = 'industry-news'), 2),
('Casting News', 'casting-news', 'Latest casting announcements and changes', 
  (SELECT id FROM categories WHERE slug = 'industry-news'), 3),
('Production Updates', 'production-updates', 'Updates on ongoing and upcoming productions', 
  (SELECT id FROM categories WHERE slug = 'industry-news'), 4),
  
('Bollywood Reviews', 'bollywood-reviews', 'Reviews of Bollywood films', 
  (SELECT id FROM categories WHERE slug = 'movie-reviews'), 1),
('Hollywood Reviews', 'hollywood-reviews', 'Reviews of Hollywood films', 
  (SELECT id FROM categories WHERE slug = 'movie-reviews'), 2),
('Regional Cinema', 'regional-cinema', 'Reviews of regional Indian cinema', 
  (SELECT id FROM categories WHERE slug = 'movie-reviews'), 3),
('Independent Films', 'independent-films', 'Reviews of independent films', 
  (SELECT id FROM categories WHERE slug = 'movie-reviews'), 4),
  
('Actor Interviews', 'actor-interviews', 'Interviews with actors', 
  (SELECT id FROM categories WHERE slug = 'interviews'), 1),
('Director Interviews', 'director-interviews', 'Interviews with directors', 
  (SELECT id FROM categories WHERE slug = 'interviews'), 2),
('Producer Interviews', 'producer-interviews', 'Interviews with producers', 
  (SELECT id FROM categories WHERE slug = 'interviews'), 3),
('Technical Crew', 'technical-crew-interviews', 'Interviews with technical crew members', 
  (SELECT id FROM categories WHERE slug = 'interviews'), 4);
