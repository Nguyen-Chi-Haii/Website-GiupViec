# Giúp Việc Nhà - Monorepo

Ứng dụng đặt dịch vụ giúp việc nhà - Monorepo với Backend (.NET 8) và Frontend (Angular 20).

## Cấu Trúc Dự Án

```
GIUPVIEC/
├── apps/
│   ├── api/          # .NET 8 Backend API
│   └── web/          # Angular 20 Frontend
├── packages/
│   └── shared/       # Shared types, constants, utils
├── scripts/          # Utility scripts
└── package.json      # Root package với npm workspaces
```

## Yêu Cầu

- **Node.js** >= 18.0.0
- **.NET SDK** 8.0
- **SQL Server** (LocalDB hoặc Express)

## Cài Đặt

```bash
# Clone repository
git clone https://github.com/Nguyen-Chi-Haii/Website-GiupViec.git
cd GIUPVIEC

# Cài đặt dependencies
npm install

# Cài đặt frontend dependencies
npm run install:web
```

## Chạy Ứng Dụng

### Chạy Cả Backend + Frontend

```bash
npm run dev
```

- **API**: https://localhost:7001 (Swagger: https://localhost:7001/swagger)
- **Web**: http://localhost:4200

### Chạy Riêng Lẻ

```bash
# Chỉ Backend
npm run dev:api

# Chỉ Frontend  
npm run dev:web
```

## Build Production

```bash
npm run build
```

## Apps

### API (`apps/api/`)

Backend API sử dụng .NET 8 với:
- Entity Framework Core + SQL Server
- JWT Authentication
- AutoMapper
- Swagger/OpenAPI

### Web (`apps/web/`)

Frontend sử dụng Angular 20 với:
- Standalone Components
- Angular Material
- Responsive Design

## Packages

### Shared (`packages/shared/`)

Các thành phần dùng chung:
- **types/**: TypeScript interfaces (matching API DTOs)
- **constants/**: Shared constants
- **utils/**: Utility functions

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy cả API + Web |
| `npm run dev:api` | Chạy API |
| `npm run dev:web` | Chạy Web |
| `npm run build` | Build tất cả |
| `npm run clean` | Xóa node_modules và dist |

## License

MIT
