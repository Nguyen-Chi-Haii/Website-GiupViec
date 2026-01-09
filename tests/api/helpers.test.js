/**
 * Helper Profiles Tests
 * Test suite for /api/helperprofiles endpoints
 */

const { apiCall, log, TestRunner } = require('../utils/api-client');
const { generateUser, generateHelperProfile } = require('../utils/test-data');

let adminToken = '';
let helperUserId = 0;
let helperToken = '';

async function runTests() {
  const runner = new TestRunner('HELPER PROFILES TESTS');

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

  // Setup: Create Helper user
  await runner.run('Setup: Create Helper user', async () => {
    const helperUser = generateUser('Helper');
    const result = await apiCall('POST', '/auth/register', helperUser);
    
    if (result.success && result.data.id) {
      helperUserId = result.data.id;
      log(`   Created Helper user ID: ${helperUserId}`, 'yellow');
      
      // Login as this helper
      const loginResult = await apiCall('POST', '/auth/login', {
        email: helperUser.email,
        password: helperUser.password
      });
      if (loginResult.success) {
        helperToken = loginResult.data.token;
        return true;
      }
    }
    return false;
  });

  // Test 1: Create Helper profile
  await runner.run('Create Helper profile', async () => {
    const profileData = generateHelperProfile(helperUserId);
    const result = await apiCall('POST', '/helperprofiles', profileData, adminToken);
    
    if (result.success && result.data.userId === helperUserId) {
      log(`   Created profile for user ${helperUserId}`, 'yellow');
      log(`   Hourly rate: ${result.data.hourlyRate}₫`, 'yellow');
      return true;
    }
    log(`   Error: ${result.error}`, 'red');
    return false;
  });

  // Test 2: Get Helper profile
  await runner.run('Get Helper profile by userId', async () => {
    const result = await apiCall('GET', `/helperprofiles/user/${helperUserId}`);
    
    if (result.success && result.data.userId === helperUserId) {
      log(`   Retrieved profile`, 'yellow');
      log(`   Bio: ${result.data.bio?.substring(0, 30)}...`, 'yellow');
      log(`   Rating: ${result.data.ratingAverage} (${result.data.ratingCount} reviews)`, 'yellow');
      return true;
    }
    return false;
  });

  // Test 3: Update Helper profile
  await runner.run('Update Helper profile', async () => {
    const updateData = {
      bio: 'Updated bio: 10 years of professional cleaning experience',
      activeArea: 'Quận 1, Quận 2, Quận 3, Quận 4',
      hourlyRate: 80000,
      experienceYears: 10
    };
    const result = await apiCall('PUT', `/helperprofiles/user/${helperUserId}`, updateData, adminToken);
    
    if (result.success) {
      log(`   Updated profile`, 'yellow');
      return true;
    }
    log(`   Error: ${result.error}`, 'red');
    return false;
  });

  // Test 4: Verify update
  await runner.run('Verify profile was updated', async () => {
    const result = await apiCall('GET', `/helperprofiles/user/${helperUserId}`);
    
    if (result.success && result.data.hourlyRate === 80000) {
      log(`   Hourly rate updated to 80000₫`, 'yellow');
      return true;
    }
    return false;
  });

  // Test 5: Get all Helper profiles
  await runner.run('Get all Helper profiles', async () => {
    const result = await apiCall('GET', '/helperprofiles');
    
    if (result.success && Array.isArray(result.data)) {
      log(`   Found ${result.data.length} helper profiles`, 'yellow');
      const ourHelper = result.data.find(h => h.userId === helperUserId);
      if (ourHelper) {
        log(`   Our helper found in list`, 'yellow');
        return true;
      }
    }
    return false;
  });

  // Test 6: Get available helpers
  await runner.run('Get available helpers for specific time', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const filter = {
      startDate: `${dateStr}T09:00:00`,
      endDate: `${dateStr}T17:00:00`,
      workShiftStart: '09:00:00',
      workShiftEnd: '17:00:00'
    };
    
    const result = await apiCall('POST', '/helperprofiles/available', filter);
    
    if (result.success && (Array.isArray(result.data) || result.data.data)) {
      const list = Array.isArray(result.data) ? result.data : result.data.data;
      log(`   Found ${list.length} available helpers`, 'yellow');
      return true;
    }
    return false;
  });

  // Test 7: Helper profile shows rating info
  await runner.run('Helper profile includes rating information', async () => {
    const result = await apiCall('GET', `/helperprofiles/user/${helperUserId}`);
    
    if (result.success) {
      const hasRatingAvg = typeof result.data.ratingAverage === 'number';
      const hasRatingCount = typeof result.data.ratingCount === 'number';
      
      if (hasRatingAvg && hasRatingCount) {
        log(`   Rating Average: ${result.data.ratingAverage}`, 'yellow');
        log(`   Rating Count: ${result.data.ratingCount}`, 'yellow');
        return true;
      }
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
