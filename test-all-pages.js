const http = require('http');

const pages = [
  { path: '/', name: 'Home Page', auth: false },
  { path: '/login', name: 'Login Page', auth: false },
  { path: '/register', name: 'Register Page', auth: false },
  { path: '/dashboard', name: 'Dashboard Overview', auth: true },
  { path: '/dashboard/profile', name: 'Profile Page', auth: true },
  { path: '/dashboard/results', name: 'Results Page', auth: true },
  { path: '/dashboard/admin', name: 'Admin Page', auth: true },
];

async function testPage(page) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: page.path,
      method: 'GET',
      headers: {
        'Cookie': '' // No auth for public pages
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          name: page.name,
          path: page.path,
          status: res.statusCode,
          success: res.statusCode < 400,
          redirect: res.statusCode >= 300 && res.statusCode < 400,
          location: res.headers.location
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name: page.name,
        path: page.path,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        name: page.name,
        path: page.path,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function testAllPages() {
  console.log('🧪 Testing all pages...\n');
  
  for (const page of pages) {
    console.log(`Testing ${page.name}...`);
    const result = await testPage(page);
    
    if (result.success) {
      if (result.redirect) {
        console.log(`✅ ${result.status} → ${result.location}`);
      } else {
        console.log(`✅ ${result.status}`);
      }
    } else {
      console.log(`❌ ${result.status} ${result.error ? `(${result.error})` : ''}`);
    }
  }
  
  console.log('\n📋 Test Summary:');
  console.log('- ✅ = Working correctly');
  console.log('- ❌ = Error or issue');
  console.log('- 🔄 = Redirect (expected for auth-protected pages)');
}

testAllPages().catch(console.error);
