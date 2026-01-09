/**
 * API Integration Tests - Booking Flow (Fixed)
 */

const { apiCall, log, TestRunner, assert, assertEqual } = require('../utils/api-client');
const { generateUser } = require('../utils/test-data');

async function runTests() {
  const runner = new TestRunner('BOOKING FLOW TESTS');
  let authToken = null;
  let testUser = null;
  let testBookingId = null;
  let selectedService = null;

  // 1. Create and Login User
  await runner.run('Register and Login Customer', async () => {
    testUser = generateUser('Customer');
    const regResult = await apiCall('POST', '/auth/register', testUser);
    if (!regResult.success) return false;

    const loginResult = await apiCall('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    if (loginResult.success && loginResult.data.token) {
      authToken = loginResult.data.token;
      return true;
    }
    return false;
  });

  // 2. Get Services
  await runner.run('Get available services', async () => {
    const result = await apiCall('GET', '/services');
    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      selectedService = result.data[0];
      log(`   Selected Service: ${selectedService.name}`, 'yellow');
      return true;
    }
    return false;
  });

  // 3. Create Booking
  await runner.run('Create new booking', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const bookingData = {
      serviceId: selectedService.id,
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0],
      workShiftStart: '08:00:00',
      workShiftEnd: '12:00:00',
      address: '123 Test St, Ha Noi, Vietnam',
      notes: 'Testing automated flow',
      quantity: 1
    };

    const result = await apiCall('POST', '/bookings', bookingData, authToken);
    if (result.success && result.data.id) {
      testBookingId = result.data.id;
      log(`   Created Booking ID: ${testBookingId}`, 'yellow');
      return true;
    }
    log(`   Error: ${result.error}`, 'red');
    return false;
  });

  // 4. Verify in List
  await runner.run('Verify booking in customer list', async () => {
    const result = await apiCall('GET', '/bookings/my', null, authToken);
    if (result.success && Array.isArray(result.data)) {
      const found = result.data.find(b => b.id === testBookingId);
      return !!found;
    }
    return false;
  });

  runner.printSummary();
  return runner.exitCode();
}

runTests().then(code => process.exit(code));
