const http = require('http');

const postData = JSON.stringify({
    email: 'test@test.com',
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/users/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('BODY: ' + data);
        if (res.statusCode === 200) {
            console.log('✅ Login Test Passed!');
            process.exit(0);
        } else {
            console.error('❌ Login Test Failed');
            process.exit(1);
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    process.exit(1);
});

// Write data to request body
req.write(postData);
req.end();
