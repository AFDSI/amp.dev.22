#!/bin/bash
#
# Search Restoration Script for amp.dev.19
# This script restores search functionality with security best practices
#

set -e  # Exit on error

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COLLECTED_FILES="/path/to/collected/files"  # UPDATE THIS PATH
AMP_DEV_19="/mnt/e/users/gigster/workspace/repos/amp/amp.dev.19"
BACKUP_DIR="${AMP_DEV_19}-search-backup-$(date +%Y%m%d-%H%M%S)"
LOG_DIR="$HOME/amp-dev-setup-logs"
FIXED_FILES="/mnt/user-data/outputs"  # Where Claude saved the fixed files

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  amp.dev.19 Search Restoration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 0: Verify paths
echo -e "${YELLOW}Step 0: Verifying paths...${NC}"
if [ ! -d "$COLLECTED_FILES" ]; then
  echo -e "${RED}✗ ERROR: COLLECTED_FILES path not found: $COLLECTED_FILES${NC}"
  echo "Please update the COLLECTED_FILES variable at the top of this script"
  exit 1
fi

if [ ! -d "$AMP_DEV_19" ]; then
  echo -e "${RED}✗ ERROR: amp.dev.19 not found: $AMP_DEV_19${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Paths verified${NC}"
echo ""

# Step 1: Create backup
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Backup files that will be modified
if [ -f "$AMP_DEV_19/frontend/templates/layouts/default.j2" ]; then
  mkdir -p "$BACKUP_DIR/frontend/templates/layouts"
  cp "$AMP_DEV_19/frontend/templates/layouts/default.j2" "$BACKUP_DIR/frontend/templates/layouts/"
fi

if [ -f "$AMP_DEV_19/frontend/templates/views/2021/partials/header.j2" ]; then
  mkdir -p "$BACKUP_DIR/frontend/templates/views/2021/partials"
  cp "$AMP_DEV_19/frontend/templates/views/2021/partials/header.j2" "$BACKUP_DIR/frontend/templates/views/2021/partials/"
fi

if [ -f "$AMP_DEV_19/frontend/templates/views/partials/header.j2" ]; then
  mkdir -p "$BACKUP_DIR/frontend/templates/views/partials"
  cp "$AMP_DEV_19/frontend/templates/views/partials/header.j2" "$BACKUP_DIR/frontend/templates/views/partials/"
fi

if [ -f "$AMP_DEV_19/frontend21/amp-dev.ejs" ]; then
  mkdir -p "$BACKUP_DIR/frontend21"
  cp "$AMP_DEV_19/frontend21/amp-dev.ejs" "$BACKUP_DIR/frontend21/"
fi

echo -e "${GREEN}✓ Backup created: $BACKUP_DIR${NC}"
echo ""

# Step 2: Copy search files
echo -e "${YELLOW}Step 2: Copying search files to amp.dev.19...${NC}"
cd "$AMP_DEV_19"

# Frontend - Icons
echo "→ Copying icon..."
mkdir -p frontend/icons
cp "$COLLECTED_FILES/frontend/icons/magnifier.svg" frontend/icons/

# Frontend - CSS
echo "→ Copying CSS..."
mkdir -p frontend/scss/components/molecules
mkdir -p frontend/scss/components/organisms
cp "$COLLECTED_FILES/frontend/scss/components/molecules/search-trigger.scss" frontend/scss/components/molecules/
cp "$COLLECTED_FILES/frontend/scss/components/organisms/search.scss" frontend/scss/components/organisms/

# Frontend - Templates
echo "→ Copying templates..."
cp "$COLLECTED_FILES/frontend/templates/layouts/default.j2" frontend/templates/layouts/
cp "$COLLECTED_FILES/frontend/templates/views/2021/partials/header.j2" frontend/templates/views/2021/partials/
cp "$COLLECTED_FILES/frontend/templates/views/partials/header.j2" frontend/templates/views/partials/
cp "$COLLECTED_FILES/frontend/templates/views/partials/search.j2" frontend/templates/views/partials/
cp "$COLLECTED_FILES/frontend/templates/views/partials/service-worker.j2" frontend/templates/views/partials/

# Frontend21
echo "→ Copying frontend21..."
cp "$COLLECTED_FILES/frontend21/amp-dev.ejs" frontend21/

# Netlify Functions
echo "→ Copying Netlify functions..."
mkdir -p netlify/functions/latest_query
mkdir -p netlify/functions/search_autosuggest
mkdir -p netlify/functions/search_do

