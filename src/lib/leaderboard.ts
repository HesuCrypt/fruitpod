/**
 * Leaderboard: top 10 from Supabase (if configured), else localStorage or mock.
 */

import { isSupabaseConfigured } from './supabase';
import { fetchLeaderboard as fetchFromApi } from './leaderboardApi';

const STORAGE_KEY = 'issy_leaderboard';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

const MOCK_ENTRIES: Omit<LeaderboardEntry, 'rank'>[] = [
  { username: 'BUSERNAME', score: 18000 },
  { username: 'PLAYER2', score: 15000 },
  { username: 'PLAYER3', score: 12000 },
  { username: 'PLAYER4', score: 10000 },
  { username: 'PLAYER5', score: 8000 },
  { username: 'PLAYER6', score: 6500 },
  { username: 'PLAYER7', score: 5000 },
  { username: 'PLAYER8', score: 4000 },
  { username: 'PLAYER9', score: 3000 },
  { username: 'PLAYER10', score: 2000 },
];

function withRanks(entries: Omit<LeaderboardEntry, 'rank'>[]): LeaderboardEntry[] {
  return entries
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Omit<LeaderboardEntry, 'rank'>[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return withRanks(parsed);
      }
    }
  } catch {
    // ignore
  }
  return withRanks(MOCK_ENTRIES);
}

export function addScoreAndGetLeaderboard(username: string, score: number): LeaderboardEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  let entries: Omit<LeaderboardEntry, 'rank'>[] = MOCK_ENTRIES;
  try {
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) entries = parsed;
    }
  } catch {
    // use mock
  }
  entries = [...entries, { username, score }];
  entries.sort((a, b) => b.score - a.score);
  entries = entries.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}

/** Fetch leaderboard: from Supabase if configured, else localStorage/mock. */
export async function getLeaderboardAsync(): Promise<LeaderboardEntry[]> {
  if (isSupabaseConfigured()) {
    const entries = await fetchFromApi();
    return entries; // Use DB result even if empty (no mock fallback)
  }
  return getLeaderboard();
}

/** Re-export for game over: submit score to database (no-op if Supabase not configured). */
export { submitScore, subscribeToLeaderboard } from './leaderboardApi';
