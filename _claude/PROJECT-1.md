# PROJECT-1: Site Configuration Analysis

## Objective

Identify all files that depend on site-specific variables for enabling multi-site configuration.

---

## PRUNING STATUS (Updated 2025-12-28)

### Completed Pruning

| Service                 | Status     | Notes                                           |
| ----------------------- | ---------- | ----------------------------------------------- |
| Pixi                    | ✅ Removed | Directories deleted, references cleaned         |
| Packager                | ✅ Removed | gulpfile.js/packager.js deleted, config removed |
| gCloud Deploy           | ✅ Removed | app.yaml and z-deploy.js deleted                |
| Static-test environment | ✅ Removed | static-test.json deleted                        |

### Remaining Cleanup (Thumbor)

The following thumbor references still exist and should be cleaned up:

| File                                         | Line | Reference          | Action |
| -------------------------------------------- | ---- | ------------------ | ------ |
| `platform/lib/utils/imageOptimizer.js`       | \*   | References thumbor | REVIEW |
| `platform/lib/templates/ImportBlogFilter.js` | \*   | References thumbor | REVIEW |

---

## PRIMARY CONFIGURATION FILES

These files serve as configuration sources:

| File                                            | Purpose                                   | Status |
| ----------------------------------------------- | ----------------------------------------- | ------ |
| `platform/config/shared.json`                   | GA tracking ID, base URLs, thumbor config | Active |
| `platform/config/environments/production.json`  | Production host configurations            | Active |
| `platform/config/environments/staging.json`     | Staging host configurations               | Active |
| `platform/config/environments/development.json` | Development host configurations           | Active |
| `platform/config/environments/local.json`       | Local development hosts                   | Active |
| `platform/lib/config.js`                        | Central configuration loader              | Active |
| `package.json`                                  | Site name, description, repository        | Active |

---

## CONFIGURATION ARCHITECTURE

### How Configuration Flows

```
Environment JSON files → config.js → podspec.yaml → Jinja2 templates
                           ↓
                      JavaScript modules (samples.js, etc.)
```

### Key Integration Points

1. **`platform/lib/config.js`** (lines 68-88): Loads environment configs and shared.json
2. **`config.buildGrowPodSpec()`** (line 198-287): Injects values into podspec for Grow/Jinja2
3. **`podspec.base_urls.*`**: Available in all Jinja2 templates

### Current Podspec Variables (from config.js:228-234)

```javascript
podspec['base_urls'] = {
  'repository': this.shared.baseUrls.repository,
  'playground': this.hosts.playground.base,
  'platform': this.hosts.platform.base,
  'api': this.hosts.api.base,
  'preview': this.hosts.preview.base,
};
```

---

## SITE VARIABLES BY CATEGORY

### 1. Site Name / Branding

| File                                                   | Line | Current Value                                     | Variable Type | Configurable?     |
| ------------------------------------------------------ | ---- | ------------------------------------------------- | ------------- | ----------------- |
| `package.json`                                         | 2    | `"name": "amp-new.netlify.app"`                   | JSON          | ❌ Static         |
| `package.json`                                         | 4    | `"description": "The AMP Project website."`       | JSON          | ❌ Static         |
| `pages/static/manifest.json`                           | 2    | `"name": "amp-new.netlify.app"`                   | JSON          | ❌ Static         |
| `pages/static/manifest.json`                           | 3    | `"short_name": "amp-new"`                         | JSON          | ❌ Static         |
| `frontend/templates/views/partials/structured-data.j2` | 63   | `- amp-new</title>`                               | Jinja2        | ⚠️ Needs variable |
| `frontend/templates/views/partials/structured-data.j2` | 74   | `"name": "amp-new"`                               | JSON-LD       | ⚠️ Needs variable |
| `frontend/templates/views/partials/structured-data.j2` | 85   | `"name": "AMP Project"`                           | JSON-LD       | ⚠️ Needs variable |
| `frontend/templates/views/partials/header.j2`          | 13   | `<span class="ap-o-header-home-title">AMP</span>` | HTML          | ⚠️ Needs variable |

### 2. Domain Names / Host URLs

| File                                           | Line | Current Value                | Configurable?                   |
| ---------------------------------------------- | ---- | ---------------------------- | ------------------------------- |
| `platform/config/environments/production.json` | 6+   | All host configurations      | ✅ Already configurable         |
| `platform/config/environments/staging.json`    | 6+   | All host configurations      | ✅ Already configurable         |
| `pages/static/sitemap/sitemap_manual.xml`      | \*   | Contains amp-new.netlify.app | ⚠️ Needs build-time replacement |
| `pages/static/robots/platform_prod.txt`        | 5    | Sitemap URL                  | ⚠️ Needs build-time replacement |