cp "$COLLECTED_FILES/netlify/functions/latest_query/latest-query.js" netlify/functions/latest_query/
cp "$COLLECTED_FILES/netlify/functions/search_autosuggest/search_autosuggest.js" netlify/functions/search_autosuggest/
cp "$COLLECTED_FILES/netlify/functions/search_autosuggest/component-versions.json" netlify/functions/search_autosuggest/
cp "$COLLECTED_FILES/netlify/functions/search_do/log.js" netlify/functions/search_do/

# Use FIXED versions from Claude
echo "→ Using FIXED googleSearch.js and search_do.js..."
cp "$FIXED_FILES/netlify-googleSearch.js" netlify/functions/search_do/googleSearch.js
cp "$FIXED_FILES/search_do.js" netlify/functions/search_do/search_do.js

# Credentials.js (safe - no hardcoded keys)
cp "$COLLECTED_FILES/netlify/functions/search_do/credentials.js" netlify/functions/search_do/

# Pages - Service Worker
echo "→ Copying service worker..."
mkdir -p pages/static
cp "$COLLECTED_FILES/pages/static/serviceworker.html" pages/static/
cp "$COLLECTED_FILES/pages/static/serviceworker.js" pages/static/

# Platform - Routers & Utils
echo "→ Copying platform files..."
mkdir -p platform/lib/routers
mkdir -p platform/lib/utils

cp "$COLLECTED_FILES/platform/lib/routers/search.js" platform/lib/routers/
cp "$COLLECTED_FILES/platform/lib/routers/search.test.js" platform/lib/routers/
cp "$COLLECTED_FILES/platform/lib/utils/credentials.js" platform/lib/utils/

# Use FIXED version from Claude
cp "$FIXED_FILES/platform-googleSearch.js" platform/lib/utils/googleSearch.js

echo -e "${GREEN}✓ All files copied!${NC}"
echo ""

# Step 3: Verify files
echo -e "${YELLOW}Step 3: Verifying copied files...${NC}"

files=(
  "frontend/icons/magnifier.svg"
  "frontend/scss/components/molecules/search-trigger.scss"
  "frontend/scss/components/organisms/search.scss"
  "frontend/templates/views/partials/search.j2"
  "netlify/functions/search_do/search_do.js"
  "netlify/functions/search_do/googleSearch.js"
  "netlify/functions/search_autosuggest/search_autosuggest.js"
  "platform/lib/routers/search.js"
  "platform/lib/utils/googleSearch.js"
)

all_present=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗ MISSING:${NC} $file"
    all_present=false
  fi
done

if [ "$all_present" = false ]; then
  echo ""
  echo -e "${RED}✗ Some files missing - check copy commands${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✓ All critical files present!${NC}"
echo ""

# Step 4: Security - API Key Rotation Instructions
echo -e "${YELLOW}Step 4: Security - API Key Setup${NC}"
echo ""
echo -e "${RED}========================================${NC}"
echo -e "${RED}  ⚠️  CRITICAL SECURITY STEP${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo "Your API key was exposed in our conversation and must be rotated!"
echo ""
echo "Follow these steps:"
echo ""
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Find your exposed API key"
echo "3. DELETE or RESTRICT that key"
echo "4. CREATE A NEW API KEY"
echo "5. Add application restrictions:"
echo "   - HTTP referrers: *.amp.dev/*, *.netlify.app/*"
echo "   OR"
echo "   - IP addresses: (your development machine IP)"
echo "6. Add API restrictions:"
echo "   - Restrict to: Custom Search JSON API"
echo "7. SAVE the new key"
echo ""
read -p "Press ENTER after you've created your NEW API key..."
echo ""

# Step 5: Create .env file
echo -e "${YELLOW}Step 5: Creating .env file...${NC}"

cat > .env << 'EOF'
# Google Programmable Search Credentials
# Enter your NEW (rotated) API key below

# Local Development
AMP_DEV_CREDENTIAL_GOOGLE_CSE_API_KEY=PASTE_YOUR_NEW_API_KEY_HERE

# Search Engine ID (Public)
GOOGLE_CSE_ID=a1a3679a4a68c41f5
EOF

echo -e "${GREEN}✓ Created .env file${NC}"
echo ""
echo "Now edit .env and add your NEW API key:"
echo ""
echo "  nano .env"
echo ""
echo "Replace: PASTE_YOUR_NEW_API_KEY_HERE"
echo "With: Your actual new API key"
echo ""
read -p "Press ENTER after you've updated .env..."

