import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err: any) => console.log('Redis Client Error', err));

(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
})();

export default redisClient;
