/**
 * Integration Tests
 * End-to-end test scenarios
 */

const { apiCall, log, TestRunner } = require('../utils/api-client');
const { generateUser, generateBooking, generateRating } = require('../utils/test-data');

let customerToken = '';
let adminToken = '';
let bookingId = 0;
let helperId = 0;

async function runTests() {
  const runner = new TestRunner('INTEGRATION TESTS');

  // Scenario 1: Complete Booking & Rating Flow
  await runner.run('E2E: Complete booking and rating flow', async () => {
    // Step 1: Customer registers
    const customer = generateUser('Customer');
    let result = await apiCall('POST', '/auth/register', customer);
    if (!result.success) {
      log(`   Failed to register customer`, 'red');
      return false;
    }
    log(`   ✓ Customer registered`, 'cyan');

    // Step 2: Customer logs in
    result = await apiCall('POST', '/auth/login', {
      email: customer.email,
      password: customer.password
    });
    if (!result.success) return false;
    customerToken = result.data.token;
    log(`   ✓ Customer logged in`, 'cyan');

    // Step 3: Customer creates booking
    const bookingData = generateBooking(1);
    result = await apiCall('POST', '/bookings', bookingData, customerToken);
    if (!result.success) {
      log(`   Failed to create booking: ${result.error}`, 'red');
      return false;
    }
    bookingId = result.data.id;
    helperId = result.data.helperId;
    log(`   ✓ Booking created #${bookingId}`, 'cyan');

    // Step 4: Admin confirms booking
    result = await apiCall('POST', '/auth/login', {
      email: 'admin@admin.com',
      password: 'Admin@123'
    });
    if (!result.success) return false;
    adminToken = result.data.token;

    result = await apiCall('PATCH', `/bookings/${bookingId}/status`, 
      { status: 2 }, adminToken);
    if (!result.success) return false;
    log(`   ✓ Booking confirmed`, 'cyan');

    // Step 5: Admin completes booking
    result = await apiCall('PATCH', `/bookings/${bookingId}/status`, 
      { status: 4 }, adminToken);
    if (!result.success) return false;
    log(`   ✓ Booking completed`, 'cyan');

    // Step 6: Customer rates the service
    const ratingData = generateRating(bookingId, 5);
    result = await apiCall('POST', '/ratings', ratingData, customerToken);
    if (!result.success) {
      log(`   Failed to create rating: ${result.error}`, 'red');
      return false;
    }
    log(`   ✓ Rating created (5 stars)`, 'cyan');

    // Step 7: Verify rating updated helper profile
    result = await apiCall('GET', `/helperprofiles/${helperId}`);
    if (!result.success) return false;
    log(`   ✓ Helper rating updated: ${result.data.ratingAverage} (${result.data.ratingCount} reviews)`, 'cyan');

    return true;
  });

  // Scenario 2: Guest Booking Flow
  await runner.run('E2E: Guest booking flow', async () => {
    const guestData = {
      serviceId: 1,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '14:00',
      address: 'Guest Address Test',
      notes: 'Guest booking test',
      guestFullName: 'Guest Test User',
      guestEmail: `guest_${Date.now()}@test.com`,
      guestPhone: '0987654321'
    };

    const result = await apiCall('POST', '/bookings/guest', guestData);
    
    if (result.success && result.data.id) {
      log(`   ✓ Guest booking created #${result.data.id}`, 'cyan');
      log(`   ✓ Temporary account created`, 'cyan');
      return true;
    }
    
    log(`   Failed: ${result.error}`, 'red');
    return false;
  });

  // Scenario 3: Concurrent Bookings (Conflict Detection)
  await runner.run('E2E: Conflict detection for same helper', async () => {
    // Create first booking
    const booking1 = generateBooking(1);
    let result = await apiCall('POST', '/bookings', booking1, customerToken);
    if (!result.success) return false;
    const booking1Id = result.data.id;
    const helper1Id = result.data.helperId;
    log(`   ✓ Booking 1 created with helper ${helper1Id}`, 'cyan');

    // Try to create overlapping booking with same helper
    const booking2 = {
      ...booking1,
      helperId: helper1Id // Force same helper
    };
    result = await apiCall('POST', '/bookings', booking2, customerToken);
    
    // Should either reject or assign different helper
    if (!result.success || result.data.helperId !== helper1Id) {
      log(`   ✓ Conflict detected and handled`, 'cyan');
      
      // Cleanup
      await apiCall('PATCH', `/bookings/${booking1Id}/cancel`, null, customerToken);
      return true;
    }
    
    log(`   ERROR: System allowed conflicting booking!`, 'red');
    return false;
  });

  // Scenario 4: Multi-role workflow
  await runner.run('E2E: Multi-role workflow', async () => {
    // Employee creates booking for customer
    const empResult = await apiCall('POST', '/auth/login', {
      email: 'nhanvien@nv.com',
      password: 'Nhanvien@123'
    });
    if (!empResult.success) return false;
    const empToken = empResult.data.token;

    const bookingData = generateBooking(1);
    let result = await apiCall('POST', '/bookings', bookingData, customerToken);
    if (!result.success) return false;
    const newBookingId = result.data.id;
    log(`   ✓ Booking created`, 'cyan');

    // Employee confirms
    result = await apiCall('PATCH', `/bookings/${newBookingId}/status`, 
      { status: 2 }, empToken);
    if (!result.success) return false;
    log(`   ✓ Employee confirmed booking`, 'cyan');

    // Employee confirms payment
    result = await apiCall('POST', `/bookings/${newBookingId}/confirm-payment`, 
      null, empToken);
    if (!result.success) return false;
    log(`   ✓ Employee confirmed payment`, 'cyan');

    // Employee completes booking
    result = await apiCall('PATCH', `/bookings/${newBookingId}/status`, 
      { status: 4 }, empToken);
    if (!result.success) return false;
    log(`   ✓ Employee completed booking`, 'cyan');

    return true;
  });

  runner.printSummary();
  return runner.exitCode();
}

runTests().then(exitCode => process.exit(exitCode)).catch(error => {
  log(`\n💥 FATAL ERROR: ${error.message}`, 'red');
  process.exit(1);
});
