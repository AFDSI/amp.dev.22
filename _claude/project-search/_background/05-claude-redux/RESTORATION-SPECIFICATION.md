# AMP.DEV Search Functionality - Restoration Specification

**Document Version:** 1.0
**Date:** 2025-10-30
**Status:** Draft - Ready for Phase A Implementation

---

## PHASE A - VERIFIED WORKING COMPONENTS (Previously Tested Successfully)

This phase focuses on restoring the search UI, autosuggest, and highlights features that were successfully implemented and tested in previous work.

### 1. Search UI Components (Working)

The following UI components have been verified to work correctly:

- **Modal overlay with amp-lightbox** - Full-screen search interface
- **Search input field with styling** - Responsive text input with proper focus states
- **Autocomplete dropdown** - Dynamic suggestion list display
- **Results display layout** - Card-based layout for search results
- **Error states and empty states** - Proper messaging for no results or errors

### 2. Client-Side Autosuggest (Working)

Component name suggestion system that operates independently of Google CSE:

- **Endpoint:** `/search/autosuggest`
- **Data source:** Local component list (no Google CSE needed)
- **Functionality:** Dropdown filtering and selection based on user input
- **Response format:** JSON array of component suggestions

**Implementation Details:**
- Filters AMP component names as user types
- No external API dependencies
- Fast client-side interaction
- Keyboard navigation support (arrow keys, enter, escape)

### 3. Highlights/Promoted Content (Working)

Featured components and popular articles displayed before user enters a query:

- **Endpoint:** `/search/highlights?locale=X`
- **Build requirement:** Requires Grow extension to build JSON files
- **Display behavior:** Default content shown on search modal open
- **Content types:** Featured components, popular articles, getting started guides

**Configuration:**
- Managed via `platform/config/search-promoted-pages.json`
- Built by `extract_highlights_info` Grow extension
- Generated at build time per locale

### 4. File Restoration Checklist for Phase A

**Source Directory:** `~/repos/amp/amp.dev.20-search/docs/removed-code/`
**Destination Directory:** `~/repos/amp/amp.dev.20/`

#### Frontend/ (Primary - BEM System)

**SCSS Files:**
```
frontend/scss/components/organisms/search.scss           (419 lines - FULL FILE)
frontend/scss/components/organisms/search-trigger.scss   (Button styling)
```

**Template Files:**
```
frontend/templates/views/partials/search.j2              (Search modal markup)
```

**Icon Files:**
```
frontend/icons/magnifier.svg                              (Search trigger icon)
frontend/icons/internal.svg                               (Result type indicator)
frontend/icons/close.svg                                  (Close modal button)

OR (alternative location):
frontend/templates/assets/icons/magnifier.svg
frontend/templates/assets/icons/internal.svg
frontend/templates/assets/icons/close.svg
```

**Integration Files (Modifications Required):**
```
frontend/templates/views/partials/header.j2              (Add search trigger button)
```

#### Frontend21/ (Secondary - Webpack System)

**SCSS Files:**
```
frontend21/scss/components/organisms/search-trigger.scss (Already exists, may need update)
```

**Note:** Frontend21 can import search organism from frontend/ via existing import patterns, or receive a ported copy for independence.

#### Backend Files

**Grow Extension:**
```
pages/extensions/extract_highlights_info/               (Complete directory)
  ├── extract_highlights_info.py
  └── (supporting files)
```

**Configuration:**
```
platform/config/search-promoted-pages.json              (Highlights content list)
```

**API Router:**
```
platform/lib/routers/search-router.js                   (Already present, verify endpoints)
```

**Utilities:**
```
platform/lib/utils/googleSearch.js                      (Already present, Phase B)
```

### 5. Integration Points for Phase A

#### A. Header Modifications

**File:** `frontend/templates/views/partials/header.j2`

Add search trigger button with appropriate classes and icon:

```jinja2
<button class="ap-o-header-search-trigger"
        on="tap:search-lightbox.open"
        aria-label="Open search">
  {% do doc.icons.useIcon('icons/magnifier.svg') %}
  <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#magnifier"></use></svg>
</button>
```

#### B. Template Inclusions

