# Handoff Document: Site-Search Restoration Guide

## Project Overview

This document provides complete context for **restoring the deprecated site-search functionality** in amp.dev.n4. Site-search was deprecated but remains functional with proper restoration. This guide includes architecture details, deprecation analysis, and step-by-step restoration instructions.

## Repository Information

- **Repository**: AFDSI/amp.dev.n4
- **Branch**: `claude/analyze-tar-011CUppL4unTTnGJgitdWds5`
- **Analysis Date**: 2025-11-06
- **Related Documents**:
  - `HANDOFF_SITE_SEARCH.md` - Original analysis (incomplete - missing Service Worker)
  - `ontology-search/reference-files/_amp-site-search-introduction.pdf` - Official AMP blog post
  - `ontology-search/reference-files/search-client.html` - Manual restoration example

## Executive Summary

**Site-search is NOT just an AMP component system** - it's a sophisticated integration of:
1. **AMP Components**: amp-lightbox, amp-list, amp-autocomplete, amp-mustache, amp-bind
2. **Backend API**: Express router + Netlify serverless functions
3. **Google Custom Search**: External API for search indexing
4. **Service Worker**: Critical for caching queries and persistence across pages
5. **Build Systems**: frontend (Grow) AND frontend21 (Webpack) - two different approaches!

**Previous Analysis Gaps**: The original `HANDOFF_SITE_SEARCH.md` missed:
1. ❌ **Service Worker integration** - Essential for UX (persistent search across navigation)
2. ❌ **frontend21 Webpack build system** - amp-dev.ejs + webpack.config.js + amp-dev.js
3. ❌ **CSS injection mechanism** - Webpack injects compiled CSS into templates (lines 85-88 of amp-dev.ejs)

**Critical Discovery**: frontend21 is NOT just SCSS files - it's a complete Webpack-based build system that:
- Compiles SCSS to minified, hashed CSS
- Processes hybrid Jinja2/EJS templates (amp-dev.ejs)
- Injects compiled CSS directly into `<style amp-custom>` tags
- Outputs to `pages/views/2021/base.html`
- **Only has search-trigger.scss** - missing search modal styles!

## What is Site-Search?

### Complete Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│  ┌────────────┐  ┌──────────┐  ┌───────────────┐  ┌──────────┐  │
│  │ amp-       │  │ amp-list │  │ amp-          │  │ amp-     │  │
│  │ lightbox   │  │ +        │  │ autocomplete  │  │ mustache │  │
│  │ (modal)    │  │ infinite │  │ (suggestions) │  │ (render) │  │
│  └────────────┘  └──────────┘  └───────────────┘  └──────────┘  │
│          ▲              ▲                ▲               ▲      │
│          └──────────────┴────────────────┴───────────────┘      │
│                          amp-bind (state glue)                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                      Service Worker Layer                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Intercepts routes:                                          ││
│  │ • /search/latest-query  → Returns cached last query         ││
│  │ • /search/do?q=...      → Cache-first then network          ││
│  │ • /search/highlights    → Cache-first                       ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                        Backend APIs                             │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────┐   │
│  │ Express      │  │ Netlify         │  │ Google Custom     │   │
│  │ /search/*    │  │ Functions       │  │ Search API        │   │
│  │ (platform)   │  │ (serverless)    │  │ (external)        │   │
│  └──────────────┘  └─────────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components Breakdown

#### 1. AMP Component Layer (Frontend)

**Purpose**: User interface built entirely with AMP components (no custom JavaScript)

**Components**:
- **amp-lightbox**: Full-screen modal overlay for search interface
- **amp-list**: Dynamic result rendering with infinite scroll and pagination
- **amp-autocomplete**: Component name suggestions (amp-carousel, amp-video, etc.)
- **amp-mustache**: Template engine for rendering search results
- **amp-bind**: State management connecting all components together

**Data Flow**:
```javascript
User types → amp-bind updates state 'query'
          → amp-list [src] binding updates
          → Fetches /search/do?q={query}
          → amp-mustache renders results
```

#### 2. Service Worker Layer (Critical!)

**Purpose**: Cache search queries and results for persistence across page navigation

**Why Critical**: Without Service Worker, search results disappear when user navigates to another page. With it, users can:
- Open search on Page A, search for "carousel"
- Navigate to Page B
- Open search again → sees previous "carousel" results automatically

**Implementation** (`pages/static/serviceworker.js`):

```javascript
// Intercept /search/latest-query (fake endpoint)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Route 1: Return cached latest query
  if (requestUrl.pathname === '/search/latest-query') {
    event.respondWith(latestQueryHandler(requestUrl, event.request));
  }

  // Route 2: Cache search results
  if (requestUrl.pathname === '/search/do') {
    event.respondWith(searchDoRequestHandler(requestUrl, event.request));
  }
});

// Extract query from URL and cache it
async function searchDoRequestHandler(url, request) {
  const searchQuery = decodeURIComponent(url.search.match(/q=([^&]+)/)[1]);
  const cache = await caches.open(SEARCH_CACHE_NAME);

  // Save latest query in cache
  cache.put(SEARCH_LATEST_QUERY_PATH, new Response(`"${searchQuery}"`));

  // Check cache for results
  let response = await cache.match(request);
  if (response) return response; // Cache hit

  // Fetch from network and cache
  response = await fetch(request);
  if (response.status == 200) {
    cache.put(request, response.clone());
  }
  return response;
}
```

**Routes Intercepted**:
- `/search/latest-query` - Fake endpoint that returns cached query from SW
- `/search/do?q=...` - Real endpoint, cached by SW (cache-first strategy)
- `/search/highlights` - Initial suggestions, cached by SW

#### 3. Backend API Layer

**Express Router** (`platform/lib/routers/search.js`):
- `/search/do` - Main search execution via Google Custom Search API
- `/search/highlights` - Promoted/curated pages
- `/search/autosuggest` - Component name autocomplete list

**Netlify Functions** (Serverless):
- `netlify/functions/search_do/` - Serverless version of search endpoint
- `netlify/functions/search_autosuggest/` - Serverless autocomplete

**Google Custom Search API**:
- External service for indexing amp.dev content
- Requires API key (`GOOGLE_CSE_API_KEY`)
- CSE ID: `014077439351665726204:s4tidjx0agu`

## Deprecation History

### What Was Deprecated

**Commit**: `df1c26b9f569758075abaceae01a66ccb6ad79c3`
**Date**: Approximately 2021-2022 (during AMP transition)

**Files Changed**:
1. `frontend/templates/layouts/default.j2`
   - **Removed**: `{% include 'views/partials/search.j2' %}`
   - **Impact**: Search UI no longer included in default layout

2. `frontend/templates/views/2021/partials/header.j2`
   - **Removed**: Search trigger button markup (~12 lines)
   - **Removed**: `{% do doc.icons.useIcon('/icons/magnifier.svg') %}`
   - **Impact**: No search button in header

### What Was NOT Deprecated

✅ **Still Exists**:
- Backend API routes (`platform/lib/routers/search.js`)
- Netlify serverless functions
- Google Custom Search integration
- Service Worker infrastructure
- CSS files (`frontend/scss/components/organisms/search.scss`)
- Search template partial (`frontend/templates/views/partials/search.j2`)

### Why Deprecated

**Likely reasons** (not explicitly documented):
- Maintenance burden during AMP project transition
- Focus shift to other priorities
- Google's decreased emphasis on AMP
- Migration to modern web standards

## CSS Architecture: frontend vs frontend21

### Overview

The project has **two CSS systems** that coexist:

| Aspect | frontend (Gen 1) | frontend21 (Gen 2) |
|--------|------------------|-------------------|
| **Methodology** | BEM (Block Element Modifier) | Custom simplified |
| **Granularity** | Highly granular (atoms/molecules/organisms) | Less granular (components) |
| **Class Names** | Descriptive (`ap-o-search`, `ap-m-search-trigger`) | Minified (`-tb`, `-tw`, `-tx`) |
| **Structure** | Deep nesting | Flatter hierarchy |
| **Compilation** | SCSS → CSS | SCSS → Minified CSS |
| **Usage** | Legacy pages | Modern pages (2021+) |

### frontend (Generation 1)

**Philosophy**: Atomic Design + BEM

**Directory Structure**:
```
frontend/scss/components/
├── atoms/          # Basic elements (buttons, icons)
├── molecules/      # Simple components (search-trigger)
└── organisms/      # Complex components (search, header)
```

**Search Files**:
- `frontend/scss/components/organisms/search.scss` (7.6KB) - Main search modal
- `frontend/scss/components/molecules/search-trigger.scss` (1.2KB) - Search button

**Class Naming**:
```css
.ap-o-search                 /* Organism: search */
.ap-o-search-container       /* Container within search */
.ap-o-search-input           /* Input within search */
.ap-m-search-trigger         /* Molecule: search trigger */
```

**Prefix Key**:
- `ap-` = AMP Project
- `-a-` = Atom
- `-m-` = Molecule
- `-o-` = Organism

### frontend21 (Generation 2)

**Philosophy**: Simplified, performance-focused + **Webpack build system**

**CRITICAL**: frontend21 is NOT just SCSS files - it's a complete Webpack-based build system!

**Build Architecture**:
```
frontend21/
├── amp-dev.js              # Entry point (imports SCSS)
├── amp-dev.ejs             # Base template (Jinja2 + EJS hybrid)
├── webpack.config.js       # Build configuration
└── scss/
    ├── amp-dev.scss        # Main SCSS (imports all components)
    └── components/
        ├── search-trigger.scss
        ├── header.scss
        └── (flat list of components)
