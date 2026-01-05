# Playground Dependency Analysis

Analysis of playground directory structure, domain references, and integration patterns.

---

## 1. Directory Structure Summary

```
playground/
├── .eslintrc.json
├── .gitignore
├── README.md
├── backend/
│   ├── api.js              # Express router for /api/fetch endpoint
│   └── index.js            # Backend server setup
├── development.js          # Dev server configuration
├── src/
│   ├── analytics/          # Analytics tracking
│   ├── app.js              # Main application entry
│   ├── auto-importer/      # AMP component auto-import
│   ├── components-provider/# Component versions provider
│   ├── document/           # Document loading/management
│   ├── editor/             # CodeMirror editor
│   ├── error-list/         # Validation error display
│   ├── experiments/        # AMP experiments toggle
│   ├── file-upload/        # Dropzone file upload
│   ├── importer/           # URL import functionality
│   ├── params/             # URL parameter handling
│   ├── preview/            # Preview pane
│   ├── state-view/         # JSON state tree view
│   ├── validator/          # AMP validator integration
│   └── ...                 # Other UI components
├── static/
│   ├── amphtml-hint.json   # Editor hints
│   ├── manifest.json       # PWA manifest
│   └── ...
└── webpack.config.js       # Build configuration
```

**Key Finding:** Playground has NO `package.json` - it uses root project dependencies.

---

## 2. Hardcoded Domain References

### Correct References (Using Config)

| File | Line | Value | Status |
|------|------|-------|--------|
| `platform/config/environments/production.json` | 26 | `playground-amp-new.netlify.app` | ✅ Correct |
| `platform/config/environments/staging.json` | 26 | `playground-amp-new.netlify.app` | ✅ Correct |
| `netlify/functions/search_do/search_do.js` | 17 | `playground-amp-new.netlify.app` | ✅ Correct |
| `platform/lib/routers/search.js` | 264-270 | Uses `config.hosts.playground.base` | ✅ Correct |
| `platform/lib/routers/search.js` | 402 | Uses `config.hosts.playground.base` | ✅ Correct |

### Hardcoded `playground.amp.dev` (Needs Migration)

| File | Line | Context | Priority |
|------|------|---------|----------|
| `pages/shared/data/tools.yaml` | 462 | `url: https://playground.amp.dev/` | HIGH |
| `examples/static/inline-examples/data/amp-list-urls.json` | 17 | Example data | MEDIUM |
| `gulpfile.js/build.js` | 181 | Netlify config copy path | LOW (just path) |
| `pages/content/.../amp-list-v0.1@*.md` | ~98 | Component docs (9 locales) | MEDIUM |
| `pages/content/.../testing_amp_emails*.md` | ~18 | Tutorial docs (15 locales) | MEDIUM |
| `pages/content/.../validate_emails*.md` | varies | Validation docs (15 locales) | MEDIUM |
| `pages/content/.../create_email*.md` | varies | Email tutorial (15 locales) | MEDIUM |
| `pages/content/.../formatting*.md` | ~209 | Formatting docs (9 locales) | MEDIUM |
| `pages/content/.../examples/index.html` | 213-214 | Examples landing page | HIGH |

### Summary Counts

- **~92 occurrences** of `playground.amp.dev` across **~71 files**
- Majority are in translated documentation files
- 6 correct references using `playground-amp-new.netlify.app`

---

## 3. Referral URL Mechanism

### How Playground Receives Source URLs

**Entry Point:** `playground/src/params/base.js`

```javascript
class Params {
  getHash(key, alt) {
    const hash = this.win.location.hash;
    if (!hash) return alt;
    const keyString = `#${key}=`;
    if (!hash.startsWith(keyString)) return alt;
    return hash.substring(keyString.length);
  }

  get(key, alt) {
    return this._getValue(this.win.location.search, key, alt);
  }
}
```

**URL Patterns Supported:**
1. Hash-based: `https://playground/#url=https://example.com/page.html`
2. Query-based: `https://playground/?url=https://example.com/page.html`
3. Runtime selection: `https://playground/?runtime=amp4email`

**Document Loading:** `playground/src/document/document.js:47`
```javascript
const request = fetch('/api/fetch?url=' + url, {...})
```

The playground uses its own `/api/fetch` endpoint to proxy external URLs.

---

## 4. Pages Referencing Playground

### Count: 258 files

### Pattern Types

