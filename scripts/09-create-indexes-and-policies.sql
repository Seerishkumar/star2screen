-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_professional_experience_user_id ON professional_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);
CREATE INDEX IF NOT EXISTS idx_user_media_user_id ON user_media(user_id);
CREATE INDEX IF NOT EXISTS idx_user_media_type ON user_media(media_type);
CREATE INDEX IF NOT EXISTS idx_user_availability_user_date ON user_availability(user_id, date);

CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_job_posts_posted_by ON job_posts(posted_by);
CREATE INDEX IF NOT EXISTS idx_job_posts_category_id ON job_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_job_posts_status ON job_posts(status);
CREATE INDEX IF NOT EXISTS idx_job_posts_location ON job_posts(location);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON job_applications(applicant_id);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Enable RLS on all tables
ALTER TABLE professional_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profile Data
CREATE POLICY "Users can view their own profile data" ON professional_experience FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view published profile data" ON professional_experience FOR SELECT USING (true);

CREATE POLICY "Users can manage their own education" ON education FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view education data" ON education FOR SELECT USING (true);

CREATE POLICY "Users can manage their own media" ON user_media FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view media" ON user_media FOR SELECT USING (true);

CREATE POLICY "Users can manage their own availability" ON user_availability FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view availability" ON user_availability FOR SELECT USING (true);

-- RLS Policies for Messaging
CREATE POLICY "Users can view conversations they participate in" ON conversations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversations.id AND user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can view their own participation" ON conversation_participants FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Participants can view messages in their conversations" ON messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Participants can send messages" ON messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = messages.conversation_id AND user_id = auth.uid() AND is_active = true
  )
);

-- RLS Policies for Jobs
CREATE POLICY "Public can view active job posts" ON job_posts FOR SELECT 
USING (status = 'active');

CREATE POLICY "Job posters can manage their own jobs" ON job_posts FOR ALL 
USING (auth.uid() = posted_by);

CREATE POLICY "Users can view their own applications" ON job_applications FOR SELECT 
USING (auth.uid() = applicant_id);

CREATE POLICY "Job posters can view applications for their jobs" ON job_applications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM job_posts 
    WHERE id = job_applications.job_id AND posted_by = auth.uid()
  )
);

CREATE POLICY "Users can apply to jobs" ON job_applications FOR INSERT 
WITH CHECK (auth.uid() = applicant_id);

-- RLS Policies for Reviews
CREATE POLICY "Public can view active reviews" ON reviews FOR SELECT 
USING (status = 'active' AND is_public = true);

CREATE POLICY "Users can create reviews" ON reviews FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can manage their own reviews" ON reviews FOR UPDATE 
USING (auth.uid() = reviewer_id);

-- RLS Policies for Subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payments" ON payments FOR SELECT 
USING (auth.uid() = user_id);
