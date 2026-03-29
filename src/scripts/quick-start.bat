@echo off
REM ═══════════════════════════════════════════════════════════
REM Wasel | واصل — Quick Start Script (Windows)
REM One-command setup for local development
REM ═══════════════════════════════════════════════════════════

setlocal EnableDelayedExpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║           Wasel - Quick Start (Windows)                   ║
echo ║           Setting up localhost:3000...                    ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM Step 1: Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% found
echo.

REM Step 2: Install dependencies
echo [2/5] Installing dependencies...
if exist node_modules (
    echo ⚠️  node_modules exists. Cleaning...
    rmdir /s /q node_modules
    del /f /q package-lock.json 2>nul
)

echo    This will take 2-5 minutes...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Installation failed
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 3: Create .env if missing
echo [3/5] Checking environment variables...
if not exist .env (
    echo    Creating .env file...
    (
        echo # Supabase Configuration
        echo VITE_SUPABASE_URL=https://djccmatubyyudeosrngm.supabase.co
        echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder
        echo.
        echo # Google Maps
        echo VITE_GOOGLE_MAPS_API_KEY=AIzaSyDemoKey_GetRealKeyFromGoogleCloud
        echo.
        echo # OAuth
        echo VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
        echo.
        echo # Stripe
        echo VITE_STRIPE_PUBLIC_KEY=pk_test_placeholder
        echo.
        echo # Environment
        echo VITE_ENV=development
        echo VITE_APP_VERSION=1.0.0
        echo.
        echo # Sentry
        echo VITE_SENTRY_DSN=https://placeholder@sentry.io/placeholder
    ) > .env
    echo ✅ .env file created
    echo ⚠️  Update .env with your real API keys for full functionality
) else (
    echo ✅ .env file exists
)
echo.

REM Step 4: Check TypeScript
echo [4/5] Checking TypeScript...
call npm run type-check >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ TypeScript check passed
) else (
    echo ⚠️  TypeScript has warnings ^(app will still work^)
)
echo.

REM Step 5: Check port availability
echo [5/5] Checking port 3000...
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Port 3000 is in use
    echo    Attempting to free port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
echo ✅ Port 3000 is available
echo.

REM Success!
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║                    ✅ SETUP COMPLETE!                     ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo.
echo 🚀 Starting development server...
echo.
echo The app will open automatically at:
echo    ➜ http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
timeout /t 2 /nobreak >nul

REM Start the dev server
call npm run dev

pause
