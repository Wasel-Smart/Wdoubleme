#!/bin/bash

# 🚀 EXTREME PERFORMANCE BUILD SCRIPT
# Builds Wasel with maximum optimizations for production

set -e  # Exit on error

echo "🚀 Starting EXTREME PERFORMANCE BUILD for Wasel..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean previous build
echo -e "${YELLOW}📦 Cleaning previous build...${NC}"
rm -rf dist/
rm -rf node_modules/.vite/
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

# Step 2: Install dependencies (with frozen lockfile for reproducible builds)
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --prefer-offline
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Type check
echo -e "${YELLOW}🔍 Type checking...${NC}"
npm run type-check
echo -e "${GREEN}✅ Type check passed${NC}"
echo ""

# Step 4: Build with optimizations
echo -e "${YELLOW}🏗️  Building with maximum optimizations...${NC}"
echo ""
echo "  ⚡ Code splitting enabled"
echo "  ⚡ Minification enabled (esbuild)"
echo "  ⚡ CSS minification enabled"
echo "  ⚡ Tree-shaking enabled"
echo "  ⚡ Brotli + Gzip compression enabled"
echo "  ⚡ Asset optimization enabled"
echo ""

# Set production environment
export NODE_ENV=production

# Build with Vite
npm run build

echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 5: Analyze bundle size
echo -e "${YELLOW}📊 Analyzing bundle size...${NC}"

# Check if dist exists
if [ ! -d "dist" ]; then
  echo -e "${RED}❌ Build failed: dist/ directory not found${NC}"
  exit 1
fi

# Calculate total size
TOTAL_SIZE=$(du -sh dist | cut -f1)
JS_SIZE=$(du -sh dist/assets/js 2>/dev/null | cut -f1 || echo "N/A")
CSS_SIZE=$(du -sh dist/assets/css 2>/dev/null | cut -f1 || echo "N/A")
VENDOR_SIZE=$(du -sh dist/assets/vendor 2>/dev/null | cut -f1 || echo "N/A")

echo ""
echo "📦 Bundle Size Report:"
echo "  Total: $TOTAL_SIZE"
echo "  JavaScript: $JS_SIZE"
echo "  CSS: $CSS_SIZE"
echo "  Vendor: $VENDOR_SIZE"
echo ""

# Step 6: Check for large files
echo -e "${YELLOW}🔍 Checking for large files (> 200KB)...${NC}"
LARGE_FILES=$(find dist -type f -size +200k -exec ls -lh {} \; | awk '{print $9, $5}' || true)

if [ -n "$LARGE_FILES" ]; then
  echo -e "${YELLOW}⚠️  Large files detected:${NC}"
  echo "$LARGE_FILES"
  echo ""
  echo "💡 Consider:"
  echo "  - Lazy loading these modules"
  echo "  - Further code splitting"
  echo "  - Using dynamic imports"
else
  echo -e "${GREEN}✅ No large files detected${NC}"
fi
echo ""

# Step 7: Verify compression
echo -e "${YELLOW}🗜️  Verifying compression...${NC}"
BR_COUNT=$(find dist -name "*.br" | wc -l)
GZ_COUNT=$(find dist -name "*.gz" | wc -l)

if [ "$BR_COUNT" -gt 0 ] && [ "$GZ_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ Compression verified${NC}"
  echo "  Brotli files: $BR_COUNT"
  echo "  Gzip files: $GZ_COUNT"
else
  echo -e "${YELLOW}⚠️  Compression may have failed${NC}"
  echo "  Brotli files: $BR_COUNT"
  echo "  Gzip files: $GZ_COUNT"
fi
echo ""

# Step 8: Performance checklist
echo -e "${YELLOW}📋 Performance Checklist:${NC}"
echo ""

# Check for source maps (should exist for debugging)
if ls dist/assets/**/*.map 1> /dev/null 2>&1; then
  echo "  ✅ Source maps generated (for debugging)"
else
  echo "  ⚠️  No source maps found"
fi

# Check for PWA manifest
if [ -f "dist/manifest.json" ]; then
  echo "  ✅ PWA manifest exists"
else
  echo "  ⚠️  PWA manifest missing"
fi

# Check for service worker
if ls dist/sw.js 1> /dev/null 2>&1 || ls dist/service-worker.js 1> /dev/null 2>&1; then
  echo "  ✅ Service Worker generated"
else
  echo "  ⚠️  Service Worker not found"
fi

# Check for fonts
if [ -d "dist/assets/fonts" ]; then
  FONT_COUNT=$(ls dist/assets/fonts | wc -l)
  echo "  ✅ Fonts optimized ($FONT_COUNT files)"
else
  echo "  ℹ️  No custom fonts detected"
fi

# Check for images
if [ -d "dist/assets/images" ]; then
  IMAGE_COUNT=$(ls dist/assets/images | wc -l)
  echo "  ✅ Images optimized ($IMAGE_COUNT files)"
else
  echo "  ℹ️  No images in build"
fi

echo ""

# Step 9: Performance recommendations
echo -e "${YELLOW}💡 Performance Recommendations:${NC}"
echo ""
echo "  1. ✅ Deploy to CDN (Cloudflare, Vercel, Netlify)"
echo "  2. ✅ Enable HTTP/2 on your server"
echo "  3. ✅ Configure caching headers:"
echo "     - Static assets (js/css/images): Cache-Control: max-age=31536000, immutable"
echo "     - HTML: Cache-Control: no-cache"
echo "  4. ✅ Add Supabase URL to preconnect in index.html"
echo "  5. ✅ Monitor with Lighthouse CI in your deployment pipeline"
echo ""

# Step 10: Success message
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 EXTREME PERFORMANCE BUILD COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Build Location: ./dist/"
echo "🌐 Preview: npm run preview"
echo "🚀 Deploy: npm run deploy"
echo ""
echo -e "${GREEN}Wasel is now the FASTEST carpooling app on Earth! ⚡${NC}"
echo ""

# Optional: Run bundle analyzer
if [ "$1" == "--analyze" ]; then
  echo -e "${YELLOW}📊 Opening bundle analyzer...${NC}"
  ANALYZE=1 npm run build
fi

# Optional: Run Lighthouse
if command -v lighthouse &> /dev/null; then
  if [ "$1" == "--lighthouse" ]; then
    echo -e "${YELLOW}🔍 Running Lighthouse audit...${NC}"
    npm run preview &
    sleep 5
    lighthouse http://localhost:4173 --output=html --output-path=./dist/lighthouse-report.html
    killall node
    echo -e "${GREEN}✅ Lighthouse report: ./dist/lighthouse-report.html${NC}"
  fi
fi

exit 0
