## Site Configuration Implementation Plan v2

## Phase 1: Configuration Foundation

**Goal:** Establish new configuration variables without changing any templates yet.

### Step 1.1: Update `platform/config/shared.json`

Add new site variables alongside existing ones:

```json
{
  "gaTrackingId": "G-1HFVWLN28T",
  "thumbor": { ... },
  "baseUrls": { ... },
  
  "site": {
    "name": "amp-new",
    "shortName": "amp-new", 
    "title": "AMP",
    "description": "The AMP Project website."
  },
  "social": {
    "twitter": {
      "handle": "@ampproject",
      "url": "https://twitter.com/AMPhtml"
    },
    "youtube": {
      "url": "https://www.youtube.com/channel/UCXPBsjgKKG2HqsKBhWA4uQw"
    },
    "github": {
      "org": "ampproject",
      "url": "https://github.com/ampproject"
    }
  }
}
```

**Verify:** `npm run develop` starts without errors.

---

### Step 1.2: Update `platform/lib/config.js`

Extend `buildGrowPodSpec()` to inject new variables. Find the section around line 228-234 where `podspec['base_urls']` is set.

Add after that block:

```javascript
// Site identity variables
podspec['site'] = {
  'name': this.shared.site?.name || 'amp-new',
  'short_name': this.shared.site?.shortName || 'amp-new',
  'title': this.shared.site?.title || 'AMP',
  'description': this.shared.site?.description || 'The AMP Project website.',
};

// Social links
podspec['social'] = {
  'twitter_handle': this.shared.social?.twitter?.handle || '@ampproject',
  'twitter_url': this.shared.social?.twitter?.url || 'https://twitter.com/AMPhtml',
  'youtube_url': this.shared.social?.youtube?.url || '',
  'github_url': this.shared.social?.github?.url || 'https://github.com/ampproject',
  'github_org': this.shared.social?.github?.org || 'ampproject',
};
```

**Verify:** `npm run develop` starts without errors. Variables exist but aren't used yet.

---

### Step 1.3: Verify Variables Are Available

Create a temporary test. In any `.j2` template, temporarily add:

```jinja
<!-- DEBUG: {{ podspec.site.name }} / {{ podspec.social.twitter_handle }} -->
```

Load page in browser, view source, confirm values appear.

**Remove debug line after verification.**

**Checkpoint 1 Complete:** Configuration foundation in place. Commit to Git.

---

## Phase 2: Template Migration (One File at a Time)

**Goal:** Replace hardcoded values with configuration variables.

### Step 2.1: `pages/static/manifest.json`

This file cannot use Jinja2 (static JSON). Two options:

**Option A (Recommended):** Generate at build time via gulp task (defer to Phase 4)

**Option B (Simple):** Leave as-is for now, update manually per-site

**Decision:** Skip for now, address in Phase 4.

---

### Step 2.2: `frontend/templates/views/partials/header.j2`

**Current (line ~13):**
```html
<span class="ap-o-header-home-title">AMP</span>
```

**Updated:**
```html
<span class="ap-o-header-home-title">{{ podspec.site.title }}</span>
```

**Verify:** Localhost shows "AMP" in header (value from config).

---

### Step 2.3: `frontend/templates/views/partials/footer.j2`

**Current (approximate lines):**
```html
<a href="https://twitter.com/AMPhtml" ...>
<a href="https://www.youtube.com/channel/UCXPBsjgKKG2HqsKBhWA4uQw" ...>
<a href="https://github.com/ampproject" ...>
```

**Updated:**
```html
<a href="{{ podspec.social.twitter_url }}" ...>
<a href="{{ podspec.social.youtube_url }}" ...>
<a href="{{ podspec.social.github_url }}" ...>
```

**Verify:** Footer links still work, point to correct URLs.

---

### Step 2.4: `frontend/templates/views/partials/structured-data.j2`

**Current (line ~63):**
```html
- amp-new</title>
```

**Updated:**
```html
- {{ podspec.site.name }}</title>
```

**Current (line ~74, ~85):**
```json
"name": "amp-new"
"name": "AMP Project"
```

**Updated:**
```json
"name": "{{ podspec.site.name }}"
"name": "{{ podspec.site.title }} Project"
```

**Current (line ~107-108):**
```json
"@ampproject"
```

**Updated:**
```json
"{{ podspec.social.twitter_handle }}"
```

**Verify:** View page source, check JSON-LD is valid and contains config values.

---

### Step 2.5: `frontend/templates/views/2021/partials/header.j2`

Apply same pattern as Step 2.2 if this file has hardcoded site title.

**Verify:** 2021 template pages show correct header.

---

### Step 2.6: `frontend/templates/views/partials/burger-menu.j2`

Check for hardcoded social links, update to use `podspec.social.*` variables.

**Verify:** Mobile menu links work correctly.

**Checkpoint 2 Complete:** Templates use configuration. Commit to Git.

---

## Phase 3: Search Configuration