**Type 1: Shortcode Attribute (Most Common)**
```markdown
[example preview="inline" playground="true" imports="amp-accordion"]
```
- Used in component reference docs
- Processed by Grow CMS to generate playground links

**Type 2: Jinja Template (Build-Time)**
```jinja
{% set playground_url = podspec.base_urls.playground + '/?url=' + podspec.base_urls.preview + doc.source %}
<a href="{{ playground_url }}">Open in playground</a>
```

**Type 3: Hardcoded Markdown Links**
```markdown
[AMP Playground](https://playground.amp.dev/?runtime=amp4email)
```

---

## 5. Build Integration

### Build Tasks (`gulpfile.js/build.js`)

```
buildPrepare
└── buildPlayground (line 163-182)
    ├── npm run build:playground (webpack)
    ├── Copy preview.amp.dev/netlify.toml → dist/examples
    ├── Copy pages/static → dist/playground/static
    ├── Copy playground/dist → dist/playground
    └── Copy playground.amp.dev/netlify.toml → dist/playground
```

### Deployment Structure

Playground is built as a separate Netlify site:
- **Build output:** `dist/playground/`
- **Config:** `netlify/configs/playground.amp.dev/netlify.toml`
- **Separate domain:** `playground-amp-new.netlify.app`

---

## 6. External Dependencies

### CDN Dependencies (Hardcoded)

| URL | Purpose | File |
|-----|---------|------|
| `https://cdn.ampproject.org/v0.js` | AMP runtime | `auto-importer.js:19` |
| `https://cdn.ampproject.org/amp4ads-v0.js` | AMP4Ads runtime | `auto-importer.js:21` |
| `https://cdn.ampproject.org/v0/${component}.js` | Components | `auto-importer.js:258` |

### Internal API Dependencies

| Endpoint | Purpose | Handler |
|----------|---------|---------|
| `/api/fetch?url=` | Proxy external URLs | `backend/api.js:47` |
| `/static/files/component-versions.json` | Component list | `components-provider.js:15` |
| `/amphtml-hint.json` | Editor hints | `editor.js:53` |

### NPM Dependencies (from root package.json)

- `dropzone` - File upload
- `json-tree-view` - State visualization
- `codemirror` - Code editor
- `url-search-params` - URL parsing

---

## 7. Configuration Flow

### How Playground URL is Resolved

```
1. Environment Config (platform/config/environments/*.json)
   └── hosts.playground.host = "playground-amp-new.netlify.app"

2. Config Module (platform/lib/config.js:76)
   └── hosts.playground.base = "https://playground-amp-new.netlify.app"

3. Grow Podspec (platform/lib/config.js:230)
   └── base_urls.playground = config.hosts.playground.base

4. Jinja Templates
   └── {{ podspec.base_urls.playground }}
```

### Current `shared.json` Setting

```json
{
  "baseUrls": {
    "playground": "/#url="  // This is a RELATIVE fragment, not a host
  }
}
```

**Note:** The `shared.json` playground value is just the URL fragment pattern, not the host. The actual host comes from environment config.

---

## 8. Recommendations

### Immediate Actions (HIGH Priority)

1. **Fix `pages/shared/data/tools.yaml:462`**
   ```yaml
   # Before
   url: https://playground.amp.dev/
   # After
   url: {{ playground_base_url }}  # Or use config
   ```

2. **Fix `examples/index.html:213-214`**
   - Replace hardcoded `playground.amp.dev` with template variable

### Medium Priority

3. **Documentation files** (~45 files)
   - Consider: Are these intentional references to the canonical `playground.amp.dev`?
   - If amp.dev is sunsetting, need bulk find/replace
   - If keeping both sites, may be intentional

4. **Component docs** (amp-list examples)
   - These are example data, may need to stay as-is for demonstration

### Parameterization Strategy

```javascript
// Option A: Environment variable
const PLAYGROUND_URL = process.env.PLAYGROUND_URL || config.hosts.playground.base;

// Option B: Build-time injection (for static content)
// Add to Grow podspec context, use in templates

// Option C: Post-build replacement (for markdown)
// sed -i 's|playground.amp.dev|$PLAYGROUND_HOST|g' dist/**/*.html
```

### For abc.dev Scaling

The environment config pattern is already correct:
```json
// production.json
"playground": {
  "host": "playground-amp-new.netlify.app"
}
```

For abc.dev, create:
```json
// abc.dev.json
"playground": {
  "host": "playground.abc.dev"  // or playground-abc.netlify.app
}
```

The build pipeline will automatically use the correct host.
