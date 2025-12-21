# Quick Start: Migrate amp-site-search to amp.dev.20

## Overview

This guide provides step-by-step instructions to migrate the restored `amp-site-search` components from `amp.dev.n4` to `amp.dev.20`.

## Prerequisites

### 1. amp.dev.20 Repository

Ensure you have the target repository ready:

```bash
cd /home/user

# Clone amp.dev.20 (if not already done)
git clone <amp.dev.20-repo-url> amp.dev.20

# OR if it already exists, ensure it's up to date
cd amp.dev.20
git pull origin main
```

### 2. Google Programmable Search Credentials

You'll need:
- **API Key**: Google Programmable Search API key
- **CSE ID**: Custom Search Engine ID (default: `014077439351665726204:s4tidjx0agu`)

Get these from [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

## Migration Steps

### Step 1: Run Migration Script

```bash
cd /home/user/amp.dev.n4

# Run the migration script
./migrate-site-search.sh /home/user/amp.dev.20

# When prompted, confirm with 'y'
```

**What it does:**
- Copies all backend files (routers, utilities, configs)
- Copies Netlify serverless functions
- Copies frontend templates and CSS
- Copies Service Worker
- Copies documentation and reference files

### Step 2: Verify Migration

```bash
cd /home/user/amp.dev.20

# Run verification script
./verify-site-search-migration.sh
```

**Expected output:**
```
✓ All checks passed!
```

If you see errors, review and fix missing files before proceeding.

### Step 3: Configure Environment

Edit `.env` or `.env.secrets` in amp.dev.20:

```bash
cd /home/user/amp.dev.20

# Create/edit .env file
nano .env
```

Add:
```bash
GOOGLE_CSE_API_KEY=your-api-key-here
GOOGLE_CSE_ID=014077439351665726204:s4tidjx0agu
```

### Step 4: Register Search Router

Edit `platform/lib/platform.js` (or equivalent app.js):

```javascript
// Add near top with other requires
const searchRouter = require('./routers/search');

// Add after other app.use() statements
app.use('/search', searchRouter);
```

### Step 5: Include Search in Layout

Edit `frontend/templates/layouts/default.j2`:

```jinja2
{# Add near bottom, before closing </body> #}
{% include 'views/partials/search.j2' %}
```

### Step 6: Add Search Trigger to Header

Edit `frontend/templates/views/2021/partials/header.j2` (or your header partial):

```jinja2
{# Load search icon #}
{% do doc.icons.useIcon('/icons/magnifier.svg') %}

{# Add search trigger button (place in header nav) #}
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

### Step 7: Build Assets

```bash
cd /home/user/amp.dev.20

# Install dependencies (if first time)
npm install

# Build frontend CSS
npm run build:css

# Build frontend21 (if using Webpack-based pages)
cd frontend21
npm install
npm run build
cd ..
```

### Step 8: Test Locally

```bash
cd /home/user/amp.dev.20

# Start development server
npm run dev

# In another terminal, test search endpoint
curl "http://localhost:8080/search/do?q=carousel&locale=en"
```

**Expected response:**
```json
{
  "result": {
    "totalResults": 42,
    "currentPage": 1,
    "components": [...],
    "pages": [...]
  },
  "nextUrl": "/search/do?q=carousel&locale=en&page=2"
}
```

### Step 9: Test in Browser

1. Open browser to `http://localhost:8080`
2. Look for search icon in header
3. Click search icon → should open lightbox modal
4. Type "carousel" → should show results
5. Verify autocomplete works
6. Test "Load more" pagination

### Step 10: Commit Changes

```bash
cd /home/user/amp.dev.20

# Create feature branch
git checkout -b feature/site-search-migration

# Add all migrated files
git add .

# Commit with descriptive message
git commit -m "feat: migrate amp-site-search from amp.dev.n4

- Add search router and GPS integration
- Include frontend templates and CSS
- Configure Service Worker with search caching
- Add serverless functions for Netlify deployment
- Include documentation and reference files

Migrated from amp.dev.n4 branch: claude/analyze-tar-011CUppL4unTTnGJgitdWds5"

# Push to remote
git push -u origin feature/site-search-migration
```

## Testing Checklist

After migration, verify:

- [ ] Search trigger button visible in header
- [ ] Clicking trigger opens search lightbox
- [ ] Modal displays highlights (promoted pages)
- [ ] Typing shows autocomplete suggestions
- [ ] Search executes and displays results
- [ ] Component results show links
- [ ] "Load more" pagination works
- [ ] Close/reopen shows cached results (Service Worker)
- [ ] Navigate to another page, search persists
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Mobile responsive design works
- [ ] Multiple locales work (test with ?hl=de)

## Troubleshooting

### Search Button Not Visible

**Problem:** No search icon appears in header

**Solution:**
1. Verify `search.j2` is included in layout
2. Check search trigger is in header template
3. Ensure CSS compiled: `npm run build:css`
4. Verify icon loaded: check for `magnifier.svg`

### Search Returns No Results

**Problem:** Search executes but shows "No results found"

**Solution:**
1. Check API key is set: `echo $GOOGLE_CSE_API_KEY`
2. Test API directly:
   ```bash
   curl "https://www.googleapis.com/customsearch/v1?cx=014077439351665726204:s4tidjx0agu&key=$GOOGLE_CSE_API_KEY&q=carousel"
   ```
3. Check server logs for errors
4. Verify CSE ID is correct

### Service Worker Not Caching

**Problem:** Search results don't persist across pages

**Solution:**
1. Open DevTools → Application → Service Workers
2. Verify `serviceworker.js` is registered and activated
3. Check SW has search routes:
   ```bash
   grep -A 5 "'/search/do'" pages/static/serviceworker.js
   ```
4. Clear cache and reload

### CORS Errors

**Problem:** Browser console shows CORS errors

**Solution:**
1. Check serverless functions have CORS headers
2. Verify `Access-Control-Allow-Origin` is set
3. Check Netlify function configuration

## Next Steps

### Populate Search Highlights

Edit `platform/config/search-promoted-pages.json`:

```json
{
  "default": {
    "components": [
      "/content/amp-dev/documentation/components/reference/amp-carousel.md",
      "/content/amp-dev/documentation/components/reference/amp-video.md",
      "/content/amp-dev/documentation/components/reference/amp-img.md"
    ],
    "pages": [
      "/content/amp-dev/documentation/guides-and-tutorials/start/create/basic_markup.md",
      "/content/amp-dev/documentation/guides-and-tutorials/start/create_amphtml.md"
    ]
  }
}
```

### Deploy to Staging

```bash
cd /home/user/amp.dev.20

# Deploy to Netlify staging
netlify deploy --build

# Test on staging URL
```

### Deploy to Production

```bash
# Merge to main
git checkout main
git merge feature/site-search-migration

# Deploy to production
netlify deploy --prod
```

## Documentation

For detailed information, see:

- **Migration Guide**: `MIGRATION_SITE_SEARCH_TO_AMP_DEV_20.md` (comprehensive guide)
- **Restoration Guide**: `HANDOFF_SITE_SEARCH_RESTORATION.md` (architecture details)
- **Reference Example**: `ontology-search/reference-files/search-client.html`

## Support

If you encounter issues:

1. Check verification script output: `./verify-site-search-migration.sh`
2. Review server logs: `npm run dev` (watch console)
3. Check browser DevTools console for errors
4. Verify all post-migration steps completed
5. Consult detailed guides in documentation

## Summary

**Time Estimate**: 30-60 minutes for basic migration + testing

**Files Migrated**:
- 13+ core files
- 2 serverless function directories
- Multiple CSS, template, and config files
- Complete documentation

**Key Benefits**:
- Full-text search across amp.dev
- Google Programmable Search integration
- Service Worker caching for performance
- Autocomplete for components
- Customizable highlights/promoted pages

---

**Migration Date**: 2025-11-11
**Source**: amp.dev.n4 (branch: claude/analyze-tar-011CUppL4unTTnGJgitdWds5)
**Target**: amp.dev.20
**Status**: Ready for migration
