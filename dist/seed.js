"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./db"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const NUM_USERS = 1000000;
const NUM_SESSIONS = 5000000;
const BATCH_SIZE = 10000;
async function seed() {
    const client = await db_1.default.connect();
    try {
        console.log('Starting seed process...');
        console.time('Total Seed Time');
        // 1. Create Tables
        console.log('Creating tables...');
        const schemaSql = fs_1.default.readFileSync(path_1.default.join(__dirname, 'schema.sql'), 'utf-8');
        await client.query(schemaSql);
        console.log('Tables created.');
        // 2. Insert Users
        console.log(`Generating ${NUM_USERS} users...`);
        console.time('Users Insert');
        // We will generate users in batches and use UNNEST to bulk insert
        // Generating all 1M in memory might be okay, but let's be safe with batches
        // Actually for 1M simple objects, it's roughly hundreds of MBs.
        // Let's do batches of 50,000 for users to be safe and efficient.
        const USER_BATCH = 50000;
        for (let i = 0; i < NUM_USERS; i += USER_BATCH) {
            const batchSize = Math.min(USER_BATCH, NUM_USERS - i);
            const usernames = new Array(batchSize);
            for (let j = 0; j < batchSize; j++) {
                usernames[j] = `user_${i + j}`;
            }
            await client.query(`
            INSERT INTO users (username)
            SELECT * FROM UNNEST($1::text[])
            ON CONFLICT (username) DO NOTHING;
        `, [usernames]);
            if ((i + USER_BATCH) % 100000 === 0)
                console.log(`Inserted ${i + USER_BATCH} users...`);
        }
        console.timeEnd('Users Insert');
        // 3. Insert Game Sessions
        // We need user IDs. Since we just inserted them sequentially (mostly), we can assume IDs 1 to NUM_USERS exist.
        // However, to be robust, we should probably just pick random IDs between 1 and NUM_USERS.
        // (Assuming the table was empty or SERIAL reset. If not, this might break.
        // For a clean seed script, we usually truncate/drop first, but schema.sql uses IF NOT EXISTS.
        // Let's assume a fresh DB or one where we can rely on ID range or just use random IDs and hope they exist
        // (which they will if we just inserted them on a fresh DB).
        // Better yet: Let's TRUNCATE tables first to ensure clean state and ID reset if possible,
        // or better, just get the max ID.
        // For this assignment, let's assume fresh start or truncate.
        console.log('Truncating tables for fresh seed...');
        await client.query('TRUNCATE users, game_sessions, leaderboard RESTART IDENTITY CASCADE');
        // Re-insert users because we just truncated
        console.log(`Re-inserting ${NUM_USERS} users after truncate...`);
        console.time('Users Re-Insert');
        for (let i = 0; i < NUM_USERS; i += USER_BATCH) {
            const batchSize = Math.min(USER_BATCH, NUM_USERS - i);
            const usernames = new Array(batchSize);
            for (let j = 0; j < batchSize; j++) {
                usernames[j] = `user_${i + j}`;
            }
            await client.query(`
            INSERT INTO users (username)
            SELECT * FROM UNNEST($1::text[])
        `, [usernames]);
        }
        console.timeEnd('Users Re-Insert');
        console.log(`Generating ${NUM_SESSIONS} game sessions...`);
        console.time('Sessions Insert');
        const SESSION_BATCH = 50000;
        for (let i = 0; i < NUM_SESSIONS; i += SESSION_BATCH) {
            const batchSize = Math.min(SESSION_BATCH, NUM_SESSIONS - i);
            const userIds = new Array(batchSize);
            const scores = new Array(batchSize);
            for (let j = 0; j < batchSize; j++) {
                // Random user ID between 1 and NUM_USERS
                userIds[j] = Math.floor(Math.random() * NUM_USERS) + 1;
                // Random score between 1 and 1000
                scores[j] = Math.floor(Math.random() * 1000) + 1;
            }
            await client.query(`
            INSERT INTO game_sessions (user_id, score)
            SELECT * FROM UNNEST($1::int[], $2::int[])
        `, [userIds, scores]);
            if ((i + SESSION_BATCH) % 500000 === 0)
                console.log(`Inserted ${i + SESSION_BATCH} sessions...`);
        }
        console.timeEnd('Sessions Insert');
        // 4. Populate Leaderboard
        console.log('Populating leaderboard...');
        console.time('Leaderboard Populate');
        // Aggregate scores from game_sessions and insert into leaderboard
        await client.query(`
        INSERT INTO leaderboard (user_id, total_score)
        SELECT user_id, SUM(score) as total_score
        FROM game_sessions
        GROUP BY user_id
    `);
        console.timeEnd('Leaderboard Populate');
        console.timeEnd('Total Seed Time');
        console.log('Seed completed successfully.');
    }
    catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
    finally {
        client.release();
        await db_1.default.end();
    }
}
seed();
