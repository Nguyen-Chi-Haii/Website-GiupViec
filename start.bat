@echo off
echo ========================================
echo   Giup Viec Nha - Starting All Apps
echo ========================================
echo.

REM Change to root directory
cd /d "%~dp0"

REM Start using npm run dev (requires concurrently)
echo Starting API and Web servers...
echo API: https://localhost:7001
echo WEB: http://localhost:4200
echo.
npm run dev

pause
