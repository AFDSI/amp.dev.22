# Boilerplate Restoration Analysis

**Date**: 2026-01-02
**Status**: Complete structure exists, needs build and URL configuration
**Reference**: Playground (working) at https://playground-amp-new.netlify.app/

---

## Executive Summary

The AMP Boilerplate Generator is **fully intact** in the codebase. It requires:
1. Building the `dist/` directory
2. Configuring URL references for the new domain
3. Adding to Netlify deployment (if needed separately)

**Estimated effort**: LOW - mainly build configuration

---

## 1. File Inventory

### Core Files (Exist ✅)

| File | Purpose | Status |
|------|---------|--------|
| `boilerplate/build.js` | Main build script - generates index.html | ✅ Exists |
| `boilerplate/backend/index.js` | Express router - serves `/boilerplate` | ✅ Exists |
| `boilerplate/lib/templates.js` | Handlebars rendering, SCSS compilation | ✅ Exists |
| `boilerplate/lib/io.js` | File I/O utilities | ✅ Exists |

### Data Files (Exist ✅)

| File | Purpose | Status |
|------|---------|--------|
| `boilerplate/data/formats.json` | AMP formats (websites, stories, ads, email) | ✅ Exists |
| `boilerplate/data/categories.json` | Feature categories (PWA, Media, Fonts, etc.) | ✅ Exists |

### Template Files (Exist ✅)

| Directory | Contents | Count |
|-----------|----------|-------|
| `boilerplate/templates/` | Main index.html template | 1 |
| `boilerplate/templates/files/` | Format-specific templates | 6 |
| `boilerplate/templates/partials/` | Partial templates by category | 22 |
| `boilerplate/templates/styles/` | SCSS stylesheets | 2 |

### Output Directory (Missing ❌)

| File | Purpose | Status |
|------|---------|--------|
| `boilerplate/dist/index.html` | Built boilerplate page | ❌ Not built |

---

## 2. Dependency List

### npm Packages (All in package.json ✅)

| Package | Version | Purpose |
|---------|---------|---------|
| `@ampproject/toolbox-optimizer` | 2.10.1 | AMP HTML optimization |
| `handlebars` | 4.7.8 | Template rendering |
| `highlight.js` | 11.10.0 | Code syntax highlighting |
| `sass` | 1.77.8 | SCSS compilation |

### Platform Utilities

| Module | Path | Purpose |
|--------|------|---------|
| `@lib/utils/log` | `platform/lib/utils/log.js` | Logging |
| `module-alias` | Root package.json | Path aliasing |

### Frontend Assets

| Path | Purpose |
|------|---------|
| `frontend/scss/` | Shared SCSS components |
| `frontend/icons/` | SVG icons (logo, format icons) |

---

## 3. Current vs Required State

### Express Route Configuration

**Current State**: ✅ Configured

```javascript
// platform/lib/platform.js:29
boilerplate: require('../../boilerplate/backend/'),

// platform/lib/platform.js:178
this.server.use(routers.boilerplate);
```

### Backend Router

**Current State**: ✅ Configured

```javascript
// boilerplate/backend/index.js
playground.use(
  '/boilerplate',
  express.static(path.join(__dirname, '../dist'), {extensions: ['html']})
);
```

### Gulp Build Task

**Current State**: ✅ Configured

```javascript
// gulpfile.js/build.js:188-192
function buildBoilerplate() {
  return sh('node build.js', {
    workingDir: project.absolute('boilerplate'),
  });
}
```

### Dist Directory

**Current State**: ❌ Missing

```bash
$ ls boilerplate/dist/
dist directory does not exist
```

### URL References

**Current State**: ⚠️ Hardcoded to amp.dev

| File | Line | Current Value | Required Change |
|------|------|---------------|-----------------|
| `templates/index.html` | 29 | `href="https://amp.dev/boilerplate/"` | Use config |
| `templates/index.html` | 131 | `href="/"` → amp.dev | Keep as-is (relative) |
| `templates/index.html` | 342 | `data-iframe-src="https://amp.dev"` | Update domain |
| `pages/shared/data/tools.yaml` | 426 | `url: https://amp.dev/boilerplate/` | Update domain |

---

## 4. Comparison with Playground

