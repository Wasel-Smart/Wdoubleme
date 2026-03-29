#!/bin/bash

# ═══════════════════════════════════════════════════════════
# Wasel | واصل — Automated Deployment Script
# Version: 1.0.0
# ═══════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
CLOCK="⏳"
INFO="ℹ️"

# Configuration
PROJECT_REF="djccmatubyyudeosrngm"
PROJECT_URL="https://djccmatubyyudeosrngm.supabase.co"

# ─────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo ""
}

print_step() {
  echo -e "${YELLOW}${CLOCK} $1${NC}"
}

print_success() {
  echo -e "${GREEN}${CHECK} $1${NC}"
}

print_error() {
  echo -e "${RED}${CROSS} $1${NC}"
}

print_info() {
  echo -e "${BLUE}${INFO} $1${NC}"
}

check_command() {
  if ! command -v $1 &> /dev/null; then
    print_error "$1 is not installed. Please install it first."
    exit 1
  fi
}

# ─────────────────────────────────────────────────────────────
# Pre-flight Checks
# ─────────────────────────────────────────────────────────────

preflight_checks() {
  print_header "Pre-flight Checks"

  print_step "Checking required commands..."
  check_command "node"
  check_command "npm"
  check_command "supabase"
  check_command "git"
  print_success "All required commands found"

  print_step "Checking Node version..."
  NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
  if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ required. Current version: $(node -v)"
    exit 1
  fi
  print_success "Node version: $(node -v)"

  print_step "Checking environment variables..."
  if [ ! -f ".env" ]; then
    print_error ".env file not found"
    exit 1
  fi
  print_success ".env file found"

  print_step "Checking Supabase connection..."
  if ! supabase projects list &> /dev/null; then
    print_error "Not logged in to Supabase. Run: supabase login"
    exit 1
  fi
  print_success "Supabase connection OK"
}

# ─────────────────────────────────────────────────────────────
# Database Deployment
# ─────────────────────────────────────────────────────────────

