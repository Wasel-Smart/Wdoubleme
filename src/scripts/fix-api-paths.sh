#!/bin/bash

###############################################################################
# Wasel Backend Fix Script
# Fixes incorrect API endpoint paths across the entire codebase
# 
# CRITICAL FIX: Updates all hardcoded API URLs to use centralized utility
###############################################################################

set -e

echo "🔧 Wasel Backend API Path Fix Script"
echo "======================================"
echo ""
echo "This script will:"
echo "  1. Find all files with incorrect API paths"
echo "  2. Update them to use the correct path"
echo "  3. Create a backup of modified files"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
FILES_MODIFIED=0

# Create backup directory
BACKUP_DIR=".api-path-backups-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📁 Backup directory created: $BACKUP_DIR${NC}"
echo ""

# Function to fix a file
fix_file() {
    local file=$1
    local search=$2
    local replace=$3
    
    if grep -q "$search" "$file"; then
        # Create backup
        cp "$file" "$BACKUP_DIR/$(basename $file).backup"
        
        # Replace
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|$search|$replace|g" "$file"
        else
            # Linux
            sed -i "s|$search|$replace|g" "$file"
        fi
        
        echo -e "${GREEN}✅ Fixed: $file${NC}"
        FILES_MODIFIED=$((FILES_MODIFIED + 1))
    fi
}

echo "🔍 Scanning files..."
echo ""

# Pattern to search for
WRONG_PATH="/functions/v1/make-server-0b1f4071"
CORRECT_PATH="/functions/v1/server/make-server-0b1f4071"

# Fix all TypeScript and JavaScript files
while IFS= read -r -d '' file; do
    fix_file "$file" "$WRONG_PATH" "$CORRECT_PATH"
done < <(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/.git/*" \
    -not -path "$BACKUP_DIR/*" \
    -print0)

echo ""
echo "======================================"
echo -e "${GREEN}✨ Fix Complete!${NC}"
echo ""
echo "Summary:"
echo "  - Files modified: $FILES_MODIFIED"
echo "  - Backups saved to: $BACKUP_DIR"
echo ""

if [ $FILES_MODIFIED -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Next Steps:${NC}"
    echo "  1. Review changes with: git diff"
    echo "  2. Test the application"
    echo "  3. Commit changes if everything works"
    echo "  4. Delete backup folder if no issues: rm -rf $BACKUP_DIR"
else
    echo -e "${GREEN}✅ No files needed fixing - all paths are correct!${NC}"
    rmdir "$BACKUP_DIR" 2>/dev/null || true
fi

echo ""
