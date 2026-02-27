const http = require('http');

function testAPI(path) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: path,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('\n=== ' + path + ' ===');
      console.log('Status: ' + res.statusCode);
      try {
        const json = JSON.parse(data);
        if (Array.isArray(json)) {
          console.log('Count: ' + json.length);
          if (json.length > 0) {
            console.log('First item keys:', Object.keys(json[0]));
            console.log('First item:', JSON.stringify(json[0], null, 2));
          }
        } else {
          console.log('Response:', JSON.stringify(json, null, 2));
        }
      } catch (e) {
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error);
  });

  req.end();
}

// Test endpoints
testAPI('/api/student/profile/STU001');
testAPI('/api/student/assignments/STU001');
testAPI('/api/submission/student/STU001');
testAPI('/api/marks/student/STU001');

setTimeout(() => process.exit(0), 2000);