**Goal:** Make search.js use configuration for playground URLs.

### Step 3.1: `platform/lib/routers/search.js` (line 267)

**Current:**
```javascript
const searchScope = 'site:blog.amp.dev OR site:playground.amp.dev';
```

**Updated:**
```javascript
const playgroundHost = config.hosts.playground.base.replace('https://', '').replace('http://', '');
const searchScope = `site:blog.amp.dev OR site:${playgroundHost}`;
```

**Verify:** Search still functions (may need actual search test).

---

### Step 3.2: `platform/lib/routers/search.js` (line 396)

**Current:**
```javascript
playgroundUrl: 'https://playground.amp.dev'
```

**Updated:**
```javascript
playgroundUrl: config.hosts.playground.base
```

**Verify:** Search results with playground links point to correct host.

---

### Step 3.3: `netlify/functions/search_do/search_do.js` (line ~116)

This runs in Netlify Functions context. Needs environment variable approach:

**Add to function:**
```javascript
const PLAYGROUND_HOST = process.env.PLAYGROUND_HOST || 'playground.amp.dev';
```

**Update search scope to use `PLAYGROUND_HOST`.**

**Add to Netlify environment variables:** `PLAYGROUND_HOST=playground-amp-new.netlify.app`

**Verify:** Deploy to Netlify, test search.

**Checkpoint 3 Complete:** Search uses configuration. Commit to Git.

---

## Phase 4: Playground URL Build-Time Replacement

**Goal:** Replace remaining hardcoded `playground.amp.dev` in HTML output.

### Step 4.1: Install gulp-replace

```bash
npm install gulp-replace --save-dev
```

**Verify:** Package installs, `package.json` updated.

---

### Step 4.2: Create Gulp Task

Add to `gulpfile.js/build.js`:

```javascript
const replace = require('gulp-replace');

/**
 * Replaces hardcoded playground.amp.dev URLs with configured host.
 * Only runs for production/staging builds.
 */
function replacePlaygroundUrls() {
  const env = config.environment;
  
  // Skip for local development
  if (env === 'development' || env === 'local') {
    return Promise.resolve();
  }
  
  const playgroundHost = config.hosts.playground.base
    .replace('https://', '')
    .replace('http://', '');
  
  console.log(`[Playground URLs] Replacing playground.amp.dev with ${playgroundHost}`);
  
  return gulp.src(['dist/**/*.html', 'dist/**/*.json'])
    .pipe(replace(/playground\.amp\.dev/g, playgroundHost))
    .pipe(gulp.dest('dist'));
}

module.exports = {
  replacePlaygroundUrls,
  // ... other exports
};
```

---

### Step 4.3: Integrate into Build Sequence

In the build task sequence, add `replacePlaygroundUrls` as a late-stage step (after Grow build, before final optimization):

```javascript
// In the build sequence
gulp.series(
  // ... existing tasks
  'buildPages',        // Grow builds HTML
  'replacePlaygroundUrls',  // Replace playground URLs
  // ... remaining tasks
)
```

**Verify:** 
1. `npm run build:local` - URLs unchanged (development mode)
2. `npm run build` (production) - Check `dist/**/*.html` for replaced URLs

---

### Step 4.4: Generate `manifest.json` (Optional)

If you want `manifest.json` to use config values:

```javascript
function generateManifest() {
  const manifest = {
    name: config.shared.site.name,
    short_name: config.shared.site.shortName,
    // ... other manifest fields
  };
  
  return file('manifest.json', JSON.stringify(manifest, null, 2))
    .pipe(gulp.dest('dist/static'));
}
```

**Verify:** `dist/static/manifest.json` contains config values.

**Checkpoint 4 Complete:** Build pipeline handles playground URLs. Commit to Git.

---

## Phase 5: Validation & Cleanup

### Step 5.1: Full Build Test

```bash
rm -rf dist/
npm run build
```

Verify no errors.

---

### Step 5.2: Netlify Deploy Test

Push to GitHub, verify Netlify build succeeds.

---

### Step 5.3: Functional Testing

- [ ] Homepage loads, header shows correct title
- [ ] Footer social links work
- [ ] Search functions
- [ ] Examples page filters work
- [ ] Playground links in examples point to correct host
- [ ] Structured data valid (Google Rich Results Test)

---

### Step 5.4: Thumbor Cleanup (Deferred)

Review these files for dead code:
- `platform/lib/utils/imageOptimizer.js`
- `platform/lib/templates/ImportBlogFilter.js`

If thumbor isn't active, remove references.

---

## Summary: Execution Order

| Step | Description | Risk Level |
|------|-------------|------------|
| 1.1 | Add to shared.json | Low |
| 1.2 | Update config.js | Low |
| 1.3 | Verify variables | Low |
| 2.1-2.6 | Template updates (one at a time) | Medium |
| 3.1-3.3 | Search configuration | Medium |
| 4.1-4.4 | Gulp playground replacement | Medium |
| 5.1-5.4 | Validation | Low |

