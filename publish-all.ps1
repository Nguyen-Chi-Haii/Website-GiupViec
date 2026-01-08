Write-Host "--- Bắt đầu dọn dẹp và đóng gói ứng dụng (Production) ---" -ForegroundColor Cyan

# 1. Build API
Write-Host "`n[1/2] Đang đóng gói API..." -ForegroundColor Yellow
$apiPath = Join-Path $PSScriptRoot "apps/api"
$apiOut = Join-Path $PSScriptRoot "release/api"

# Xóa thư mục cũ nếu có
if (Test-Path $apiOut) {
    Remove-Item -Path $apiOut -Recurse -Force
}

dotnet publish $apiPath/API.csproj -c Release -o $apiOut

# 2. Build Frontend
Write-Host "`n[2/2] Đang đóng gói Giao diện (Angular)..." -ForegroundColor Yellow
$webPath = Join-Path $PSScriptRoot "apps/web"
$currentDir = Get-Location
Set-Location $webPath
npm run build
Set-Location $currentDir

Write-Host "`n--- HOÀN THÀNH ---" -ForegroundColor Green
Write-Host "Bây giờ bạn có thể sử dụng lệnh './run-production.ps1' để khởi chạy ứng dụng." -ForegroundColor Cyan
