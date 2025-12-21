# Frontend Architecture Analysis - amp.dev.20

## Executive Summary

The amp.dev.20 project employs a **dual frontend architecture** with both `frontend/` and `frontend21/` directories actively used in production builds. The legacy search functionality exists in `frontend/` but is **not currently integrated** into the production site. Search restoration needs to target **both frontend systems** with different integration strategies for each.

---

## 1. Directory Structure & Active Status

### 1.1 Both Frontend Directories Exist and Are Active

**Location:** `~/repos/amp/amp.dev.20/`

```
frontend/          # Legacy frontend system (Gulp-based SCSS compilation)
├── icons/
├── js/
├── scss/
│   └── components/
│       ├── atoms/
│       ├── molecules/
│       ├── organisms/
│       └── templates/
└── templates/
    ├── layouts/
    ├── macros/
    └── views/

frontend21/        # Modern frontend system (Webpack-based)
├── scss/
│   └── components/
└── static/
    ├── fonts/
    └── img/
```

### 1.2 Active Usage Status

**Both directories are actively used:**

- **frontend/**: Provides SCSS, templates, and icons compiled via Gulp
- **frontend21/**: Modern Webpack-based build for 2021+ design system
- Both are built in parallel during production builds

---

## 2. Build System Analysis

### 2.1 Package.json Build Scripts

**Source:** `package.json:19-31`

```json
{
  "build:frontend": "cd frontend21 && webpack --mode production",
  "build:local": "npx gulp build --env local",
  "build:staging": "npx gulp build --env staging",
  "build:prod": "npx gulp build --env production",
  "start:frontend": "cd frontend21 && webpack serve --mode development"
}
```

**Key Findings:**
- Production builds use `npx gulp build --env production`
- Frontend21 is built separately via `npm run build:frontend`
- Both systems are compiled during production builds

### 2.2 Gulp Build System

**Source:** `gulpfile.js/build.js`

#### Key Build Functions:

**buildFrontend() - Line 157-159:**
```javascript
function buildFrontend(done) {
  return gulp.parallel(sass, templates, icons, buildFrontend21)(done);
}
```

**Builds in parallel:**
1. `sass()` - Compiles SCSS from `frontend/scss/` → `dist/css/`
2. `templates()` - Copies `frontend/templates/` → `pages/`
3. `icons()` - Copies `frontend/icons/` → `pages/icons/`
4. `buildFrontend21()` - Runs `npm run build:frontend` (webpack)

**Production Build Flow (Line 802-807):**
```javascript
exports.build = gulp.series(
  clean,
  buildPrepare,        // Includes buildFrontend21
  buildPages,          // Includes buildFrontend (sass, templates, icons)
  gulp.parallel(collectStatics, persistBuildInfo)
);
```

### 2.3 Frontend21 Webpack Configuration

**Source:** `frontend21/webpack.config.js`

**Entry Point:** `frontend21/amp-dev.js`

**Output:**
- CSS: `dist/static/frontend/[name].[contenthash].css`
- JS: `dist/static/[name].[contenthash].js`

**Post-Build Actions (Lines 84-97):**
```javascript
FileManagerPlugin - copies:
  - dist/base.html → pages/views/2021/
  - dist/static/sprite.svg → dist/static/frontend/sprite.svg
  - static/img/** → dist/static/frontend/img
```

**SCSS Include Path:** `frontend21/scss/`

**Key Finding:** Frontend21's webpack config shows it references the 2021 design system templates at `pages/views/2021/`

---

## 3. BEM Infrastructure Analysis

### 3.1 Frontend/ SCSS Infrastructure (Legacy System)

**Location:** `frontend/scss/`

**Core BEM Infrastructure Files:**
- ✅ `_extends.scss` - Empty but present
- ✅ `_functions.scss` - 1,937 bytes, includes BEM helper functions
- ✅ `_mixins.scss` - 2,670 bytes, includes BEM mixins
- ✅ `_variables.scss` - 2,108 bytes, color palette, spacing, etc.
- ✅ `_fonts.scss` - 4,308 bytes, font definitions
- ✅ `base.scss` - 2,342 bytes, base styles

**Component Structure:**
```
frontend/scss/components/
├── atoms/           # ✅ 27 atomic components (buttons, icons, text, etc.)
├── molecules/       # ✅ Composite components
├── organisms/       # ✅ Complex UI patterns (header, search, etc.)
└── templates/       # ✅ Page-level templates
```

**BEM Function Examples from `_functions.scss`:**
```scss
@function organism($name) { ... }
@function molecule($name) { ... }
@function atom($name) { ... }
```

### 3.2 Frontend21/ SCSS Infrastructure (Modern System)

**Location:** `frontend21/scss/`

**Core Infrastructure Files:**
- ✅ `functions.scss` - 251 bytes (minimal)
- ✅ `mixins.scss` - 1,882 bytes
- ✅ `variables.scss` - 1,559 bytes
- ✅ `amp-dev.scss` - 3,374 bytes (main entry point)

**Component Structure:**
```
frontend21/scss/components/
├── banner.scss
├── breadcrumbs.scss
├── button.scss
├── header.scss
├── search-trigger.scss  # ⚠️ Only search-trigger, no full search organism
├── section.scss
└── [32 other component files]
```

**Critical Finding:** Frontend21 **imports BEM infrastructure from frontend/**

**Source:** `frontend21/scss/amp-dev.scss:1-4`
```scss
@import '../../frontend/scss/_functions.scss';
@import '../../frontend/scss/_mixins.scss';
@import '../../frontend/scss/components/atoms/_icon.scss';
@import '../../frontend/scss/components/atoms/_color.scss';
```

**Implication:** Frontend21 is **not independent** - it relies on the BEM infrastructure from the legacy frontend/ directory.

---

## 4. Search Component Analysis

### 4.1 Legacy Search System (frontend/)

**Search Files Present:**
1. **SCSS:**
   - `frontend/scss/components/molecules/search-trigger.scss` - Search button styles
   - `frontend/scss/components/organisms/search.scss` - **Full search UI** (419 lines)

2. **Template:**
   - `frontend/templates/views/partials/search.j2` - **Complete search implementation** (177 lines)

**Search Component Architecture (search.scss):**

```scss
.ap-o-search {
  &-escaper       // Dark overlay background
  &-container     // Main search container with responsive sizing
  &-form          // Search form wrapper
  &-autocomplete  // Autocomplete dropdown
  &-input         // Search input field with icon
  &-submit        // Search submit button
  &-result        // Results container with scrolling
    &-list        // Results list
    &-category    // Category headers (Components, Articles)
    &-item        // Individual result item
    &-link        // Result link
    &-title       // Result title
    &-description // Result description
    &-error       // Error states with emoticons
    &-hint        // Helper text
}
```

**Search Template Features (search.j2):**
- **AMP Components Used:**
  - `amp-state` - Search state management
  - `amp-lightbox` - Modal search overlay
  - `amp-autocomplete` - Search suggestions
  - `amp-list` - Dynamic result loading
  - `amp-mustache` - Result templating

- **API Endpoints:**
  - `/search/latest-query` - Retrieve last search
  - `/search/clear-latest-query` - Clear search history
  - `/search/autosuggest` - Autocomplete suggestions
  - `/search/do?q={query}&locale={locale}` - Search execution
  - `/search/highlights/{locale}.json` - Default/highlighted results

- **Features:**
  - Real-time autocomplete
  - Categorized results (Components vs. Articles)
  - Load more pagination
  - Error handling
  - Empty state handling
  - Responsive design (mobile + desktop)

### 4.2 Frontend21 Search System

**Search Files Present:**
1. **SCSS:**
   - `frontend21/scss/components/search-trigger.scss` - Only the trigger button (45 lines)

**Critical Finding:** Frontend21 has **only the search trigger**, not the full search organism.

**search-trigger.scss Features:**
```scss
.ap--search-trigger {
  &-close        // Close button positioning
  &-icon         // Icon sizing
}
```

**Missing in Frontend21:**
- ❌ No search organism/overlay
- ❌ No search template
- ❌ No search form
- ❌ No results display

### 4.3 Current Integration Status

**Search is NOT Currently Integrated:**

1. **Header Analysis:**
   - `frontend/templates/views/2021/partials/header.j2` - **No search trigger**
   - `frontend/templates/views/partials/header.j2` - **No search trigger**

2. **Base Template Analysis:**
   - `frontend21/amp-dev.ejs` - **No search.j2 include**
   - Base template includes header but header doesn't include search

3. **Grep Results:**
   - No templates currently include `search.j2`
   - Search component exists but is orphaned

**Conclusion:** The search functionality was **built but never integrated** into the active templates.

---

## 5. Template System Architecture

### 5.1 Template Flow

**Base Template:** `frontend21/amp-dev.ejs` (Webpack generates → `pages/views/2021/base.html`)

**Template Inheritance:**
```
amp-dev.ejs (base)
├── {% block header %}
│   └── views/2021/partials/header.j2
├── {% block main %}
│   └── {{ doc.html|render|safe }}
└── {% block footer %}
    └── views/partials/footer.j2
```

**CSS Injection Pattern:**
```jinja
{% do doc.styles.addCssFile('/css/components/organisms/search.css') %}
```

**Icon Usage Pattern:**
```jinja
{% do doc.icons.useIcon('/icons/magnifier.svg') %}
```

### 5.2 2021 Design System

**Header Template:** `frontend/templates/views/2021/partials/header.j2`

**Current Components:**
- Logo
- Navigation menu (About, Documentation, Community, Events, Blog, Support)
- Language selector
- Mobile burger menu

**Missing:** Search trigger button

---

## 6. Recommendations for Search Restoration

### 6.1 Primary Integration Target: Frontend/

**Rationale:**
1. **Complete implementation already exists** in frontend/
2. Search organism (SCSS), template, and all assets are present
3. BEM infrastructure is mature and complete
4. Frontend21 **depends on** frontend/ for BEM functions

### 6.2 Integration Strategy

#### Phase 1: Restore Search to Legacy System
1. **Add search trigger to header:**
   - Modify `frontend/templates/views/2021/partials/header.j2`
   - Add search button next to language selector
   - Include search-trigger styles

2. **Include search component:**
   - Add `{% include 'views/partials/search.j2' %}` to base template
   - Or include in header template after navigation

3. **Verify assets:**
   - Ensure search icon SVGs are available
   - Confirm CSS compilation of search.scss

#### Phase 2: Frontend21 Integration (Optional)
1. **Copy search organism:**
   - Port `frontend/scss/components/organisms/search.scss` → `frontend21/scss/components/search.scss`
   - Update BEM function calls if needed
   - Test responsive behavior

2. **Create search component:**
   - Port search.j2 template or create native component
   - Integrate with webpack build

### 6.3 Why Both Systems?

**Frontend/** is the **recommended primary target** because:
- ✅ Complete search implementation exists
- ✅ Already compiled by production build (`gulp.parallel(sass, templates, icons)`)
- ✅ Templates are copied to `pages/` directory
- ✅ No additional build configuration needed

**Frontend21/** integration is **optional/future enhancement** because:
- ⚠️ Only has search-trigger stub
- ⚠️ Would require porting full search organism
- ⚠️ Already imports BEM from frontend/ anyway
- ℹ️ Could use frontend/'s search with frontend21's trigger

---

## 7. File Reference Summary

### Search-Related Files

**Frontend/ (Legacy - Complete Implementation):**
```
frontend/scss/components/molecules/search-trigger.scss
frontend/scss/components/organisms/search.scss           ← FULL IMPLEMENTATION
frontend/templates/views/partials/search.j2              ← FULL TEMPLATE
```

**Frontend21/ (Modern - Partial Implementation):**
```
frontend21/scss/components/search-trigger.scss           ← TRIGGER ONLY
```

### Template Files to Modify

**For Search Integration:**
```
frontend/templates/views/2021/partials/header.j2         ← Add search trigger
frontend21/amp-dev.ejs                                   ← Include search partial (optional)
```

### Build Configuration Files

```
package.json                                             ← Build scripts
gulpfile.js/build.js                                     ← Gulp tasks
gulpfile.js/index.js                                     ← Task loader
frontend21/webpack.config.js                             ← Webpack config
```

---

## 8. Key Findings Summary

1. ✅ **Both frontend directories are active** and used in production builds
2. ✅ **BEM infrastructure exists** in frontend/ with complete atoms/molecules/organisms
3. ✅ **Frontend21 depends on frontend/** for BEM functions and shared components
4. ✅ **Complete search implementation exists** in frontend/ but is not integrated
5. ⚠️ **Frontend21 only has search-trigger**, not the full search organism
6. ❌ **Search is not currently included** in any active templates
7. ✅ **Production build compiles both systems** via Gulp series/parallel tasks

---

## 9. Conclusion

**Primary Recommendation:** Restore search functionality to **frontend/** first.

**Rationale:**
- Complete, production-ready search implementation already exists
- BEM infrastructure is mature and proven
- Templates are actively used in production
- Frontend21 already depends on frontend/ for shared components
- Minimal integration work required (add trigger to header, include search.j2)

**Secondary Recommendation:** Frontend21 can optionally port the search organism later, or simply reuse frontend/'s search implementation with a frontend21-styled trigger button.

**Integration Complexity:**
- Frontend/: **LOW** - Just needs template inclusion
- Frontend21/: **MEDIUM** - Requires porting full search organism or hybrid approach

---

## Appendix A: Build Flow Diagram

```
npm run build:prod
    ↓
gulp build --env production
    ↓
    ├─ clean()
    ├─ buildPrepare()
    │   ├─ buildSamples()
    │   └─ parallel:
    │       ├─ buildPlayground()
    │       ├─ buildBoilerplate()
    │       ├─ buildFrontend21()  ← Webpack builds frontend21/
    │       ├─ importAll()
    │       └─ zipTemplates()
    ├─ buildPages()
    │   ├─ unpackArtifacts()
    │   ├─ buildFrontend()        ← Compiles frontend/scss, copies templates
    │   │   └─ parallel:
    │   │       ├─ sass()          ← frontend/scss → dist/css
    │   │       ├─ templates()     ← frontend/templates → pages/
    │   │       ├─ icons()         ← frontend/icons → pages/icons
    │   │       └─ buildFrontend21() (again)
    │   └─ grow deploy
    └─ collectStatics()
```

---

**Analysis Date:** 2025-10-30
**Analyzed By:** Claude Code
**Repository:** ~/repos/amp/amp.dev.20
**Analysis Target:** Frontend architecture for search restoration
