## Site Configuration Implementation Plan v2

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

