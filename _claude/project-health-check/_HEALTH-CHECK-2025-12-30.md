# Health Check Report: amp.dev.22

**Date**: 2025-12-30
**Deployed**: https://amp-new.netlify.app/
**Focus**: Python/JavaScript dependencies, dead code, gCloud remnants

---

## Executive Summary

The repository has been significantly cleaned up from the pixi/gCloud pruning. However, several **dead code paths** and **unused dependencies** remain that are specific to the former Google Cloud deployment model.

### Critical Findings

| Category | Count | Impact |
|----------|-------|--------|
| Dead code files | 1 | Can delete |
| Dead npm dependencies | 5 | Can remove from package.json |
| gCloud-only code paths | 3 | Need refactoring for Netlify |
| Unused dependencies | 2 | Can remove from package.json |

---

## 1. DEAD CODE FILES

### Files to DELETE

| File | Reason | Uses |
|------|--------|------|
| `platform/lib/routers/packager.js` | Commented out in platform.js, SXG packager for gCloud | `http-proxy` |

### Verification
The import in `platform/lib/platform.js` is already commented out:
```javascript
// packager: require('@lib/routers/packager.js'),
// this.server.use(routers.packager);
```

---

## 2. GOOGLE CLOUD DEPENDENCIES (Dead on Netlify)

These npm packages are only used for Google Cloud features that don't work on Netlify:

| Package | Used By | Purpose | Recommendation |
|---------|---------|---------|----------------|
| `@google-cloud/datastore` | `platform/lib/utils/credentials.js`, `netlify/functions/search_do/credentials.js` | Credential storage in GCloud Datastore | REFACTOR or REMOVE |
| `gcp-metadata` | `platform/lib/utils/pageCache.js` | Get GCP zone/region metadata | REMOVE (use LRU only) |
| `ioredis` | `platform/lib/utils/pageCache.js` | Redis caching in GCP | REMOVE (use LRU only) |
| `http-proxy` | `platform/lib/routers/packager.js` | SXG packager proxy | REMOVE with packager.js |

### Impact Analysis

**`platform/lib/utils/credentials.js`**:
- Used by: `surveyComponent.js`, `googleSearch.js`, example APIs
- Falls back to environment variables when not on GCloud
- On Netlify: Will always use env vars, never GCloud Datastore
- **Action**: Keep for env var fallback, but package is dead weight

**`platform/lib/utils/pageCache.js`**:
- Used by: `growPages.js`
- Uses `gcp-metadata` to detect GCP region for Redis
- On Netlify: Always falls back to LRU cache
- **Action**: Simplify to LRU-only, remove Redis/GCP code

**`netlify/functions/search_do/credentials.js`**:
- Duplicate of platform version for Netlify functions
- Same issue: GCloud Datastore never available
- **Action**: Simplify to env-var only

---

## 3. UNUSED NPM DEPENDENCIES

These packages are in `package.json` but not imported anywhere:

| Package | Version | Recommendation |
|---------|---------|----------------|
| `dropzone` | 5.9.3 | REMOVE |
| `json-tree-view` | 0.4.12 | REMOVE |

---

## 4. EXAMPLE/SAMPLE API DEPENDENCIES

These are **actively used** by example APIs and Netlify functions:

| Package | Used Count | Purpose |
|---------|------------|---------|
| `multer` | 13 files | File uploads in examples |
| `busboy` | 8 files | Form parsing in Netlify functions |
| `client-sessions` | 1 file | Shopping cart example |
| `web-push` | 1 file | Web push example |
| `ws` | 1 file | WebSocket server example |

**These should be kept** as they support working example functionality.

---

## 5. PYTHON DEPENDENCIES

**Status**: ✅ Clean

`Pipfile` has no package dependencies - only specifies Python 3.9. The Grow extensions use Python but don't have external pip dependencies beyond Grow itself.

---

## 6. REMAINING GCLOUD REFERENCES (Non-blocking)

These are external services or comments, not project infrastructure:

| File | Reference | Type |
|------|-----------|------|
| `platform/lib/utils/cacheHelpers.js:58` | `csp-collector.appspot.com` | External AMP CSP reporting service |
| `platform/lib/build/samplesBuilder.js:73` | Commented `amp-by-example-api.appspot.com` | Already disabled |
| Example APIs | `@google-cloud/datastore` | For demo purposes only |

---

## 7. SURVEY COMPONENT STATUS

`platform/lib/routers/surveyComponent.js`:
- Uses `credentials.js` → GCloud Datastore (will fail on Netlify)
- Uses `google-spreadsheet` → Requires credentials
- **Status**: Non-functional on Netlify without env vars configured
- **Action**: Either configure env vars or disable survey endpoint

---

## 8. RECOMMENDATIONS BY PRIORITY

### HIGH Priority (Clean Dead Code)

1. **Delete** `platform/lib/routers/packager.js`
2. **Remove from package.json**:
   - `@google-cloud/datastore` (if not needed for survey)
   - `gcp-metadata`
   - `ioredis`
   - `http-proxy`
   - `dropzone`
   - `json-tree-view`

3. **Simplify** `platform/lib/utils/pageCache.js`:
   - Remove Redis and GCP metadata code
   - Keep LRU cache only

### MEDIUM Priority (Code Cleanup)

4. **Simplify** `platform/lib/utils/credentials.js`:
   - Remove GCloud Datastore code path
   - Keep environment variable approach only

5. **Review** survey component:
   - Decide if survey functionality is needed
   - If yes: ensure env vars are configured
   - If no: disable or remove surveyComponent router

### LOW Priority (abc.dev Migration Specific)

6. These are **local to amp.dev** and don't affect abc.dev migration:
   - CSP report URL (`csp-collector.appspot.com`)
   - Example API demos using GCloud

---

## 9. PACKAGE.JSON CLEANUP SUMMARY

**Can be removed** (dead on Netlify):
```json
{
  "dependencies": {
    "@google-cloud/datastore": "8.7.0",  // Dead unless survey is used
    "gcp-metadata": "6.1.0",              // Dead (GCP metadata)
    "ioredis": "5.4.1",                   // Dead (Redis)
    "http-proxy": "1.18.1",               // Dead (packager)
    "dropzone": "5.9.3",                  // Unused
    "json-tree-view": "0.4.12"            // Unused
  }
}
```

**Savings**: ~6 packages, reduced install size

---

## 10. ABC.DEV MIGRATION RELEVANCE

| Issue | Relevant to abc.dev? | Notes |
|-------|---------------------|-------|
| Dead GCloud code | ✅ Yes | Clean before forking |
| pageCache simplification | ✅ Yes | Use LRU-only |
| Unused dependencies | ✅ Yes | Cleaner package.json |
| Survey component | ❌ No | Site-specific feature |
| CSP report URL | ❌ No | Can keep as-is |
| Example APIs | ❌ No | Demo code only |

---

## STATUS

- [x] Dependencies analyzed
- [x] Dead code identified
- [x] gCloud remnants catalogued
- [x] Recommendations prioritized
- [ ] Cleanup implementation (pending user approval)
