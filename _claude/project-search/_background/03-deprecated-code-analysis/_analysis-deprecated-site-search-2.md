# Deprecation Commit Analysis

**Commit:** df1c26b9f569758075abaceae01a66ccb6ad79c3
**Repository:** ampproject/amp.dev
**Author:** patrick kettner (patrickkettner@gmail.com)
**Date:** November 28, 2022, 17:45:43 UTC
**PR:** #6533
**Title:** Static production amp dev (#6533) - Static production amp dev updates (#6523)

## Executive Summary

This commit represents a major infrastructure refactor focused on static production deployment. While it added many new features and improvements, it also **removed critical search functionality from the AMP.dev website UI**, including the search trigger button, search partial template, and related UI components. The backend search API functions (`search_autosuggest` and `search_do`) were retained and enhanced with CORS headers but the user-facing search interface was completely removed.

## Statistics

- **Total Changes:** 1,090 lines
- **Additions:** 960 lines
- **Deletions:** 130 lines
- **Files Modified:** 70+ files

---

## Search-Related Changes

### 1. Search UI Components REMOVED

#### 1.1 Search Partial Template Removed

**Files Modified:**
- `frontend/templates/layouts/default.j2:114-115`
- `frontend21/amp-dev.ejs:117-118`

**What Was Removed:**
```jinja2
{% include 'views/partials/search.j2' %}
```

**Impact:** The complete search partial template was removed from both the main layout (`default.j2`) and the 2021 frontend layout (`amp-dev.ejs`). This means the entire search overlay/lightbox component is no longer included in the page templates.

**Deprecation Status:** ⛔ **COMPLETELY REMOVED** - No search UI exists in the main layouts

---

#### 1.2 Search Trigger Button - 2021 Header

**File:** `frontend/templates/views/2021/partials/header.j2:89-101`

**What Was Removed:**
```jinja2
{% do doc.icons.useIcon('/icons/magnifier.svg') %}
<button id="searchTriggerOpen"
    class="ap-search-trigger"
    on="tap:searchLightbox"
    role="button"
    aria-label="{{ _('Search') }}"
    tabindex="0">
  <div class="ap-icon ap-search-trigger-icon">
    <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#magnifier"></use></svg>
  </div>
</button>
```

**Component Details:**
- **ID:** `searchTriggerOpen`
- **CSS Class:** `ap-search-trigger`
- **Icon:** `/icons/magnifier.svg`
- **AMP Event:** `tap:searchLightbox` (opens search lightbox overlay)
- **Accessibility:** ARIA label for screen readers
- **Location:** Header navigation area (2021 design)

**Deprecation Status:** ⛔ **COMPLETELY REMOVED**

---

#### 1.3 Search Trigger Button - Legacy Header

**File:** `frontend/templates/views/partials/header.j2:95-103`

**What Was Removed:**
```jinja2
{% do doc.styles.addCssFile('/css/components/molecules/search-trigger.css') %}
{% do doc.icons.useIcon('/icons/magnifier.svg') %}
<div id="searchTriggerOpen" class="ap-m-search-trigger" on="tap:searchLightbox" role="button" aria-label="{{ _('Search') }}"  tabindex="0">
  <div class="ap-a-ico ap-m-search-trigger-icon">
    <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#magnifier"></use></svg>
  </div>
</div>
```

**Component Details:**
- **ID:** `searchTriggerOpen`
- **CSS Class:** `ap-m-search-trigger` (BEM: molecule-level component)
- **CSS File:** `/css/components/molecules/search-trigger.css`
- **Icon Class:** `ap-a-ico` (atomic icon component)
- **Icon:** `/icons/magnifier.svg`
- **AMP Event:** `tap:searchLightbox`
- **Accessibility:** ARIA label for screen readers, keyboard accessible (tabindex="0")
- **Location:** Header navigation area (legacy design)

**Deprecation Status:** ⛔ **COMPLETELY REMOVED**

---

#### 1.4 Search Component on About Page

**File:** `pages/content/amp-dev/about/websites-2021.html:111-123`

**What Was Removed:**
Approximately 13 lines of search-related HTML content from the "Grab-and-go components" section of the About/Websites page.

**Deprecation Status:** ⛔ **COMPLETELY REMOVED**

---

### 2. Search Backend Functions MODIFIED (NOT REMOVED)

#### 2.1 Search Autosuggest Function

**File:** `netlify/functions/search_autosuggest/search_autosuggest.js:33`

**Change Type:** ✅ **ENHANCEMENT** - CORS header added

**What Changed:**
```javascript
// ADDED:
'Access-Control-Allow-Origin': ev.headers?.origin || '',
```

**Function Details:**
- **Endpoint:** `/search/autosuggest`
- **Purpose:** Provides autocomplete suggestions for search queries
- **Status:** Still active and functional
- **Enhancement:** Added CORS support for cross-origin requests
- **Cache Control:** Uses `RESPONSE_MAX_AGE.autosuggest` with immutable cache

**Deprecation Status:** ✅ **ACTIVE & ENHANCED**

---

#### 2.2 Search Do Function

**File:** `netlify/functions/search_do/search_do.js:108-203`

**Change Type:** ✅ **BUG FIX & ENHANCEMENT**

**What Changed:**

1. **Bug Fix (Line 111):**
```javascript
// BEFORE:
const searchQuery = ev.searchQueryStringParameters;

// AFTER:
const searchQuery = ev.queryStringParameters;
```
Fixed incorrect parameter name to properly access query string parameters.

2. **CORS Headers Added (Lines 147, 165, 206):**
```javascript
'Access-Control-Allow-Origin': ev.headers?.origin || '',
```
Added CORS support to all three response paths (success, error, results).

**Function Details:**
- **Endpoint:** `/search/do`
- **Purpose:** Performs actual search queries and returns results
- **Parameters:**
  - `locale` (default: `DEFAULT_LOCALE`)
  - `page` (default: 1)
  - `query` (search term)
- **Response Types:**
  - Success (200) - Returns search results
  - Error (500) - Returns error message
  - Empty results (200) - Returns empty result set
- **Cache Control:** Uses `RESPONSE_MAX_AGE.search` with immutable cache

**Deprecation Status:** ✅ **ACTIVE & ENHANCED**

---

#### 2.3 Latest Query Function

**File:** `netlify/functions/latest-query/latest-query.js`

**Change Type:** ✅ **ENHANCEMENT** - CORS header added (based on pattern)

**Function Details:**
- **Endpoint:** `/search/latest-query`
- **Purpose:** Returns the most recent search query
- **Status:** Still active

**Deprecation Status:** ✅ **ACTIVE & ENHANCED**

---

### 3. Example Search Functions ADDED/ENHANCED

These are example/demo functions for AMP component documentation, not the main site search:

#### 3.1 Autosuggest Search List

**Files:**
- `netlify/functions/examples_api_autosuggest_search_list/autosuggest.js` (NEW - 111 lines added)
- `netlify/functions/examples_api_autosuggest_search_list/examples_api_autosuggest_search_list.js` (MODIFIED)

**Purpose:** Example implementation for amp-autocomplete component documentation

**Deprecation Status:** ✅ **NEW ADDITION**

---

#### 3.2 Paged List Search

**Files:**
- `netlify/functions/examples_interactivity_dynamic_content_pages_list_search/examples_interactivity_dynamic_content_pages_list_search.js` (NEW - 61 lines added)

**Purpose:** Example implementation for paginated list with search functionality

**Redirect Added:**
```toml
from = "/documentation/examples/interactivity-dynamic-content/paged_list/search"
to = "/.netlify/functions/examples_interactivity_dynamic_content_pages_list_search"
```

**Deprecation Status:** ✅ **NEW ADDITION**

---

### 4. Files/Resources Referenced (Status Unknown)

These files were referenced in the removed code but their status is not shown in this commit:

#### 4.1 Search Partial Template
- **Path:** `views/partials/search.j2`
- **Status:** ⚠️ **UNKNOWN** - May still exist but is no longer included in layouts
- **Purpose:** Likely contained the search lightbox/overlay UI with input field and results display

#### 4.2 Search Trigger CSS
- **Path:** `/css/components/molecules/search-trigger.css`
- **Status:** ⚠️ **UNKNOWN** - May be orphaned
- **Purpose:** Styling for the search trigger button in legacy header

#### 4.3 Magnifier Icon
- **Path:** `/icons/magnifier.svg`
- **Status:** ⚠️ **UNKNOWN** - May still be used elsewhere
- **Purpose:** Search icon SVG graphic

---

## Configuration Changes Related to Search

### Netlify Configuration

**File:** `netlify/configs/amp.dev/netlify.toml`

#### Search Endpoint Redirects (RETAINED)

```toml
[[redirects]]
  from = "/search/latest-query"
  to = "/.netlify/functions/latest-query"
  status = 200

[[redirects]]
  from = "/search/autosuggest"
  to = "/.netlify/functions/search_autosuggest/search_autosuggest.js"
  status = 200  # ← Status code added

[[redirects]]
  from = "/search/do"
  to = "/.netlify/functions/search_do/search_do.js"
  status = 200  # ← Status code added
```

**Status:** ✅ **RETAINED & ENHANCED** - Search API endpoints still accessible

#### CSP Report Endpoint (REMOVED)

```toml
# REMOVED:
[[redirects]]
  from = "/csp-report"
  to = "/.netlify/functions/csp-report"
  status = 200
```

**Related File Deleted:**
- `netlify/functions/csp-report/csp-report.js` (14 lines deleted)

**Function Code That Was Removed:**
```javascript
const handler = async (ev) => {
  if (ev.httpMethod !== 'POST') {
    return {statusCode: 405, body: 'Method Not Allowed'};
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/csp-report',
    },
  };
};

module.exports = {handler};
```

**Impact:** CSP (Content Security Policy) violation reporting endpoint removed. This was likely used for security monitoring.

**Deprecation Status:** ⛔ **COMPLETELY REMOVED**

---

## Other Non-Search Related Changes

### CORS Headers Enhancement

Added CORS headers to 40+ API functions across the codebase:
```javascript
'Access-Control-Allow-Origin': ev.headers?.origin || ''
'Access-Control-Allow-Credentials': 'true' // where applicable
```

**Affected Function Categories:**
- amp-access (authorization, login, logout, submit)
- amp-consent (get_consent, get_consent_server_side)
- amp-form (submit, verify)
- autosuggest (address, characters, cities, search_list)
- cache (invalid_amp, not_found, query, redirect, server_error)
- API utilities (echo, hello, photo_stream, products, time)
- slow_response endpoints
- interactivity examples (favorite_button, star_rating)

### GitHub Actions Updates

All workflow files upgraded from `actions/cache@v2` to `actions/cache@v3`:
- check-grow-link-integrity.yaml
- lint-js.yaml
- lint-yaml.yaml
- release-production.yaml
- release-staging.yaml
- release-static-production.yml
- test-grow-extensions.yaml
- test-pixi.yaml
- test-platform.yaml
- test-playground.yaml

### Netlify Configuration Enhancements

**Global Headers Added:**
```toml
Access-Control-Allow-Origin="*"
Cache-Control="public,max-age=604800,stale-while-revalidate=86400"
```

**160+ New Redirects Added** for legacy URL mapping, including:
- `/webvitals` → `https://web.dev/measure/` (302)
- `/web-vitals` → `https://web.dev/measure/` (302)
- `/pageexperience` → `https://web.dev/measure/` (302)
- `/vitals` → `https://web.dev/measure/` (302)
- `/ads` → `/about/ads/` (302)
- `/amp-optimizer` → `/documentation/guides-and-tutorials/optimize-and-measure/amp-optimizer-guide/` (302)
- `/docs` → `/documentation/guides-and-tutorials/` (302)

### Build System Changes

**File:** `gulpfile.js/build.js`

1. **SVG Optimization Enhancement (Line 529):**
   - Added file path parameter to optimize function call
   - Improved error context for SVG processing

2. **Static Collection Enhancement (Line 736):**
   - Added collection of inline-examples documentation:
   ```javascript
   await gulp
     .src(`${project.paths.DIST}/inline-examples/documentation**/**/*`)
     .pipe(gulp.dest(`${project.paths.DIST}/examples/sources/`));
   ```

**File:** `gulpfile.js/staticify.js`

- Integrated `htmlContent` helper from `cheerioHelper`
- Improved HTML processing for static file generation
- Enhanced rendering of tool pages with proper pill navigation

### Frontend Fixes

**File:** `examples/source/interactivity-dynamic-content/ComboBox.html:63`

**CSS Fix:**
```css
/* BEFORE: */
background-position-x: -2px;

/* AFTER: */
background-position: -2px, 0;
```

Fixed improper use of `background-position-x` to standard `background-position` shorthand.

---

## Key Findings

### 🔴 Critical Deprecations

1. **Search UI Completely Removed:**
   - No search trigger button in header
   - No search partial/lightbox component
   - Users cannot perform site search via UI

2. **CSP Reporting Disabled:**
   - Content Security Policy violation monitoring removed
   - Security observability reduced

### 🟢 Retained Functionality

1. **Search API Backend Still Active:**
   - `/search/do` - Main search endpoint
   - `/search/autosuggest` - Autocomplete endpoint
   - `/search/latest-query` - Recent query tracking
   - All enhanced with CORS support

2. **Example/Documentation Functions:**
   - New example implementations added for amp-autocomplete
   - Demo search functionality for component documentation

### ⚠️ Unclear Status

1. **Search Partial Template File:**
   - `views/partials/search.j2` existence unclear
   - May contain additional components and logic

2. **Search-Related CSS:**
   - `/css/components/molecules/search-trigger.css` may be orphaned
   - Possible unused styles remaining

3. **Search State Management:**
   - Unknown if `searchLightbox` AMP component/state still exists
   - May have related JavaScript/AMP-bind logic

---

## Migration Impact Analysis

### For Site Users
- ⛔ **NO SEARCH CAPABILITY** - Users cannot search the site via the UI
- Alternative: Must use external search (Google site search) or browse navigation

### For Developers
- ✅ Search APIs still functional for programmatic access
- ✅ Can implement custom search UI that calls existing backends
- ⚠️ Need to understand search.j2 template structure (not visible in this commit)

### For Restoration Efforts

**To restore search functionality, you would need:**

1. **UI Components:**
   - Restore `{% include 'views/partials/search.j2' %}` in layouts
   - Restore search trigger buttons in headers
   - Verify `views/partials/search.j2` exists and is functional

2. **Assets:**
   - Ensure `/css/components/molecules/search-trigger.css` exists
   - Ensure `/icons/magnifier.svg` exists
   - Check for any JavaScript dependencies

3. **AMP Components:**
   - Verify `searchLightbox` component/state is configured
   - Check AMP-bind state management
   - Ensure proper event handling (`tap:searchLightbox`)

4. **Testing:**
   - Test search query input
   - Test autosuggest functionality
   - Test search results display
   - Test responsive behavior
   - Test keyboard accessibility

---

## Architectural Observations

### Search Architecture (Pre-Removal)

Based on the removed code, the search system used:

1. **Frontend Layer:**
   - Trigger button in header (magnifier icon)
   - AMP lightbox overlay component for search UI
   - AMP events for interaction (`tap:searchLightbox`)
   - Responsive CSS (BEM methodology)

2. **Backend Layer:**
   - Serverless functions on Netlify
   - Separate endpoints for search and autocomplete
   - JSON responses with CORS support
   - Caching strategy (immutable with max-age)

3. **Integration:**
   - Nunjucks/Jinja2 templates
   - AMP framework for interactivity
   - Netlify redirects for API routing

### Search System Flow

```
User clicks magnifier icon (searchTriggerOpen)
         ↓
AMP event: tap:searchLightbox
         ↓
Search lightbox opens (from search.j2 partial)
         ↓
User types query
         ↓
Autocomplete: /search/autosuggest
         ↓
User submits search
         ↓
Search execution: /search/do?query=...&locale=...&page=...
         ↓
Results displayed in lightbox
```

---

## Related Documentation Needs

To fully understand the search deprecation, investigate:

1. **search.j2 Partial Template:**
   - Location: `frontend/templates/views/partials/search.j2`
   - Contains: Search input, results display, AMP configuration

2. **Search CSS:**
   - `/css/components/molecules/search-trigger.css`
   - `/css/components/[search-related-styles]`

3. **AMP Components Used:**
   - `amp-lightbox` configuration
   - `amp-state` for search state
   - `amp-list` for results display (likely)
   - `amp-autocomplete` for suggestions

4. **Search Implementation:**
   - Backend search provider (Algolia? Custom?)
   - Index structure and data source
   - Locale/internationalization handling

5. **Historical Context:**
   - Why was search removed in this "static production" update?
   - Was search replaced with alternative navigation?
   - Performance or cost considerations?

---

## Questions for Stakeholders

1. **Was the search removal intentional or accidental?**
   - Commit message doesn't mention search removal
   - No deprecation notice or migration guide

2. **What is the current search strategy?**
   - External search engine?
   - Planned replacement?
   - Navigation-only approach?

3. **Are the backend APIs still maintained?**
   - search_do and search_autosuggest still deployed
   - Are they being used by other properties?

4. **Should search be restored?**
   - User feedback on missing search?
   - Alternative solutions implemented?
   - Resource constraints?

---

## Recommendations

### Immediate Actions

1. ✅ **Verify API Status:**
   - Test `/search/do` and `/search/autosuggest` endpoints
   - Ensure they still return valid results
   - Confirm search index is still being updated

2. ✅ **Document Missing Files:**
   - Locate and document `search.j2` template
   - Identify all search-related CSS files
   - Catalog search JavaScript/AMP-bind logic

3. ✅ **Assess User Impact:**
   - Review analytics for search usage (pre-removal)
   - Gather user feedback on missing search
   - Evaluate navigation effectiveness as alternative

### Restoration Plan (If Needed)

1. **Phase 1: Template Recovery**
   - Recover `search.j2` from git history (pre-df1c26b)
   - Restore search trigger buttons in headers
   - Re-include search partial in layouts

2. **Phase 2: Asset Verification**
   - Verify CSS files exist and are functional
   - Confirm icon SVGs are available
   - Test responsive layouts

3. **Phase 3: Functionality Testing**
   - Test search input and submission
   - Verify autocomplete works
   - Check result display and pagination
   - Test locale switching
   - Verify keyboard navigation

4. **Phase 4: Enhancement**
   - Update search UI for accessibility improvements
   - Add mobile optimizations
   - Consider search analytics integration

### Alternative Approaches

1. **External Search Widget:**
   - Google Custom Search
   - Algolia DocSearch
   - Reduces maintenance burden

2. **Modern Search UI:**
   - Rebuild with modern framework (React/Vue)
   - Improve UX based on current best practices
   - Keep existing backend APIs

3. **Navigation Enhancement:**
   - Improve site navigation as search alternative
   - Add breadcrumbs and site map
   - Enhance documentation structure

---

## Conclusion

Commit df1c26b9f569758075abaceae01a66ccb6ad79c3 removed all user-facing search functionality from the AMP.dev website while retaining and enhancing the backend search API. This appears to be a side effect of a larger infrastructure refactor focused on static site generation and production optimization.

The search backend remains functional and could support a restored or replacement search UI. However, the removal has left the site without any built-in search capability for end users.

**Key Takeaway:** This was primarily an infrastructure/deployment commit with search UI removal as a secondary (possibly unintended) consequence. The search system architecture remains viable at the API level.