### 3. External Blog URL

**HARDCODED - Needs Configuration Variable**

| File                                               | Line | Current Value                         |
| -------------------------------------------------- | ---- | ------------------------------------- |
| `frontend/templates/views/partials/header.j2`      | 23   | `https://blog.amp.dev`                |
| `frontend/templates/views/partials/footer.j2`      | 25   | `https://blog.amp.dev/`               |
| `frontend/templates/views/partials/footer.j2`      | 78   | `https://blog.amp.dev/2020/02/20/...` |
| `frontend/templates/views/2021/partials/header.j2` | \*   | Blog link                             |
| `frontend/templates/views/partials/burger-menu.j2` | \*   | Blog link                             |
| `platform/lib/routers/search.js`                   | 267  | `site:blog.amp.dev` in search scope   |

**Recommendation**: Add `blog` host to environment configs and `podspec.base_urls.blog`

### 4. Analytics IDs

| File                                             | Line | Current Value                    | Configurable?           |
| ------------------------------------------------ | ---- | -------------------------------- | ----------------------- |
| `platform/config/shared.json`                    | 6    | `"gaTrackingId": "G-1HFVWLN28T"` | ✅ Already configurable |
| `frontend/templates/views/partials/analytics.j2` | 35   | Uses `podspec.gaTrackingId`      | ✅ Already configurable |

### 5. Social Media / External Links

| File                                                   | Line    | Current Value                   | Configurable?     |
| ------------------------------------------------------ | ------- | ------------------------------- | ----------------- |
| `frontend/templates/views/partials/structured-data.j2` | 107-108 | `@ampproject` (Twitter)         | ⚠️ Needs variable |
| `frontend/templates/views/partials/footer.j2`          | 15      | `https://twitter.com/AMPhtml`   | ⚠️ Needs variable |
| `frontend/templates/views/partials/footer.j2`          | 20      | YouTube channel URL             | ⚠️ Needs variable |
| `frontend/templates/views/partials/footer.j2`          | 30      | `https://github.com/ampproject` | ⚠️ Needs variable |

### 6. GitHub Repository URLs

| File                          | Line | Current Value                                                           | Configurable?           |
| ----------------------------- | ---- | ----------------------------------------------------------------------- | ----------------------- |
| `platform/config/shared.json` | 4    | `"repository": "https://github.com/AFDSI/amp-dev-22/docs/blob/future/"` | ✅ Already configurable |
| `package.json`                | 5    | `"repository": "git@github.com:AFDSI/amp-dev-22.git"`                   | ❌ Static (OK)          |

---

## 11. Playground URLs (CRITICAL)

The playground is the most complex integration requiring careful configuration.

### Current State Summary

| Category                       | Count      | Status                                   |
| ------------------------------ | ---------- | ---------------------------------------- |
| Configuration-based references | 7+ files   | ✅ Working via `config.hosts.playground` |
| Hardcoded `playground.amp.dev` | 73 files   | ❌ Needs attention                       |
| Documentation content          | 100+ files | ⚠️ May be intentional                    |

### A. Configuration-Based (Working)

These properly use `config.hosts.playground.base` or `podspec.base_urls.playground`:

| File                                                                 | Pattern                                      |
| -------------------------------------------------------------------- | -------------------------------------------- |
| `platform/config/environments/*.json`                                | `"playground": { "host": "..." }`            |
| `platform/lib/common/samples.js:46-50`                               | `config.hosts.playground.base + '/?url=...'` |
| `platform/lib/config.js:230`                                         | Builds `podspec.base_urls.playground`        |
| `frontend/templates/views/partials/code-preview/code-preview.j2:146` | `{{podspec.base_urls.playground}}`           |
| `frontend/templates/views/examples/documentation.j2:101`             | `podspec.base_urls.playground`               |

### B. Hardcoded References (Needs Fix)

| File                                                      | Line    | Context                                        | Priority |
| --------------------------------------------------------- | ------- | ---------------------------------------------- | -------- |
| `platform/lib/routers/search.js`                          | 267     | `site:blog.amp.dev OR site:playground.amp.dev` | HIGH     |
| `platform/lib/routers/search.js`                          | 396     | `playgroundUrl: 'https://playground.amp.dev'`  | HIGH     |
| `netlify/functions/search_do/search_do.js`                | 116     | Search scope                                   | HIGH     |
| `pages/shared/data/tools.yaml`                            | 462     | Tools listing URL                              | MEDIUM   |
| `pages/content/amp-dev/documentation/examples/index.html` | 212-213 | Examples index                                 | MEDIUM   |
| `examples/static/inline-examples/data/amp-list-urls.json` | 17      | Example data                                   | LOW      |