**File:** Main layout template (likely `base.j2` or similar)

Include search partial before closing `</body>` tag:

```jinja2
{% include 'views/partials/search.j2' %}
```

#### C. CSS Compilation

Ensure SCSS files are compiled via Gulp:

- `frontend/scss/components/organisms/search.scss` → `dist/css/`
- `frontend/scss/components/organisms/search-trigger.scss` → `dist/css/`

**Verify import statements** in main SCSS manifest files include:
```scss
@import 'components/organisms/search';
@import 'components/organisms/search-trigger';
```

#### D. Icon Registration

Icons must be registered in the appropriate icon manifest or used inline via `doc.icons.useIcon()`.

Verify icon paths match actual file locations in frontend structure.

### 6. Testing Strategy for Phase A

#### Development Environment

**Command:** `npm run develop`

**Benefits:**
- Fast iteration cycle
- Live reload on file changes
- No full build required
- Rapid UI/UX testing

#### Test Cases

**6.1 Search Trigger Button**
- [ ] Button appears in header
- [ ] Icon displays correctly
- [ ] Click/tap opens search modal
- [ ] Mobile responsive sizing

**6.2 Search Modal**
- [ ] Modal opens with full-screen overlay
- [ ] Input field has focus on open
- [ ] Close button works
- [ ] Escape key closes modal
- [ ] Click outside closes modal (if desired)

**6.3 Autosuggest Functionality**
- [ ] Type "amp-" → suggestions appear
- [ ] Suggestions filter as user types more
- [ ] Arrow keys navigate suggestions
- [ ] Enter key selects suggestion
- [ ] Click/tap selects suggestion
- [ ] Selected suggestion populates input

**6.4 Highlights Loading**
- [ ] Highlights display on modal open (before query)
- [ ] Default locale content loads
- [ ] Multiple highlights render correctly
- [ ] Links work correctly

**6.5 UI Responsiveness**
- [ ] Desktop layout (1200px+)
- [ ] Tablet layout (768px-1199px)
- [ ] Mobile layout (320px-767px)
- [ ] Orientation changes handled

**6.6 Keyboard Navigation**
- [ ] Tab order is logical
- [ ] All interactive elements keyboard-accessible
- [ ] Screen reader support (aria labels)

**6.7 Error States**
- [ ] Empty state message displays correctly
- [ ] Network error handled gracefully
- [ ] Invalid input handled

---

## PHASE B - BACKEND SEARCH INTEGRATION (KNOWN ISSUE - REQUIRES INVESTIGATION)

This phase addresses the non-functional backend search integration with Google Custom Search.

### 1. Known Working Status

✅ **Google Programmable Search API is operational**
- API is accessible and responding
- Tested in standalone GPS test environment
- Can retrieve search results via direct API calls
- API key and CSE ID are valid

### 2. Known NOT Working

❌ **Backend Integration Points:**
- `/search/do?q=query&locale=en` endpoint returns errors or no results
- Backend integration that binds autosuggest terms to search index
- Connection between amp.dev search UI and Google Custom Search
- Query submission from UI → Backend → Google CSE → Results display

### 3. Technical Analysis

#### Current Implementation

**File:** `platform/lib/routers/search-router.js:22`

```javascript
const googleSearch = require('../utils/googleSearch');
```

**File:** `platform/lib/utils/googleSearch.js`

This utility handles:
- API key configuration
- CSE ID configuration
- Query formatting
- Result parsing

#### Required Configuration

**Environment Variables Needed:**
```bash
GOOGLE_CSE_ID=your_custom_search_engine_id
GOOGLE_CSE_API_KEY=your_api_key
```

**Configuration Points:**
- Environment variable loading (`.env` file or Netlify environment)
- API endpoint configuration
- Rate limiting and caching
- Error handling and fallbacks

### 4. Investigation Required

Before Phase B implementation, the following must be clarified:

#### 4.1 Configuration Discovery
- [ ] Where are environment variables configured?
- [ ] Is there a `.env.example` or configuration template?
- [ ] Are API keys stored in Netlify environment variables?
- [ ] What is the correct CSE ID for amp.dev?

