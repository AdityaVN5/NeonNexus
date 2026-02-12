"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.NEW_RELIC_LICENSE_KEY) {
    try {
        require('newrelic');
    }
    catch (err) {
        console.warn('New Relic could not be loaded:', err);
    }
}
else {
    console.warn('NEW_RELIC_LICENSE_KEY not set. Skipping New Relic initialization.');
}
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
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
        // 2. Pessimistic Locking: SELECT ... FOR UPDATE
        // This locks the row for this user in the leaderboard table.
        // Use ON CONFLICT DO NOTHING to ensure we have a row to lock if it exists,
        // or we insert a new one.
        // However, standard pattern for "updating existing or inserting new" with locking:
        // We can try to lock. If no row, we insert. If row, we update.
        // But UPSERT (ON CONFLICT) is atomic in Postgres. 
        // The requirement asks to usage of "SELECT ... FOR UPDATE" inside transaction.
        // Doing strict "SELECT ... FOR UPDATE" ensures we serialize updates for THIS user.
        // This prevents race conditions where two concurrent requests for same user might
        // read the same old score and write overwriting each other (lost update problem).
        // Check if user exists and lock the row
        const checkRes = await client.query('SELECT total_score FROM leaderboard WHERE user_id = $1 FOR UPDATE', [userId]);
        if (checkRes.rows.length > 0) {
            // User exists, update score
            await client.query('UPDATE leaderboard SET total_score = total_score + $2, last_updated = CURRENT_TIMESTAMP WHERE user_id = $1', [userId, score]);
        }
        else {
            // User does not exist, insert. 
            // Note: A race condition is still possible here if two threads both get 0 rows and try to insert.
            // `ON CONFLICT` handles unicity constraint, but let's stick to the flow.
            await client.query(`
            INSERT INTO leaderboard (user_id, total_score)
            VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE SET 
            total_score = leaderboard.total_score + EXCLUDED.total_score,
            last_updated = CURRENT_TIMESTAMP
        `, [userId, score]);
        }
        await client.query('COMMIT');
        // Redis cache invalidation removed
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
        // 2. Query DB
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
        const userRes = await db_1.default.query('SELECT total_score FROM leaderboard WHERE user_id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found in leaderboard' });
        }
        const userScore = userRes.rows[0].total_score;
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
