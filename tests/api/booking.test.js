/**
 * API Integration Tests - Booking Flow
 * Chạy: node tests/api/booking.test.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testBookingId = 0;

// Màu sắc cho console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function để gọi API
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

// Test Cases
async function test_01_Login() {
  log('\n📝 Test 1: Đăng nhập Customer', 'blue');
  
  const result = await apiCall('POST', '/auth/login', {
    email: 'customer@test.com',
    password: 'Customer@123'
  });

  if (result.success && result.data.token) {
    authToken = result.data.token;
    log('✅ PASS: Đăng nhập thành công', 'green');
    log(`   Token: ${authToken.substring(0, 20)}...`, 'yellow');
    return true;
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function test_02_GetServices() {
  log('\n📝 Test 2: Lấy danh sách dịch vụ', 'blue');
  
  const result = await apiCall('GET', '/services');

  if (result.success && Array.isArray(result.data)) {
    log(`✅ PASS: Có ${result.data.length} dịch vụ`, 'green');
    return true;
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function test_03_GetAvailableHelpers() {
  log('\n📝 Test 3: Lấy danh sách Helper khả dụng', 'blue');
  
  const result = await apiCall('GET', '/helperprofiles/available?startDate=2026-01-10&endDate=2026-01-12&startTime=08:00&endTime=17:00');

  if (result.success && Array.isArray(result.data)) {
    log(`✅ PASS: Có ${result.data.length} helper khả dụng`, 'green');
    if (result.data.length > 0) {
      log(`   Helper đầu tiên: ${result.data[0].fullName} (Rating: ${result.data[0].ratingAverage})`, 'yellow');
    }
    return true;
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function test_04_CreateBooking() {
  log('\n📝 Test 4: Tạo đơn đặt dịch vụ', 'blue');
  
  const bookingData = {
    serviceId: 1,
    startDate: '2026-01-10',
    endDate: '2026-01-12',
    startTime: '08:00',
    endTime: '17:00',
    address: '123 Test Street, Quận 1, TP.HCM',
    notes: 'Test booking from automated script',
    helperId: null // Auto assign
  };

  const result = await apiCall('POST', '/bookings', bookingData, authToken);

  if (result.success && result.data.id) {
    testBookingId = result.data.id;
    log(`✅ PASS: Tạo đơn #${testBookingId} thành công`, 'green');
    log(`   Giá: ${result.data.totalPrice}₫`, 'yellow');
    return true;
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function test_05_GetMyBookings() {
  log('\n📝 Test 5: Lấy danh sách đơn của tôi', 'blue');
  
  const result = await apiCall('GET', '/bookings/my-bookings', null, authToken);

  if (result.success && Array.isArray(result.data)) {
    const myBooking = result.data.find(b => b.id === testBookingId);
    if (myBooking) {
      log(`✅ PASS: Tìm thấy đơn #${testBookingId}`, 'green');
      log(`   Trạng thái: ${myBooking.status}`, 'yellow');
      return true;
    } else {
      log(`❌ FAIL: Không tìm thấy đơn vừa tạo`, 'red');
      return false;
    }
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function test_06_CancelBooking() {
  log('\n📝 Test 6: Hủy đơn hàng', 'blue');
  
  const result = await apiCall('PATCH', `/bookings/${testBookingId}/cancel`, null, authToken);

  if (result.success) {
    log(`✅ PASS: Hủy đơn #${testBookingId} thành công`, 'green');
    return true;
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

// Chạy tất cả tests
async function runAllTests() {
  log('='.repeat(60), 'blue');
  log('🚀 BẮT ĐẦU KIỂM THỬ API - BOOKING FLOW', 'blue');
  log('='.repeat(60), 'blue');

  const tests = [
    test_01_Login,
    test_02_GetServices,
    test_03_GetAvailableHelpers,
    test_04_CreateBooking,
    test_05_GetMyBookings,
    test_06_CancelBooking
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  log('\n' + '='.repeat(60), 'blue');
  log('📊 KẾT QUẢ KIỂM THỬ', 'blue');
  log('='.repeat(60), 'blue');
  log(`✅ Passed: ${passed}/${tests.length}`, 'green');
  log(`❌ Failed: ${failed}/${tests.length}`, failed > 0 ? 'red' : 'green');
  log('='.repeat(60), 'blue');

  process.exit(failed > 0 ? 1 : 0);
}

// Chạy
runAllTests().catch(error => {
  log(`\n💥 LỖI NGHIÊM TRỌNG: ${error.message}`, 'red');
  process.exit(1);
});
