import express, { Request, Response } from 'express';
import { Pool } from 'pg';

const app = express();
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gaming_db',
  password: process.env.DB_PASS || 'password',
  port: 5432,
});

// Endpoint: Submit Score
app.post('/api/leaderboard/submit', async (req: Request, res: Response) => {
  const { user_id, score } = req.body;
  
  if (!user_id || score === undefined) {
    res.status(400).json({ error: 'Missing user_id or score' });
    return;
  }

  try {
    // 1. Insert into game_sessions
    // Naive: No transaction
    await pool.query(
      'INSERT INTO game_sessions (user_id, score, game_mode) VALUES ($1, $2, $3)',
      [user_id, score, 'normal']
    );

    // 2. Update leaderboard table (total score)
    // Check if user exists in leaderboard
    const checkRes = await pool.query('SELECT * FROM leaderboard WHERE user_id = $1', [user_id]);
    
    if (checkRes.rows.length === 0) {
      // Initialize if not present (seeding covers existing, but new users need this)
       await pool.query(
        'INSERT INTO leaderboard (user_id, total_score) VALUES ($1, $2)',
        [user_id, score]
      );
    } else {
       await pool.query(
        'UPDATE leaderboard SET total_score = total_score + $1 WHERE user_id = $2',
        [score, user_id]
      );
    }

    res.json({ message: 'Score submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint: Get Top 10
app.get('/api/leaderboard/top', async (req: Request, res: Response) => {
  try {
    // Simple ORDER BY DESC, no indexes yet
    const result = await pool.query(
      'SELECT u.username, l.total_score FROM leaderboard l JOIN users u ON l.user_id = u.id ORDER BY l.total_score DESC LIMIT 10'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint: Get User Rank
app.get('/api/leaderboard/rank/:userId', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    // Naive Rank Calculation: Count how many have a higher score
    // This is O(N) where N is number of leaderboard entries. Very slow for 1M rows.
    const result = await pool.query(
      `SELECT COUNT(*) + 1 as rank FROM leaderboard WHERE total_score > (SELECT total_score FROM leaderboard WHERE user_id = $1)`,
      [userId]
    );
    
    // Also get the score
    const scoreRes = await pool.query('SELECT total_score FROM leaderboard WHERE user_id = $1', [userId]);

    if(scoreRes.rows.length === 0) {
        res.status(404).json({ error: 'User not found in leaderboard' });
        return;
    }

    res.json({ user_id: userId, rank: parseInt(result.rows[0].rank), total_score: scoreRes.rows[0].total_score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
