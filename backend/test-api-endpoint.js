const http = require('http');

// Test the /api/student/upcoming-deadlines endpoint
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/student/upcoming-deadlines/2023CSE001',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});

req.end();
