@echo off
echo ==========================================
echo  Setup Hotel Booking API - Day 2
echo ==========================================
echo.

REM Check Node.js
echo [1/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found!
    echo Please install from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
echo [OK] Node.js found: %NODE_VERSION%

REM Check npm
echo.
echo [2/4] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)
for /f "tokens=*" %%a in ('npm --version') do set NPM_VERSION=%%a
echo [OK] npm found: v%NPM_VERSION%

REM Install dependencies
echo.
echo [3/4] Installing dependencies...
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

REM Create .env file
echo.
echo [4/4] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo [OK] .env file created
) else (
    echo [INFO] .env file already exists
)

echo.
echo ==========================================
echo  Setup Complete!
echo ==========================================
echo.
echo To start the server:
echo   npm start     (production mode)
echo   npm run dev   (development mode)
echo.
echo Server will run at: http://localhost:3000
echo.
pause
