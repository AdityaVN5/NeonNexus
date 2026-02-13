
import http from 'http';

console.log('Testing Method Fallback (Redis Down)...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/leaderboard/top',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
        const parsed = JSON.parse(data);
        console.log(`Result count: ${Array.isArray(parsed) ? parsed.length : 'Not Array'}`);
        if (res.statusCode === 200) {
            console.log('✅ Fallback successful: API returned OK response from DB.');
        } else {
            console.error('❌ Fallback failed with status', res.statusCode);
            process.exit(1);
        }
    } catch (e) {
        console.error('Failed to parse response:', data);
        process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
  console.error('Ensure server is running on port 3000');
  process.exit(1);
});

req.end();
