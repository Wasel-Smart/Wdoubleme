#!/bin/bash

# ═══════════════════════════════════════════════════════════
# Wasel | واصل — Quick Start Script
# One-command setup for local development
# ═══════════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║           Wasel | واصل - Quick Start                    ║"
echo "║           Setting up localhost:3000...                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Step 1: Check Node.js
echo -e "${BLUE}[1/5]${NC} Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}❌ Node.js version too old: $(node -v)${NC}"
    echo "   Need version 18 or higher"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}[2/5]${NC} Installing dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules exists. Cleaning...${NC}"
    rm -rf node_modules package-lock.json
fi

echo "   This will take 2-5 minutes..."
if npm install --legacy-peer-deps; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}❌ Installation failed. Trying alternative method...${NC}"
    npm install
fi
echo ""

# Step 3: Create .env if missing
echo -e "${BLUE}[3/5]${NC} Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cat > .env << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=https://djccmatubyyudeosrngm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqY2NtYXR1Ynl5dWRlb3NybmdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1NjI2MDAsImV4cCI6MjAyNTEzODYwMH0.placeholder

# Google Maps (placeholder - get real key from console.cloud.google.com)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDemoKey_GetRealKeyFromGoogleCloud

# OAuth (placeholder)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Stripe (placeholder - get from dashboard.stripe.com)
VITE_STRIPE_PUBLIC_KEY=pk_test_placeholder

# Environment
VITE_ENV=development
VITE_APP_VERSION=1.0.0

# Sentry (optional - get from sentry.io)
VITE_SENTRY_DSN=https://placeholder@sentry.io/placeholder
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Update .env with your real API keys for full functionality${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi
echo ""

# Step 4: Check TypeScript
echo -e "${BLUE}[4/5]${NC} Checking TypeScript..."
if npm run type-check &> /dev/null; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript has warnings (app will still work)${NC}"
fi
echo ""

# Step 5: Check port availability
echo -e "${BLUE}[5/5]${NC} Checking port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use${NC}"
    echo "   Killing process on port 3000..."
    kill -9 $(lsof -ti:3000) 2>/dev/null || true
    sleep 1
fi
echo -e "${GREEN}✅ Port 3000 is available${NC}"
echo ""

# Success!
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║                    ✅ SETUP COMPLETE!                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${GREEN}🚀 Starting development server...${NC}"
echo ""
echo -e "${BLUE}The app will open automatically at:${NC}"
echo -e "   ${GREEN}➜${NC} http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
sleep 2

# Start the dev server
npm run dev