### C. Documentation Content (100+ files)

Hardcoded URLs in markdown documentation across all locales. These reference the canonical AMP playground for educational purposes.

**Affected patterns:**

- `https://playground.amp.dev/?runtime=amp4email` (~45 files)
- `[AMP Playground](https://playground.amp.dev/...)` (~50 files)

**Decision needed**: Should documentation reference the canonical playground or the deployed instance?

### D. URL Construction Pattern

```
{playground_host}/?url={preview_host}/{example_path}
         ↓                    ↓
   podspec.base_urls.playground  podspec.base_urls.preview
```

### E. Recommended Actions for Playground

1. **search.js** (line 267): Make search scope configurable:

   ```javascript
   const searchScope = `site:${config.hosts.blog.base} OR site:${config.hosts.playground.base}`;
   ```

2. **search.js** (line 396): Use config for test data:

   ```javascript
   playgroundUrl: config.hosts.playground.base;
   ```

3. **tools.yaml**: Consider templating or accepting canonical URL

4. **Documentation**: Likely keep canonical URLs as educational references

---

## RECOMMENDED CONFIGURATION ADDITIONS

### Add to `shared.json`

```json
{
  "siteName": "amp-new",
  "siteTitle": "AMP",
  "twitterHandle": "@ampproject",
  "socialLinks": {
    "twitter": "https://twitter.com/AMPhtml",
    "youtube": "https://www.youtube.com/channel/UCXPBsjgKKG2HqsKBhWA4uQw",
    "github": "https://github.com/ampproject"
  },
  "blog": {
    "url": "https://blog.amp.dev"
  }
}
```

### Add to config.js buildGrowPodSpec()

```javascript
podspec['base_urls']['blog'] = this.hosts.blog?.base || this.shared.blog?.url;
podspec['site'] = {
  'name': this.shared.siteName,
  'title': this.shared.siteTitle,
  'twitter': this.shared.twitterHandle,
};
```

---

## CDN References (Do NOT Change)

These reference the official AMP CDN and should remain hardcoded:

| Domain                 | Purpose                    |
| ---------------------- | -------------------------- |
| `cdn.ampproject.org`   | AMP runtime and components |
| `fonts.googleapis.com` | Google Fonts               |

---

## EXTERNAL SERVICES (May Need Separate Instances)

| Service              | Current Reference             | Multi-site Consideration        |
| -------------------- | ----------------------------- | ------------------------------- |
| Google Custom Search | `googleapis.com/customsearch` | Need separate Search Engine ID  |
| Google Analytics     | GA4 tracking ID               | Need separate property per site |

---

## STATUS

- [ ] User review and negotiation with Claude Chat
- [ ] Design substitution patterns
- [ ] Implement configuration system

---

## NEXT STEPS

2. **Negotiate variable partitioning** with Claude Chat
3. **Add missing configuration variables** to shared.json
4. **Update templates** to use new variables
5. **Update search.js** for configurable search scope
6. **Decide on documentation** playground URL strategy

---

# User Comments on Claude Code (CC) Analysis

## Related to CC Analysis

### Domain Names / Host URLs

An additional site variable is `Google Site Verifcation` located in `pages/static/`
Site verification is a file, not an inline value defined in `<head>`.
Current value for `amp-new.netlify.app` is `pages/static/googleb5588557ad6b0d99.html`

### Analytics IDs and External Services

Private IDs for external services are stored in `secrets`.
Secrets are site specific.
Local secrets are stored in `env`.
Instances of local secrets for server access are stored in GitHub secrets and Netlify secrets.
Secrets management is a separate, independant process.

Public IDs for external services are in the clear and should be managed by site configuration.
Public IDs are site specific.
Examples: Google Analytics, Google Maps, Google Programmable Search Engine account.

### External Blog URL

The current blog for `amp.dev` is inconsistent with TO BE blog for `abc.dev`.
Further, it is not part of the repository and the file assigned to the blog value is not accessible.
Decision:
Do not address blog in configuration project.
Retain hard wired blog link AS IS.

## User Comments, General

### Site Maps

CC correcty identifies `pages/static/sitemap/sitemap_manual.xml`. `sitemap_manual.xml` is site specific.
Previously, Claude Chat designed a generate for `sitemap_generate.xml` which consumes site-specific URLs.
`sitemap_generate.xml` is integrated in `gulpfile.js/build.js`

### Site Search

`amp-site-search` fails to integrate Google Programmable Search Engine (GPSE) and site search results. The reason may be XHR end points are misalligned with Netlify functions.
However, the GPSE API value is a `secret` and seprately managed. The GPSE ID is site specific and registered with the site configuration process.
