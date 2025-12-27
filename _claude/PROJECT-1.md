# PROJECT-1: Site Configuration Analysis

## Objective
Identify all files that depend on site-specific variables for enabling multi-site configuration.

---

## PRIMARY CONFIGURATION FILES

These files already serve as configuration sources:

| File | Purpose |
|------|---------|
| `platform/config/shared.json` | GA tracking ID, base URLs |
| `platform/config/environments/production.json` | Production host configurations |
| `platform/config/environments/staging.json` | Staging host configurations |
| `platform/config/environments/development.json` | Development host configurations |
| `platform/config/environments/local.json` | Local development hosts |
| `package.json` | Site name, description, repository |
| `pixi/config.js` | API endpoints (development/production) |
| `app.yaml` | Google Cloud App Engine config |

---

## SITE VARIABLES BY CATEGORY

### 1. Site Name / Branding

| File | Line | Current Value | Variable Type |
|------|------|---------------|---------------|
| `package.json` | 2 | `"name": "amp-new.netlify.app"` | JSON |
| `package.json` | 4 | `"description": "The AMP Project website."` | JSON |
| `pages/static/manifest.json` | 2 | `"name": "amp-new.netlify.app"` | JSON |
| `pages/static/manifest.json` | 3 | `"short_name": "amp-new"` | JSON |
| `frontend/templates/views/partials/structured-data.j2` | 63 | `- amp-new</title>` | Jinja2 |
| `frontend/templates/views/partials/structured-data.j2` | 74 | `"name": "amp-new"` | Jinja2/JSON-LD |
| `frontend/templates/views/partials/structured-data.j2` | 85 | `"name": "AMP Project"` | Jinja2/JSON-LD |
| `frontend/templates/views/partials/header.j2` | 13 | `<span class="ap-o-header-home-title">AMP</span>` | Jinja2/HTML |

### 2. Domain Names / Host URLs

| File | Line | Current Value | Variable Type |
|------|------|---------------|---------------|
| `platform/config/environments/production.json` | 6 | `"host": "amp-new.netlify.app"` | JSON |
| `platform/config/environments/staging.json` | 6 | `"host": "amp-new.netlify.app"` | JSON |
| `pages/static/sitemap/sitemap_manual.xml` | 4 | `https://playground-amp-new.netlify.app` | XML |
| `pages/static/sitemap/sitemap_manual.xml` | 7 | `https://amp-new.netlify.app/boilerplate/` | XML |
| `pages/static/sitemap/sitemap.xml` | * | Contains amp-new.netlify.app URLs | XML |
| `pages/static/robots/platform_prod.txt` | 5 | `Sitemap: https://amp-new.netlify.app/sitemap.xml` | Text |
| `pages/static/serviceworker.html` | 6 | `https://amp-new.netlify.app/serviceworker.js` | HTML/JS |
| `pages/static/serviceworker.txt` | * | Service worker URLs | Text |
| `netlify/configs/playground.amp.dev/netlify.toml` | * | Playground domain references | TOML |
| `netlify/configs/preview.amp.dev/netlify.toml` | * | Preview domain references | TOML |

### 3. External Blog URL

| File | Line | Current Value | Variable Type |
|------|------|---------------|---------------|
| `frontend/templates/views/partials/header.j2` | 23 | `https://blog.amp.dev` | Jinja2/HTML |
| `frontend/templates/views/partials/footer.j2` | 25 | `https://blog.amp.dev/` | Jinja2/HTML |
| `frontend/templates/views/partials/footer.j2` | 78 | `https://blog.amp.dev/2020/02/20/amp-conf-2020-return-to-nyc/` | Jinja2/HTML |
| `frontend/templates/views/2021/partials/header.j2` | * | Blog link | Jinja2/HTML |
| `frontend/templates/views/partials/burger-menu.j2` | * | Blog link | Jinja2/HTML |
| `platform/lib/templates/ImportBlogFilter.js` | * | Blog import logic | JavaScript |
| `netlify/functions/search_do/search_do.js` | * | Blog search integration | JavaScript |

### 4. Analytics IDs

| File | Line | Current Value | Variable Type |
|------|------|---------------|---------------|
| `platform/config/shared.json` | 6 | `"gaTrackingId": "G-1HFVWLN28T"` | JSON |
| `frontend/templates/views/partials/analytics.j2` | 35-37 | Uses `podspec.gaTrackingId` | Jinja2 |

**Legacy example analytics (in sample code):**
- `examples/source/news-publishing/*.html` - `UA-73836974-1`
- `examples/source/e-commerce/*.html` - `UA-73836974-1`, `UA-80609902-1`

### 5. Social Media / External Links

| File | Line | Current Value | Variable Type |
|------|------|---------------|---------------|
| `frontend/templates/views/partials/structured-data.j2` | 107-108 | `@ampproject` (Twitter) | Jinja2 |
| `frontend/templates/views/partials/footer.j2` | 15 | `https://twitter.com/AMPhtml` | Jinja2/HTML |
| `frontend/templates/views/partials/footer.j2` | 20 | `https://www.youtube.com/channel/UCXPBsjgKKG2HqsKBhWA4uQw` | Jinja2/HTML |
| `frontend/templates/views/partials/footer.j2` | 30 | `https://github.com/ampproject` | Jinja2/HTML |
| `frontend/templates/views/partials/footer.j2` | 34 | `https://stackoverflow.com/questions/tagged/amp-html` | Jinja2/HTML |
| `pages/content/amp-dev/index.html` | 89,97 | Newsletter signup URLs (Google Forms) | HTML/Jinja2 |

