const http = require('http');

function testAPI() {
  console.log('🧪 Testing Echo Stories API...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ API Health Check Response:');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Success: ${response.success}`);
        console.log(`   Message: ${response.message}`);
        console.log(`   Database: ${response.data?.database?.status}`);
        console.log(`   Environment: ${response.data?.environment}`);
        console.log(`   Uptime: ${Math.round(response.data?.uptime || 0)}s`);
        console.log('\n🎉 Backend API is working correctly!');
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ API Test Failed:', error.message);
    console.log('Make sure the backend server is running with: npm run dev');
  });

  req.end();
}

testAPI();