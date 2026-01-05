/**
 * Simple Test - Check Registration Validation
 */

const axios = require('axios');

async function testRegistration() {
  console.log('Testing registration with different data formats...\n');
  
  // Test 1: Minimal valid data
  console.log('1. Testing minimal valid registration...');
  try {
    const res = await axios.post('http://localhost:5217/api/auth/register', {
      fullName: 'Test User One',
      email: `test1_${Date.now()}@test.com`,
      phone: '0987654321',
      password: 'Test@123456',
      role: 4, // Customer enum value
      status: 1
    }, { validateStatus: () => true });
    
    console.log(`   Status: ${res.status}`);
    if (res.status === 200) {
      console.log(`   ✅ Success! User ID: ${res.data.id}`);
    } else {
      console.log(`   ❌ Failed:`, res.data);
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
  }
  
  // Test 2: With address
  console.log('\n2. Testing with address...');
  try {
    const res = await axios.post('http://localhost:5217/api/auth/register', {
      fullName: 'Test User Two',
      email: `test2_${Date.now()}@test.com`,
      phone: '0987654322',
      password: 'Test@123456',
      address: 'Test Address, District 1',
      role: 4, // Customer
      status: 1
    }, { validateStatus: () => true });
    
    console.log(`   Status: ${res.status}`);
    if (res.status === 200) {
      console.log(`   ✅ Success! User ID: ${res.data.id}`);
    } else {
      console.log(`   ❌ Failed:`, res.data);
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
  }
  
  // Test 3: Check what validation errors we get
  console.log('\n3. Testing with invalid data to see validation errors...');
  try {
    const res = await axios.post('http://localhost:5217/api/auth/register', {
      fullName: 'T',
      email: 'invalid-email',
      phone: '123',
      password: 'weak',
      role: 'Customer',
      status: 1
    }, { validateStatus: () => true });
    
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.log(`   ❌ Error:`, error.message);
  }
}

testRegistration();