### 6. GitHub Repository URLs

| File | Line | Current Value | Variable Type |
|------|------|---------------|---------------|
| `platform/config/shared.json` | 4 | `"repository": "https://github.com/AFDSI/amp-dev-22/docs/blob/future/"` | JSON |
| `package.json` | 5 | `"repository": "git@github.com:AFDSI/amp-dev-22.git"` | JSON |
| `netlify/configs/amp.dev/netlify.toml` | 70-76 | `https://github.com/ampproject/amphtml/` (redirects) | TOML |
| `pages/content/amp-dev/index.html` | 392 | `https://github.com/orgs/ampproject/people` | HTML |
| `pages/content/amp-dev/index.html` | 407 | `https://github.com/ampproject/amphtml/issues` | HTML |

### 7. API Endpoints / Cloud Functions

| File | Line | Current Value | Variable Type |
|------|------|---------------|---------------|
| `pixi/config.js` | 18-19 | `http://localhost:8080/page-experience/api/lint` (dev) | JavaScript |
| `pixi/config.js` | 29-30 | `https://amp.dev/page-experience/api/lint` (prod) | JavaScript |
| `pixi/config.js` | 22,33 | `https://us-central1-amp-dev-230314.cloudfunctions.net/checkPageExperience` | JavaScript |
| `pixi/config.js` | 35 | `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` | JavaScript |
| `pixi/config.js` | 37 | `https://searchconsole.googleapis.com/v1/urlTestingTools/mobileFriendlyTest:run` | JavaScript |
| `platform/lib/build/samplesBuilder.js` | 73 | `https://amp-by-example-api.appspot.com` | JavaScript |
| `netlify/functions/search_do/googleSearch.js` | 29 | `https://www.googleapis.com/customsearch/v1` | JavaScript |
| `platform/lib/utils/googleSearch.js` | 29 | `https://www.googleapis.com/customsearch/v1` | JavaScript |

### 8. Google Cloud Project References

| File | Line | Current Value | Variable Type |
|------|------|---------------|---------------|
| `pixi/config.js` | 22,33 | `amp-dev-230314` (project ID) | JavaScript |
| `platform/config/environments/development.json` | 50 | `amp-dev-sxg.appspot.com` | JSON |
| `platform/config/environments/static-test.json` | 11 | `amp-dev-staging.appspot.com` | JSON |
| `thumbor/Dockerfile` | 14-15 | `amp-dev-staging.appspot.com` | Docker |
| `gulpfile.js/packager.js` | 43 | `amp-dev-staging.appspot.com` | JavaScript |

### 9. Publisher Organization Info

| File | Line | Current Value | Variable Type |
|------|------|---------------|---------------|
| `frontend/templates/views/partials/structured-data.j2` | 85 | `"name": "AMP Project"` | Jinja2/JSON-LD |
| `package.json` | 47 | `"author": "The AMP HTML Authors"` | JSON |
| `frontend/templates/views/partials/footer.j2` | 67 | `OpenJS Foundation` section | Jinja2/HTML |
| `frontend/templates/views/partials/footer.j2` | 99 | Copyright with `OpenJS Foundation and AMP Project` | Jinja2/HTML |

### 10. CDN / External Script References

| File | Line | Current Value | Variable Type |
|------|------|---------------|---------------|
| `frontend/templates/layouts/default.j2` | 43 | `https://cdn.ampproject.org/v0.js` | Jinja2/HTML |
| `frontend/templates/views/partials/footer.j2` | 101 | `https://cdn.ampproject.org` reference | Jinja2/HTML |
| Various template files | * | `https://fonts.googleapis.com/` | HTML |

---

## FILE TYPES AND SUBSTITUTION METHODS

| File Type | Extension | Substitution Method |
|-----------|-----------|---------------------|
| JSON | `.json` | Direct key replacement or JSON template processing |
| JavaScript | `.js` | Environment variables, config imports, or build-time replacement |
| Jinja2 Templates | `.j2` | Template variables from podspec or context |
| YAML | `.yaml`, `.yml` | Direct key replacement or Jinja-style templating |
| TOML | `.toml` | Direct key replacement |
| HTML | `.html` | Build-time replacement or template processing |
| XML | `.xml` | Build-time replacement |
| Text | `.txt` | Build-time replacement |
| Markdown | `.md` | Content is informational; links may need updates |
| Docker | `Dockerfile` | Build arguments or environment variables |

---

## NOTES FOR DISCUSSION

1. **Environment Files Already Exist**: The `platform/config/environments/` directory already supports multiple environments. This pattern could be extended for multi-site configuration.

2. **Config Loading**: `platform/lib/config.js` (line 68-88) loads environment configs and `shared.json`. This is the central configuration hub.

3. **Grow CMS Integration**: `platform/lib/config.js` configures Grow via `buildGrowPodSpec()` which injects values into the podspec. This is a key integration point.

4. **Content Files**: Many markdown files in `pages/content/amp-dev/` contain hardcoded references (e.g., `ampproject` GitHub links). These are informational content and may not need variable substitution.

5. **Example Code**: Files in `examples/source/` contain example Analytics IDs and API endpoints. These are sample code for documentation and likely should remain as examples.

6. **External Service Dependencies**: Several Google Cloud services (`amp-dev-230314`, `amp-dev-sxg`, etc.) and external APIs are referenced. Multi-site deployment may require separate service instances.

---

## STATUS

- [x] Initial scan complete
- [ ] User review and additional context
- [ ] Finalize variable list
- [ ] Design substitution patterns
- [ ] Implement configuration system
