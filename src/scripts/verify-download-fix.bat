@echo off
REM Wasel Download Fix Verification Script (Windows)
REM Run this to verify the "Failed to download code files" fix is working

setlocal enabledelayedexpansion

echo ================================================================
echo   Wasel Download Fix Verification - March 10, 2026
echo ================================================================
echo.

set TESTS_PASSED=0
set TESTS_FAILED=0

REM ================================================================
REM TEST 1: Check for figma:asset imports in code files
REM ================================================================
echo === Test 1: Checking for figma:asset imports ===
echo.

findstr /S /I /M "from.*figma:asset" *.tsx *.ts > nul 2>&1
if errorlevel 1 (
    echo [32m✓[0m No figma:asset imports found in code files
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗[0m Found figma:asset imports in code files
    set /a TESTS_FAILED+=1
)

REM ================================================================
REM TEST 2: Verify critical files use public assets
REM ================================================================
echo.
echo === Test 2: Verifying critical files ===
echo.

findstr /C:"const waselLogoImg = '/icon-512.png'" components\Logo.tsx > nul 2>&1
if errorlevel 1 (
    echo [31m✗[0m Logo.tsx does not use correct public asset path
    set /a TESTS_FAILED+=1
) else (
    echo [32m✓[0m Logo.tsx uses public asset path
    set /a TESTS_PASSED+=1
)

findstr /C:"const waselGlobe = '/icon-512.png'" features\landing\JordanLandingPage.tsx > nul 2>&1
if errorlevel 1 (
    echo [31m✗[0m JordanLandingPage.tsx does not use correct public asset path
    set /a TESTS_FAILED+=1
) else (
    echo [32m✓[0m JordanLandingPage.tsx uses public asset path
    set /a TESTS_PASSED+=1
)

findstr /C:"const logoImage = '/icon-512.png'" components\branding\WaselLogo.tsx > nul 2>&1
if errorlevel 1 (
    echo [31m✗[0m WaselLogo.tsx does not use correct public asset path
    set /a TESTS_FAILED+=1
) else (
    echo [32m✓[0m WaselLogo.tsx uses public asset path
    set /a TESTS_PASSED+=1
)

REM ================================================================
REM TEST 3: Verify public assets exist
REM ================================================================
echo.
echo === Test 3: Verifying public assets ===
echo.

if exist "public\icon-512.png" (
    echo [32m✓[0m public\icon-512.png exists
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗[0m public\icon-512.png is missing
    set /a TESTS_FAILED+=1
)

if exist "public\icon-192.png" (
    echo [32m✓[0m public\icon-192.png exists
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗[0m public\icon-192.png is missing
    set /a TESTS_FAILED+=1
)

if exist "public\favicon.svg" (
    echo [32m✓[0m public\favicon.svg exists
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗[0m public\favicon.svg is missing
    set /a TESTS_FAILED+=1
)

if exist "public\favicon.ico" (
    echo [32m✓[0m public\favicon.ico exists
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗[0m public\favicon.ico is missing
    set /a TESTS_FAILED+=1
)

if exist "public\apple-touch-icon.png" (
    echo [32m✓[0m public\apple-touch-icon.png exists
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗[0m public\apple-touch-icon.png is missing
    set /a TESTS_FAILED+=1
)

if exist "public\manifest.json" (
    echo [32m✓[0m public\manifest.json exists
    set /a TESTS_PASSED+=1
) else (
    echo [31m✗[0m public\manifest.json is missing
    set /a TESTS_FAILED+=1
)

REM ================================================================
REM TEST 4: TypeScript compilation
REM ================================================================
echo.
echo === Test 4: TypeScript compilation ===
echo.

echo [34mℹ[0m Running TypeScript type check...
call npm run type-check > nul 2>&1
if errorlevel 1 (
    echo [31m✗[0m TypeScript compilation failed (run 'npm run type-check' for details)
    set /a TESTS_FAILED+=1
) else (
    echo [32m✓[0m TypeScript compilation successful
    set /a TESTS_PASSED+=1
)

REM ================================================================
REM TEST 5: Verify route configuration
REM ================================================================
echo.
echo === Test 5: Verifying route configuration ===
echo.

findstr /C:"import { WaselLogoLoading } from '../components/branding/WaselLogo'" utils\optimizedRoutes.tsx > nul 2>&1
if errorlevel 1 (
    echo [31m✗[0m optimizedRoutes.tsx has incorrect WaselLogoLoading import
    set /a TESTS_FAILED+=1
) else (
    echo [32m✓[0m optimizedRoutes.tsx imports WaselLogoLoading correctly
    set /a TESTS_PASSED+=1
)

findstr /C:"export default App" App.tsx > nul 2>&1
if errorlevel 1 (
    echo [31m✗[0m App.tsx missing default export
    set /a TESTS_FAILED+=1
) else (
    echo [32m✓[0m App.tsx has default export
    set /a TESTS_PASSED+=1
)

REM ================================================================
REM SUMMARY
REM ================================================================
echo.
echo ================================================================
echo                       TEST RESULTS
echo ================================================================
echo.
echo Tests Passed: [32m%TESTS_PASSED%[0m
echo Tests Failed: [31m%TESTS_FAILED%[0m
echo.

if %TESTS_FAILED% EQU 0 (
    echo [32m✓ ALL TESTS PASSED[0m
    echo.
    echo Next steps:
    echo   1. Run 'npm run dev' to test locally
    echo   2. Test download in Figma Make
    echo   3. Deploy to production when ready
    echo.
    exit /b 0
) else (
    echo [31m✗ SOME TESTS FAILED[0m
    echo.
    echo Please review the errors above and fix before deploying.
    echo.
    echo Documentation:
    echo   - \docs\QUICK_FIX_SUMMARY.md
    echo   - \docs\DOWNLOAD_ERROR_FIX_REPORT.md
    echo   - \docs\DOWNLOAD_FIX_VALIDATION.md
    echo.
    exit /b 1
)
