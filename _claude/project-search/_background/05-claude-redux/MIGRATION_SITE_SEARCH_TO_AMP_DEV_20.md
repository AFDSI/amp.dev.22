# Migration Guide: amp-site-search to amp.dev.20

## Executive Summary

This document outlines the complete migration process for transferring recovered `amp-site-search` objects from the `amp.dev.n4` repository to the target `amp.dev.20` repository. The migration includes backend APIs, frontend components, Service Worker integration, and GPS (Google Programmable Search) configuration.

## Prerequisites

### Source Repository: amp.dev.n4
- **Status**: Analysis and recovery complete
- **Branch**: `claude/analyze-tar-011CUppL4unTTnGJgitdWds5`
- **Components**: All site-search objects recovered and documented

### Target Repository: amp.dev.20
- **Status**: Ready for integration
- **Requirement**: GPS services active and configured
- **Backend**: Ready to receive GPS-enabled search code

## Recovered Objects Inventory

### 1. Backend Components

#### Express Router
**File**: `platform/lib/routers/search.js`
- Main search execution endpoint (`/search/do`)
- Highlights endpoint (`/search/highlights`)
- Autosuggest endpoint (`/search/autosuggest`)
- Google Programmable Search (GPS) API integration

**Dependencies**:
```
platform/lib/routers/search.js
└── platform/lib/utils/googleSearch.js
    └── Google Programmable Search API
```

#### Netlify Serverless Functions
**Files**:
```
netlify/functions/search_do/
├── search_do.js                    # Main search handler
├── googleSearch.js                  # GPS wrapper
└── package.json

netlify/functions/search_autosuggest/
├── search_autosuggest.js
├── component-versions.json
└── package.json
```

**Purpose**: Serverless alternatives to Express routes for Netlify deployments

#### Configuration Files
**Files**:
```
platform/config/search-promoted-pages.json  # Curated highlights
netlify/functions/search_autosuggest/component-versions.json  # Component list
```

### 2. Frontend Components

#### Jinja2 Templates
**File**: `frontend/templates/views/partials/search.j2`
- Complete AMP search lightbox modal
- amp-list integration with infinite scroll
- amp-autocomplete for component suggestions
- amp-mustache templates for result rendering
- amp-bind state management

**Integration Point**: Included in layout templates

#### CSS Stylesheets

**frontend (Generation 1 - BEM)**:
```
frontend/scss/components/organisms/search.scss         # 7.6KB - Main modal
frontend/scss/components/molecules/search-trigger.scss # 1.2KB - Trigger button
```

**frontend21 (Generation 2 - Minified)**:
```
frontend21/scss/components/search-trigger.scss         # 775 bytes - Trigger only
```

**Note**: frontend21 missing search modal styles - requires import from frontend

### 3. Service Worker Integration

**File**: `pages/static/serviceworker.js`

**Critical Routes**:
```javascript
/search/latest-query  → Returns cached last query (fake endpoint)
/search/do            → Cache-first search results
/search/highlights    → Cache-first promoted pages
```

**Purpose**: Persist search state across page navigation

**Template Integration**: `frontend/templates/views/partials/service-worker.j2`

### 4. Reference Documentation

**Files**:
```
ontology-search/reference-files/
├── _amp-site-search-introduction.pdf   # Official AMP blog post
└── search-client.html                   # Standalone working example

HANDOFF_SITE_SEARCH_RESTORATION.md      # Complete restoration guide (50KB)
```

## Migration Strategy

### Option 1: Full Repository Clone (Recommended)

This approach migrates the entire codebase to ensure all dependencies and configurations are preserved.

#### Step 1: Prepare Target Repository

```bash
# Navigate to parent directory
cd /home/user

# Clone or initialize amp.dev.20
git clone <amp.dev.20-repo-url> amp.dev.20
# OR if it exists:
cd amp.dev.20

# Create feature branch for site-search integration
git checkout -b feature/site-search-migration
```

#### Step 2: Identify Migration Scope

**Full Directory Copy Approach**:
```bash
# Copy complete directories to preserve structure
cp -r /home/user/amp.dev.n4/platform /home/user/amp.dev.20/
cp -r /home/user/amp.dev.n4/netlify /home/user/amp.dev.20/
cp -r /home/user/amp.dev.n4/frontend /home/user/amp.dev.20/
cp -r /home/user/amp.dev.n4/frontend21 /home/user/amp.dev.20/
cp -r /home/user/amp.dev.n4/pages /home/user/amp.dev.20/
```

**Note**: This copies entire directories. You'll need to merge with existing amp.dev.20 files.

#### Step 3: Selective File Migration (Surgical Approach)