#### 4.2 Search Index Architecture
- [ ] How is the search index populated?
- [ ] What content is indexed (components, docs, guides)?
- [ ] How often is the index updated?
- [ ] Are there separate indexes per locale?

#### 4.3 Query Mapping
- [ ] How do autosuggest terms map to searchable content?
- [ ] Are component names indexed as separate entities?
- [ ] How are articles/guides categorized?
- [ ] Is there a taxonomy or tagging system?

#### 4.4 Authentication & Authorization
- [ ] API key rotation policy
- [ ] Rate limiting configuration
- [ ] Cost monitoring setup
- [ ] CORS configuration for API calls

#### 4.5 Result Processing
- [ ] How are results ranked/sorted?
- [ ] What metadata is available per result?
- [ ] How are results categorized (Components vs Articles)?
- [ ] Pagination implementation

### 5. Phase B Deferred Until

**Prerequisites for Phase B Start:**
- ✅ Phase A is fully functional and tested
- ⏳ Google Custom Search integration architecture is documented
- ⏳ Missing configuration/code is identified
- ⏳ Clear implementation path is established
- ⏳ Test environment for backend search is available

**Decision Point:** After Phase A completion, assess whether to:
1. Fix existing backend integration
2. Replace with alternative search solution (Algolia, Typesense, etc.)
3. Implement client-side search with pre-built index

---

## DUAL FRONTEND RESTORATION (Both frontend/ and frontend21/)

### 1. Why Both Frontends?

