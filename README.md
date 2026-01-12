# Giúp Việc Nhà - Booking System

Dự án **Giúp Việc Nhà** là một hệ thống monorepo toàn diện kết nối khách hàng với người giúp việc, bao gồm ứng dụng web hiện đại và backend mạnh mẽ. Hệ thống cung cấp các tính năng quản lý đơn hàng, theo dõi doanh thu, và quản lý hồ sơ người dùng theo thời gian thực.

## 🚀 Tính Năng Nổi Bật

*   **Đa Vai Trò**: Hỗ trợ 4 vai trò người dùng riêng biệt: Khách hàng (Customer), Người giúp việc (Helper), Nhân viên (Employee), và Quản trị viên (Admin).
*   **Real-time Dashboard**: Biểu đồ doanh thu, thống kê đơn hàng và trạng thái hoạt động cập nhật tức thì.
*   **Quản Lý Đơn Hàng**: Quy trình đặt lịch, xác nhận, thanh toán và hoàn thành công việc được tối ưu hóa.
*   **Giao Diện Hiện Đại**: Thiết kế Responsive, sử dụng Angular Signals cho hiệu suất cao.

## 🛠️ Công Nghệ Sử Dụng

### Frontend (`apps/web`)
*   **Framework**: Angular 21 (Latest)
*   **Ngôn Ngữ**: TypeScript 5.9
*   **State Management**: Angular Signals
*   **Styling**: Modern CSS / TailwindCSS (Architecture)
*   **Charts**: Chart.js & ng2-charts
*   **Testing**: Jasmine & Karma

### Backend (`apps/api`)
*   **Framework**: ASP.NET Core Web API
*   **Database**: SQL Server (Entity Framework Core)
*   **Real-time**: SignalR (Dự kiến cho thông báo)

### Monorepo Tooling
*   **Workspaces**: npm workspaces
*   **Script Runner**: Concurrently
*   **Shared Library**: `@giupviec/shared` (Chia sẻ Interfaces/DTOs giữa Frontend và Backend mock)

## 📂 Cấu Trúc Dự Án

```
giupviec-monorepo/
├── apps/
│   ├── api/            # ASP.NET Core Backend
│   └── web/            # Angular Frontend Application
├── packages/
│   └── shared/         # Thư viện chia sẻ (Types, Constants)
├── package.json        # Root configuration & scripts
└── README.md           # Project documentation
```

## ⚙️ Cài Đặt & Chạy Dự Án

### Yêu Cầu
*   **Node.js**: >= 18.0.0
*   **Angular CLI**: Latest
*   **.NET SDK**: 8.0 / 9.0 (Tùy cấu hình backend)

### Các Bước Cài Đặt

1.  **Clone dự án:**
    ```bash
    git clone <repository-url>
    cd GIUPVIEC
    ```

2.  **Cài đặt dependencies:**
    Tại thư mục gốc, chạy lệnh để cài đặt cho cả workspace:
    ```bash
    npm install
    ```
    *Lưu ý: Nếu gặp lỗi dependency, hãy chạy `npm run install:web` để cài đặt riêng cho frontend.*

3.  **Cấu hình Database (Backend):**
    *   Mở `apps/api/appsettings.json` và cập nhật ConnectionString.
    *   Chạy Migrations (nếu có): `dotnet ef database update`

### Lệnh Chạy (Scripts)

Dự án cung cấp các lệnh tiện ích trong `package.json` gốc:

*   **Chạy toàn bộ hệ thống (Dev Mode):**
    ```bash
    npm run dev
    ```
    *(Lệnh này sẽ chạy song song Backend API và Frontend Angular)*

*   **Chỉ chạy Frontend:**
    ```bash
    npm run dev:web
    ```

*   **Chỉ chạy Backend:**
    ```bash
    npm run dev:api
    ```

*   **Build Production:**
    ```bash
    npm run build
    ```

## 🧪 Testing

Hệ thống Frontend được phủ Unit Test toàn diện cho các module quan trọng (Employee, Admin, Auth).

Để chạy test:
```bash
cd apps/web
npm run test
```
*Kết quả test sẽ hiển thị trên trình duyệt Chrome (hoặc Headless tùy cấu hình).*

## 👥 Tác Giả & Liên Hệ

Dự án được phát triển bởi đội ngũ kỹ thuật **Giúp Việc Nhà**. Mọi thắc mắc vui lòng liên hệ qua kênh hỗ trợ của dự án.