If amp.dev.20 already has these directories, migrate only site-search files:

**Backend Files**:
```bash
# Create target directories if needed
mkdir -p /home/user/amp.dev.20/platform/lib/routers
mkdir -p /home/user/amp.dev.20/platform/lib/utils
mkdir -p /home/user/amp.dev.20/platform/config

# Copy search router and utilities
cp /home/user/amp.dev.n4/platform/lib/routers/search.js \
   /home/user/amp.dev.20/platform/lib/routers/

cp /home/user/amp.dev.n4/platform/lib/utils/googleSearch.js \
   /home/user/amp.dev.20/platform/lib/utils/

cp /home/user/amp.dev.n4/platform/config/search-promoted-pages.json \
   /home/user/amp.dev.20/platform/config/
```

**Netlify Functions**:
```bash
# Create target directories
mkdir -p /home/user/amp.dev.20/netlify/functions

# Copy serverless functions
cp -r /home/user/amp.dev.n4/netlify/functions/search_do \
      /home/user/amp.dev.20/netlify/functions/

cp -r /home/user/amp.dev.n4/netlify/functions/search_autosuggest \
      /home/user/amp.dev.20/netlify/functions/
```

**Frontend Templates**:
```bash
# Create target directories
mkdir -p /home/user/amp.dev.20/frontend/templates/views/partials

# Copy search template
cp /home/user/amp.dev.n4/frontend/templates/views/partials/search.j2 \
   /home/user/amp.dev.20/frontend/templates/views/partials/

# Copy service worker template
cp /home/user/amp.dev.n4/frontend/templates/views/partials/service-worker.j2 \
   /home/user/amp.dev.20/frontend/templates/views/partials/
```

**Frontend CSS**:
```bash
# Create target directories
mkdir -p /home/user/amp.dev.20/frontend/scss/components/organisms
mkdir -p /home/user/amp.dev.20/frontend/scss/components/molecules
mkdir -p /home/user/amp.dev.20/frontend21/scss/components

# Copy CSS files
cp /home/user/amp.dev.n4/frontend/scss/components/organisms/search.scss \
   /home/user/amp.dev.20/frontend/scss/components/organisms/

cp /home/user/amp.dev.n4/frontend/scss/components/molecules/search-trigger.scss \
   /home/user/amp.dev.20/frontend/scss/components/molecules/

cp /home/user/amp.dev.n4/frontend21/scss/components/search-trigger.scss \
   /home/user/amp.dev.20/frontend21/scss/components/
```

**Service Worker**:
```bash
# Copy Service Worker with search handlers
cp /home/user/amp.dev.n4/pages/static/serviceworker.js \
   /home/user/amp.dev.20/pages/static/
```

**Documentation**:
```bash
# Copy migration and restoration guides
cp /home/user/amp.dev.n4/HANDOFF_SITE_SEARCH_RESTORATION.md \
   /home/user/amp.dev.20/

cp /home/user/amp.dev.n4/MIGRATION_SITE_SEARCH_TO_AMP_DEV_20.md \
   /home/user/amp.dev.20/

# Copy reference files
mkdir -p /home/user/amp.dev.20/ontology-search/reference-files
cp /home/user/amp.dev.n4/ontology-search/reference-files/_amp-site-search-introduction.pdf \
   /home/user/amp.dev.20/ontology-search/reference-files/

cp /home/user/amp.dev.n4/ontology-search/reference-files/search-client.html \
   /home/user/amp.dev.20/ontology-search/reference-files/
```

### Option 2: Git Patch Method

Create a patch file containing only site-search changes:

```bash
# In amp.dev.n4 repository
cd /home/user/amp.dev.n4

# Create patch of site-search files
git diff origin/main -- \
  platform/lib/routers/search.js \
  platform/lib/utils/googleSearch.js \
  platform/config/search-promoted-pages.json \
  netlify/functions/search_do/ \
  netlify/functions/search_autosuggest/ \
  frontend/templates/views/partials/search.j2 \
  frontend/scss/components/organisms/search.scss \
  frontend/scss/components/molecules/search-trigger.scss \
  frontend21/scss/components/search-trigger.scss \
  pages/static/serviceworker.js \
  > /tmp/site-search-migration.patch

# In amp.dev.20 repository
cd /home/user/amp.dev.20
git apply /tmp/site-search-migration.patch
```

### Option 3: Git Subtree/Cherry-Pick Method

If both repositories share git history:

