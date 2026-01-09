const { apiCall, log, TestRunner } = require('../utils/api-client');
const { generateUser, generateBooking } = require('../utils/test-data');

let adminToken = '';
let customerToken = '';
let testBookingId = 0;
let testHelperId = 0;

async function runTests() {
  const runner = new TestRunner('RATING SYSTEM TESTS');

  // 1. Login Admin
  await runner.run('Setup: Login Admin', async () => {
    const result = await apiCall('POST', '/auth/login', {
      email: 'admin@admin.com',
      password: 'Admin@123'
    });
    if (result.success) {
      adminToken = result.data.token;
      return true;
    }
    return false;
  });

  // 2. Setup Customer
  await runner.run('Setup: Register and Login Customer', async () => {
    const user = generateUser('Customer');
    await apiCall('POST', '/auth/register', user);
    const result = await apiCall('POST', '/auth/login', { email: user.email, password: user.password });
    if (result.success) {
      customerToken = result.data.token;
      return true;
    }
    return false;
  });

  // 3. Find a Helper
  await runner.run('Setup: Find a Helper', async () => {
    const result = await apiCall('GET', '/helperprofiles');
    if (result.success && result.data.length > 0) {
      testHelperId = result.data[0].userId;
      log(`   Using Helper ID: ${testHelperId}`, 'yellow');
      return true;
    }
    return false;
  });

  // 4. Create and Complete Booking
  await runner.run('Create and Complete Booking', async () => {
    const booking = generateBooking(1);
    booking.helperId = testHelperId;
    
    // Create
    const createRes = await apiCall('POST', '/bookings', booking, customerToken);
    if (!createRes.success) return false;
    testBookingId = createRes.data.id;

    // Confirm (Admin)
    await apiCall('PUT', `/bookings/${testBookingId}/status`, { status: 2 }, adminToken);
    
    // Complete (Admin) - Force status to Completed
    const res = await apiCall('PUT', `/bookings/${testBookingId}/status`, { status: 4 }, adminToken);
    return res.success;
  });

  // 5. Get Rating Before
  let ratingBefore = { avg: 0, count: 0 };
  await runner.run('Get Rating Before', async () => {
    const result = await apiCall('GET', `/helperprofiles/user/${testHelperId}`);
    if (result.success) {
      ratingBefore = { avg: result.data.ratingAverage, count: result.data.ratingCount };
      return true;
    }
    return false;
  });

  // 6. Create Rating
  await runner.run('Create Rating for Booking', async () => {
    const ratingData = {
      bookingId: testBookingId,
      score: 5,
      comment: 'Excellent service! Automated test rating.'
    };
    const result = await apiCall('POST', '/ratings', ratingData, customerToken);
    return result.success;
  });

  // 7. Verify Rating Update
  await runner.run('Verify Helper Rating Updated', async () => {
    const result = await apiCall('GET', `/helperprofiles/user/${testHelperId}`);
    if (result.success) {
      const after = { avg: result.data.ratingAverage, count: result.data.ratingCount };
      log(`   Count: ${ratingBefore.count} -> ${after.count}`, 'yellow');
      return after.count === ratingBefore.count + 1;
    }
    return false;
  });

  // 8. Prevent Duplicate
  await runner.run('Prevent Duplicate Rating', async () => {
    const result = await apiCall('POST', '/ratings', {
      bookingId: testBookingId,
      score: 1,
      comment: 'Spam'
    }, customerToken);
    return !result.success;
  });

  runner.printSummary();
  return runner.exitCode();
}

runTests().then(exitCode => process.exit(exitCode)).catch(err => {
  console.error(err);
  process.exit(1);
});
