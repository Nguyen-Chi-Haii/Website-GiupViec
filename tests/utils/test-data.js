/**
 * Test Data Utility
 * Functions for generating random data for tests
 */

function generatePassword() {
  return 'Test@123' + Math.floor(Math.random() * 1000);
}

function generateUser(roleName = 'Customer') {
  const timestamp = Date.now() + Math.floor(Math.random() * 1000);
  const roles = {
    'Admin': 1,
    'Employee': 2,
    'Helper': 3,
    'Customer': 4
  };
  
  return {
    fullName: `Test ${roleName} ${timestamp}`,
    email: `test_${roleName.toLowerCase()}_${timestamp}@test.com`,
    phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    password: 'Test@123456',
    role: roles[roleName] || 4,
    status: 1
  };
}

function generateService() {
  const timestamp = Date.now();
  return {
    name: `Test Service ${timestamp}`,
    description: `Automated testing service created at ${timestamp}`,
    price: 50000,
    unit: 'Hour',
    unitLabel: 'giờ',
    minQuantity: 1,
    requiresNotes: false,
    isActive: true
  };
}

function generateHelperProfile(userId) {
  return {
    userId: userId,
    bio: 'Professional cleaner with 5 years of experience.',
    activeArea: 'Quận 1, Quận 7, TP.HCM',
    hourlyRate: 60000,
    experienceYears: 5
  };
}

function generateBooking(serviceId) {
  const futureDay = new Date();
  // Random day between 1 and 365 days from now to avoid conflicts
  const offset = Math.floor(Math.random() * 365) + 1;
  futureDay.setDate(futureDay.getDate() + offset);
  const dateStr = futureDay.toISOString().split('T')[0];
  
  return {
    serviceId: serviceId,
    startDate: dateStr,
    endDate: dateStr,
    workShiftStart: '08:00:00',
    workShiftEnd: '12:00:00',
    address: '123 Integration Test St, VN',
    notes: 'Integration test booking',
    quantity: 1
  };
}

function generateRating(bookingId, score = 5) {
  return {
    bookingId: bookingId,
    score: score,
    comment: 'Great service! Highly recommended.'
  };
}

module.exports = {
  generateUser,
  generatePassword,
  generateService,
  generateHelperProfile,
  generateBooking,
  generateRating
};
