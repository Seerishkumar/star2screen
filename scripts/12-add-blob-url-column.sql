-- Add blob_url column to user_media table for Vercel Blob URLs
ALTER TABLE user_media ADD COLUMN IF NOT EXISTS blob_url VARCHAR(500);

-- Update existing records to use file_url as blob_url if blob_url is null
UPDATE user_media SET blob_url = file_url WHERE blob_url IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_media_blob_url ON user_media(blob_url);
CREATE INDEX IF NOT EXISTS idx_user_media_user_featured ON user_media(user_id, is_featured);
CREATE INDEX IF NOT EXISTS idx_user_media_user_profile ON user_media(user_id, is_profile_picture);
