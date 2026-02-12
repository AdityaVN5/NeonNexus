import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  const client = new Client({
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
    } else {
      console.log('Database leaderboard_db already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await client.end();
  }
}

createDatabase();
