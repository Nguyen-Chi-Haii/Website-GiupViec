Write-Host "--- Đang khởi chạy ứng dụng ở chế độ Production ---" -ForegroundColor Cyan

# 1. Chạy API
Write-Host "[1/2] Đang khởi chạy API tại http://localhost:5217 ..." -ForegroundColor Yellow
$apiExe = Join-Path $PSScriptRoot "release/api/API.exe"

if (-not (Test-Path $apiExe)) {
    Write-Host "Lỗi: Không tìm thấy file API.exe. Vui lòng chạy './publish-all.ps1' trước." -ForegroundColor Red
    exit
}

# Chạy API trong cửa sổ mới
Start-Process -FilePath $apiExe -ArgumentList "--urls http://localhost:5217" -WindowStyle Normal

# 2. Chạy Frontend
Write-Host "[2/2] Đang khởi chạy Giao diện tại http://localhost:4200..." -ForegroundColor Yellow
$webDist = Join-Path $PSScriptRoot "apps/web/dist/FE/browser"
# Kiểm tra nếu thư mục tồn tại, Angular 17+ thường có /browser
if (-not (Test-Path $webDist)) {
    $webDist = Join-Path $PSScriptRoot "apps/web/dist/FE"
}

if (-not (Test-Path $webDist)) {
    Write-Host "Lỗi: Không tìm thấy thư mục dist của Web. Vui lòng chạy './publish-all.ps1' trước." -ForegroundColor Red
    exit
}

# Sử dụng npx serve để chạy web nhẹ nhàng (cần cài đặt Node.js)
# -s để hỗ trợ Single Page Application (SPA)
Start-Process -FilePath "npx.cmd" -ArgumentList "-y serve -s $webDist -l 4200" -WindowStyle Normal

Write-Host "`n--- ỨNG DỤNG ĐÃ SẴN SÀNG! ---" -ForegroundColor Green
Write-Host "Bạn có thể truy cập web tại: http://localhost:4200" -ForegroundColor Cyan
Write-Host "Nhấn Ctrl+C trong các cửa sổ mới mở để dừng ứng dụng." -ForegroundColor Gray
