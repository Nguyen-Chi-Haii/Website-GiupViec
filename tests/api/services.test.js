/**
 * Services Tests
 * Test suite for /api/services endpoints
 */

const { apiCall, log, TestRunner, assert } = require('../utils/api-client');
const { generateUser, generateService } = require('../utils/test-data');

let adminToken = '';
let customerToken = '';
let testServiceId = 0;

async function runTests() {
  const runner = new TestRunner('SERVICES TESTS');

  // Setup: Login as Admin
  await runner.run('Setup: Login as Admin', async () => {
    const result = await apiCall('POST', '/auth/login', {
      email: 'admin@admin.com',
      password: 'Admin@123'
    });
    if (result.success && result.data.token) {
      adminToken = result.data.token;
      return true;
    }
    return false;
  });

  // Setup: Register and Login Customer
  await runner.run('Setup: Register and Login Customer', async () => {
    const testUser = generateUser('Customer');
    await apiCall('POST', '/auth/register', testUser);
    const result = await apiCall('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    if (result.success && result.data.token) {
      customerToken = result.data.token;
      return true;
    }
    return false;
  });

  // Test 1: Get all services (public)
  await runner.run('Get all services (public access)', async () => {
    const result = await apiCall('GET', '/services');
    
    if (result.success && Array.isArray(result.data)) {
      log(`   Found ${result.data.length} services`, 'yellow');
      return true;
    }
    return false;
  });

  // Test 2: Create service (Admin only)
  await runner.run('Create new service (Admin)', async () => {
    const serviceData = generateService();
    const result = await apiCall('POST', '/services', serviceData, adminToken);
    
    if (result.success && result.data.id) {
      testServiceId = result.data.id;
      log(`   Created service ID: ${testServiceId}`, 'yellow');
      log(`   Name: ${result.data.name}`, 'yellow');
      return true;
    }
    log(`   Error: ${result.error}`, 'red');
    return false;
  });

  // Test 3: Customer cannot create service
  await runner.run('Customer cannot create service', async () => {
    const serviceData = generateService();
    const result = await apiCall('POST', '/services', serviceData, customerToken);
    
    if (!result.success && result.status === 403) {
      log(`   Correctly rejected (403 Forbidden)`, 'yellow');
      return true;
    }
    log(`   ERROR: Should have been forbidden`, 'red');
    return false;
  });

  // Test 4: Get service by ID
  await runner.run('Get service by ID', async () => {
    const result = await apiCall('GET', `/services/${testServiceId}`);
    
    if (result.success && result.data.id === testServiceId) {
      log(`   Retrieved: ${result.data.name}`, 'yellow');
      return true;
    }
    return false;
  });

  // Test 5: Update service
  await runner.run('Update service (Admin)', async () => {
    const timestamp = Date.now();
    const updateData = {
      name: `Updated Service ${timestamp}`,
      description: 'Updated description',
      price: 75000,
      unit: 'Hour',
      unitLabel: 'giờ'
    };
    const result = await apiCall('PUT', `/services/${testServiceId}`, updateData, adminToken);
    
    if (result.success) {
      log(`   Updated successfully to: ${updateData.name}`, 'yellow');
      return true;
    }
    log(`   Error: ${result.error}`, 'red');
    return false;
  });

  // Test 6: Verify update
  await runner.run('Verify service was updated', async () => {
    const result = await apiCall('GET', `/services/${testServiceId}`);
    
    if (result.success && result.data.name.startsWith('Updated Service')) {
      log(`   Name updated correctly: ${result.data.name}`, 'yellow');
      return true;
    }
    return false;
  });

  runner.printSummary();
  return runner.exitCode();
}

runTests().then(exitCode => process.exit(exitCode)).catch(error => {
  log(`\n💥 FATAL ERROR: ${error.message}`, 'red');
  process.exit(1);
});