```bash
# In amp.dev.20 repository
cd /home/user/amp.dev.20

# Add amp.dev.n4 as remote
git remote add n4-source /home/user/amp.dev.n4

# Fetch branches
git fetch n4-source

# Cherry-pick site-search commits
git cherry-pick <commit-hash-1> <commit-hash-2> ...

# Or merge specific branch
git merge n4-source/claude/analyze-tar-011CUppL4unTTnGJgitdWds5
```

## Post-Migration Configuration

### 1. Environment Variables

**File**: `amp.dev.20/.env` or `.env.secrets`

```bash
# Google Programmable Search (GPS) Configuration
GOOGLE_CSE_API_KEY=<your-gps-api-key>
GOOGLE_CSE_ID=014077439351665726204:s4tidjx0agu

# Optional: If migrating to different domain
DOMAIN_NAME=amp.dev.20
```

**Note**: Use existing `.env.secrets` if already configured with GPS credentials

### 2. Update Domain-Specific References

If `amp.dev.20` uses a different domain, update:

**Google Custom Search Engine ID**:
```javascript
// platform/lib/utils/googleSearch.js:30
// netlify/functions/search_do/googleSearch.js:30

// Change from:
const CSE_ID = '014077439351665726204:s4tidjx0agu';

// To (recommended):
const CSE_ID = process.env.GOOGLE_CSE_ID || '014077439351665726204:s4tidjx0agu';
```

**Web Manifest**:
```json
// pages/static/manifest.json
{
  "name": "amp.dev.20",
  "short_name": "amp.dev.20"
}
```

// ### 3. Register Router in Platform
// 
// **File**: `amp.dev.20/platform/lib/platform.js` (or equivalent)
// 
// ```javascript
// // Import search router
// const searchRouter = require('./routers/search');
// 
// // Register route
// app.use('/search', searchRouter);
// ```

### 4. Include Search in Layout Templates

**File**: `amp.dev.20/frontend/templates/layouts/default.j2` (or equivalent)

```jinja2
{# Include search modal #}
{% include 'views/partials/search.j2' %}
```

**Header Template**: Add search trigger button

```jinja2
{# In header partial #}
{% do doc.icons.useIcon('/icons/magnifier.svg') %}

<div id="searchTriggerOpen"
     class="ap-m-search-trigger"
     on="tap:searchLightbox"
     role="button"
     tabindex="0">
  <div class="ap-a-ico ap-m-search-trigger-icon">
    <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#magnifier"></use></svg>
  </div>
</div>
```

### 5. Build and Compile Assets

**CSS Compilation**:
```bash
cd /home/user/amp.dev.20

# Build frontend CSS
npm run build:css

# Build frontend21 (if using Webpack system)
cd frontend21
npm install
npm run build
```

**Verify Output**:
```bash
# Check compiled CSS
ls -la dist/css/components/organisms/search.css
ls -la dist/css/components/molecules/search-trigger.css

# Check frontend21 build
ls -la dist/static/frontend/*.css
```

### 6. Populate Search Highlights

**File**: `platform/config/search-promoted-pages.json`

```json
{
  "default": {
    "components": [
      "/content/amp-dev/documentation/components/reference/amp-carousel.md",
      "/content/amp-dev/documentation/components/reference/amp-video.md",
      "/content/amp-dev/documentation/components/reference/amp-img.md",
      "/content/amp-dev/documentation/components/reference/amp-list.md",
      "/content/amp-dev/documentation/components/reference/amp-bind.md"
    ],
    "pages": [
      "/content/amp-dev/documentation/guides-and-tutorials/start/create/basic_markup.md",
      "/content/amp-dev/documentation/guides-and-tutorials/start/create_amphtml.md"
    ]
  }
}
```

## Testing Migration

### 1. Backend API Testing

```bash
# Start development server
cd /home/user/amp.dev.20
npm run dev

# Test search endpoint
curl "http://localhost:8080/search/do?q=carousel&locale=en"

# Expected response:
# {
#   "result": {
#     "totalResults": 42,
#     "currentPage": 1,
#     "components": [...],
#     "pages": [...]
#   },
#   "nextUrl": "/search/do?q=carousel&locale=en&page=2"
# }

# Test autosuggest
curl "http://localhost:8080/search/autosuggest"

# Expected:
# {"items": ["amp-accordion", "amp-ad", ...]}

# Test highlights
curl "http://localhost:8080/search/highlights?locale=en"
```

### 2. Frontend Integration Testing

**Manual Testing Checklist**:
- [ ] Search trigger button visible in header
- [ ] Clicking trigger opens lightbox modal
- [ ] Modal displays highlights on open
- [ ] Typing shows autocomplete suggestions
- [ ] Search executes and displays results
- [ ] Pagination "Load more" works
- [ ] Service Worker caches queries (test by navigating between pages)
- [ ] Closing and reopening search shows last results
- [ ] Mobile responsive design works
- [ ] All locales work (`?hl=en`, `?hl=de`, etc.)

