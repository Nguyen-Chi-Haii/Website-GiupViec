const { apiCall, log, TestRunner } = require('../utils/api-client');
const { generateUser, generateBooking, generateRating } = require('../utils/test-data');

let customerToken = '';
let adminToken = '';
let bookingId = 0;

async function runTests() {
  const runner = new TestRunner('INTEGRATION TESTS');
  let testHelperId = 0;

  // Setup: Find a Helper to use in tests
  await runner.run('Setup: Find a Helper', async () => {
    const result = await apiCall('GET', '/helperprofiles');
    if (result.success && result.data.length > 0) {
      testHelperId = result.data[0].userId;
      log(`   Using Helper ID: ${testHelperId}`, 'yellow');
      return true;
    }
    log(`   No helpers found`, 'red');
    return false;
  });

  // Scenario 1: Complete Booking & Rating Flow
  await runner.run('E2E: Complete booking and rating flow', async () => {
    // Step 1: Customer registers
    const customer = generateUser('Customer');
    let result = await apiCall('POST', '/auth/register', customer);
    if (!result.success) return false;
    log(`   ✓ Customer registered`, 'cyan');

    // Step 2: Customer logs in
    result = await apiCall('POST', '/auth/login', { email: customer.email, password: customer.password });
    if (!result.success) return false;
    customerToken = result.data.token;
    log(`   ✓ Customer logged in`, 'cyan');

    // Step 3: Customer creates booking and assigns helper
    const bookingData = generateBooking(1);
    bookingData.helperId = testHelperId;
    result = await apiCall('POST', '/bookings', bookingData, customerToken);
    if (!result.success) return false;
    bookingId = result.data.id;
    log(`   ✓ Booking created #${bookingId} with helper ${testHelperId}`, 'cyan');

    // Step 4: Admin confirms booking
    result = await apiCall('POST', '/auth/login', { email: 'admin@admin.com', password: 'Admin@123' });
    if (!result.success) return false;
    adminToken = result.data.token;

    result = await apiCall('PUT', `/bookings/${bookingId}/status`, { status: 2 }, adminToken);
    if (!result.success) return false;
    log(`   ✓ Booking confirmed`, 'cyan');

    // Step 5: Admin completes booking
    result = await apiCall('PUT', `/bookings/${bookingId}/status`, { status: 4 }, adminToken);
    if (!result.success) return false;
    log(`   ✓ Booking completed`, 'cyan');

    // Step 6: Customer rates the service
    const ratingData = generateRating(bookingId, 5);
    result = await apiCall('POST', '/ratings', ratingData, customerToken);
    if (!result.success) return false;
    log(`   ✓ Rating created (5 stars)`, 'cyan');

    // Step 7: Verify rating updated helper profile
    result = await apiCall('GET', `/helperprofiles/user/${testHelperId}`);
    if (!result.success) return false;
    log(`   ✓ Helper rating updated: ${result.data.ratingAverage} (${result.data.ratingCount} reviews)`, 'cyan');

    return true;
  });

  // Scenario 2: Guest Booking Flow
  await runner.run('E2E: Guest booking flow', async () => {
    const guestData = {
      serviceId: 1,
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      workShiftStart: '10:00:00',
      workShiftEnd: '14:00:00',
      address: 'Guest Address Test',
      notes: 'Guest booking test',
      fullName: 'Guest User',
      email: `guest_${Date.now()}@test.com`,
      phone: '0912345678',
      captchaToken: 'test'
    };

    const result = await apiCall('POST', '/bookings/guest', guestData);
    if (result.success && result.data.bookingId) {
      log(`   ✓ Guest booking created #${result.data.bookingId}`, 'cyan');
      return true;
    }
    log(`   Failed: ${result.error}`, 'red');
    return false;
  });

  // Scenario 3: Conflict Detection
  await runner.run('E2E: Conflict detection for same helper', async () => {
    if (!testHelperId) return false;

    // First booking
    const booking1 = generateBooking(1);
    booking1.helperId = testHelperId;
    let result = await apiCall('POST', '/bookings', booking1, customerToken);
    if (!result.success) {
      log(`   Failed to create first booking: ${result.error}`, 'red');
      return false;
    }
    const b1Id = result.data.id;
    log(`   ✓ Booking 1 created #${b1Id} with helper ${testHelperId}`, 'cyan');

    // Second booking (Same helper, same time)
    const booking2 = { ...booking1 };
    result = await apiCall('POST', '/bookings', booking2, customerToken);
    
    // Result should be failure (Conflict)
    if (!result.success && result.error.includes('bận')) {
      log(`   ✓ Conflict correctly detected: ${result.error}`, 'cyan');
      return true;
    }
    
    if (result.success) {
      log(`   ERROR: System allowed conflicting booking! (#${result.data.id})`, 'red');
      return false;
    }

    log(`   Unexpected result: ${result.error}`, 'red');
    return false;
  });

  // Scenario 4: Multi-role workflow
  await runner.run('E2E: Multi-role workflow', async () => {
    // Register employee
    const empUser = generateUser('Employee');
    await apiCall('POST', '/auth/register', empUser);
    const empLogin = await apiCall('POST', '/auth/login', { email: empUser.email, password: empUser.password });
    if (!empLogin.success) return false;
    const empToken = empLogin.data.token;

    const bookingData = generateBooking(1);
    bookingData.helperId = testHelperId;
    let result = await apiCall('POST', '/bookings', bookingData, customerToken);
    if (!result.success) return false;
    const bid = result.data.id;

    // Actions
    await apiCall('PUT', `/bookings/${bid}/status`, { status: 2 }, empToken);
    await apiCall('PUT', `/bookings/${bid}/payment-confirm`, null, empToken);
    const res = await apiCall('PUT', `/bookings/${bid}/status`, { status: 4 }, empToken);
    
    if (res.success) {
      log(`   ✓ Flow completed by Employee`, 'cyan');
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
