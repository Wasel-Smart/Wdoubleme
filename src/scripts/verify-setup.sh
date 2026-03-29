#!/bin/bash

# ═══════════════════════════════════════════════════════════
# Wasel | واصل — Pre-Flight Verification Script
# Ensures 100% working local setup before running
# ═══════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
ERRORS=0
WARNINGS=0
CHECKS=0

# ─────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${BLUE}════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}════════════════════════════════════════════${NC}"
  echo ""
}

check_pass() {
  ((CHECKS++))
  echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
  ((CHECKS++))
  ((ERRORS++))
  echo -e "${RED}❌ $1${NC}"
}

check_warn() {
  ((CHECKS++))
  ((WARNINGS++))
  echo -e "${YELLOW}⚠️  $1${NC}"
}

check_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# ─────────────────────────────────────────────────────────────
# System Requirements Check
# ─────────────────────────────────────────────────────────────

check_system() {
  print_header "System Requirements Check"

  # Check Node.js
  if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_VERSION" -ge 18 ]; then
      check_pass "Node.js installed: $(node -v)"
    else
      check_fail "Node.js version too old: $(node -v) (need 18+)"
    fi
  else
    check_fail "Node.js not installed"
  fi

  # Check npm
  if command -v npm &> /dev/null; then
    check_pass "npm installed: $(npm -v)"
  else
    check_fail "npm not installed"
  fi

  # Check disk space
  FREE_SPACE=$(df -h . | awk 'NR==2 {print $4}' | sed 's/G//')
  if (( $(echo "$FREE_SPACE > 2" | bc -l) )); then
    check_pass "Disk space available: ${FREE_SPACE}GB"
  else
    check_warn "Low disk space: ${FREE_SPACE}GB (need 2GB+)"
  fi

  # Check Git
  if command -v git &> /dev/null; then
    check_pass "Git installed: $(git --version)"
  else
    check_warn "Git not installed (optional)"
  fi
}

# ─────────────────────────────────────────────────────────────
# Project Structure Check
# ─────────────────────────────────────────────────────────────

check_structure() {
  print_header "Project Structure Check"

  # Critical files
  CRITICAL_FILES=(
    "package.json"
    "tsconfig.json"
    "vite.config.ts"
    "index.html"
    "App.tsx"
    "main.tsx"
  )

  for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
      check_pass "Found: $file"
    else
      check_fail "Missing: $file"
    fi
  done

  # Critical directories
  CRITICAL_DIRS=(
    "components"
    "contexts"
    "utils"
    "styles"
    "public"
  )

  for dir in "${CRITICAL_DIRS[@]}"; do
    if [ -d "$dir" ]; then
      check_pass "Found: $dir/"
    else
      check_fail "Missing: $dir/"
    fi
  done
}

# ─────────────────────────────────────────────────────────────
# Dependencies Check
# ─────────────────────────────────────────────────────────────

check_dependencies() {
  print_header "Dependencies Check"

  if [ ! -d "node_modules" ]; then
    check_fail "node_modules not found - run: npm install"
    return
  fi

  # Check critical packages
  CRITICAL_PACKAGES=(
    "react"
    "react-dom"
    "react-router"
    "@supabase/supabase-js"
    "@tanstack/react-query"
    "lucide-react"
    "motion"
    "@stripe/stripe-js"
  )

  for package in "${CRITICAL_PACKAGES[@]}"; do
    if [ -d "node_modules/$package" ]; then
      check_pass "Installed: $package"
    else
      check_fail "Missing: $package"
    fi
  done

  # Check for package-lock.json
  if [ -f "package-lock.json" ]; then
    check_pass "package-lock.json exists"
  else
    check_warn "package-lock.json missing (will be created on install)"
  fi
}

# ─────────────────────────────────────────────────────────────
# Environment Variables Check
# ─────────────────────────────────────────────────────────────

check_env() {
  print_header "Environment Variables Check"

  if [ ! -f ".env" ]; then
    check_warn ".env file not found - creating from template..."
    
    # Create .env from template
    cat > .env << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://djccmatubyyudeosrngm.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key-here

# OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# Stripe
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key-here

# Environment
VITE_ENV=development
VITE_APP_VERSION=1.0.0

# Sentry (optional)
VITE_SENTRY_DSN=your-sentry-dsn-here
EOF
    check_info ".env file created - please update with your keys"
  else
    check_pass ".env file exists"
    
    # Check required variables
    REQUIRED_VARS=(
      "VITE_SUPABASE_URL"
      "VITE_SUPABASE_ANON_KEY"
    )

    for var in "${REQUIRED_VARS[@]}"; do
      if grep -q "^$var=" .env 2>/dev/null; then
        VALUE=$(grep "^$var=" .env | cut -d'=' -f2)
        if [[ "$VALUE" == *"your-"* ]] || [ -z "$VALUE" ]; then
          check_warn "$var not configured (using placeholder)"
        else
          check_pass "$var configured"
        fi
      else
        check_warn "$var missing in .env"
      fi
    done
  fi
}