### 3. GPS API Verification

```bash
# Verify GPS credentials
echo $GOOGLE_CSE_API_KEY

# Test GPS API directly
curl "https://www.googleapis.com/customsearch/v1?cx=014077439351665726204:s4tidjx0agu&key=$GOOGLE_CSE_API_KEY&q=carousel"

# Check for valid JSON response with search results
```

### 4. Service Worker Testing

**Browser DevTools**:
1. Open Chrome DevTools → Application → Service Workers
2. Verify `serviceworker.js` is registered and activated
3. Search for "carousel"
4. Check Application → Cache Storage → "search-cache"
5. Should see cached queries and results
6. Navigate to different page
7. Open search again → should show "carousel" results

### 5. Node.js 22 Compatibility

**Verify Header Handling**:
```javascript
// Check netlify/functions/search_do/search_do.js
// Should have:
headers: {
  'Access-Control-Allow-Origin': ev.headers?.origin || '',  // ✅ Optional chaining
  'Content-Type': 'application/javascript',
}
```

## Migration Verification Script

Create automated verification script:

```bash
#!/bin/bash
# File: verify-site-search-migration.sh

set -e

echo "=== Site-Search Migration Verification ==="

# Check backend files
echo "✓ Checking backend files..."
test -f platform/lib/routers/search.js && echo "  ✓ search.js"
test -f platform/lib/utils/googleSearch.js && echo "  ✓ googleSearch.js"
test -f platform/config/search-promoted-pages.json && echo "  ✓ search-promoted-pages.json"

# Check serverless functions
echo "✓ Checking serverless functions..."
test -d netlify/functions/search_do && echo "  ✓ search_do/"
test -d netlify/functions/search_autosuggest && echo "  ✓ search_autosuggest/"

# Check frontend files
echo "✓ Checking frontend files..."
test -f frontend/templates/views/partials/search.j2 && echo "  ✓ search.j2"
test -f frontend/scss/components/organisms/search.scss && echo "  ✓ search.scss"
test -f frontend/scss/components/molecules/search-trigger.scss && echo "  ✓ search-trigger.scss"

# Check Service Worker
echo "✓ Checking Service Worker..."
test -f pages/static/serviceworker.js && echo "  ✓ serviceworker.js"
grep -q "/search/do" pages/static/serviceworker.js && echo "  ✓ SW has search routes"

# Check environment variables
echo "✓ Checking environment variables..."
test -n "$GOOGLE_CSE_API_KEY" && echo "  ✓ GOOGLE_CSE_API_KEY set" || echo "  ✗ GOOGLE_CSE_API_KEY missing"

echo ""
echo "=== Migration verification complete ==="
```

**Run verification**:
```bash
cd /home/user/amp.dev.20
chmod +x verify-site-search-migration.sh
./verify-site-search-migration.sh
```

## Deployment Workflow

### Development Deployment

```bash
cd /home/user/amp.dev.20

# Install dependencies
npm install

# Build assets
npm run build

# Start development server
npm run dev

# Open browser
open http://localhost:8080

# Test search functionality
```

### Staging Deployment

```bash
# Commit changes
git add .
git commit -m "feat: migrate amp-site-search from amp.dev.n4

- Add search router and GPS integration
- Include frontend templates and CSS
- Configure Service Worker with search caching
- Add serverless functions for Netlify deployment
- Include documentation and reference files"

# Push to staging branch
git push -u origin feature/site-search-migration

# Deploy to staging environment
netlify deploy --build

# Test on staging URL
```

### Production Deployment

```bash
# Merge to main branch
git checkout main
git merge feature/site-search-migration

# Deploy to production
netlify deploy --prod

# Or via platform deployment
npm run deploy:production
```

## Rollback Strategy

If migration causes issues:

### Option 1: Git Revert

```bash
cd /home/user/amp.dev.20

# Identify commit hash of migration
git log --oneline

# Revert migration commit
git revert <migration-commit-hash>

# Push revert
git push origin main
```

### Option 2: Feature Flag

Disable search without code removal:

```jinja2
{# In layout template #}
{% if ENABLE_SITE_SEARCH %}
  {% include 'views/partials/search.j2' %}
{% endif %}
```

```bash
# Disable via environment variable
export ENABLE_SITE_SEARCH=false
```

### Option 3: Branch Rollback

```bash
# Reset to pre-migration state
git reset --hard <pre-migration-commit-hash>

# Force push (use with caution)
git push --force origin main
```

