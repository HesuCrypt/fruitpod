-- ============================================================
-- ISSY Game Leaderboard – run in Supabase SQL Editor
-- ============================================================
-- 1. Go to your project → SQL Editor → New query
-- 2. Paste this script and run it
-- 3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
-- ============================================================

-- Table: top scores (username + score)
create table if not exists public.scores (
  id         uuid primary key default gen_random_uuid(),
  username   text not null,
  score      bigint not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.scores enable row level security;

-- Drop existing policies so this script can be re-run
drop policy if exists "Allow anonymous read" on public.scores;
drop policy if exists "Allow anonymous insert" on public.scores;

-- Anyone can read top scores (for leaderboard)
create policy "Allow anonymous read"
  on public.scores for select
  using (true);

-- Anyone can insert a score (when game ends)
create policy "Allow anonymous insert"
  on public.scores for insert
  with check (true);

-- Function: top 10 players by best score only (one row per username)
create or replace function public.leaderboard_top10()
returns table (username text, score bigint)
language sql
security definer
set search_path = public
as $$
  select s.username, max(s.score) as score
  from scores s
  group by s.username
  order by score desc
  limit 10;
$$;

-- Allow anonymous to call the function
grant execute on function public.leaderboard_top10() to anon;

