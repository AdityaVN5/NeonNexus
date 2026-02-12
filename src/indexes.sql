-- Add B-Tree Index on leaderboard(total_score) for fast retrieval of top players/rank
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leaderboard_total_score ON leaderboard (total_score DESC);

-- Add B-Tree Index on game_sessions(user_id) for fast lookup of a user's sessions (if needed later)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_id ON game_sessions (user_id);