## Common Migration Issues

### Issue 1: GPS API Key Not Found

**Symptom**: 403 errors when searching

**Solution**:
```bash
# Verify .env file has GPS credentials
cat .env | grep GOOGLE_CSE_API_KEY

# Or check secrets file
cat .env.secrets | grep GOOGLE_CSE_API_KEY

# Set manually if missing
export GOOGLE_CSE_API_KEY="your-api-key-here"
```

### Issue 2: Router Not Registered

**Symptom**: 404 errors on `/search/*` endpoints

**Solution**:
```javascript
// Check platform/lib/platform.js (or app.js)
const searchRouter = require('./routers/search');
app.use('/search', searchRouter);
```

### Issue 3: Service Worker Not Caching

**Symptom**: Search doesn't persist across pages

**Solution**:
```javascript
// Verify serviceworker.js has search routes
grep -A 5 "'/search/do'" pages/static/serviceworker.js

// Check browser DevTools → Application → Service Workers
// Should show serviceworker.js as activated
```

### Issue 4: CSS Not Loading

**Symptom**: Search UI looks broken

**Solution**:
```bash
# Rebuild CSS
npm run build:css

# Check compiled output
ls -la dist/css/components/organisms/search.css

# For frontend21:
cd frontend21
npm run build
```

### Issue 5: CORS Errors

**Symptom**: Browser console shows CORS errors

**Solution**:
```javascript
// Verify serverless functions have CORS headers
// netlify/functions/search_do/search_do.js
headers: {
  'Access-Control-Allow-Origin': ev.headers?.origin || '*',
  'Content-Type': 'application/json',
}
```

## Post-Migration Optimization

### 1. Performance Tuning

**Service Worker Cache Strategy**:
```javascript
// Adjust cache duration in serviceworker.js
const CACHE_VERSION = 'v1';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
```

**GPS Response Caching**:
```javascript
// Add server-side caching
app.get('/search/do', cacheMiddleware(300), searchHandler);
```

### 2. Analytics Integration

**Track Search Queries**:
```html
<amp-analytics type="gtag">
  <script type="application/json">
  {
    "triggers": {
      "searchQuery": {
        "on": "visible",
        "request": "event",
        "vars": {
          "event_name": "search",
          "search_term": "${query}"
        }
      }
    }
  }
  </script>
</amp-analytics>
```

### 3. Content Quality

**Populate Highlights**:
- Add top 10 most popular components
- Include seasonal/trending articles
- Update quarterly based on analytics

**Update Component List**:
```bash
# Regenerate component-versions.json
npm run update-component-list
```

## Next Steps

### Immediate (Post-Migration)

1. **Verify All Tests Pass**
   ```bash
   npm test
   npm run e2e
   ```

2. **Monitor Error Logs**
   - Check GPS API quota usage
   - Monitor Service Worker errors
   - Track search failure rate

3. **User Acceptance Testing**
   - Internal team testing
   - Beta user testing
   - Gather feedback

### Short Term (1-2 Weeks)

1. **Performance Monitoring**
   - Measure search latency
   - Track cache hit rates
   - Monitor API response times

2. **Content Curation**
   - Populate highlights with quality content
   - Test multilingual support
   - Verify all locales work

3. **Documentation Updates**
   - Update README with search functionality
   - Create user guide for search features
   - Document API endpoints

### Long Term (1-3 Months)

1. **Feature Enhancements**
   - Add "recent searches" feature
   - Implement search analytics dashboard
   - Consider GKG (Google Knowledge Graph) integration

2. **Optimization**
   - A/B test search UI variations
   - Optimize autocomplete performance
   - Improve mobile UX

3. **Integration**
   - Unified search with ontology-search
   - Type filters (Component, Guide, Example)
   - Faceted search capabilities

## Support and Resources

### Documentation
- **Restoration Guide**: `HANDOFF_SITE_SEARCH_RESTORATION.md`
- **Migration Guide**: `MIGRATION_SITE_SEARCH_TO_AMP_DEV_20.md` (this file)
- **Reference Files**: `ontology-search/reference-files/`

### External Links
- [Google Programmable Search](https://developers.google.com/custom-search)
- [AMP Components Documentation](https://amp.dev/documentation/components/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Contact
- **Source Repository**: AFDSI/amp.dev.n4
- **Source Branch**: `claude/analyze-tar-011CUppL4unTTnGJgitdWds5`
- **Migration Date**: 2025-11-11

---

**Last Updated**: 2025-11-11
**Status**: Ready for migration
**Migration Complexity**: Medium
**Estimated Time**: 2-4 hours (selective migration) | 1 day (full migration + testing)