# Load credentials
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Verify credentials are set
if [ -z "$AMP_DEV_CREDENTIAL_GOOGLE_CSE_API_KEY" ] || [ "$AMP_DEV_CREDENTIAL_GOOGLE_CSE_API_KEY" = "PASTE_YOUR_NEW_API_KEY_HERE" ]; then
  echo -e "${RED}✗ API key not set in .env${NC}"
  echo "Please edit .env and add your API key, then run this script again"
  exit 1
fi

echo -e "${GREEN}✓ Credentials loaded${NC}"
echo ""

# Step 6: Update .gitignore
echo -e "${YELLOW}Step 6: Updating .gitignore...${NC}"

if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Search credentials (never commit!)" >> .gitignore
  echo ".env" >> .gitignore
  echo -e "${GREEN}✓ Added .env to .gitignore${NC}"
else
  echo -e "${GREEN}✓ .env already in .gitignore${NC}"
fi
echo ""

# Step 7: Register search router
echo -e "${YELLOW}Step 7: Checking search router registration...${NC}"

if grep -q "const searchRouter = require('@lib/routers/search.js');" platform/lib/platform.js && \
   grep -q "this.server.use('/search', searchRouter);" platform/lib/platform.js; then
  echo -e "${GREEN}✓ Search router already registered${NC}"
else
  echo -e "${RED}✗ Search router NOT registered in platform.js${NC}"
  echo ""
  echo "You need to add these lines to platform/lib/platform.js:"
  echo ""
  echo "  // Add after other router requires:"
  echo "  const searchRouter = require('@lib/routers/search.js');"
  echo ""
  echo "  // Add after other router registrations:"
  echo "  this.server.use('/search', searchRouter);"
  echo ""
  read -p "Press ENTER after adding search router registration..."
fi
echo ""

# Step 8: Start development server
echo -e "${YELLOW}Step 8: Starting development server...${NC}"
echo "This may take a minute..."
echo ""

# Start server in background
npm run develop > "$LOG_DIR/search-develop.log" 2>&1 &
DEV_PID=$!

# Save PID for later
echo $DEV_PID > "$LOG_DIR/dev-server.pid"

# Wait for server to start
echo "Waiting for server to start..."
for i in {1..30}; do
  if curl -s http://localhost:8080 > /dev/null 2>&1; then
    break
  fi
  sleep 1
  echo -n "."
done
echo ""

# Check if server is running
if ps -p $DEV_PID > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Server started (PID: $DEV_PID)${NC}"
  echo "  Logs: $LOG_DIR/search-develop.log"
  echo "  URL: http://localhost:8080"
else
  echo -e "${RED}✗ Server failed to start${NC}"
  echo "  Check logs: $LOG_DIR/search-develop.log"
  tail -20 "$LOG_DIR/search-develop.log"
  exit 1
fi
echo ""

# Step 9: Test search endpoints
echo -e "${YELLOW}Step 9: Testing search endpoints...${NC}"
echo ""
sleep 5  # Give server a bit more time

# Test autosuggest
echo "→ Testing /search/autosuggest..."
response=$(curl -s http://localhost:8080/search/autosuggest)
if echo "$response" | grep -q "amp-"; then
  echo -e "${GREEN}✓ Autosuggest working${NC}"
  echo "  Found component names in response"
else
  echo -e "${RED}✗ Autosuggest failed${NC}"
  echo "  Response: $response"
fi

echo ""

# Test search execution
echo "→ Testing /search/do..."
response=$(curl -s "http://localhost:8080/search/do?q=iframe&locale=en")
if echo "$response" | grep -q '"result"'; then
  echo -e "${GREEN}✓ Search execution working${NC}"
  echo "  Found results in response"
else
  echo -e "${RED}✗ Search execution failed${NC}"
  echo "  Response: $response"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  ✓ Search restoration complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Open browser: ${BLUE}http://localhost:8080${NC}"
echo "2. Click search icon (magnifier in header)"
echo "3. Type 'iframe' and select from suggestions"
echo "4. Verify search results appear"
echo ""
echo "Server info:"
echo "  PID: $DEV_PID"
echo "  Stop: kill $DEV_PID"
echo "  Logs: tail -f $LOG_DIR/search-develop.log"
echo ""
echo "Backup location:"
echo "  $BACKUP_DIR"
echo ""
echo -e "${GREEN}Happy searching! 🔍${NC}"
echo ""