```

**Build Process**:
1. **Entry**: `amp-dev.js` imports `amp-dev.scss`
2. **Webpack**: Compiles SCSS → minified CSS with hashing
3. **Template**: Processes `amp-dev.ejs` with HtmlWebpackPlugin
4. **Injection**: Lines 85-88 of amp-dev.ejs inject compiled CSS:
   ```ejs
   <%
   print(htmlWebpackPlugin.files.css.map((cssFile) =>
     compilation.assets[cssFile.substr(htmlWebpackPlugin.files.publicPath.length)].source()
   ).join(''));
   %>
   ```
5. **Output**: Copies `dist/base.html` to `pages/views/2021/base.html`

**Search Files**:
- `frontend21/scss/components/search-trigger.scss` (775 bytes) - Trigger button only
- ❌ **MISSING**: No search modal/lightbox SCSS in frontend21!

**Key File: amp-dev.ejs** (Base Template)
- Line 44-52: Font preloading, AMP script, favicon
- Line 72-89: `<style amp-custom>` with Webpack CSS injection
- Line 114: Includes 2021 header: `{% include 'views/2021/partials/header.j2' %}`
- Line 139: Includes Service Worker: `{% include 'views/partials/service-worker.j2' %}`
- **NOTE**: No search partial included here (deprecated)

**Class Naming** (Minified):
```css
.-tb     /* Corresponds to search lightbox */
.-tw     /* Corresponds to search escaper/backdrop */
.-tx     /* Corresponds to search container */
.-tj     /* Corresponds to search input */
```

**Why Minified**:
- Smaller CSS bundle size
- Faster parsing
- Performance optimization for production

### search-client.html Uses Both

The manual restoration example (`ontology-search/reference-files/search-client.html`) uses **frontend21 minified classes** because:
1. It's a standalone page (doesn't rely on full frontend stack)
2. All styles are inlined in `<style amp-custom>`
3. Uses modern AMP implementation patterns
4. Demonstrates minimal viable search restoration

## Node.js Compatibility (Node 22)

### Background

After site-search deprecation, the repository was upgraded to support:
- **Node events** (modern event handling)
- **Node v22** (latest LTS)

### Required Changes

**Header Handling**: Node 22 has case-sensitive header names in some contexts.

**Pattern** (already applied in repo):
```javascript
// OLD (breaks in Node 22)
const contentType = ev.headers['content-type'];

