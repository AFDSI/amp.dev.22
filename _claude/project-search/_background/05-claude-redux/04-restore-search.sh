#!/bin/bash
#
# Site-Search Migration Verification Script
# Verifies that all site-search components were migrated correctly
#
# Usage: ./verify-site-search-migration.sh
#

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Site-Search Migration Verification${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

ERRORS=0
WARNINGS=0
SUCCESS=0

# Function to check if file exists
check_file() {
    local file="$1"
    local description="$2"

    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓ $description${NC}"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${RED}  ✗ MISSING: $description${NC}"
        echo -e "${RED}    Expected: $file${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# Function to check if directory exists
check_dir() {
    local dir="$1"
    local description="$2"

    if [ -d "$dir" ]; then
        echo -e "${GREEN}  ✓ $description${NC}"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${RED}  ✗ MISSING: $description${NC}"
        echo -e "${RED}    Expected: $dir${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# Function to check file contains pattern
check_pattern() {
    local file="$1"
    local pattern="$2"
    local description="$3"

    if [ -f "$file" ]; then
        if grep -q "$pattern" "$file"; then
            echo -e "${GREEN}  ✓ $description${NC}"
            SUCCESS=$((SUCCESS + 1))
        else
            echo -e "${YELLOW}  ⚠ WARNING: $description not found${NC}"
            echo -e "${YELLOW}    File: $file${NC}"
            echo -e "${YELLOW}    Pattern: $pattern${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${RED}  ✗ MISSING: File for $description${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# ===========================
# Backend Files
# ===========================
echo -e "${BLUE}[1/7] Checking Backend Files...${NC}"

check_file "platform/lib/routers/search.js" "Express search router"
check_file "platform/lib/utils/googleSearch.js" "Google Search utility"
check_file "platform/config/search-promoted-pages.json" "Search promoted pages config"

echo ""

# ===========================
# Serverless Functions
# ===========================
echo -e "${BLUE}[2/7] Checking Serverless Functions...${NC}"

check_dir "netlify/functions/search_do" "search_do function directory"
check_file "netlify/functions/search_do/search_do.js" "search_do handler"
check_file "netlify/functions/search_do/googleSearch.js" "search_do Google Search wrapper"

check_dir "netlify/functions/search_autosuggest" "search_autosuggest function directory"
check_file "netlify/functions/search_autosuggest/search_autosuggest.js" "search_autosuggest handler"
check_file "netlify/functions/search_autosuggest/component-versions.json" "Component versions list"

echo ""

# ===========================
# Frontend Files
# ===========================
echo -e "${BLUE}[3/7] Checking Frontend Templates...${NC}"

check_file "frontend/templates/views/partials/search.j2" "Search partial template"
check_file "frontend/templates/views/partials/service-worker.j2" "Service Worker partial template"

echo ""

# ===========================
# CSS Files
# ===========================
echo -e "${BLUE}[4/7] Checking CSS Files...${NC}"

check_file "frontend/scss/components/organisms/search.scss" "Search organism styles (frontend)"
check_file "frontend/scss/components/molecules/search-trigger.scss" "Search trigger styles (frontend)"
check_file "frontend21/scss/components/search-trigger.scss" "Search trigger styles (frontend21)"

echo ""

# ===========================
# Service Worker
# ===========================
echo -e "${BLUE}[5/7] Checking Service Worker...${NC}"

check_file "pages/static/serviceworker.js" "Service Worker file"
check_pattern "pages/static/serviceworker.js" "/search/do" "Service Worker search/do route"
check_pattern "pages/static/serviceworker.js" "/search/latest-query" "Service Worker latest-query route"

echo ""

# ===========================
# Environment Variables
# ===========================
echo -e "${BLUE}[7/7] Checking Environment Configuration...${NC}"

if [ -n "$GOOGLE_PROGRAMMABLE_SEARCH_CSE_ID" ]; then
    echo -e "${GREEN}  ✓ GOOGLE_PROGRAMMABLE_SEARCH_CSE_ID environment variable set${NC}"
    SUCCESS=$((SUCCESS + 1))
else
    if [ -f ".env" ] && grep -q "GOOGLE_PROGRAMMABLE_SEARCH_CSE_ID" ".env"; then
        echo -e "${GREEN}  ✓ GOOGLE_PROGRAMMABLE_SEARCH_CSE_ID found in .env${NC}"
        SUCCESS=$((SUCCESS + 1))
    elif [ -f ".env.secrets" ] && grep -q "GOOGLE_PROGRAMMABLE_SEARCH_CSE_ID" ".env.secrets"; then
        echo -e "${GREEN}  ✓ GOOGLE_PROGRAMMABLE_SEARCH_CSE_ID found in .env.secrets${NC}"
        SUCCESS=$((SUCCESS + 1))
    else
        echo -e "${YELLOW}  ⚠ WARNING: GOOGLE_PROGRAMMABLE_SEARCH_CSE_ID not configured${NC}"
        echo -e "${YELLOW}    Set in .env or .env.secrets before testing${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

echo ""

# ===========================
# Summary
# ===========================
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}  Successful checks: $SUCCESS${NC}"
echo -e "${YELLOW}  Warnings: $WARNINGS${NC}"
echo -e "${RED}  Errors: $ERRORS${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "  1. Ensure GOOGLE_PROGRAMMABLE_SEARCH_CSE_ID is configured"
    echo -e "  2. Register search router in platform/lib/platform.js"
    echo -e "  3. Include search.j2 partial in layout templates"
    echo -e "  4. Add search trigger button to header"
    echo -e "  5. Build CSS: npm run build:css"
    echo -e "  6. Test: npm run dev"
    echo -e "  7. Verify: curl 'http://localhost:8080/search/do?q=test&locale=en'"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Migration complete with warnings${NC}"
    echo -e "${YELLOW}  Review warnings above and address as needed${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Migration incomplete - missing required files${NC}"
    echo -e "${RED}  Fix errors above before proceeding${NC}"
    echo ""
    exit 1
fi
