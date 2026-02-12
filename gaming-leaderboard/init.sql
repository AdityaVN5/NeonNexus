-- Create Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    join_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    score INT NOT NULL,
    game_mode TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id),
    total_score INT DEFAULT 0,
    rank INT
);

-- Seeding Data (Using CTEs or direct INSERTs)

-- 1. Users (1 Million)
INSERT INTO users (username, join_date)
SELECT 
    'user_' || generate_series, 
    NOW() - (random() * interval '365 days')
FROM generate_series(1, 1000000);

-- 2. Game Sessions (5 Million)
INSERT INTO game_sessions (user_id, score, game_mode, timestamp)
SELECT 
    floor(random() * 1000000 + 1)::int,
    floor(random() * 1000)::int,
    CASE WHEN random() > 0.5 THEN 'hard' ELSE 'normal' END,
    NOW() - (random() * interval '30 days')
FROM generate_series(1, 5000000);

-- 3. Populate Leaderboard (Initial Cache)
-- Note: 'rank' is left NULL for now or calculated simply. The requirement is a naive approach.
-- We will populate total_score.
INSERT INTO leaderboard (user_id, total_score)
SELECT user_id, SUM(score)
FROM game_sessions
GROUP BY user_id;

-- Naive rank update (optional, might take long on init, but good for baseline)
-- We can skip rank calculation here and do it on read as requested in "naive" implementation.
