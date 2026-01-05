/**
 * API Integration Tests - Rating System
 * Chạy: node tests/api/rating.test.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let adminToken = '';
let customerToken = '';
let testBookingId = 0;
let testHelperId = 0;

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

async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    
    if (data) config.data = data;

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
}

async function test_01_LoginAdmin() {
  log('\n📝 Test 1: Đăng nhập Admin', 'blue');
  
  const result = await apiCall('POST', '/auth/login', {
    email: 'admin@admin.com',
    password: 'Admin@123'
  });

  if (result.success && result.data.token) {
    adminToken = result.data.token;
    log('✅ PASS: Admin đăng nhập thành công', 'green');
    return true;
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function test_02_LoginCustomer() {
  log('\n📝 Test 2: Đăng nhập Customer', 'blue');
  
  const result = await apiCall('POST', '/auth/login', {
    email: 'customer@test.com',
    password: 'Customer@123'
  });

  if (result.success && result.data.token) {
    customerToken = result.data.token;
    log('✅ PASS: Customer đăng nhập thành công', 'green');
    return true;
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function test_03_CreateAndCompleteBooking() {
  log('\n📝 Test 3: Tạo và hoàn thành đơn hàng', 'blue');
  
  // Tạo booking
  const bookingData = {
    serviceId: 1,
    startDate: '2026-01-15',
    endDate: '2026-01-15',
    startTime: '09:00',
    endTime: '12:00',
    address: 'Test Address for Rating',
    notes: 'Rating test booking'
  };

  const createResult = await apiCall('POST', '/bookings', bookingData, customerToken);
  
  if (!createResult.success) {
    log(`❌ FAIL: Không tạo được booking - ${createResult.error}`, 'red');
    return false;
  }

  testBookingId = createResult.data.id;
  testHelperId = createResult.data.helperId;
  log(`   Đã tạo booking #${testBookingId}`, 'yellow');

  // Xác nhận booking (Admin)
  const confirmResult = await apiCall('PATCH', `/bookings/${testBookingId}/status`, 
    { status: 2 }, adminToken);
  
  if (!confirmResult.success) {
    log(`❌ FAIL: Không xác nhận được - ${confirmResult.error}`, 'red');
    return false;
  }
  log(`   Đã xác nhận booking`, 'yellow');

  // Hoàn thành booking
  const completeResult = await apiCall('PATCH', `/bookings/${testBookingId}/status`, 
    { status: 4 }, adminToken);
  
  if (completeResult.success) {
    log('✅ PASS: Đã hoàn thành booking', 'green');
    return true;
  } else {
    log(`❌ FAIL: Không hoàn thành được - ${completeResult.error}`, 'red');
    return false;
  }
}

async function test_04_GetHelperRatingBefore() {
  log('\n📝 Test 4: Lấy rating của Helper trước khi đánh giá', 'blue');
  
  const result = await apiCall('GET', `/helperprofiles/${testHelperId}`);

  if (result.success) {
    const before = {
      avg: result.data.ratingAverage,
      count: result.data.ratingCount
    };
    log(`✅ PASS: Rating hiện tại - Avg: ${before.avg}, Count: ${before.count}`, 'green');
    // Lưu để so sánh sau
    global.ratingBefore = before;
    return true;
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function test_05_CreateRating() {
  log('\n📝 Test 5: Tạo đánh giá cho booking', 'blue');
  
  const ratingData = {
    bookingId: testBookingId,
    score: 5,
    comment: 'Excellent service! Automated test rating.'
  };

  const result = await apiCall('POST', '/ratings', ratingData, customerToken);

  if (result.success && result.data.id) {
    log(`✅ PASS: Đã tạo rating #${result.data.id}`, 'green');
    log(`   Score: ${result.data.score}/5`, 'yellow');
    log(`   Comment: ${result.data.comment}`, 'yellow');
    return true;
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function test_06_VerifyRatingUpdate() {
  log('\n📝 Test 6: Kiểm tra rating đã được cập nhật', 'blue');
  
  const result = await apiCall('GET', `/helperprofiles/${testHelperId}`);

  if (result.success) {
    const after = {
      avg: result.data.ratingAverage,
      count: result.data.ratingCount
    };
    const before = global.ratingBefore;

    log(`   Trước: Avg=${before.avg}, Count=${before.count}`, 'yellow');
    log(`   Sau:   Avg=${after.avg}, Count=${after.count}`, 'yellow');

    if (after.count === before.count + 1) {
      log('✅ PASS: Rating count đã tăng đúng', 'green');
      return true;
    } else {
      log('❌ FAIL: Rating count không tăng', 'red');
      return false;
    }
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function test_07_PreventDuplicateRating() {
  log('\n📝 Test 7: Kiểm tra không cho đánh giá 2 lần', 'blue');
  
  const ratingData = {
    bookingId: testBookingId,
    score: 4,
    comment: 'Trying to rate again'
  };

  const result = await apiCall('POST', '/ratings', ratingData, customerToken);

  if (!result.success) {
    log('✅ PASS: Hệ thống chặn đánh giá trùng', 'green');
    log(`   Lỗi: ${result.error}`, 'yellow');
    return true;
  } else {
    log('❌ FAIL: Hệ thống cho phép đánh giá 2 lần!', 'red');
    return false;
  }
}

async function test_08_GetHelperRatings() {
  log('\n📝 Test 8: Lấy danh sách đánh giá của Helper', 'blue');
  
  const result = await apiCall('GET', `/ratings/helper/${testHelperId}`);

  if (result.success && Array.isArray(result.data)) {
    const ourRating = result.data.find(r => r.bookingId === testBookingId);
    if (ourRating) {
      log(`✅ PASS: Tìm thấy rating vừa tạo`, 'green');
      log(`   Từ: ${ourRating.customerName}`, 'yellow');
      log(`   Score: ${ourRating.score}/5`, 'yellow');
      return true;
    } else {
      log('❌ FAIL: Không tìm thấy rating', 'red');
      return false;
    }
  } else {
    log(`❌ FAIL: ${result.error}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('='.repeat(60), 'blue');
  log('⭐ BẮT ĐẦU KIỂM THỬ HỆ THỐNG ĐÁNH GIÁ', 'blue');
  log('='.repeat(60), 'blue');

  const tests = [
    test_01_LoginAdmin,
    test_02_LoginCustomer,
    test_03_CreateAndCompleteBooking,
    test_04_GetHelperRatingBefore,
    test_05_CreateRating,
    test_06_VerifyRatingUpdate,
    test_07_PreventDuplicateRating,
    test_08_GetHelperRatings
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    else failed++;
  }

  log('\n' + '='.repeat(60), 'blue');
  log('📊 KẾT QUẢ KIỂM THỬ', 'blue');
  log('='.repeat(60), 'blue');
  log(`✅ Passed: ${passed}/${tests.length}`, 'green');
  log(`❌ Failed: ${failed}/${tests.length}`, failed > 0 ? 'red' : 'green');
  log('='.repeat(60), 'blue');

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  log(`\n💥 LỖI: ${error.message}`, 'red');
  process.exit(1);
});
