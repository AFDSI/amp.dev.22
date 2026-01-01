# amp.dev.22 Project Analysis Report

**Date**: 2026-01-01
**Baseline**: Post-Phase 0 Cleanup
**Status**: Clean baseline established

---

## Executive Summary

This analysis identifies **19 project areas** across the amp.dev.22 codebase, establishes their dependencies, and provides a phased implementation sequence for the site configuration migration (amp.dev → abc.dev).

### Key Findings

| Metric | Count |
|--------|-------|
| Total Project Areas | 19 |
| Express Routers | 15 active |
| Netlify Functions | 47 directories |
| Configuration Files | 6 primary |
| Phase 0 Cleanup | ✅ Complete |

### Phase 0 Cleanup Status (COMPLETE)

| Item | Status |
|------|--------|
| `packager.js` deleted | ✅ |
| 6 npm packages removed | ✅ |
| `pageCache.js` → LRU-only | ✅ |
| `credentials.js` → env-var only | ✅ |
| Lint passes | ⚠️ (npm install blocked by network) |

---

## 1. Dependency Matrix

### 19 Project Areas Identified

| # | Project | Upstream Dependencies | Downstream Dependents | Shared Infrastructure |
|---|---------|----------------------|----------------------|----------------------|
| 1 | **Site Configuration** | shared.json, environments/*.json | All templates, routers, build | config.js |
| 2 | **Environment Config** | None | config.js, podspec | JSON files |
| 3 | **Playground** | config.hosts.playground | search.js, samples.js, templates | Express, Webpack |
| 4 | **Search System** | googleSearch.js, config, samples | Frontend search UI | Express + Netlify |
| 5 | **Grow CMS** | config, templates, pageCache | All HTML pages | nunjucks, LRU |
| 6 | **Examples System** | samplesBuilder, config | Inline examples, docs | Gulp build |
| 7 | **Static Assets** | project paths | All pages | Express static |
| 8 | **Netlify Functions** | credentials, googleSearch | API endpoints | Serverless |
| 9 | **Health Check** | None | Monitoring | Express |
| 10 | **CSP Reporting** | cacheHelpers | Security logging | Express |
| 11 | **Go Links** | go-links.yaml, config | URL redirects | Express |
| 12 | **Survey Component** | credentials, google-spreadsheet | User feedback | Express |
| 13 | **Template System** | nunjucks, project | All rendered pages | Templates lib |
| 14 | **Boilerplate** | Templates | Starter projects | Express backend |
| 15 | **Build Pipeline** | All sources | Dist output | Gulp |
| 16 | **Frontend Styling** | SCSS sources | All pages | Webpack, Sass |
| 17 | **Credentials** | Environment vars | Survey, Search | Utils |
| 18 | **Caching** | LRU-cache | growPages | Utils |
| 19 | **Middleware Stack** | config, security rules | All requests | Express |

### Dependency Graph (Critical Path)

```
shared.json ─────┐
                 ├──► config.js ──┬──► podspec.yaml ──► Jinja2 Templates
environments/*.json ─┘            │
                                  ├──► search.js ──► Netlify search_do
                                  ├──► samples.js ──► Examples
                                  └──► middleware ──► All routes
```

### Files Modified Per Project

| Project | Primary Files | Secondary Files | Config Files |
|---------|--------------|-----------------|--------------|
| Site Configuration | config.js | podspec.yaml | shared.json, environments/*.json |
| Playground | playground/backend/ | playground/src/ | config.hosts.playground |
| Search | search.js, search_do.js | googleSearch.js | credentials |
| Grow CMS | growPages.js, growXmls.js | pageCache.js | podspec.yaml |
| Examples | samplesBuilder.js | inlineExamples.js | samples.js |
| Static Assets | static.js | staticify.js | project paths |
| Go Links | go.js | - | go-links.yaml |
| Survey | surveyComponent.js | - | credentials |
| Templates | templates/ lib | - | nunjucks config |
| Build Pipeline | gulpfile.js/* | - | build-info.yaml |
| Frontend | frontend/scss, templates | - | webpack.config |

### Conflict Analysis

| Project A | Project B | Potential Conflict | Resolution |
|-----------|-----------|-------------------|------------|
| Search | Playground | Both use config.hosts.playground | Coordinate URL updates |
| Grow CMS | Examples | Both modify podspec | Sequential updates |
| Build Pipeline | All | Build order dependencies | Phase sequencing |
| Config | All | Central dependency | Update first |

---

## 2. Recommended Implementation Sequence

### Phase 1: Foundation (No Breaking Changes)

**Objective**: Establish configurable site identity without breaking existing functionality.

| Order | Project | Action | Risk |
|-------|---------|--------|------|
| 1.1 | Site Configuration | Add site identity to shared.json | LOW |
| 1.2 | Environment Config | Verify all hosts configurable | LOW |
| 1.3 | config.js | Expose site identity to podspec | LOW |
| 1.4 | Templates | Update to use podspec.site.* | LOW |

**Files**:
- `platform/config/shared.json` - Add site.name, site.title
- `platform/lib/config.js` - Already done (lines 237-254)
- `frontend/templates/views/partials/header.j2` - Use `{{podspec.site.title}}`
- `frontend/templates/views/partials/footer.j2` - Use `{{podspec.social.*}}`

### Phase 2: Search & Playground (Medium Risk)

**Objective**: Make search scope and playground URLs fully configurable.

| Order | Project | Action | Risk |
|-------|---------|--------|------|
| 2.1 | Search Router | Replace hardcoded playground.amp.dev | MEDIUM |
| 2.2 | Search Netlify | Use env vars for SITE_BASE_URL | MEDIUM |
| 2.3 | Playground | Verify config.hosts.playground flow | LOW |

**Files**:
- `platform/lib/routers/search.js:267,396` - Use config.hosts
- `netlify/functions/search_do/search_do.js:14-17` - Already uses env vars ✅
- `netlify/functions/search_do/googleSearch.js` - Verify credentials

**Current State (search_do.js)**:
```javascript
const SITE_BASE_URL = process.env.SITE_BASE_URL || 'https://amp-new.netlify.app';
const PLAYGROUND_BASE_URL = process.env.PLAYGROUND_BASE_URL || 'https://playground-amp-new.netlify.app';
```
✅ Already configurable via environment variables!

### Phase 3: Static Assets & Build (Low Risk)

**Objective**: Ensure all static file references use configuration.

| Order | Project | Action | Risk |
|-------|---------|--------|------|
| 3.1 | Sitemap | Verify sitemap_generate.xml uses config | LOW |
| 3.2 | Robots.txt | Verify uses config.hosts.platform | LOW |
| 3.3 | manifest.json | Template or configure | LOW |

**Files**:
- `pages/static/manifest.json` - Needs templating
- `pages/static/sitemap/sitemap_manual.xml` - Review
- `platform/lib/routers/robots.js` - Already uses config

### Phase 4: Cleanup & Documentation (No Risk)

**Objective**: Remove remaining hardcoded references, update documentation.

| Order | Project | Action | Risk |
|-------|---------|--------|------|
| 4.1 | Documentation | Decide on playground.amp.dev in docs | DECISION |
| 4.2 | tools.yaml | Update playground reference | LOW |
| 4.3 | Health Check | Verify endpoint works | LOW |
| 4.4 | Survey | Configure or disable | DECISION |

---

## 3. Testability Assessment

| # | Project | Unit Test | Integration | Manual Steps | Error Scenarios | Rollback |
|---|---------|-----------|-------------|--------------|-----------------|----------|
| 1 | Site Configuration | Y | Y | Check header/footer branding | Missing config keys | Revert shared.json |
| 2 | Environment Config | Y | N | localhost vs production | Invalid JSON | Revert env file |
| 3 | Playground | N | Y | Open playground URL | 404, CORS errors | Revert config |
| 4 | Search | Y ✅ | Y | Search query test | API timeout, no results | Feature flag |
| 5 | Grow CMS | Y ✅ | Y | Page render test | Template errors | Revert podspec |
| 6 | Examples | N | Y | View examples page | Missing samples | Rebuild |
| 7 | Static Assets | N | N | Check asset URLs | 404 errors | Rebuild |
| 8 | Netlify Functions | Y | Y | API endpoint test | Lambda timeout | Redeploy |
| 9 | Health Check | Y ✅ | N | GET /health | Server error | N/A |
| 10 | CSP Reporting | N | N | Check console | Logging failure | N/A |
| 11 | Go Links | Y ✅ | N | Test redirect | 404 redirect | Revert yaml |
| 12 | Survey | Y ✅ | Y | Submit survey | Credential error | Disable router |
| 13 | Templates | N | Y | Page render | Syntax error | Revert template |
| 14 | Boilerplate | N | Y | Download boilerplate | Build error | Rebuild |
| 15 | Build Pipeline | N | Y | `npm run build` | Build failure | Fix and rebuild |
| 16 | Frontend | N | Y | Visual check | CSS errors | Rebuild |
| 17 | Credentials | Y | N | Check env vars | Missing creds | Add env vars |
| 18 | Caching | N | N | Cache hit/miss | Memory pressure | Clear cache |
| 19 | Middleware | N | Y | Security headers | Blocked request | Revert |

### Existing Tests

| File | Type | Coverage |
|------|------|----------|
| `platform/lib/routers/go.test.js` | Unit | Go Links |
| `platform/lib/routers/search.test.js` | Unit | Search |
| `platform/lib/routers/surveyComponent.test.js` | Unit | Survey |
| `platform/lib/routers/growPages.test.js` | Unit | Grow Pages |
| `smoke-tests/` | E2E | Smoke tests |

---

## 4. Health Check Delta

### Phase 0 Complete (HIGH Priority)

| Item | Before | After |
|------|--------|-------|
| `packager.js` | Exists (dead) | ✅ Deleted |
| `@google-cloud/datastore` | In package.json | ✅ Removed |
| `gcp-metadata` | In package.json | ✅ Removed |
| `ioredis` | In package.json | ✅ Removed |
| `http-proxy` | In package.json | ✅ Removed |
| `dropzone` | In package.json | ✅ Removed |
| `json-tree-view` | In package.json | ✅ Removed |
| `pageCache.js` | Redis + LRU | ✅ LRU only |
| `credentials.js` | Datastore + env | ✅ Env only |

### Remaining Warnings (MEDIUM Priority)

| Item | File | Issue | Priority |
|------|------|-------|----------|
| Thumbor references | `imageOptimizer.js`, `ImportBlogFilter.js` | Review/remove | MEDIUM |
| Survey credentials | `surveyComponent.js` | Needs env vars or disable | MEDIUM |
| Hardcoded blog URL | Multiple templates | Keep as-is per user decision | LOW |
| Commented packager/thumbor | `platform.js` | Comments only, safe | LOW |

### Remaining Cleanup Tasks

| Task | Files | Action |
|------|-------|--------|
| Review thumbor | `platform/lib/utils/imageOptimizer.js` | Check if functional |
| Survey decision | `platform/lib/routers/surveyComponent.js` | Enable or disable |
| Remove .original files | `static.js.original` | Delete backup |

---

## 5. Express-to-Netlify Migration Map

### Router Status

| Express Router | Path(s) | Netlify Function | Status |
|----------------|---------|------------------|--------|
| **search.js** | `/search/do` | `search_do` | ✅ DONE |
| **search.js** | `/search/autosuggest` | `autosuggest.js` | ✅ DONE |
| **search.js** | `/search/highlights` | - | Express only |
| **search.js** | `/search/latest-query` | `latest-query` | ✅ DONE |
| **go.js** | `/go/*` | - | Express only (subdomain) |
| **healthCheck.js** | `/health` | - | Express only |
| **cspReport.js** | `/csp-report` | - | Express only |
| **surveyComponent.js** | `/survey` | - | Express only |
| **whoAmI.js** | `/who-am-i` | - | Express only |
| **boilerplate** | `/boilerplate/*` | - | Express only |
| **growPages.js** | `/*` (catch-all) | - | Static build |
| **growXmls.js** | `/*.xml` | - | Static build |
| **static.js** | `/static/*` | - | Netlify CDN |
| **templates.js** | `/templates/*` | - | Express only |

### Example API Functions (All Migrated)

| Express Endpoint | Netlify Function | Status |
|------------------|------------------|--------|
| `/documentation/examples/api/amp-access/authorization` | `examples_api_amp-access_authorization` | ✅ DONE |
| `/documentation/examples/api/amp-access/login` | `examples_api_amp-access_login` | ✅ DONE |
| `/documentation/examples/api/amp-access/logout` | `examples_api_amp-access_logout` | ✅ DONE |
| `/documentation/examples/api/amp-access/pingback` | `examples_api_amp-access_pingback` | ✅ DONE |
| `/documentation/examples/api/amp-consent/get_consent` | `examples_api_amp-consent_get_consent` | ✅ DONE |
| `/documentation/examples/api/amp-form/submit_form` | `examples_api_amp-form_submit_form` | ✅ DONE |
| `/documentation/examples/api/amp-form/submit_form_xhr` | `examples_api_amp-form_submit_form_xhr` | ✅ DONE |
| `/documentation/examples/api/autosuggest/*` | `examples_api_autosuggest_*` (4 functions) | ✅ DONE |
| `/documentation/examples/api/cache/*` | `examples_api_cache_*` (5 functions) | ✅ DONE |
| `/documentation/examples/api/echo` | `examples_api_echo` | ✅ DONE |
| `/documentation/examples/api/hello` | `examples_api_hello` | ✅ DONE |
| `/documentation/examples/api/photo_stream` | `examples_api_photo_stream` | ✅ DONE |
| `/documentation/examples/api/products` | `examples_api_products` | ✅ DONE |
| `/documentation/examples/api/slow_response/*` | `examples_api_slow_response_*` (4 functions) | ✅ DONE |
| `/documentation/examples/api/time` | `examples_api_time` | ✅ DONE |

**Total Example Functions**: 37 migrated

### Migration Summary

| Category | Express | Netlify | Status |
|----------|---------|---------|--------|
| Core Routers | 15 | 3 | Hybrid |
| Example APIs | 37 | 37 | ✅ Complete |
| Static Files | Express | CDN | ✅ Complete |
| Dynamic Pages | Express | Build | ✅ Complete |

### Not Migrated (Express Only)

These remain Express-only and are accessed via the local dev server:

1. **go.js** - Subdomain routing
2. **healthCheck.js** - Server health
3. **surveyComponent.js** - Google Sheets integration
4. **templates.js** - Template files
5. **boilerplate** - Starter kit generator
6. **runtimeLog.js** - Error logging

---

## Appendix A: Configuration Files Reference

### Primary Configuration

| File | Purpose | Site-Specific? |
|------|---------|----------------|
| `platform/config/shared.json` | Site identity, GA ID, social links | ✅ YES |
| `platform/config/environments/production.json` | Production hosts | ✅ YES |
| `platform/config/environments/staging.json` | Staging hosts | ✅ YES |
| `platform/config/environments/local.json` | Local dev hosts | NO |
| `platform/lib/config.js` | Configuration loader | NO |
| `platform/config/podspec.yaml` | Grow template | NO |

### Secondary Configuration

| File | Purpose | Site-Specific? |
|------|---------|----------------|
| `package.json` | Package name | ✅ YES |
| `pages/static/manifest.json` | PWA manifest | ✅ YES |
| `platform/config/go-links.yaml` | URL redirects | ✅ YES |
| `netlify.toml` | Netlify config | ✅ YES |

---

## Appendix B: Environment Variables

### Required for Netlify

| Variable | Purpose | Used By |
|----------|---------|---------|
| `SITE_BASE_URL` | Site base URL | search_do.js |
| `PLAYGROUND_BASE_URL` | Playground URL | search_do.js |
| `AMP_DEV_CREDENTIAL_GOOGLE` | Google API key | googleSearch.js |
| `AMP_DEV_CREDENTIAL_GOOGLE_SEARCH` | Search Engine ID | googleSearch.js |

### Optional

| Variable | Purpose | Default |
|----------|---------|---------|
| `APP_ENV` | Environment name | production |
| `NODE_ENV` | Node environment | production |

---

## Status

- [x] Dependency Matrix complete
- [x] Recommended Sequence defined
- [x] Testability assessed
- [x] Health Check Delta documented
- [x] Express-to-Netlify map complete
- [ ] User review and approval