**Strategic Reasons:**
- **Complete dependency tree visible** - Understand full import chain
- **Independent testing** - Verify both systems work correctly
- **Clear understanding for future pruning** - Prepare for abc.dev migration
- **Frontend21 imports BEM from frontend/** - Currently coupled, should be decoupled

**Current State:**
- Frontend/ is the primary BEM-based system
- Frontend21/ is the newer Webpack-based system
- Frontend21 imports some components from frontend/ (not ideal)

**Goal:**
- Restore search to both systems
- Document all dependencies
- Enable future decoupling or pruning

### 2. Frontend/ Restoration (Primary - BEM System)

**Full Implementation Required:**

```
frontend/scss/components/organisms/
  ├── search.scss              (419 lines - complete file)
  └── search-trigger.scss      (Button styles)

frontend/templates/views/partials/
  └── search.j2                (Complete AMP component markup)

frontend/icons/
  ├── magnifier.svg
  ├── internal.svg
  └── close.svg
```

**Integration:**
- Add search trigger to header.j2
- Import SCSS in main manifest
- Register icons in icon system
- Include search.j2 partial in base layout

**Build Output:**
- Compiled CSS in `dist/css/`
- Processed templates for Grow rendering

### 3. Frontend21/ Restoration (Secondary - Webpack System)

**Current State:**
```
frontend21/scss/components/organisms/
  └── search-trigger.scss      (Already exists)
```

**Options:**

**Option A: Import from Frontend/ (Current Pattern)**
```scss
// In frontend21 main SCSS
@import '../../../frontend/scss/components/organisms/search';
```
- Pros: Less duplication, single source of truth
- Cons: Maintains coupling, harder to prune later

**Option B: Port to Frontend21/ (Independence)**
```
frontend21/scss/components/organisms/
  ├── search.scss              (Ported from frontend/)
  └── search-trigger.scss      (Update existing)
```
- Pros: Decoupled, easier to prune frontend/ later
- Cons: Duplication, must maintain two versions

**Recommendation:** Start with Option A for Phase A, plan Option B for future decoupling.

### 4. Testing Both Frontends

**Development Server:**
```bash
npm run develop
```
- Should serve both frontend/ and frontend21/ assets
- Test on pages using each frontend

**Validation:**
- Search works on pages using frontend/ templates
- Search works on pages using frontend21/ templates
- Consistent behavior across both

---

## CRITICAL BUG FIX REQUIRED

### URL Format Bug in search.j2

**Location:** `frontend/templates/views/partials/search.j2`

**Problem:** Lines 59 and 61 reference static JSON files, but the backend serves a dynamic endpoint.

#### Current Code (WRONG):
```jinja2
{# Line 59 #}
<amp-list src='{{ base_url }}/search/highlights/{{ doc.locale }}.json'
          ...>

{# Line 61 #}
<amp-state id="search-highlights"
           src='{{ base_url }}/search/highlights/{{ doc.locale }}.json'>
```

#### Corrected Code:
```jinja2
{# Line 59 #}
<amp-list src='{{ base_url }}/search/highlights?locale={{ doc.locale }}'
          ...>

{# Line 61 #}
<amp-state id="search-highlights"
           src='{{ base_url }}/search/highlights?locale={{ doc.locale }}'>
```

**Explanation:**
- Template expects: `/search/highlights/en.json` (static file)
- Backend serves: `/search/highlights?locale=en` (dynamic endpoint with query parameter)
- Fix: Change URL format from path-based to query-parameter-based

**Impact:**
- Without fix: Highlights will not load, 404 errors
- With fix: Highlights load correctly from backend endpoint

**Verification:**
```bash
# Test endpoint manually
curl http://localhost:8080/search/highlights?locale=en
```

---

## BUILD AND DEPLOYMENT

### 1. Development Testing

**Command:**
```bash
npm run develop
```

**Use Cases:**
- Phase A testing (UI, autosuggest, highlights)
- Fast iteration cycle
- Live reload for CSS and template changes
- No full build required

**Benefits:**
- 2-5 second restart time vs. 37-minute full build
- Rapid UI/UX iteration
- Immediate feedback on changes

**Limitations:**
- May not reflect production build optimizations
- Some Grow extensions may not run in develop mode
- Not suitable for final validation

### 2. Production Build (When Ready)

**Command:**
```bash
SKIP_OPTIMIZE=1 NODE_ENV=local npm run build:local --locales en
```

**Duration:** ~37 minutes

**Required For:**
- Final validation before deployment
- Grow extension execution (highlights generation)
- Production asset optimization
- Testing production-like environment

**Build Stages:**
1. Grow extension execution
2. SCSS compilation
3. JavaScript bundling
4. Template processing
5. Asset optimization
6. Output to `dist/`

**Validation:**
```bash
# Serve built site
npm run serve:local

# Test at http://localhost:8080
# Verify all search features work in production build
```

### 3. Deployment Considerations

**Netlify Deployment:**
- Build command configured in `netlify.toml`
- Environment variables set in Netlify dashboard
- Redirects for `/search/*` endpoints in `_redirects` or `netlify.toml`

**Pre-Deployment Checklist:**
- [ ] Phase A features tested in production build
- [ ] All assets compile without errors
- [ ] No console errors in browser
- [ ] Mobile and desktop layouts verified
- [ ] Accessibility validated
- [ ] Performance metrics acceptable

---

## ROLLBACK PLAN

### Clean Working Environment

**Current Setup:**
- `amp.dev.20` - Clean clone for restoration work
- `amp.dev.20-search` - Analysis workspace (preserved)
- `amp.dev.4`, `amp.dev.8` - Working systems (untouched)

### Rollback Strategy

**If Restoration Fails:**

```bash
cd ~/repos/amp
rm -rf amp.dev.20
git clone https://github.com/ampproject/amp.dev.git amp.dev.20
```

**Recovery Time:** ~2-5 minutes (depending on network speed)

**No Risk To:**
- Production systems
- Other working clones
- Analysis workspace
- Git commit history

### Checkpoint Strategy

**Create Git Branches for Checkpoints:**

```bash
cd ~/repos/amp/amp.dev.20
git checkout -b restore-search-phase-a-start
# ... make changes ...
git add .
git commit -m "Phase A: Restore search UI and autosuggest"

git checkout -b restore-search-phase-a-complete
# ... test and verify ...
git commit -m "Phase A: Complete and tested"
```

**Benefits:**
- Easy rollback to any checkpoint
- Compare changes between phases
- Cherry-pick specific changes if needed

---

## DEPENDENCIES AND PREREQUISITES

### 1. Grow Extension for Highlights

**Required Files:**
```
pages/extensions/extract_highlights_info/
  ├── extract_highlights_info.py
  ├── __init__.py
  └── (supporting modules)
```

**Configuration File:**
```
platform/config/search-promoted-pages.json
```

**Example Configuration:**
```json
{
  "en": [
    {
      "title": "Getting Started with AMP",
      "url": "/documentation/guides-and-tutorials/start/",
      "type": "guide"
    },
    {
      "title": "amp-carousel",
      "url": "/documentation/components/amp-carousel/",
      "type": "component"
    }
  ]
}
```

**Registration in podspec.yaml:**
```yaml
extensions:
  preprocessors:
    - extensions.extract_highlights_info.ExtractHighlightsInfoExtension
```

**Build Process:**
1. Grow reads `search-promoted-pages.json`
2. Extension processes configuration
3. Generates locale-specific JSON files
4. Output available at `/search/highlights?locale=X` endpoint

**Verification:**
```bash
# After build, test endpoint
curl http://localhost:8080/search/highlights?locale=en | jq
```

### 2. SCSS Compilation

**Frontend/ BEM Infrastructure:**

**Required:**
- Gulp task for SCSS compilation verified present
- Main SCSS manifest imports component files
- BEM class naming convention followed

**Compilation Flow:**
```
frontend/scss/components/organisms/search.scss
  ↓ (Gulp sass task)
dist/css/components/organisms/search.css
  ↓ (Browser)
Applied to .ap-o-search elements
```

**Files to Compile:**
```scss
// In main SCSS manifest (e.g., frontend/scss/main.scss)
@import 'components/organisms/search';
@import 'components/organisms/search-trigger';
```

**Build Command:**
```bash
# Development (watch mode)
npm run develop

# Production
npm run build:local
```

**Verification:**
```bash
# Check compiled CSS exists
ls -lh dist/css/main.css

# Check search styles included
grep -i "ap-o-search" dist/css/main.css
```

### 3. Icons

**Required Icons:**
- `magnifier.svg` - Search trigger button
- `internal.svg` - Result type indicator
- `close.svg` - Close modal button

**Possible Locations:**
```
Option A: frontend/icons/
Option B: frontend/templates/assets/icons/
```

**Icon Usage in Templates:**
```jinja2
{# Register icon #}
{% do doc.icons.useIcon('icons/magnifier.svg') %}

{# Use icon #}
<svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#magnifier"></use></svg>
```

**Verification:**
```bash
# Find icon files
find frontend/ -name "magnifier.svg"
find frontend/ -name "internal.svg"
find frontend/ -name "close.svg"

# Check icon registration in templates
grep -r "useIcon" frontend/templates/
```

### 4. Backend API Endpoints

**Router Configuration:**

**File:** `platform/lib/routers/search-router.js`

**Required Endpoints:**
- `GET /search/autosuggest` - Component name suggestions
- `GET /search/highlights?locale=X` - Promoted content
- `GET /search/do?q=query&locale=X` - Search results (Phase B)

**Express App Integration:**

**File:** `platform/lib/routers.js` (or similar)

```javascript
const searchRouter = require('./routers/search-router');

app.use('/search', searchRouter);
```

**Verification:**
```bash
# Check router is loaded
grep -r "search-router" platform/lib/

# Check endpoint definitions
cat platform/lib/routers/search-router.js | grep "router.get"
```

**Netlify Configuration:**

**File:** `netlify.toml` or `_redirects`

```toml
[[redirects]]
  from = "/search/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
```

Or in `_redirects`:
```
/search/*  /.netlify/functions/api/:splat  200
```

**Verification:**
```bash
# Test autosuggest endpoint
curl http://localhost:8080/search/autosuggest | jq

# Test highlights endpoint
curl http://localhost:8080/search/highlights?locale=en | jq
```

---

## SUCCESS CRITERIA

### Phase A Complete When:

#### ✅ Search Trigger
- [ ] Search trigger button appears in header
- [ ] Button displays magnifier icon correctly
- [ ] Click/tap opens search modal
- [ ] Button is accessible (keyboard, screen reader)
- [ ] Mobile and desktop layouts work

#### ✅ Search Modal
- [ ] Modal opens with full-screen overlay
- [ ] Input field receives focus on open
- [ ] Close button works (click and keyboard)
- [ ] Escape key closes modal
- [ ] Overlay click closes modal (if desired)
- [ ] Modal is accessible (ARIA labels, focus trap)

#### ✅ Search Input Field
- [ ] Input field accepts text
- [ ] Placeholder text displays
- [ ] Focus states styled correctly
- [ ] Clear button works (if present)
- [ ] Mobile keyboard appears correctly

#### ✅ Autosuggest
- [ ] Dropdown appears as user types
- [ ] Component name suggestions display
- [ ] Suggestions filter based on input
- [ ] Arrow keys navigate suggestions
- [ ] Enter key selects highlighted suggestion
- [ ] Click/tap selects suggestion
- [ ] Selected suggestion populates input
- [ ] Dropdown closes after selection
- [ ] No console errors during interaction

#### ✅ Highlights/Promoted Content
- [ ] Highlights display on modal open (before query)
- [ ] Default locale content loads
- [ ] Multiple highlights render correctly (title, description, link)
- [ ] Links navigate correctly
- [ ] Images display (if present)
- [ ] Fallback content if highlights fail to load
- [ ] No 404 errors for highlights endpoint

#### ✅ UI Responsiveness
- [ ] Desktop layout (1200px+) displays correctly
- [ ] Tablet layout (768px-1199px) displays correctly
- [ ] Mobile layout (320px-767px) displays correctly
- [ ] Portrait and landscape orientations work
- [ ] Touch targets are appropriately sized (mobile)
- [ ] Text is readable at all breakpoints

#### ✅ Keyboard Navigation
- [ ] Tab order is logical
- [ ] All interactive elements keyboard-accessible
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] Escape key behavior works

#### ✅ Accessibility
- [ ] Screen reader announces modal state
- [ ] ARIA labels present and correct
- [ ] Focus management on modal open/close
- [ ] Color contrast meets WCAG AA
- [ ] No accessibility warnings in console

#### ✅ Error States
- [ ] Empty state message displays correctly
- [ ] Network error handled gracefully
- [ ] Invalid input handled (if applicable)
- [ ] Loading states display during API calls
- [ ] Timeout errors handled

#### ✅ Performance
- [ ] Modal opens quickly (<200ms)
- [ ] Autosuggest responds quickly (<100ms)
- [ ] No layout shift on modal open
- [ ] Smooth animations
- [ ] No console errors or warnings

---

### Phase B Complete When:

#### ✅ Search Submission
- [ ] User can type query and press Enter
- [ ] Search results load for query
- [ ] Loading indicator displays during search
- [ ] Results replace highlights after search

#### ✅ Search Results Display
- [ ] Results render in card layout
- [ ] Title, description, URL display correctly
- [ ] Result images display (if present)
- [ ] Links navigate correctly
- [ ] Result count displays (e.g., "42 results for 'amp-carousel'")

#### ✅ Result Relevance
- [ ] Results are relevant to query terms
- [ ] Ranking appears logical
- [ ] Component names prioritized for component queries
- [ ] Articles/guides appear for general queries

#### ✅ Result Categorization
- [ ] Results tagged as "Component" or "Article"
- [ ] Category indicators display correctly
- [ ] Can filter by category (if desired)

#### ✅ Pagination
- [ ] "Load more" button appears after initial results
- [ ] Clicking loads additional results
- [ ] Scroll position maintained during load
- [ ] No duplicate results
- [ ] End of results indicated clearly

#### ✅ Google Custom Search Integration
- [ ] API key configured correctly
- [ ] CSE ID configured correctly
- [ ] API requests succeed
- [ ] Rate limiting handled
- [ ] API errors handled gracefully
- [ ] Cost monitoring in place

#### ✅ Multi-Locale Support
- [ ] Search works for all supported locales
- [ ] Results match query locale
- [ ] Locale parameter passed correctly
- [ ] No cross-locale result bleeding

#### ✅ Edge Cases
- [ ] Empty query handled (no search or error message)
- [ ] Very long query handled
- [ ] Special characters in query handled
- [ ] No results case displays message
- [ ] API timeout handled
- [ ] Network offline handled

---

## APPENDIX

### A. File Locations Reference

**Frontend/ (BEM System):**
```
frontend/
├── scss/
│   └── components/
│       └── organisms/
│           ├── search.scss
│           └── search-trigger.scss
├── templates/
│   └── views/
│       └── partials/
│           ├── search.j2
│           └── header.j2
└── icons/
    ├── magnifier.svg
    ├── internal.svg
    └── close.svg
```

**Frontend21/ (Webpack System):**
```
frontend21/
└── scss/
    └── components/
        └── organisms/
            └── search-trigger.scss
```

**Backend:**
```
platform/
├── lib/
│   ├── routers/
│   │   └── search-router.js
│   └── utils/
│       └── googleSearch.js
└── config/
    └── search-promoted-pages.json

pages/
└── extensions/
    └── extract_highlights_info/
        └── extract_highlights_info.py
```

### B. API Endpoint Reference

**Autosuggest:**
```
GET /search/autosuggest
Response: ["amp-carousel", "amp-img", "amp-video", ...]
```

**Highlights:**
```
GET /search/highlights?locale=en
Response: [
  {
    "title": "Getting Started",
    "url": "/documentation/guides-and-tutorials/start/",
    "type": "guide"
  },
  ...
]
```

**Search (Phase B):**
```
GET /search/do?q=amp-carousel&locale=en
Response: {
  "results": [...],
  "total": 42,
  "nextPage": 2
}
```

### C. Environment Variables

**Development:**
```bash
# .env.local
NODE_ENV=development
GOOGLE_CSE_ID=your_cse_id_here
GOOGLE_CSE_API_KEY=your_api_key_here
```

**Production (Netlify):**
- Set in Netlify dashboard under Site settings → Environment variables
- Never commit API keys to git

### D. Testing Commands

**Development Server:**
```bash
npm run develop
# Opens at http://localhost:8080
```

**Production Build:**
```bash
SKIP_OPTIMIZE=1 NODE_ENV=local npm run build:local --locales en
npm run serve:local
```

**API Testing:**
```bash
# Autosuggest
curl http://localhost:8080/search/autosuggest | jq

# Highlights
curl http://localhost:8080/search/highlights?locale=en | jq

# Search (Phase B)
curl 'http://localhost:8080/search/do?q=amp-carousel&locale=en' | jq
```

### E. Useful Resources

**AMP Components Used:**
- `amp-lightbox` - Modal overlay
- `amp-list` - Dynamic content rendering
- `amp-state` - State management
- `amp-bind` - Data binding

**Documentation:**
- AMP Project: https://amp.dev
- Google Programmable Search: https://developers.google.com/custom-search
- Grow Framework: https://grow.dev

### F. Known Issues & Workarounds

**Issue 1: Highlights 404 Error**
- **Cause:** Incorrect URL format in search.j2
- **Fix:** Change from `/search/highlights/{locale}.json` to `/search/highlights?locale={locale}`
- **Status:** Documented in "CRITICAL BUG FIX REQUIRED" section

**Issue 2: Search Results Not Working (Phase B)**
- **Cause:** Backend integration incomplete or misconfigured
- **Fix:** Requires investigation (deferred to Phase B)
- **Status:** Documented in "PHASE B" section

**Issue 3: Frontend21 Import Coupling**
- **Cause:** Frontend21 imports from frontend/ (tight coupling)
- **Fix:** Consider porting search organism to frontend21 for independence
- **Status:** Documented in "DUAL FRONTEND RESTORATION" section

---

## REVISION HISTORY

| Version | Date       | Author | Changes                                    |
|---------|------------|--------|--------------------------------------------|
| 1.0     | 2025-10-30 | System | Initial comprehensive specification        |

---

## NEXT STEPS

1. **Review this specification** - Ensure all requirements understood
2. **Begin Phase A** - Restore files from `docs/removed-code/`
3. **Apply critical bug fix** - Fix URL format in search.j2
4. **Test iteratively** - Use `npm run develop` for rapid testing
5. **Document findings** - Update this spec with new discoveries
6. **Complete Phase A** - Meet all success criteria
7. **Plan Phase B** - Investigate backend search integration

---

**END OF SPECIFICATION**
