const axios = require('axios');

async function simpleTest() {
  console.log('Simple registration test with exact backend format...\n');
  
  try {
    const res = await axios.post('http://localhost:5217/api/auth/register', {
      fullName: 'Simple Test User',
      email: `simple_${Date.now()}@test.com`,
      phone: '0987654321',
      password: 'Test@123456',
      role: 4,
      status: 1
    }, { validateStatus: () => true });
    
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(res.data, null, 2));
    
    if (res.status === 200 || res.status === 201) {
      console.log('\n✅ SUCCESS! Registration works!');
      console.log('User ID:', res.data.id);
    } else {
      console.log('\n❌ FAILED');
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

simpleTest();
