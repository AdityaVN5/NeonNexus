"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
function request(path, method = 'GET', body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const req = http_1.default.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, body: parsed });
                }
                catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });
        req.on('error', (e) => {
            reject(e);
        });
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}
async function verify() {
    console.log('Verifying API...');
    try {
        // 1. Get Top 10
        console.log('Test 1: GET /api/leaderboard/top');
        const topRes = await request('/api/leaderboard/top');
        console.log(`Status: ${topRes.status}`);
        console.log('Top Players:', topRes.body.length);
        if (topRes.status === 200 && Array.isArray(topRes.body)) {
            console.log('PASS');
        }
        else {
            console.log('FAIL');
        }
        // 2. Submit Score
        console.log('\nTest 2: POST /api/leaderboard/submit');
        const submitRes = await request('/api/leaderboard/submit', 'POST', { userId: 1, score: 100 });
        console.log(`Status: ${submitRes.status}`);
        console.log('Response:', submitRes.body);
        if (submitRes.status === 200) {
            console.log('PASS');
        }
        else {
            console.log('FAIL');
        }
        // 3. Get Rank
        console.log('\nTest 3: GET /api/leaderboard/rank/1');
        const rankRes = await request('/api/leaderboard/rank/1');
        console.log(`Status: ${rankRes.status}`);
        console.log('Rank:', rankRes.body);
        if (rankRes.status === 200 && rankRes.body.rank) {
            console.log('PASS');
        }
        else {
            console.log('FAIL');
        }
    }
    catch (err) {
        console.error('Verification failed:', err);
    }
}
// Wait for server to be ready? simpler to just run this manually after server starts.
// But we can retry loop here.
async function main() {
    // Retry connection for 5 seconds
    for (let i = 0; i < 10; i++) {
        try {
            await request('/api/leaderboard/top');
            break; // Server is up
        }
        catch (e) {
            await new Promise(r => setTimeout(r, 500));
        }
    }
    await verify();
}
main();
