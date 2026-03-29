@echo off
REM 🚀 EXTREME PERFORMANCE BUILD SCRIPT (Windows)
REM Builds Wasel with maximum optimizations for production

echo 🚀 Starting EXTREME PERFORMANCE BUILD for Wasel...
echo.

REM Step 1: Clean previous build
echo 📦 Cleaning previous build...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo ✅ Cleaned
echo.

REM Step 2: Install dependencies
echo 📦 Installing dependencies...
call npm ci --prefer-offline
echo ✅ Dependencies installed
echo.

REM Step 3: Type check
echo 🔍 Type checking...
call npm run type-check
if errorlevel 1 (
    echo ❌ Type check failed
    exit /b 1
)
echo ✅ Type check passed
echo.

REM Step 4: Build with optimizations
echo 🏗️  Building with maximum optimizations...
echo.
echo   ⚡ Code splitting enabled
echo   ⚡ Minification enabled (esbuild)
echo   ⚡ CSS minification enabled
echo   ⚡ Tree-shaking enabled
echo   ⚡ Brotli + Gzip compression enabled
echo   ⚡ Asset optimization enabled
echo.

REM Set production environment
set NODE_ENV=production

REM Build with Vite
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)

echo ✅ Build complete
echo.

REM Step 5: Analyze bundle size
echo 📊 Analyzing bundle size...

REM Check if dist exists
if not exist dist (
    echo ❌ Build failed: dist\ directory not found
    exit /b 1
)

echo.
echo 📦 Bundle Size Report:
dir dist /s /-c | find "File(s)"
echo.

REM Step 6: Success message
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🚀 EXTREME PERFORMANCE BUILD COMPLETE!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📊 Build Location: .\dist\
echo 🌐 Preview: npm run preview
echo 🚀 Deploy: npm run deploy
echo.
echo Wasel is now the FASTEST carpooling app on Earth! ⚡
echo.

exit /b 0