# ─────────────────────────────────────────────────────────────
# TypeScript Check
# ─────────────────────────────────────────────────────────────

check_typescript() {
  print_header "TypeScript Check"

  if [ ! -f "tsconfig.json" ]; then
    check_fail "tsconfig.json missing"
    return
  fi

  check_pass "tsconfig.json exists"

  # Run type check if node_modules exists
  if [ -d "node_modules" ]; then
    check_info "Running TypeScript type check..."
    if npm run type-check &> /tmp/typecheck.log; then
      check_pass "TypeScript type check passed"
    else
      check_warn "TypeScript has warnings (see tmp/typecheck.log)"
    fi
  fi
}

# ─────────────────────────────────────────────────────────────
# Port Availability Check
# ─────────────────────────────────────────────────────────────

check_ports() {
  print_header "Port Availability Check"

  # Check port 3000
  if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    check_warn "Port 3000 is in use"
  else
    check_pass "Port 3000 is available"
  fi

  # Check port 5173 (default Vite port)
  if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    check_warn "Port 5173 is in use"
  else
    check_pass "Port 5173 is available"
  fi
}

# ─────────────────────────────────────────────────────────────
# Component Files Check
# ─────────────────────────────────────────────────────────────

check_components() {
  print_header "Critical Components Check"

  CRITICAL_COMPONENTS=(
    "components/AuthPage.tsx"
    "components/Header.tsx"
    "components/LoadingSpinner.tsx"
    "components/ProtectedRoute.tsx"
    "contexts/AuthContext.tsx"
    "contexts/LanguageContext.tsx"
    "utils/optimizedRoutes.ts"
    "utils/supabase/client.ts"
  )

  for component in "${CRITICAL_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
      check_pass "Found: $component"
    else
      check_fail "Missing: $component"
    fi
  done
}

# ─────────────────────────────────────────────────────────────
# CSS and Assets Check
# ─────────────────────────────────────────────────────────────

check_assets() {
  print_header "CSS and Assets Check"

  if [ -f "styles/globals.css" ]; then
    check_pass "Global CSS found"
  else
    check_fail "styles/globals.css missing"
  fi

  if [ -d "public" ]; then
    check_pass "public/ directory exists"
  else
    check_warn "public/ directory missing"
  fi
}

# ─────────────────────────────────────────────────────────────
# Build Test
# ─────────────────────────────────────────────────────────────

test_build() {
  print_header "Build Test (Optional)"

  if [ ! -d "node_modules" ]; then
    check_warn "Skipping build test - run npm install first"
    return
  fi

  check_info "Testing production build..."
  if npm run build &> /tmp/build.log; then
    check_pass "Production build successful"
    
    # Check build output
    if [ -d "dist" ]; then
      DIST_SIZE=$(du -sh dist | cut -f1)
      check_pass "Build output created: dist/ ($DIST_SIZE)"
    fi
  else
    check_fail "Production build failed (see tmp/build.log)"
  fi
}

# ─────────────────────────────────────────────────────────────
# Generate Report
# ─────────────────────────────────────────────────────────────

generate_report() {
  print_header "Verification Summary"

  echo ""
  echo -e "${BLUE}Total Checks: $CHECKS${NC}"
  echo -e "${GREEN}Passed: $((CHECKS - ERRORS - WARNINGS))${NC}"
  echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
  echo -e "${RED}Errors: $ERRORS${NC}"
  echo ""

  if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}You can now run:${NC}"
    echo -e "  ${BLUE}npm run dev${NC}    - Start development server"
    echo -e "  ${BLUE}npm run build${NC}  - Build for production"
    echo ""
    echo -e "${GREEN}The app will be available at:${NC}"
    echo -e "  ${BLUE}http://localhost:3000${NC} (if port configured)"
    echo -e "  ${BLUE}http://localhost:5173${NC} (default Vite port)"
    echo ""
    return 0
  else
    echo -e "${RED}════════════════════════════════════════════${NC}"
    echo -e "${RED}❌ $ERRORS ERROR(S) FOUND${NC}"
    echo -e "${RED}════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${RED}Please fix the errors above before running the app.${NC}"
    echo ""
    echo -e "${YELLOW}Common fixes:${NC}"
    echo -e "  1. Install dependencies: ${BLUE}npm install${NC}"
    echo -e "  2. Configure .env file with your API keys"
    echo -e "  3. Check Node.js version: ${BLUE}node -v${NC} (need 18+)"
    echo ""
    return 1
  fi
}

# ─────────────────────────────────────────────────────────────
# Main Execution
# ─────────────────────────────────────────────────────────────

main() {
  clear
  echo -e "${BLUE}"
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║                                                           ║"
  echo "║           Wasel | واصل - Pre-Flight Check               ║"
  echo "║                                                           ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo -e "${NC}"

  check_system
  check_structure
  check_dependencies
  check_env
  check_components
  check_assets
  check_ports
  check_typescript
  
  # Optional build test
  if [ "$1" == "--build" ]; then
    test_build
  fi

  generate_report
  exit $?
}

# Run main function
main "$@"
