"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
// POST /api/leaderboard/submit
app.post('/api/leaderboard/submit', async (req, res) => {
    const { userId, score } = req.body;
    if (!userId || score === undefined) {
        return res.status(400).json({ error: 'Missing userId or score' });
    }
    const client = await db_1.default.connect();
    try {
        await client.query('BEGIN');
        // 1. Insert into game_sessions
        await client.query('INSERT INTO game_sessions (user_id, score) VALUES ($1, $2)', [userId, score]);
        // 2. Update leaderboard
        // We strive for robustness. If the user doesn't exist in leaderboard, insert them.
        // If they do, update the score.
        // However, the requirement says "aggregate scores".
        // A simple approach is: check if user exists in leaderboard.
        // If yes, update total_score = total_score + new_score
        // If no, insert total_score = new_score.
        // Efficient UPSERT:
        await client.query(`
      INSERT INTO leaderboard (user_id, total_score)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        total_score = leaderboard.total_score + EXCLUDED.total_score,
        last_updated = CURRENT_TIMESTAMP
    `, [userId, score]);
        await client.query('COMMIT');
        res.status(200).json({ message: 'Score submitted successfully' });
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error('Error submitting score:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        client.release();
    }
});
// GET /api/leaderboard/top
app.get('/api/leaderboard/top', async (req, res) => {
    try {
        const result = await db_1.default.query(`
      SELECT l.user_id, u.username, l.total_score
      FROM leaderboard l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.total_score DESC
      LIMIT 10
    `);
        res.json(result.rows);
    }
    catch (err) {
        console.error('Error fetching top leaderboard:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// GET /api/leaderboard/rank/:userId
app.get('/api/leaderboard/rank/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    try {
        // To get the rank, we count how many players have a higher score.
        // Or simpler: Use a window function in a subquery or a direct count.
        // For a single user, COUNT(*) WHERE total_score > (SELECT total_score FROM leaderboard WHERE user_id = ?) is efficient enough for this scale if indexed properly.
        // But let's use the window function approach if we were getting multiple, but for one, direct count is faster than computing all ranks.
        // First, check if user exists in leaderboard
        const userRes = await db_1.default.query('SELECT total_score FROM leaderboard WHERE user_id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found in leaderboard' });
        }
        const userScore = userRes.rows[0].total_score;
        // Count users with higher score
        const rankRes = await db_1.default.query('SELECT COUNT(*) + 1 as rank FROM leaderboard WHERE total_score > $1', [userScore]);
        const rank = parseInt(rankRes.rows[0].rank);
        res.json({ userId, rank, totalScore: userScore });
    }
    catch (err) {
        console.error('Error fetching user rank:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
