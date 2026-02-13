
import redisClient from './redisClient';

// Polyfill fetch if needed (Node 18+ has it built-in)
// If running in an environment without fetch, this might fail, but let's assume Node 18+ based on types.

async function verify() {
    console.log('Verifying Redis Integration...');
    
    // Ensure Redis is connected for the test client
    // Note: The app has its own client. We use this one to inspect Redis directly.
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    try {
        const API_URL = 'http://localhost:3000/api/leaderboard';

        // 1. Initial State: Clear cache to be sure
        console.log('\nStep 1: Clearing cache...');
        await redisClient.del('leaderboard:top');
        console.log('   Cache cleared.');
        
        // 2. Fetch Top (Cache Miss -> Set Cache)
        console.log('\nStep 2: Fetching Leaderboard (Expected Cache Miss)...');
        const start1 = Date.now();
        const res1 = await fetch(`${API_URL}/top`);
        const data1 = await res1.json();
        const time1 = Date.now() - start1;
        console.log(`   Response time: ${time1}ms`);
        console.log(`   Items returned: ${Array.isArray(data1) ? data1.length : 'Error'}`);
        
        // 3. Verify Cache Key exists
        console.log('\nStep 3: Checking Redis Key...');
        const cachedVal = await redisClient.get('leaderboard:top');
        if (cachedVal) {
            console.log('   ✅ Cache Key "leaderboard:top" exists.');
        } else {
            console.error('   ❌ Cache Key missing! Caching implementation might be broken.');
        }

        // 4. Fetch Top Again (Cache Hit)
        console.log('\nStep 4: Fetching Leaderboard again (Expected Cache Hit)...');
        const start2 = Date.now();
        const res2 = await fetch(`${API_URL}/top`);
        await res2.json();
        const time2 = Date.now() - start2;
        console.log(`   Response time: ${time2}ms`);
        
        if (time2 < time1) {
             console.log('   ✅ Second request was faster.');
        } else {
             console.log('   ⚠️  Second request was not faster (could be network variance or local dev speed).');
        }

        // 5. Submit Score (Invalidate Cache)
        console.log('\nStep 5: Submitting Score to invalidate cache...');
        // We'll use a user_id that likely exists or will be created. 
        // Based on seed, user IDs might be 1-100.
        const res3 = await fetch(`${API_URL}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 1, score: 50 }) 
        });
        console.log(`   Status: ${res3.status}`);
        const submitData = await res3.json();
        console.log(`   Response: ${JSON.stringify(submitData)}`);

        // 6. Verify Key is gone
        console.log('\nStep 6: Checking Redis Key (Should be gone)...');
        // Give a tiny delay for the async invalidation if strictly necessary, but await in server.ts handles it.
        const cachedValAfter = await redisClient.get('leaderboard:top');
        if (!cachedValAfter) {
            console.log('   ✅ Cache Key "leaderboard:top" validated (deleted).');
        } else {
             console.error('   ❌ Cache Key still exists! Invalidation failed.');
        }

    } catch (err) {
        console.error('Verification failed with error:', err);
    } finally {
        await redisClient.quit();
    }
}

verify();