// NEW (works in Node 22)
const contentType = ev.headers['Content-Type'] || ev.headers['content-type'];
```

### Site-Search Compatibility Status

✅ **Already Compatible**:

**netlify/functions/search_do/search_do.js**:
```javascript
headers: {
  'Access-Control-Allow-Origin': ev.headers?.origin || '',  // ✅ Optional chaining
  'Content-Type': 'application/javascript',
  'Cache-Control': 'no-cache',
}
```

**netlify/functions/search_autosuggest/search_autosuggest.js**:
- Uses same pattern

**netlify/functions/examples_*/**:
```javascript
'content-type': ev.headers['Content-Type'] || ev.headers['content-type']  // ✅ Dual check
```

### What Needs Verification

When restoring site-search, verify:

1. **Service Worker**: Check if SW code needs Node 22 updates
   - File: `pages/static/serviceworker.js`
   - Look for header access patterns

2. **Express Router**: Verify middleware compatibility
   - File: `platform/lib/routers/search.js`
   - Check request/response header handling

3. **Test All Endpoints**:
   ```bash
   # Test search
   curl http://localhost:8080/search/do?q=carousel&locale=en

   # Test autosuggest
   curl http://localhost:8080/search/autosuggest

   # Test highlights
   curl http://localhost:8080/search/highlights?locale=en
   ```

## Restoration Steps

### Phase 1: Restore Frontend UI

#### Step 1.1: Re-include Search Partial

**File**: `frontend/templates/layouts/default.j2`

**Before** (current):
```jinja2
{# Search was here but removed in df1c26b #}
```

**After** (restore):
```jinja2
{% include 'views/partials/search.j2' %}
```

#### Step 1.2: Add Search Trigger to Header

**File**: `frontend/templates/views/2021/partials/header.j2` (or equivalent)

**Add** (before `</header>`):
```jinja2
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

#### Step 1.3: Verify Search Template Exists

**Check**: `frontend/templates/views/partials/search.j2` still exists

**If missing**: Use `ontology-search/reference-files/search-client.html` as reference to recreate

### Phase 2: Verify Backend Services

#### Step 2.1: Test Express Router

```bash
# Start development server
npm run dev

# Test search endpoint
curl "http://localhost:8080/search/do?q=carousel&locale=en"

# Should return JSON with results
```

**Expected Response**:
```json
{
  "result": {
    "totalResults": 42,
    "currentPage": 1,
    "pageCount": 5,
    "components": [...],
    "pages": [...]
  },
  "nextUrl": "/search/do?q=carousel&locale=en&page=2"
}
```

#### Step 2.2: Verify Google CSE API Key

```bash
# Check credentials
echo $GOOGLE_CSE_API_KEY

# Or check in .env file
cat .env | grep GOOGLE_CSE_API_KEY
```

**If missing**: Obtain API key from Google Cloud Console and configure

#### Step 2.3: Test Netlify Functions

```bash
# Test serverless function locally
netlify dev

# Test search
curl "http://localhost:8888/.netlify/functions/search_do?q=carousel&locale=en"
```

### Phase 3: Restore Service Worker Integration

#### Step 3.1: Verify Service Worker File

**Check**: `pages/static/serviceworker.js` contains search handlers

**Required Routes**:
```javascript
// Must intercept these routes
if (requestUrl.pathname === '/search/latest-query') {
  // Return cached query
}

if (requestUrl.pathname === '/search/do') {
  // Cache search results
}

if (requestUrl.pathname === '/search/highlights') {
  // Cache highlights
}
```

#### Step 3.2: Register Service Worker

**File**: Page layout template

**Verify includes**:
```html
<amp-install-serviceworker
  src="/serviceworker.js"
  data-iframe-src="/serviceworker-frame.html"
  layout="nodisplay">
</amp-install-serviceworker>
```

#### Step 3.3: Test Service Worker

```bash
# Open browser DevTools → Application → Service Workers
# Verify SW is registered

# Test cache:
# 1. Search for "carousel"
# 2. Navigate to another page
# 3. Open search again
# 4. Should show "carousel" results automatically
```

### Phase 4: Populate Highlights

#### Step 4.1: Configure Promoted Pages

**File**: `platform/config/search-promoted-pages.json`

**Current** (empty):
```json
{
  "default": {
    "components": [],
    "pages": []
  }
}
```

**Populate** (example):
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
      "/content/amp-dev/documentation/guides-and-tutorials/start/create_amphtml.md",
      "/content/amp-dev/documentation/guides-and-tutorials/start/visual_story/index.md"
    ]
  },
  "de": {
    "components": [],
    "pages": []
  }
}
```

#### Step 4.2: Build Highlights

```bash
# Grow build process generates highlights
npm run build

# Check output
ls dist/static/files/search-promoted-pages/
# Should contain: en.json, de.json, etc.
```

#### Step 4.3: Verify Highlights Endpoint

```bash
curl http://localhost:8080/search/highlights?locale=en

# Should return populated components and pages
```

### Phase 5: CSS Integration

#### Option A: Use Existing frontend SCSS (Legacy Pages)

**If page uses frontend (Gen 1)**:

```jinja2
{% do doc.styles.addCssFile('/css/components/organisms/search.css') %}
{% do doc.styles.addCssFile('/css/components/molecules/search-trigger.css') %}
```

**Classes in template**:
```html
<amp-lightbox id="searchLightbox" class="ap-o-search" ...>
  <div class="ap-o-search-container">
    <input class="ap-o-search-input" ...>
  </div>
