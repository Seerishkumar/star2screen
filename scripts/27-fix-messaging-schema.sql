-- Fix messaging system database schema issues
-- This script addresses foreign key relationships and missing columns

DO $$
BEGIN
    -- 1. Add missing profile_picture_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'author_profiles' 
        AND column_name = 'profile_picture_url'
    ) THEN
        ALTER TABLE author_profiles ADD COLUMN profile_picture_url TEXT;
        RAISE NOTICE '✅ Added profile_picture_url column to author_profiles';
    ELSE
        RAISE NOTICE '✅ profile_picture_url column already exists';
    END IF;

    -- 2. Add missing location column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'author_profiles' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE author_profiles ADD COLUMN location TEXT;
        RAISE NOTICE '✅ Added location column to author_profiles';
    ELSE
        RAISE NOTICE '✅ location column already exists';
    END IF;

    -- 3. Add missing category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'author_profiles' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE author_profiles ADD COLUMN category TEXT;
        RAISE NOTICE '✅ Added category column to author_profiles';
    ELSE
        RAISE NOTICE '✅ category column already exists';
    END IF;

    -- 4. Ensure messages table has proper foreign key to author_profiles
    -- First check if the foreign key constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_sender_id_fkey' 
        AND table_name = 'messages'
    ) THEN
        -- Add foreign key constraint from messages.sender_id to author_profiles.user_id
        ALTER TABLE messages 
        ADD CONSTRAINT messages_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES author_profiles(user_id);
        RAISE NOTICE '✅ Added foreign key constraint messages_sender_id_fkey';
    ELSE
        RAISE NOTICE '✅ Foreign key constraint messages_sender_id_fkey already exists';
    END IF;

    -- 5. Ensure conversation_participants has proper foreign key to author_profiles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversation_participants_user_id_fkey' 
        AND table_name = 'conversation_participants'
    ) THEN
        ALTER TABLE conversation_participants 
        ADD CONSTRAINT conversation_participants_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES author_profiles(user_id);
        RAISE NOTICE '✅ Added foreign key constraint conversation_participants_user_id_fkey';
    ELSE
        RAISE NOTICE '✅ Foreign key constraint conversation_participants_user_id_fkey already exists';
    END IF;

    -- 6. Update any NULL values in author_profiles
    UPDATE author_profiles 
    SET 
        profile_picture_url = COALESCE(profile_picture_url, ''),
        display_name = COALESCE(display_name, full_name, 'Unknown User'),
        category = COALESCE(category, 'Not specified'),
        location = COALESCE(location, 'Not specified')
    WHERE profile_picture_url IS NULL 
       OR display_name IS NULL 
       OR category IS NULL 
       OR location IS NULL;

    RAISE NOTICE '✅ Updated NULL values in author_profiles';

END $$;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);

-- 8. Verify the schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('messages', 'conversations', 'conversation_participants', 'author_profiles')
    AND column_name IN ('sender_id', 'user_id', 'profile_picture_url', 'display_name', 'location', 'category')
ORDER BY table_name, column_name;

RAISE NOTICE '🎉 Messaging schema fix completed successfully!';
