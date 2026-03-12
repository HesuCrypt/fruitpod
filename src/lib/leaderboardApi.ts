/**
 * Leaderboard API: fetch top 10 and submit score via Supabase.
 * Table required: scores (id uuid, username text, score bigint, created_at timestamptz)
 * Shows one row per player (their best score only).
 */

import { getSupabase } from './supabase';
import type { LeaderboardEntry } from './leaderboard';

const TABLE = 'scores';

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  // Top 10 by best score per player (one entry per username)
  const { data, error } = await supabase.rpc('leaderboard_top10');

  if (error) {
    console.warn('[Leaderboard] fetch error:', error.message);
    return [];
  }

  return (data ?? []).map((row: { username: string; score: number }, i: number) => ({
    rank: i + 1,
    username: String(row.username ?? ''),
    score: Number(row.score ?? 0),
  }));
}

export async function submitScore(username: string, score: number): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const name = username.trim().slice(0, 100);
  const scoreInt = Math.round(Number(score)) || 0;

  const { error } = await supabase.from(TABLE).insert({
    username: name,
    score: scoreInt,
  });

  if (error) {
    console.error('[Leaderboard] submit error:', error.message, error.details);
    return false;
  }
  return true;
}

export function subscribeToLeaderboard(callback: () => void): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase.channel('public:scores')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: TABLE },
      () => {
        // Trigger the callback when a new score is inserted
        callback();
      }
    )
    .subscribe();

  // Return an unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