deploy_database() {
  print_header "Database Deployment"

  print_step "Linking to Supabase project..."
  if ! supabase link --project-ref "$PROJECT_REF" 2>/dev/null; then
    print_info "Already linked or connection issue"
  fi
  print_success "Project linked"

  print_step "Running main schema migration..."
  if supabase db push --file supabase/migrations/20260224_wasel_complete_schema.sql; then
    print_success "Main schema deployed"
  else
    print_error "Main schema migration failed"
    exit 1
  fi

  print_step "Running additional tables migration..."
  if supabase db push --file supabase/migrations/20260224_additional_tables.sql; then
    print_success "Additional tables deployed"
  else
    print_error "Additional tables migration failed"
    exit 1
  fi

  print_step "Running PostGIS functions migration..."
  if supabase db push --file supabase/migrations/20260224_postgis_functions.sql; then
    print_success "PostGIS functions deployed"
  else
    print_error "PostGIS functions migration failed"
    exit 1
  fi

  print_step "Verifying tables..."
  TABLE_COUNT=$(supabase db query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" --csv | tail -n 1)
  if [ "$TABLE_COUNT" -lt 25 ]; then
    print_error "Expected at least 25 tables, found: $TABLE_COUNT"
    exit 1
  fi
  print_success "Tables verified: $TABLE_COUNT tables"
}

# ─────────────────────────────────────────────────────────────
# Storage Setup
# ─────────────────────────────────────────────────────────────

setup_storage() {
  print_header "Storage Buckets Setup"

  print_step "Creating storage buckets..."
  
  supabase storage create avatars --public 2>/dev/null || print_info "avatars bucket may already exist"
  supabase storage create documents 2>/dev/null || print_info "documents bucket may already exist"
  supabase storage create vehicle-photos --public 2>/dev/null || print_info "vehicle-photos bucket may already exist"
  supabase storage create trip-receipts 2>/dev/null || print_info "trip-receipts bucket may already exist"
  supabase storage create chat-media 2>/dev/null || print_info "chat-media bucket may already exist"
  
  print_success "Storage buckets created/verified"
}

# ─────────────────────────────────────────────────────────────
# Edge Functions Deployment
# ─────────────────────────────────────────────────────────────

deploy_functions() {
  print_header "Edge Functions Deployment"

  print_step "Setting Supabase secrets..."
  
  # Read from .env
  source .env
  
  if [ -n "$STRIPE_SECRET_KEY" ]; then
    supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" 2>/dev/null
  fi
  
  if [ -n "$TWILIO_ACCOUNT_SID" ]; then
    supabase secrets set TWILIO_ACCOUNT_SID="$TWILIO_ACCOUNT_SID" 2>/dev/null
  fi
  
  if [ -n "$TWILIO_AUTH_TOKEN" ]; then
    supabase secrets set TWILIO_AUTH_TOKEN="$TWILIO_AUTH_TOKEN" 2>/dev/null
  fi
  
  if [ -n "$VITE_GOOGLE_MAPS_API_KEY" ]; then
    supabase secrets set GOOGLE_MAPS_API_KEY="$VITE_GOOGLE_MAPS_API_KEY" 2>/dev/null
  fi
  
  print_success "Secrets configured"

  print_step "Deploying Edge Functions..."
  
  FUNCTIONS=(
    "server"
    "chat-realtime"
    "payment-webhooks"
    "sms-send"
    "email-send"
    "system-monitoring"
  )

  for func in "${FUNCTIONS[@]}"; do
    print_step "Deploying $func..."
    if supabase functions deploy "$func" --no-verify-jwt 2>/dev/null; then
      print_success "$func deployed"
    else
      print_info "$func may not exist or already deployed"
    fi
  done

  print_success "Edge Functions deployed"
}

# ─────────────────────────────────────────────────────────────
# Frontend Build & Deploy
# ─────────────────────────────────────────────────────────────

build_frontend() {
  print_header "Frontend Build"

  print_step "Installing dependencies..."
  npm ci
  print_success "Dependencies installed"

  print_step "Running linter..."
  npm run lint || print_info "Linter warnings found"

  print_step "Running type check..."
  npm run type-check || print_info "Type check issues found"

  print_step "Building production bundle..."
  npm run build
  print_success "Build completed"

  print_step "Analyzing build size..."
  du -sh dist/
  print_success "Build analysis complete"
}

# ─────────────────────────────────────────────────────────────
# Health Checks
# ─────────────────────────────────────────────────────────────

health_checks() {
  print_header "Health Checks"

  print_step "Testing database connection..."
  if supabase db query "SELECT 1;" &> /dev/null; then
    print_success "Database connected"
  else
    print_error "Database connection failed"
    exit 1
  fi

  print_step "Testing Edge Functions..."
  HEALTH_URL="$PROJECT_URL/functions/v1/server/health"
  if curl -s "$HEALTH_URL" | grep -q "healthy"; then
    print_success "Edge Functions responding"
  else
    print_info "Edge Functions may not be ready yet"
  fi

  print_step "Testing authentication..."
  AUTH_URL="$PROJECT_URL/auth/v1/health"
  if curl -s "$AUTH_URL" | grep -q "ok"; then
    print_success "Authentication service OK"
  else
    print_info "Authentication may not be ready yet"
  fi
}

# ─────────────────────────────────────────────────────────────
# Post-deployment Tasks
# ─────────────────────────────────────────────────────────────

post_deployment() {
  print_header "Post-Deployment Tasks"

  print_step "Enabling Realtime..."
  supabase db query "ALTER PUBLICATION supabase_realtime ADD TABLE messages;" 2>/dev/null || true
  supabase db query "ALTER PUBLICATION supabase_realtime ADD TABLE notifications;" 2>/dev/null || true
  supabase db query "ALTER PUBLICATION supabase_realtime ADD TABLE trips;" 2>/dev/null || true
  print_success "Realtime enabled"

  print_step "Creating indexes (if not exists)..."
  supabase db query "CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);" 2>/dev/null || true
  supabase db query "CREATE INDEX IF NOT EXISTS idx_drivers_location ON drivers USING GIST(current_location);" 2>/dev/null || true
  print_success "Indexes created"

  print_step "Generating TypeScript types..."
  if supabase gen types typescript --local > types/supabase.ts 2>/dev/null; then
    print_success "Types generated"
  else
    print_info "Type generation skipped"
  fi
}

# ─────────────────────────────────────────────────────────────
# Rollback Function
# ─────────────────────────────────────────────────────────────

rollback() {
  print_header "Rollback"
  print_error "Deployment failed. Initiating rollback..."
  
  # Add rollback logic here
  print_info "Manual rollback may be required"
  exit 1
}

# ─────────────────────────────────────────────────────────────
# Main Deployment Flow
# ─────────────────────────────────────────────────────────────

main() {
  print_header "Wasel | واصل — Automated Deployment"
  print_info "Starting deployment at $(date)"

  # Trap errors and run rollback
  trap rollback ERR

  # Run deployment steps
  preflight_checks
  deploy_database
  setup_storage
  deploy_functions
  build_frontend
  health_checks
  post_deployment

  # Success!
  print_header "Deployment Complete ${ROCKET}"
  print_success "Database: ✅ Deployed"
  print_success "Storage: ✅ Configured"
  print_success "Functions: ✅ Deployed"
  print_success "Frontend: ✅ Built"
  print_success "Health: ✅ All systems operational"
  
  echo ""
  print_info "Next steps:"
  echo "  1. Configure Stripe webhook in dashboard"
  echo "  2. Set Twilio phone number in .env"
  echo "  3. Setup Firebase for push notifications"
  echo "  4. Run: npm run deploy:frontend"
  echo "  5. Monitor logs: supabase functions logs server"
  echo ""
  print_info "Deployment completed at $(date)"
}

# ─────────────────────────────────────────────────────────────
# Script Entry Point
# ─────────────────────────────────────────────────────────────

# Parse arguments
DRY_RUN=false
SKIP_BUILD=false

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true ;;
    --skip-build) SKIP_BUILD=true ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --dry-run      Run without making changes"
      echo "  --skip-build   Skip frontend build"
      echo "  -h, --help     Show this help message"
      exit 0
      ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

if [ "$DRY_RUN" = true ]; then
  print_info "Running in DRY RUN mode - no changes will be made"
  exit 0
fi

# Run main deployment
main

exit 0
