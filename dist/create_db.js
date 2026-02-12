"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function createDatabase() {
    const client = new pg_1.Client({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'postgres', // Connect to default database
    });
    try {
        await client.connect();
        console.log('Connected to postgres database.');
        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'leaderboard_db'");
        if (res.rowCount === 0) {
            console.log('Database leaderboard_db does not exist. Creating...');
            await client.query('CREATE DATABASE leaderboard_db');
            console.log('Database leaderboard_db created successfully.');
        }
        else {
            console.log('Database leaderboard_db already exists.');
        }
    }
    catch (err) {
        console.error('Error creating database:', err);
    }
    finally {
        await client.end();
    }
}
createDatabase();
