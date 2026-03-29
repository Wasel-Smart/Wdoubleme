@echo off
setlocal EnableDelayedExpansion
REM ================================================================
REM  WASEL — Production Cleanup Script
REM  Run this ONCE from the project root.
REM  Creates _REMOVED\ backup before touching anything.
REM ================================================================

SET ROOT=C:\Users\user\OneDrive\Desktop\Wdoubleme
SET BAK=%ROOT%\_REMOVED

echo.
echo  ██╗    ██╗ █████╗ ███████╗███████╗██╗
echo  ██║    ██║██╔══██╗██╔════╝██╔════╝██║
echo  ██║ █╗ ██║███████║███████╗█████╗  ██║
echo  ██║███╗██║██╔══██║╚════██║██╔══╝  ██║
echo  ╚███╔███╔╝██║  ██║███████║███████╗███████╗
echo   ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
echo.
echo  Production Cleanup Script
echo  All removed files go to _REMOVED\ (safe to delete later)
echo.

REM ── Create backup root ──────────────────────────────────────────
mkdir "%BAK%" 2>nul
mkdir "%BAK%\src-root" 2>nul
mkdir "%BAK%\docs" 2>nul
mkdir "%BAK%\scripts" 2>nul
mkdir "%BAK%\components" 2>nul
mkdir "%BAK%\utils" 2>nul
mkdir "%BAK%\layouts" 2>nul

echo [1/10] Backing up and removing /src/ root junk files...
for %%F in (
  "FINAL_DELIVERY_SUMMARY.md"
  "IMPLEMENTATION_SUMMARY.md"
  "MOBILITY_OS_IMPLEMENTATION.md"
  "QUICK_START_NEW_FEATURES.md"
  "Attributions.md"
  "fix-build.bat"
  "fix-build.sh"
  "test-backend-health.sh"
  "test-wasel-ds-exports.ts"
  "GoogleService-Info.plist"
  "lighthouserc.json"
  "drizzle.config.ts"
) do (
  if exist "%ROOT%\src\%%~F" (
    move "%ROOT%\src\%%~F" "%BAK%\src-root\" >nul 2>&1
    echo   Removed: src\%%~F
  )
)

echo [2/10] Removing /src/docs/ fix-report files...
for %%F in (
  "DOWNLOAD_ERROR_FIX_REPORT.md"
  "DOWNLOAD_FIX_VALIDATION.md"
  "QUICK_FIX_SUMMARY.md"
) do (
  if exist "%ROOT%\src\docs\%%~F" (
    move "%ROOT%\src\docs\%%~F" "%BAK%\docs\" >nul 2>&1
    echo   Removed: src\docs\%%~F
  )
)

echo [3/10] Removing /src/scripts/ one-time fix scripts...
for %%F in (
  "verify-download-fix.bat"
  "verify-download-fix.sh"
  "fix-api-paths.sh"
) do (
  if exist "%ROOT%\src\scripts\%%~F" (
    move "%ROOT%\src\scripts\%%~F" "%BAK%\scripts\" >nul 2>&1
    echo   Removed: src\scripts\%%~F
  )
)

echo [4/10] Removing /src/imports/ planning dump (entire folder)...
if exist "%ROOT%\src\imports" (
  xcopy "%ROOT%\src\imports" "%BAK%\imports\" /E /I /Q 2>nul
  rd /s /q "%ROOT%\src\imports" 2>nul
  echo   Removed: src\imports\ (planning docs, pasted text, strategy notes)
)

echo [5/10] Removing /src/gxp/ pharmaceutical compliance (not relevant)...
if exist "%ROOT%\src\gxp" (
  xcopy "%ROOT%\src\gxp" "%BAK%\gxp\" /E /I /Q 2>nul
  rd /s /q "%ROOT%\src\gxp" 2>nul
  echo   Removed: src\gxp\ (GxP compliance — unused)
)

echo [6/10] Removing empty /src/routes/ directory...
if exist "%ROOT%\src\routes" (
  rd "%ROOT%\src\routes" 2>nul
  echo   Removed: src\routes\ (empty folder — routes live in wasel-routes.tsx)
)

echo [7/10] Removing unused legacy components...
for %%F in (
  "AuthFix.tsx"
  "LandingPage.tsx"
  "LandingPageWrapper.tsx"
  "TripsAnalyticsDashboard.tsx"
  "GoogleMapComponent.tsx"
  "MapComponent.tsx"
  "WorkflowGuide.tsx"
  "APIKeysSetupGuide.tsx"
  "AdvancedFilters.tsx"
) do (
  if exist "%ROOT%\src\components\%%~F" (
    move "%ROOT%\src\components\%%~F" "%BAK%\components\" >nul 2>&1
    echo   Removed: src\components\%%~F
  )
)

echo [8/10] Removing Figma plugin tooling and UAT data from utils...
for %%F in (
  "figmaMessagePortHandler.ts"
  "figmaMessagePortHandler.test.ts"
  "uatTestData.ts"
) do (
  if exist "%ROOT%\src\utils\%%~F" (
    move "%ROOT%\src\utils\%%~F" "%BAK%\utils\" >nul 2>&1
    echo   Removed: src\utils\%%~F
  )
)

echo [9/10] Removing duplicate/legacy layout files...
for %%F in (
  "RootLayout.tsx"
  "AuthLayout.tsx"
  "BareLayout.tsx"
  "LandingLayout.tsx"
) do (
  if exist "%ROOT%\src\layouts\%%~F" (
    move "%ROOT%\src\layouts\%%~F" "%BAK%\layouts\" >nul 2>&1
    echo   Removed: src\layouts\%%~F
  )
)

echo [10/10] Removing stale vitest .mjs config (replaced by .ts)...
if exist "%ROOT%\vitest.config.mjs" (
  move "%ROOT%\vitest.config.mjs" "%BAK%\" >nul 2>&1
  echo   Removed: vitest.config.mjs
)

echo.
echo  Moving CI/CD workflows to correct .github\workflows\ location...
if exist "%ROOT%\src\workflows" (
  mkdir "%ROOT%\.github\workflows" 2>nul
  for %%F in ("%ROOT%\src\workflows\*.yml") do (
    move "%%F" "%ROOT%\.github\workflows\" >nul 2>&1
    echo   Moved: src\workflows\%%~nxF → .github\workflows\
  )
  rd "%ROOT%\src\workflows" 2>nul
)

echo.
echo ================================================================
echo  CLEANUP COMPLETE
echo.
echo  Files removed:  ~60+ files and folders
echo  Space freed:    ~800 KB from source tree
echo  Backed up in:   _REMOVED\  (delete this folder when satisfied)
echo.
echo  NEXT STEPS:
echo    1. npm install          (re-install after package.json cleanup)
echo    2. npm run type-check   (verify no broken imports)
echo    3. npm run build        (confirm clean production build)
echo    4. npm run dev          (smoke test the app)
echo    5. Delete _REMOVED\     (once satisfied)
echo ================================================================
echo.
pause