</amp-lightbox>
```

#### Option B: frontend21 Pages (Webpack Build System)

**IMPORTANT**: frontend21 uses Webpack, not Grow's direct CSS includes!

**Sub-Option B1: Import frontend Search Styles (Recommended)**

Since frontend21 doesn't have search modal styles, import from frontend:

1. **Add to `frontend21/scss/amp-dev.scss`** (after line 21):
   ```scss
   @import 'components/search-trigger.scss';  // Already present
   @import '../../frontend/scss/components/organisms/search.scss';  // ADD THIS
   ```

2. **Build frontend21**:
   ```bash
   cd frontend21
   npm run build  # or webpack --mode=production
   ```

3. **Add search partial to amp-dev.ejs** (after line 115):
   ```jinja2
   {% block search %}
   {% include 'views/partials/search.j2' %}
   {% endblock %}
   ```

4. **Use frontend (BEM) classes** in search.j2 template:
   ```html
   <amp-lightbox class="ap-o-search" ...>
   ```

**Sub-Option B2: Create frontend21 Search Styles (More Work)**

Create minified search styles specifically for frontend21:

1. **Create `frontend21/scss/components/search.scss`**
2. **Write minified classes** (like search-client.html)
3. **Import in amp-dev.scss**
4. **Update search.j2** to use minified classes

**Sub-Option B3: Inline Styles (Quick Test)**

For testing, inline styles directly in amp-dev.ejs:

```ejs
<style amp-custom>
  /* Copy styles from search-client.html */
  .-tb { /* search lightbox */ }
  .-tw { /* escaper */ }
  /* ... */
</style>
```

#### Option C: Migrate to Third Generation (Future)

**Not in scope for restoration** - just get it working first

### Phase 5.5: Build and Deploy (frontend21 Only)

**If using frontend21 (Option B)**:

```bash
# Build frontend21
cd frontend21
npm install  # if first time
npm run build  # or: webpack --mode=production

# This generates:
# - dist/base.html (copied to pages/views/2021/base.html)
# - dist/static/frontend/*.css (with hash)
# - dist/static/sprite.svg

