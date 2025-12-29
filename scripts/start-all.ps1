# Start All - Chạy cả API và Web cùng lúc
# Sử dụng: .\scripts\start-all.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Giúp Việc Nhà - Starting All Apps    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = Split-Path -Parent $PSScriptRoot

# Start API in new terminal
Write-Host "[API] Starting .NET Backend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\apps\api'; Write-Host 'API Server starting...' -ForegroundColor Blue; dotnet watch run"

# Wait a bit for API to start
Start-Sleep -Seconds 3

# Start Web in new terminal
Write-Host "[WEB] Starting Angular Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\apps\web'; Write-Host 'Web Server starting...' -ForegroundColor Green; npm run start"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servers are starting in new windows  " -ForegroundColor Cyan
Write-Host "  API: https://localhost:7001          " -ForegroundColor Blue
Write-Host "  WEB: http://localhost:4200           " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
