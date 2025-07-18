-- Add `updated_at` column so profile saves work
ALTER TABLE public.author_profiles
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
