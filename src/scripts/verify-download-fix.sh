#!/bin/bash
# Wasel Download Fix Verification Script
# Run this to verify the "Failed to download code files" fix is working

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Wasel Download Fix Verification — March 10, 2026           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}═══ $1 ═══${NC}"
}

# ═══════════════════════════════════════════════════════════════════
# TEST 1: Check for figma:asset imports in code files
# ═══════════════════════════════════════════════════════════════════
section "Test 1: Checking for figma:asset imports"

FIGMA_IMPORTS=$(grep -r "from ['\"]figma:asset" --include="*.tsx" --include="*.ts" . 2>/dev/null || true)

if [ -z "$FIGMA_IMPORTS" ]; then
    pass "No figma:asset imports found in code files"
else
    fail "Found figma:asset imports in code files:"
    echo "$FIGMA_IMPORTS"
fi

# ═══════════════════════════════════════════════════════════════════
# TEST 2: Verify critical files use public assets
# ═══════════════════════════════════════════════════════════════════
section "Test 2: Verifying critical files"

# Check Logo.tsx
if grep -q "const waselLogoImg = '/icon-512.png'" components/Logo.tsx; then
    pass "Logo.tsx uses public asset path"
else
    fail "Logo.tsx does not use correct public asset path"
fi

# Check JordanLandingPage.tsx
if grep -q "const waselGlobe = '/icon-512.png'" features/landing/JordanLandingPage.tsx; then
    pass "JordanLandingPage.tsx uses public asset path"
else
    fail "JordanLandingPage.tsx does not use correct public asset path"
fi

# Check WaselLogo.tsx
if grep -q "const logoImage = '/icon-512.png'" components/branding/WaselLogo.tsx; then
    pass "WaselLogo.tsx uses public asset path"
else
    fail "WaselLogo.tsx does not use correct public asset path"
fi

# ═══════════════════════════════════════════════════════════════════
# TEST 3: Verify public assets exist
# ═══════════════════════════════════════════════════════════════════
section "Test 3: Verifying public assets"

REQUIRED_ASSETS=(
    "public/icon-512.png"
    "public/icon-192.png"
    "public/favicon.svg"
    "public/favicon.ico"
    "public/apple-touch-icon.png"
    "public/manifest.json"
)

for asset in "${REQUIRED_ASSETS[@]}"; do
    if [ -f "$asset" ]; then
        pass "$asset exists"
    else
        fail "$asset is missing"
    fi
done

# ═══════════════════════════════════════════════════════════════════
# TEST 4: TypeScript compilation
# ═══════════════════════════════════════════════════════════════════
section "Test 4: TypeScript compilation"

info "Running TypeScript type check..."
if npm run type-check > /dev/null 2>&1; then
    pass "TypeScript compilation successful"
else
    fail "TypeScript compilation failed (run 'npm run type-check' for details)"
fi

# ═══════════════════════════════════════════════════════════════════
# TEST 5: Verify route configuration
# ═══════════════════════════════════════════════════════════════════
section "Test 5: Verifying route configuration"

# Check optimizedRoutes.tsx imports WaselLogoLoading correctly
if grep -q "import { WaselLogoLoading } from '../components/branding/WaselLogo'" utils/optimizedRoutes.tsx; then
    pass "optimizedRoutes.tsx imports WaselLogoLoading correctly"
else
    fail "optimizedRoutes.tsx has incorrect WaselLogoLoading import"
fi

# Check App.tsx has default export
if grep -q "export default App" App.tsx; then
    pass "App.tsx has default export"
else
    fail "App.tsx missing default export"
fi

# ═══════════════════════════════════════════════════════════════════
# TEST 6: Build test (optional - commented out by default)
# ═══════════════════════════════════════════════════════════════════
section "Test 6: Build verification (optional)"

warn "Build test skipped (uncomment in script to enable)"
# Uncomment below to run full build test
# info "Running production build..."
# if npm run build > /dev/null 2>&1; then
#     pass "Production build successful"
#     
#     # Check if assets were copied to dist
#     if [ -f "dist/icon-512.png" ]; then
#         pass "Assets copied to dist folder"
#     else
#         fail "Assets not found in dist folder"
#     fi
# else
#     fail "Production build failed (run 'npm run build' for details)"
# fi

# ═══════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                      TEST RESULTS                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm run dev' to test locally"
    echo "  2. Test download in Figma Make"
    echo "  3. Deploy to production when ready"
    echo ""
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please review the errors above and fix before deploying."
    echo ""
    echo "Documentation:"
    echo "  - /docs/QUICK_FIX_SUMMARY.md"
    echo "  - /docs/DOWNLOAD_ERROR_FIX_REPORT.md"
    echo "  - /docs/DOWNLOAD_FIX_VALIDATION.md"
    echo ""
    exit 1
fi
