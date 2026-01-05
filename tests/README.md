# 🧪 Hệ Thống Test Tự Động - Giúp Việc Nhà

## 📦 Cài Đặt

```bash
cd tests
npm install
```

## 🚀 Chạy Tests

### Test Từng Module

```bash
# Authentication (Đăng ký, đăng nhập, đổi mật khẩu)
npm run test:auth

# Services (CRUD dịch vụ)
npm run test:services

# Helper Profiles (Quản lý helper)
npm run test:helpers

# Booking Flow (Đặt dịch vụ, xác nhận, hủy)
npm run test:booking

# Rating System (Đánh giá, cập nhật rating)
npm run test:rating

# Statistics (Thống kê Admin/Employee/Helper)
npm run test:statistics

# Integration (End-to-end scenarios)
npm run test:integration
```

### Test Nhanh (Các tính năng chính)

```bash
npm run test:quick
```

### Test Toàn Bộ Hệ Thống

```bash
npm run test:all
```

## 📊 Coverage

| Module | Tests | Endpoints Covered |
|--------|-------|-------------------|
| **Authentication** | 10 | `/auth/login`, `/auth/register`, `/auth/change-password` |
| **Services** | 8 | CRUD `/services` |
| **Helpers** | 7 | CRUD `/helperprofiles`, `/available` |
| **Bookings** | 6 | CRUD `/bookings`, status updates |
| **Ratings** | 8 | `/ratings` create, list, validation |
| **Statistics** | 6 | `/statistics/admin`, `/employee`, `/helper` |
| **Integration** | 4 | End-to-end workflows |
| **TOTAL** | **49** | **~40 API endpoints** |

## 🎯 Test Scenarios

### ✅ Authentication Tests
- Đăng ký tài khoản mới (Customer, Helper)
- Đăng nhập thành công/thất bại
- Đổi mật khẩu
- Token validation
- Duplicate email rejection
- Unauthorized access protection

### ✅ Services Tests
- Lấy danh sách dịch vụ (public)
- Tạo dịch vụ (Admin only)
- Cập nhật dịch vụ
- Xóa dịch vụ
- Authorization checks

### ✅ Helper Profile Tests
- Tạo và cập nhật profile
- Lấy danh sách helpers
- Tìm helpers khả dụng theo thời gian
- Kiểm tra rating hiển thị đúng

### ✅ Booking Tests
- Tạo booking (Customer & Guest)
- Gán helper
- Xác nhận/Từ chối/Hoàn thành
- Hủy booking
- Xác nhận thanh toán

### ✅ Rating Tests
- Tạo đánh giá
- Cập nhật rating của helper
- Chặn đánh giá trùng lặp
- Lấy danh sách đánh giá

### ✅ Statistics Tests
- Admin/Employee/Helper stats
- Data consistency checks
- Authorization checks

### ✅ Integration Tests
- **E2E Booking & Rating**: Đăng ký → Đặt dịch vụ → Hoàn thành → Đánh giá
- **Guest Booking**: Tạo tài khoản tạm thời
- **Conflict Detection**: Kiểm tra helper không bị trùng lịch
- **Multi-role Workflow**: Employee xử lý booking

## ⚙️ Cấu Hình

### Yêu Cầu
- Backend đang chạy tại `http://localhost:5000`
- Database có dữ liệu test:
  - Admin: `admin@admin.com` / `Admin@123`
  - Employee: `nhanvien@nv.com` / `Nhanvien@123`
  - Customer: `customer@test.com` / `Customer@123`
  - Ít nhất 1 service (ID = 1)

### Biến Môi Trường (Optional)

```bash
export API_URL=http://localhost:5000/api
```

## 📈 Kết Quả

Mỗi test suite hiển thị:
- 🔵 **Test name** (màu xanh dương)
- ✅ **PASS** (màu xanh lá)
- ❌ **FAIL** (màu đỏ)
- 🟡 **Details** (màu vàng)
- 📊 **Summary** (tổng kết cuối)

Exit codes:
- `0`: Tất cả tests pass
- `1`: Có ít nhất 1 test fail

## 🔧 Cấu Trúc

```
tests/
├── api/                      # Test suites
│   ├── auth.test.js         # 10 tests
│   ├── services.test.js     # 8 tests
│   ├── helpers.test.js      # 7 tests
│   ├── booking.test.js      # 6 tests
│   ├── rating.test.js       # 8 tests
│   ├── statistics.test.js   # 6 tests
│   └── integration.test.js  # 4 tests
├── utils/                    # Utilities
│   ├── api-client.js        # HTTP client & test runner
│   └── test-data.js         # Data generators
├── package.json
└── README.md
```

## 💡 Tips

### Chạy Test Trước Khi Commit
```bash
npm run test:quick
```

### Debug Một Test Cụ Thể
Mở file test và chạy trực tiếp:
```bash
node api/auth.test.js
```

### Thêm Test Mới
1. Tạo file trong `tests/api/`
2. Import utilities: `require('../utils/api-client')`
3. Sử dụng `TestRunner` class
4. Thêm script vào `package.json`

### CI/CD Integration
```yaml
# .github/workflows/test.yml
- name: Run API Tests
  run: |
    cd tests
    npm install
    npm run test:all
```

## 🐛 Troubleshooting

**Lỗi: "ECONNREFUSED"**
→ Backend chưa chạy hoặc sai port

**Lỗi: "401 Unauthorized"**
→ Token hết hạn hoặc credentials sai

**Lỗi: "404 Not Found"**
→ Endpoint không tồn tại hoặc sai URL

**Tests fail ngẫu nhiên**
→ Kiểm tra database state, có thể cần reset data

## 📝 Changelog

### v1.0.0 (2026-01-05)
- ✅ 49 test cases covering 7 modules
- ✅ Utility modules (api-client, test-data)
- ✅ Integration tests
- ✅ Comprehensive documentation

---

**Tác giả**: Antigravity AI  
**Dự án**: Giúp Việc Nhà  
**Ngày tạo**: 05/01/2026
