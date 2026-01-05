/**
 * Authentication Tests
 * Test suite for /api/auth endpoints
 */

const { apiCall, log, TestRunner, assert, assertEqual } = require('../utils/api-client');
const { generateUser, generatePassword } = require('../utils/test-data');

let testUser = null;
let authToken = null;

async function runTests() {
  const runner = new TestRunner('AUTHENTICATION TESTS');

  // Test 1: Register new user
  await runner.run('Register new Customer account', async () => {
    testUser = generateUser('Customer');
    const result = await apiCall('POST', '/auth/register', testUser);
    
    if (result.success && result.data.id) {
      log(`   Created user ID: ${result.data.id}`, 'yellow');
      log(`   Email: ${testUser.email}`, 'yellow');
      testUser.id = result.data.id;
      return true;
    }
    log(`   Error: ${result.error}`, 'red');
    return false;
  });

  // Test 2: Login with correct credentials
  await runner.run('Login with correct credentials', async () => {
    const result = await apiCall('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (result.success && result.data.token) {
      authToken = result.data.token;
      log(`   Token received: ${authToken.substring(0, 30)}...`, 'yellow');
      log(`   Role: ${result.data.role}`, 'yellow');
      assertEqual(result.data.role, 'Customer', 'Role should be Customer');
      return true;
    }
    log(`   Error: ${result.error}`, 'red');
    return false;
  });

  // Test 3: Login with wrong password
  await runner.run('Login with wrong password should fail', async () => {
    const result = await apiCall('POST', '/auth/login', {
      email: testUser.email,
      password: 'WrongPassword123!'
    });
    
    if (!result.success) {
      log(`   Correctly rejected: ${result.error}`, 'yellow');
      return true;
    }
    log(`   ERROR: Should have failed but succeeded!`, 'red');
    return false;
  });

  // Test 4: Login with non-existent email
  await runner.run('Login with non-existent email should fail', async () => {
    const result = await apiCall('POST', '/auth/login', {
      email: 'nonexistent@test.com',
      password: 'SomePassword123!'
    });
    
    if (!result.success) {
      log(`   Correctly rejected: ${result.error}`, 'yellow');
      return true;
    }
    log(`   ERROR: Should have failed but succeeded!`, 'red');
    return false;
  });

  // Test 5: Change password
  await runner.run('Change password', async () => {
    const newPassword = 'NewPassword@123';
    const result = await apiCall('POST', '/auth/change-password', {
      currentPassword: testUser.password,
      newPassword: newPassword,
      confirmPassword: newPassword
    }, authToken);
    
    if (result.success) {
      log(`   Password changed successfully`, 'yellow');
      testUser.password = newPassword;
      return true;
    }
    log(`   Error: ${result.error}`, 'red');
    return false;
  });

  // Test 6: Login with new password
  await runner.run('Login with new password', async () => {
    const result = await apiCall('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (result.success && result.data.token) {
      log(`   Login successful with new password`, 'yellow');
      return true;
    }
    log(`   Error: ${result.error}`, 'red');
    return false;
  });

  // Test 7: Change password with wrong current password
  await runner.run('Change password with wrong current password should fail', async () => {
    const result = await apiCall('POST', '/auth/change-password', {
      currentPassword: 'WrongCurrentPassword',
      newPassword: 'AnotherPassword@123',
      confirmPassword: 'AnotherPassword@123'
    }, authToken);
    
    if (!result.success) {
      log(`   Correctly rejected: ${result.error}`, 'yellow');
      return true;
    }
    log(`   ERROR: Should have failed but succeeded!`, 'red');
    return false;
  });

  // Test 8: Register with duplicate email
  await runner.run('Register with duplicate email should fail', async () => {
    const duplicateUser = { ...testUser };
    delete duplicateUser.id;
    const result = await apiCall('POST', '/auth/register', duplicateUser);
    
    if (!result.success) {
      log(`   Correctly rejected duplicate email`, 'yellow');
      return true;
    }
    log(`   ERROR: Should have failed but succeeded!`, 'red');
    return false;
  });

  // Test 9: Register Helper account
  await runner.run('Register Helper account', async () => {
    const helperUser = generateUser('Helper');
    const result = await apiCall('POST', '/auth/register', helperUser);
    
    if (result.success && result.data.id) {
      log(`   Created Helper ID: ${result.data.id}`, 'yellow');
      return true;
    }
    log(`   Error: ${result.error}`, 'red');
    return false;
  });

  // Test 10: Access protected endpoint without token
  await runner.run('Access protected endpoint without token should fail', async () => {
    const result = await apiCall('GET', '/bookings/my-bookings', null, null);
    
    if (!result.success && result.status === 401) {
      log(`   Correctly rejected (401 Unauthorized)`, 'yellow');
      return true;
    }
    log(`   ERROR: Should have returned 401 but got ${result.status}`, 'red');
    return false;
  });

  runner.printSummary();
  return runner.exitCode();
}

// Run tests
runTests().then(exitCode => {
  process.exit(exitCode);
}).catch(error => {
  log(`\n💥 FATAL ERROR: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
});
