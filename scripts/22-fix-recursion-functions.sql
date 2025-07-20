-- =============================================================================
--  SECURITY DEFINER helper functions to avoid RLS recursion
-- -----------------------------------------------------------------------------
-- ❶ get_user_conversation_ids(p_user uuid)
--      → returns every conversation_id the user participates in
-- ❷ get_conversation_participants(p_ids uuid[])
--      → returns participants (+ basic profile info) for those conversations
--
-- Run this script ONCE in Supabase SQL editor or psql.
-- =============================================================================

-- ❶ ---------------------------------------------------------------------------
create or replace function public.get_user_conversation_ids(p_user uuid)
returns table (conversation_id uuid)
language sql
stable
security definer
set search_path = public as $$
  select distinct conversation_id
  from conversation_participants
  where user_id = p_user
    and coalesce(is_active, true);
$$;

grant execute on function public.get_user_conversation_ids(uuid) to authenticated;

-- ❷ ---------------------------------------------------------------------------
create or replace function public.get_conversation_participants(p_ids uuid[])
returns table (
  conversation_id      uuid,
  user_id              uuid,
  display_name         text,
  stage_name           text,
  full_name            text,
  profile_picture_url  text
)
language sql
stable
security definer
set search_path = public as $$
  select
      cp.conversation_id,
      cp.user_id,
      ap.display_name,
      ap.stage_name,
      ap.full_name,
      ap.profile_picture_url
  from conversation_participants cp
  left join author_profiles ap on ap.user_id = cp.user_id
  where cp.conversation_id = any(p_ids)
    and coalesce(cp.is_active, true);
$$;

grant execute on function public.get_conversation_participants(uuid[]) to authenticated;