# Verify output
ls -la dist/base.html
ls -la ../pages/views/2021/base.html  # Should be updated
ls -la ../dist/static/frontend/*.css

# Dev mode (watch for changes)
npm run dev  # Starts webpack-dev-server on port 8090
```

**Key webpack.config.js Settings**:
- Dev server: `http://localhost:8090`
- Output: `dist/static/frontend/[name].[contenthash].css`
- Copies compiled HTML to `pages/views/2021/`
- Hot reload enabled in dev mode

### Phase 6: Testing & Verification

#### Test Checklist

- [ ] Search trigger button visible in header
- [ ] Clicking trigger opens search lightbox modal
- [ ] Modal displays initial highlights (promoted components/pages)
- [ ] Typing in input shows autocomplete suggestions (component names)
- [ ] Selecting suggestion or pressing Enter executes search
- [ ] Search results display with proper formatting
- [ ] Component results show example and playground links
- [ ] "Load more" button appears for paginated results
- [ ] Clicking "Load more" fetches next page
- [ ] Closing modal and reopening shows last search results (Service Worker)
- [ ] Navigating to another page and opening search shows last results
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Mobile responsive design works
- [ ] Locale switching works (test with ?hl=de)

#### Manual Test Scenarios

**Scenario 1: Basic Search**
1. Open site
2. Click search icon
3. Search for "carousel"
4. Verify results include amp-carousel component
5. Click component result → navigates to component page

**Scenario 2: Autocomplete**
1. Open search
2. Type "amp-"
3. Verify dropdown shows component suggestions
4. Select "amp-video"
5. Verify search executes automatically

**Scenario 3: Persistence**
1. Search for "form"
2. Close search
3. Navigate to different page
4. Open search
5. Verify "form" results still displayed

**Scenario 4: Pagination**
1. Search for "amp"
2. Scroll to bottom
3. Click "Load more"
4. Verify next 10 results loaded

**Scenario 5: No Results**
1. Search for "xyznonexistent"
2. Verify "No results found" message displays
3. Verify emoticon shows: ¯\_(ツ)_/¯

**Scenario 6: Highlights**
1. Open search (don't type anything)
2. Verify "Important Components" section displays
3. Verify "Popular Articles" section displays
4. Verify content matches `search-promoted-pages.json`

## Troubleshooting Common Issues

### Issue 1: Search Button Not Visible

**Symptoms**: No search icon in header

**Causes**:
- Search partial not included in layout
- Search trigger not added to header
- CSS not loaded

**Solutions**:
```bash
# Check template includes
grep -r "search.j2" frontend/templates/layouts/

# Check CSS compilation
npm run build:css

# Verify icon loaded
grep -r "magnifier.svg" frontend/templates/
```

### Issue 2: Search Returns No Results

**Symptoms**: Search executes but shows "No results found"

**Causes**:
- Google CSE API key missing
- API key quota exceeded
- CSE ID incorrect
- Network blocked

**Solutions**:
```bash
# Check API key
echo $GOOGLE_CSE_API_KEY

# Test API directly
curl "https://www.googleapis.com/customsearch/v1?cx=014077439351665726204:s4tidjx0agu&key=YOUR_KEY&q=carousel"

# Check server logs
npm run dev
# Watch for CSE errors
```

### Issue 3: Service Worker Not Caching

**Symptoms**: Search results don't persist across navigation

**Causes**:
- Service Worker not registered
- SW cache routes missing
- Browser blocking SW

**Solutions**:
```bash
# Check SW registration
# Open DevTools → Application → Service Workers
# Should show serviceworker.js as activated

# Check SW code
grep -A 20 "'/search/do'" pages/static/serviceworker.js

# Clear cache and reload
# DevTools → Application → Clear storage
```

### Issue 4: Autocomplete Not Working

**Symptoms**: No suggestions when typing component names

**Causes**:
- Autosuggest endpoint returning error
- Component list not populated
- `min-characters` set too high

**Solutions**:
```bash
# Test autosuggest endpoint
curl http://localhost:8080/search/autosuggest

# Should return:
# {"items": ["amp-accordion", "amp-ad", ...]}

# Check component-versions.json
cat netlify/functions/search_autosuggest/component-versions.json
```

### Issue 5: Pagination Broken

**Symptoms**: "Load more" doesn't work or causes errors

**Causes**:
- `load-more-bookmark` incorrect
- `nextUrl` not in response
- amp-list configuration error

**Solutions**:
```javascript
// Verify response includes nextUrl
{
  "result": {...},
  "nextUrl": "/search/do?q=carousel&page=2"  // Must be present
}

// Check amp-list attributes
<amp-list
  load-more="auto"
  load-more-bookmark="nextUrl"  // Must match response key
  ...
```

### Issue 6: CSS Classes Not Applied

**Symptoms**: Search UI looks broken or unstyled

**Causes**:
- Wrong CSS generation used (frontend vs frontend21)
- Minified classes don't match template
- CSS files not compiled

**Solutions**:
```bash
# Identify which generation page uses
grep -o 'class="ap-' template.html  # frontend (BEM)
grep -o 'class="-' template.html    # frontend21 (minified)

# Compile correct CSS
npm run build:css           # frontend
npm run build:css:frontend21  # frontend21

# Or inline styles for standalone page
```

### Issue 7: CORS Errors

**Symptoms**: Browser console shows CORS errors when fetching search results

**Causes**:
- Missing CORS headers in serverless functions
- Incorrect `Access-Control-Allow-Origin`

**Solutions**:
```javascript
// Verify all search endpoints return CORS headers
headers: {
  'Access-Control-Allow-Origin': ev.headers?.origin || '*',
  'Content-Type': 'application/json',
}

// Check preflight OPTIONS request handled
if (ev.httpMethod === 'OPTIONS') {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  };
}
```

## Development Workflow

### Local Development

```bash
# 1. Start development server
npm run dev

# 2. In separate terminal, watch CSS
npm run watch:css

# 3. Open browser
open http://localhost:8080

# 4. Open DevTools → Console for errors
```

### Testing Search

```bash
# Test backend directly
curl "http://localhost:8080/search/do?q=test&locale=en" | jq

# Test with real Google CSE
export GOOGLE_CSE_API_KEY="your-key-here"
npm run dev

# Test Service Worker caching
# 1. Open DevTools → Application → Service Workers
# 2. Search for something
# 3. Application → Cache Storage → check 'search-cache'
# 4. Should see cached queries and results
```

### Debugging Tips

```javascript
// Add debug logging to Service Worker
console.log('[SW] Intercepting:', event.request.url);
console.log('[SW] Cached query:', cachedQuery);

// Add debug to amp-bind state
<pre [text]="'Query: ' + query + ', Results: ' + search.result.totalResults"></pre>

// Monitor amp-list loading
<amp-list on="fetch-error:AMP.setState({error: true})">
  <div [hidden]="!error">Error loading results!</div>
</amp-list>
```

## Reference Materials

### Official Documentation

- **AMP Blog Post**: `ontology-search/reference-files/_amp-site-search-introduction.pdf`
  - Original implementation guide by Jung von Matt
  - Explains architecture and component integration
  - Published February 14, 2020

- **Manual Restoration**: `ontology-search/reference-files/search-client.html`
  - Standalone working example
  - Uses frontend21 minified CSS
  - Complete AMP component setup
  - No external dependencies

### Key Code Locations

**Backend**:
- `platform/lib/routers/search.js` - Express routes
- `platform/lib/utils/googleSearch.js` - Google CSE wrapper
- `netlify/functions/search_do/` - Serverless search
- `netlify/functions/search_autosuggest/` - Autocomplete

**Frontend**:
- `frontend/templates/views/partials/search.j2` - Main template
- `frontend/scss/components/organisms/search.scss` - Styles (Gen 1)
- `frontend21/scss/components/search-trigger.scss` - Trigger (Gen 2)

**Service Worker**:
- `pages/static/serviceworker.js` - Cache handlers

**Configuration**:
- `platform/config/search-promoted-pages.json` - Highlights input
- `netlify/functions/search_autosuggest/component-versions.json` - Component list

### External Links

- **Deprecation Commit**: https://github.com/ampproject/amp.dev/commit/df1c26b9f569758075abaceae01a66ccb6ad79c3
- **Google Custom Search**: https://developers.google.com/custom-search
- **AMP Components**:
  - [amp-lightbox](https://amp.dev/documentation/components/amp-lightbox/)
  - [amp-list](https://amp.dev/documentation/components/amp-list/)
  - [amp-autocomplete](https://amp.dev/documentation/components/amp-autocomplete/)
  - [amp-bind](https://amp.dev/documentation/components/amp-bind/)

## Next Steps

### Immediate (Restoration)

1. **Follow Phase 1-6** restoration steps
2. **Test thoroughly** using test checklist
3. **Populate highlights** with curated content
4. **Document any issues** encountered

### Short Term (Improvements)

1. **Performance**:
   - Measure search latency
   - Optimize Service Worker caching strategy
   - Consider preloading popular queries

2. **UX Enhancements**:
   - Add "recent searches" feature
   - Implement "related searches"
   - Add keyboard shortcuts (/ to open search)

3. **Content**:
   - Curate better highlights per locale
   - Add seasonal/trending promoted pages
   - Include blog posts in highlights

### Long Term (Modernization)

1. **Third Generation CSS**:
   - Migrate from frontend/frontend21 to new system
   - Unified, maintainable CSS architecture
   - Component-based styling

2. **Search Engine Options**:
   - Consider alternatives to Google CSE (cost, limits)
   - Evaluate Algolia, ElasticSearch, or local indexing
   - Compare with ontology-search pattern (Wade.js)

3. **Integration**:
   - Unified search across site-search and ontology-search
   - Type filters (Component, Guide, Example, Blog)
   - Faceted search with tags/categories

## Comparison: Site-Search vs Ontology-Search

After restoration, you'll have two search systems:

| Feature | Site-Search | Ontology-Search |
|---------|-------------|-----------------|
| **Scope** | Entire website | Specific ontologies |
| **Engine** | Google Custom Search | Wade.js (local) |
| **Data** | Live web crawl | Static JSON |
| **Speed** | Network-dependent (100-500ms) | Sub-millisecond |
| **Cost** | API quota limits | Free |
| **Offline** | No | Yes |
| **Maintenance** | Low (Google indexes) | High (update JSONs) |
| **Freshness** | Hours (Google crawl) | Build time |
| **Query Quality** | Google ranking | Wade.js scoring |
| **Pagination** | Server-side (10/page) | Client-side (all) |
| **Persistence** | Service Worker cache | localStorage |
| **AMP Components** | Yes | No (vanilla JS) |

### When to Use Which

**Use Site-Search for**:
- General content discovery
- Finding guides, blog posts, documentation
- Users want Google-quality results
- Content changes frequently

**Use Ontology-Search for**:
- Curated datasets (playgrounds, components)
- Fast, instant filtering
- Offline-capable apps
- Full control over ranking

### Potential Unified Search

**Vision**: Combine both systems for best experience

```
User types query
     ↓
Search both systems in parallel:
  ├─ Ontology-Search: Fast results from curated data
  └─ Site-Search: Comprehensive results from Google CSE
     ↓
Merge and deduplicate results
     ↓
Display with type badges: [Component] [Guide] [Example]
```

## Questions for Implementation

When ready to restore, clarify:

1. **Which pages get search?**
   - All pages (restore to default layout)
   - Specific sections only
   - Gradual rollout

2. **CSS approach?**
   - Use existing frontend SCSS
   - Use frontend21 minified
   - Wait for third generation

3. **Service Worker scope?**
   - All pages or specific paths
   - Cache duration limits
   - Storage quota management

4. **Highlights content?**
   - How many components to promote
   - How to choose popular articles
   - Update frequency

5. **Analytics?**
   - Track search queries
   - Measure search success (clicks)
   - Monitor "no results" queries

6. **Locale support?**
   - All supported locales
   - Fallback strategy
   - Translation of UI strings

## Domain-Specific Dependencies

### Overview

Site-search contains several hardcoded domain references that must be identified and potentially configurable when deploying to different domains or environments.

### Critical Domain References

#### 1. Service Worker - AMP CDN Reference

**File**: `pages/static/serviceworker.js:1`

```javascript
importScripts('https://cdn.ampproject.org/sw/amp-sw.js');
```

**Impact**: High
**Type**: External CDN dependency
**Notes**:
- Not specific to amp.dev domain, but imports from ampproject.org CDN
- Required for AMP Service Worker functionality
- Should work for any AMP site using the standard SW library

#### 2. Google Custom Search Engine ID

**Files**:
- `platform/lib/utils/googleSearch.js:30`
- `netlify/functions/search_do/googleSearch.js:30`

```javascript
const CSE_ID = '014077439351665726204:s4tidjx0agu';
```

**Impact**: Critical
**Type**: Domain-specific configuration
**Notes**:
- This CSE ID is configured in Google Cloud Console to index amp.dev specifically
- Different domains will require their own CSE ID
- **Recommendation**: Move to environment variable `GOOGLE_CSE_ID` for configurability

**Suggested Refactor**:
```javascript
const CSE_ID = process.env.GOOGLE_CSE_ID || '014077439351665726204:s4tidjx0agu';
```

#### 3. Web App Manifest

**File**: `pages/static/manifest.json:2-3`

```json
{
  "name": "amp.dev",
  "short_name": "amp.dev"
}
```

**Impact**: Low
**Type**: Domain-specific branding
**Notes**:
- Affects PWA installation name
- Consider making configurable via build-time variable

#### 4. Content References (Throughout)

**Search Pattern**: `amp.dev` appears in 934 files (mostly content)

**Key Locations**:
- Documentation pages
- Example templates
- Configuration files
- README files

**Impact**: Medium
**Type**: Content and documentation
**Notes**:
- Most references are in documentation/examples (acceptable)
- Configuration files should be reviewed for build-time variables

### Audit Checklist for Domain Migration

When deploying to a new domain, verify:

- [ ] **Google CSE ID**: Update or make configurable
- [ ] **CSE API Key**: Ensure correct key for new domain's CSE
- [ ] **Web Manifest**: Update name/short_name
- [ ] **Content URLs**: Review any hardcoded amp.dev URLs in content
- [ ] **Service Worker**: Verify ampproject.org CDN accessible
- [ ] **Analytics**: Update tracking IDs if using Google Analytics
- [ ] **CORS Headers**: Ensure serverless functions allow new origin

### Environment Variables Required

**Production Deployment**:
```bash
GOOGLE_CSE_API_KEY=<your-api-key>           # Required (existing)
GOOGLE_CSE_ID=014077439351665726204:s4tidjx0agu  # Recommended (new)
DOMAIN_NAME=amp.dev                         # Optional (for manifest generation)
```

### Testing Domain Dependencies

```bash
# Search for hardcoded domain references
grep -r "amp\.dev" --include="*.js" --include="*.json" platform/ netlify/

# Check Google CSE configuration
curl "https://www.googleapis.com/customsearch/v1?cx=${GOOGLE_CSE_ID}&key=${GOOGLE_CSE_API_KEY}&q=test"

# Verify manifest
curl http://localhost:8080/manifest.json
```

## Label Migration: Google Custom Search → Google Programmable Search

### Background

Google rebranded **Google Custom Search Engine (CSE)** to **Google Programmable Search Engine (PSE/GPS)** in recent years.

### Current State

The codebase still uses "CSE" terminology throughout:

**Environment Variable**: `GOOGLE_CSE_API_KEY`

**Files Using CSE Label**:
- `platform/lib/utils/googleSearch.js:34` - `credentials.get('GOOGLE_CSE_API_KEY')`
- `netlify/functions/search_do/googleSearch.js:34` - Same pattern
- `HANDOFF_SITE_SEARCH_RESTORATION.md` - Documentation uses both CSE and GPS

**API Endpoints**:
```javascript
const CSE_BASE_URL = 'https://www.googleapis.com/customsearch/v1';
```

**Note**: The API endpoint URL still uses `/customsearch/v1` (Google hasn't changed this)

### Migration Strategy

#### Option 1: Keep CSE Label (Recommended for Restoration)

**Rationale**:
- Existing `.env.secrets` file already contains `GOOGLE_CSE_API_KEY`
- No breaking changes required
- API URL is still `/customsearch/v1`
- Focus on getting site-search working first

**Action**: No changes needed now

#### Option 2: Migrate to GPS Label (Future)

**Rationale**:
- Aligns with Google's current branding
- Clearer for new developers
- Modernizes codebase

**Changes Required**:
1. **Environment Variable**:
   ```bash
   # Old (current)
   GOOGLE_CSE_API_KEY=xxx

   # New (future)
   GOOGLE_PSE_API_KEY=xxx
   # or
   GOOGLE_PROGRAMMABLE_SEARCH_API_KEY=xxx
   ```

2. **Code Updates**:
   ```javascript
   // Update all files
   credentials.get('GOOGLE_PSE_API_KEY')

   // Maintain backwards compatibility
   credentials.get('GOOGLE_PSE_API_KEY') || credentials.get('GOOGLE_CSE_API_KEY')
   ```

3. **Configuration Files**:
   - Update `.env.example`
   - Update `.env.secrets`
   - Update documentation

4. **Documentation**:
   - Find/replace CSE → PSE/GPS in READMEs
   - Update HANDOFF guides

#### Option 3: Support Both (Backwards Compatible)

**Rationale**:
- Zero downtime migration
- Supports existing deployments
- Gradual transition

**Implementation**:
```javascript
// platform/lib/utils/googleSearch.js
const API_KEY = await credentials.get('GOOGLE_PSE_API_KEY')
  .catch(() => credentials.get('GOOGLE_CSE_API_KEY'));

if (!API_KEY) {
  throw Error('Missing Google Programmable Search key (GOOGLE_PSE_API_KEY or GOOGLE_CSE_API_KEY)');
}
```

### Verification During Live Testing

When testing site-search with `.env.secrets`:

1. **Check Variable Name**:
   ```bash
   grep "GOOGLE_" .env.secrets
   ```

2. **Test Both Names** (if implementing Option 3):
   ```javascript
   console.log('CSE Key:', process.env.GOOGLE_CSE_API_KEY);
   console.log('PSE Key:', process.env.GOOGLE_PSE_API_KEY);
   ```

3. **API Response Check**:
   - Google API doesn't care about label - same key works for both
   - Only internal code references need updating

### Recommendation

**For Site-Search Restoration**: Keep `GOOGLE_CSE_API_KEY` as-is
- Don't break existing configuration
- Document that CSE = GPS/PSE in comments
- Consider label migration as separate task after restoration

**Future Modernization**: Implement Option 3 (dual support) then deprecate CSE label

## Future Integration: Google Knowledge Graph (GKG)

### Overview

After site-search restoration, future enhancement opportunity exists to integrate **Google Knowledge Graph (GKG)** search for semantic/ontological queries based on schema.org structured data.

### Strategic Context

**Current Architecture**: Google Programmable Search (GPS)
- Full-text search across amp.dev content
- Returns page results with snippets
- Good for discovery and general queries

**Future Addition**: Google Knowledge Graph (GKG)
- Entity-based search
- Leverages JSON-LD structured data already in HTML pages
- Schema.org `@type` filtering (e.g., "Show all Article pages", "Show all HowTo pages")
- Different UX paradigm than text search

**Rationale for Staying in Google Ecosystem**:
1. **Integration Synergy**: GPS, GKG, and Google Analytics (GA) integrate seamlessly
2. **Unified Authentication**: Single API key/project for all services
3. **Data Consistency**: GKG can leverage same crawl data as GPS
4. **Analytics Integration**: GA can track both search types uniformly
5. **Cost Efficiency**: Bundled pricing, shared quotas

### Google Knowledge Graph Search API

**Documentation**: https://cloud.google.com/enterprise-knowledge-graph/docs/search-api

**Endpoint**:
```
https://kgsearch.googleapis.com/v1/entities:search?
```

**Authentication**: Requires API key (can use same project as GPS)

**Example Query**:
```bash
curl "https://kgsearch.googleapis.com/v1/entities:search?query=Taylor+Swift&key=YOUR_API_KEY&limit=1"
```

### Response Structure Differences

#### GPS Response Format
```json
{
  "items": [
    {
      "title": "Page Title",
      "link": "https://amp.dev/page",
      "snippet": "Text snippet...",
      "htmlSnippet": "<b>Formatted</b> snippet"
    }
  ],
  "searchInformation": {
    "totalResults": "1420"
  }
}
```

#### GKG Response Format
```json
{
  "itemListElement": [
    {
      "@type": "EntitySearchResult",
      "result": {
        "@type": "Thing",
        "name": "Entity Name",
        "description": "Entity description",
        "url": "https://...",
        "detailedDescription": {...}
      },
      "resultScore": 452.03
    }
  ]
}
```

**Key Difference**: Completely different JSON structure - cannot reuse GPS parsing logic

### Integration Architecture Considerations

#### Approach 1: Separate Search Endpoint (Recommended)

**Pattern**: Similar to `search-promoted-pages`

**New Files**:
```
platform/lib/routers/knowledge-graph.js      # Express router
netlify/functions/search_kg/                 # Serverless function
frontend/templates/views/partials/kg-search.j2  # Separate UI
```

**UI Approach**:
- Separate button/trigger for "Browse by Type"
- Different modal or section in search lightbox
- No autosuggest (GKG doesn't support real-time suggestions)
- Filter by schema.org `@type` (Article, HowTo, Recipe, etc.)

**Example UI**:
```html
<amp-list src="/search/knowledge-graph?type=Article">
  <template type="amp-mustache">
    <div class="kg-result">
      <h3>{{name}}</h3>
      <p>{{description}}</p>
      <a href="{{url}}">View {{@type}}</a>
    </div>
  </template>
</amp-list>
```

#### Approach 2: Unified Search Interface (Future)

**Pattern**: Single search box, tabbed results

```
┌─────────────────────────────────────┐
│  Search: [carousel____________]  🔍 │
├─────────────────────────────────────┤
│  [Text Results] [Entities] [Types]  │  ← Tabs
├─────────────────────────────────────┤
│  Results appear here...             │
└─────────────────────────────────────┘
```

**Implementation**:
- amp-bind state manages active tab
- amp-list with dynamic `[src]` binding
- Response adapter normalizes GPS vs GKG formats

### UX Considerations

#### No Autosuggest for GKG
**Reason**: GKG searches entities, not text completions

**Alternative UX**:
- **Type Selector**: Dropdown of schema.org types
  ```html
  <select on="change:AMP.setState({kgType: event.value})">
    <option value="Article">Articles</option>
    <option value="HowTo">How-To Guides</option>
    <option value="FAQPage">FAQs</option>
    <option value="VideoObject">Videos</option>
  </select>
  ```

- **Tag Cloud**: Visual selection of types
  ```html
  <div class="type-tags">
    <button on="tap:AMP.setState({kgType: 'Article'})">📄 Articles</button>
    <button on="tap:AMP.setState({kgType: 'HowTo'})">📖 Guides</button>
  </div>
  ```

#### Schema.org @type Filtering

**Available Types** (depends on JSON-LD in amp.dev pages):
- `Article` - Blog posts, news
- `HowTo` - Tutorial pages
- `FAQPage` - FAQ sections
- `WebPage` - General pages
- `SoftwareApplication` - Component docs
- `TechArticle` - Technical documentation

**Query Pattern**:
```
/search/knowledge-graph?type=Article&locale=en
```

**Backend Logic**:
```javascript
async function searchByType(type, locale) {
  const query = `site:amp.dev @type:${type}`;
  const response = await fetch(
    `https://kgsearch.googleapis.com/v1/entities:search?` +
    `query=${encodeURIComponent(query)}&` +
    `key=${API_KEY}&` +
    `languages=${locale}&` +
    `limit=50`
  );
  return await response.json();
}
```

### Implementation Phases

#### Phase 1: Research & Validation (Before Building)

1. **Audit JSON-LD Coverage**:
   ```bash
   # Check which pages have structured data
   grep -r "@type" pages/content/ | cut -d: -f2 | sort | uniq -c
   ```

2. **Test GKG API**:
   ```bash
   # Verify API works for amp.dev content
   curl "https://kgsearch.googleapis.com/v1/entities:search?query=site:amp.dev+carousel&key=$API_KEY"
   ```

3. **Analyze Results Quality**:
   - Does GKG return useful results for amp.dev?
   - How many entities does Google recognize?
   - Are schema.org types properly indexed?

#### Phase 2: Backend Implementation

1. **New Router**: `platform/lib/routers/knowledge-graph.js`
2. **Serverless Function**: `netlify/functions/search_kg/`
3. **Response Adapter**: Normalize GKG format to frontend-friendly JSON
4. **Caching**: Service Worker patterns for KG results

#### Phase 3: Frontend Integration

1. **New Partial**: Type-filtered search UI
2. **CSS**: Separate styles for entity cards
3. **amp-form**: Submit handler for type selection
4. **Testing**: UX testing for type filtering

#### Phase 4: Analytics Integration

**Track GKG Usage**:
```javascript
// Google Analytics events
{
  category: 'search',
  action: 'kg_type_filter',
  label: selectedType,  // "Article", "HowTo", etc.
}

{
  category: 'search',
  action: 'kg_result_click',
  label: entityUrl,
}
```

### Google Analytics Integration Notes

**For Both GPS and GKG**:

**Track Search Events**:
- Query submitted (text, type, source)
- Results displayed (count, latency)
- Result clicked (position, URL)
- Zero results (query logged for improvement)
- Search abandonment (query typed but not submitted)

**Implementation** (amp-analytics):
```html
<amp-analytics type="gtag">
  <script type="application/json">
  {
    "vars": {
      "gtag_id": "GA_MEASUREMENT_ID",
      "config": {
        "GA_MEASUREMENT_ID": {
          "groups": "default"
        }
      }
    },
    "triggers": {
      "searchQuery": {
        "on": "visible",
        "request": "event",
        "vars": {
          "event_name": "search",
          "event_category": "site_search",
          "event_label": "${query}",
          "search_term": "${query}"
        }
      }
    }
  }
  </script>
</amp-analytics>
```

**Benefits**:
- Identify popular queries → improve highlights
- Track conversion rate (search → page view)
- Compare GPS vs GKG effectiveness
- Monitor search health (errors, latency)

### Priority and Timing

**Current Priority**: ⏸️ Paused (Context Only)
- Focus on site-search restoration first
- GKG is future enhancement, not blocker

**When to Consider**:
- ✅ Site-search fully restored and stable
- ✅ GPS search working well with good UX
- ✅ JSON-LD coverage audited and sufficient
- ✅ User feedback indicates desire for type filtering

**Estimated Effort**:
- Backend: 2-3 days (router, serverless, adapter)
- Frontend: 3-4 days (UI, CSS, integration)
- Testing: 2 days (UX testing, analytics validation)
- **Total**: ~2 weeks for full GKG integration

### Alternatives Considered

**Why NOT alternative search engines** (per your guidance):

| Alternative | Pros | Cons |
|-------------|------|------|
| **Algolia** | Fast, good UX | ❌ Separate analytics integration |
| **ElasticSearch** | Full control | ❌ High maintenance, hosting costs |
| **Typesense** | Open source, fast | ❌ No GA integration, separate tracking |
| **Wade.js** | Already in use (ontology-search) | ❌ Local only, no cloud knowledge graph |

**Staying with Google GPS + GKG**:
- ✅ Unified authentication and billing
- ✅ Native GA integration
- ✅ Leverages existing Google infrastructure
- ✅ No additional maintenance burden
- ✅ Consistent analytics and reporting

### Questions for Future GKG Implementation

When ready to implement GKG:

1. **Scope**: All content types or specific sections?
2. **UX**: Separate interface or tabbed within site-search?
3. **Priority**: Which schema.org types to prioritize?
4. **Fallback**: What to show if GKG returns no results?
5. **Caching**: How long to cache type-filtered results?
6. **Localization**: Support all locales or English-first?

---

**Last Updated**: 2025-11-06
**Status**: ✅ Analysis complete, ready for restoration
**Restoration Priority**: High (just get it working)
**Modernization Priority**: Low (future phase)