| Aspect | Playground | Boilerplate |
|--------|------------|-------------|
| Build system | Webpack | Node script |
| Output | `playground/dist/` | `boilerplate/dist/` |
| Express router | `/` (subdomain) | `/boilerplate` (path) |
| Backend API | Yes (`/api`) | No |
| Deployment | Separate subdomain | Path on main domain |
| Status | ✅ Working | ⚠️ Needs build |

### Key Differences

1. **Playground** uses webpack for complex frontend build
2. **Boilerplate** uses simple Node script with Handlebars
3. **Playground** runs on subdomain (`playground-amp-new.netlify.app`)
4. **Boilerplate** runs on path (`/boilerplate/`)

---

## 5. Restoration Steps

### Phase 1: Build (Required)

```bash
# Step 1: Run boilerplate build
cd /home/user/amp.dev.22/boilerplate
node build.js

# Or via gulp
npm run build:local
```

### Phase 2: URL Configuration (Required)

1. **Update canonical URL** in `boilerplate/templates/index.html:29`:
   ```html
   <!-- FROM -->
   <link rel="canonical" href="https://amp.dev/boilerplate/">
   <!-- TO -->
   <link rel="canonical" href="https://amp-new.netlify.app/boilerplate/">
   ```

2. **Update service worker iframe** in `boilerplate/templates/index.html:342`:
   ```html
   <!-- FROM -->
   data-iframe-src="https://amp.dev"
   <!-- TO -->
   data-iframe-src="https://amp-new.netlify.app"
   ```

3. **Update tools.yaml** in `pages/shared/data/tools.yaml:426`:
   ```yaml
   # FROM
   url: https://amp.dev/boilerplate/
   # TO
   url: https://amp-new.netlify.app/boilerplate/
   ```

### Phase 3: Verification

1. Build locally: `npm run build:local`
2. Start server: `npm run start:local`
3. Navigate to: `http://localhost:8080/boilerplate/`
4. Verify all 4 formats load (websites, stories, ads, email)
5. Verify code snippets render correctly

### Phase 4: Configuration Integration (Optional)

Make URLs configurable via `shared.json`:

```javascript
// boilerplate/build.js - add to config
config.siteUrl = require('../platform/config/shared.json').site?.url || 'https://amp-new.netlify.app';

// boilerplate/templates/index.html - use variable
<link rel="canonical" href="{{ siteUrl }}/boilerplate/">
```

---

## 6. Risk Assessment

### LOW Risk

| Risk | Mitigation |
|------|------------|
| Build fails | Dependencies already in package.json |
| Missing icons | Frontend icons shared, already exist |
| SCSS errors | Frontend SCSS shared, already working |

### MEDIUM Risk

| Risk | Mitigation |
|------|------------|
| Hardcoded URLs break | Search and replace in template |
| Service worker fails | Points to amp.dev, update to new domain |

### Testing Checklist

- [ ] Build completes without errors
- [ ] `boilerplate/dist/index.html` created
- [ ] Page loads at `/boilerplate/`
- [ ] Format selector works (websites/stories/ads/email)
- [ ] Feature checkboxes update code preview
- [ ] Code snippets syntax highlighted
- [ ] Copy button works (if present)
- [ ] Mobile responsive layout

---

## 7. File Changes Summary

### Files to Modify

| File | Change |
|------|--------|
| `boilerplate/templates/index.html` | Update canonical URL, service worker |
| `pages/shared/data/tools.yaml` | Update tool URL |

### Files to Create

| File | Method |
|------|--------|
| `boilerplate/dist/index.html` | Run `node boilerplate/build.js` |

### No Changes Needed

| Component | Reason |
|-----------|--------|
| `boilerplate/build.js` | Already correct |
| `boilerplate/backend/index.js` | Already correct |
| Express routes in `platform.js` | Already configured |
| Gulp task in `build.js` | Already configured |

---

## 8. Quick Start Commands

```bash
# Build boilerplate only
cd boilerplate && node build.js

# Full build including boilerplate
npm run build:local

# Start local server
npm run start:local

# Access boilerplate
open http://localhost:8080/boilerplate/
```

---

## Status

- [x] File inventory complete
- [x] Dependency list documented
- [x] Current vs Required state analyzed
- [x] Restoration steps defined
- [x] Risk assessment complete
- [ ] Implementation pending user approval
