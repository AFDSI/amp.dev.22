# Netlify Functions Analysis for amp.dev.22

## Overview

This document provides a comprehensive analysis of all Netlify functions in the amp.dev.22 project, focusing on Node 22 compatibility issues and critical bugs.

**Date:** December 18, 2025
**Branch:** `claude/netlify-functions-analysis-Q03Nz`
**Node Version:** 22.x (as specified in `package.json`)

---

## Executive Summary

### Critical Issues Found

| Priority | Issue | Location | Status |
|----------|-------|----------|--------|
| 🔴 Critical | Missing functions (`createPageObject`, `addExampleAndPlaygroundLink`) | `search_do/search_do.js` | Needs Fix |
| 🔴 Critical | Undefined `config` reference | `search_do/search_do.js:123` | Needs Fix |
| 🔴 Critical | Undefined `request.query` reference | `search_do/search_do.js:131-133` | Needs Fix |
| 🔴 Critical | Undefined `request.query` reference | `fetch/fetch.js:49` | Needs Fix |
| 🟡 Medium | Deprecated `url.parse()` | `fetch/rateLimitedFetch.js:63` | Node 22 Warning |
| 🟡 Medium | Deprecated `substr()` | `search_do/googleSearch.js:55` | Node 22 Warning |
| 🟢 Low | Old middy package (v0.36.0) | `examples_api_amp-inputmask` | Monitor |
| 🟢 Low | LRU cache using `maxAge` API (v6) | `fetch/rateLimitedFetch.js` | Compatible but outdated |

---

## Detailed Analysis

### 1. `netlify/functions/search_do/` - **CRITICAL**

#### Files:
- `search_do.js` - Main handler
- `googleSearch.js` - Google Custom Search API integration
- `credentials.js` - Credential management via Google Cloud Datastore
- `log.js` - Signale logger wrapper

#### Critical Bugs in `search_do.js`:

**1. Missing Function Definitions**
```javascript
// Line 177: createPageObject is called but never defined
const page = createPageObject(item);

// Line 60: addExampleAndPlaygroundLink is called but never defined
addExampleAndPlaygroundLink(page, locale);
```

**2. Undefined `config` Reference**
```javascript
// Line 123: config is never imported
searchOptions.hiddenQuery =
  `more:pagemap:metatags-page-locale:${config.getDefaultLocale()}` +
```

**3. Undefined `request.query` References**
```javascript
// Lines 131-133: Uses 'request' which is never defined
const error =
  'Invalid search params (q=' +
  request.query.q +    // Should be: searchQuery.q or query
  ', page=' +
  request.query.page + // Should be: searchQuery.page or ev.queryStringParameters.page
  ')';
```

**4. Double JSON Stringification**
```javascript
// Line 205-214: createResult() already returns JSON.stringify(result)
// Then it's wrapped in another JSON.stringify()
body: JSON.stringify(
  createResult(...)  // This already returns a JSON string
)
```

#### Node 22 Deprecation in `googleSearch.js`:

```javascript
// Line 55: substr() is deprecated in favor of substring()
language = language.substr(0, 2);  // Should use: language.substring(0, 2)
```

#### Dependencies:
- `node-fetch` (v2.7.0) - Works on Node 22
- `@google-cloud/datastore` (v8.7.0) - Compatible
- `signale` (v1.4.0) - Compatible

---

### 2. `netlify/functions/fetch/` - **CRITICAL**

#### Files:
- `fetch.js` - Main handler
- `rateLimitedFetch.js` - Rate-limited HTTP fetch utility
- `fetchError.js` - Custom error class

#### Critical Bug in `fetch.js`:

```javascript
// Line 49: Uses undefined 'request' variable
body = `Internal error fetching ${request.query.url}`;  // Should be: query.url
```

#### Node 22 Deprecation in `rateLimitedFetch.js`:

```javascript
// Line 63: url.parse() is deprecated
const fetchUrl = url.parse(urlString);

// Should use:
const fetchUrl = new URL(urlString);
```

**Note:** When migrating to `new URL()`, be aware of property differences:
- `url.parse().host` → `new URL().host` ✓
- `url.parse().href` → `new URL().href` ✓
- `url.parse().protocol` → `new URL().protocol` ✓

#### LRU Cache Configuration:

```javascript
// Line 41-44: Uses maxAge (lru-cache v6 API)
const limits = new LRU({
  max: MAX_LIMITS,
  maxAge: RATE_LIMIT_TIME_FRAME,  // v7+ uses 'ttl' instead
});
```

The project uses `lru-cache@6.0.0` which still supports `maxAge`. This is compatible but outdated.

---

### 3. `netlify/functions/search_autosuggest/` - **OK**

Simple function that returns a list of AMP components. No issues found.

#### Files:
- `search_autosuggest.js` - Main handler
- `component-versions.json` - Component version data
- `AmpConstants.js` - Built-in component lists

---

### 4. `netlify/functions/examples_api_*` - **MOSTLY OK**

Most example API functions are simple and well-structured. Common patterns:

#### Functions Using `busboy`:
- `examples_api_hello`
- `examples_api_echo`
- `examples_api_amp-form_submit_form_input_text_xhr`
- `examples_api_autosuggest_address`
- `examples_api_amp-access_submit`
- `examples_api_amp-form_verify_form_input_text_xhr`
- `examples_interactivity_dynamic_content_star_rating`
- `examples_interactivity-dynamic-content_subscription_settings_subscription`

**Status:** `busboy@1.6.0` is Node 22 compatible.

#### Functions Using `middy` (Old Version):

```javascript
// examples_api_amp-inputmask/examples_api_amp-inputmask.js
const middy = require('middy');  // v0.36.0 - VERY OLD
```

The `middy@0.36.0` package is from 2019 and may have compatibility issues. Current version is 4.x+.

#### Functions Using `nunjucks`:
- `examples_api_amp-access_login`
- `examples_source_news_publishing_amp-live-list_api`

**Status:** `nunjucks@3.2.4` is Node 22 compatible.

#### Functions Using `cookie`:
- `examples_api_amp-access_authorization`
- `examples_api_amp-access_submit`
- `examples_source_news_publishing_amp-live-list_api`
- `examples_interactivity_dynamic_content_favorite_button`
- `examples_interactivity_dynamic_content_favorite_button_with_count`
- `examples_interactivity-dynamic-content_subscription_settings_subscription`

**Status:** `cookie@0.6.0` is Node 22 compatible.

---

### 5. `netlify/functions/latest-query/` - **OK**

Minimal function that returns `'null'` as plain text. No issues.

---

## Node 22 Compatibility Summary

### Deprecated APIs Found:

| API | Location | Replacement |
|-----|----------|-------------|
| `String.prototype.substr()` | `googleSearch.js:55` | `String.prototype.substring()` |
| `url.parse()` | `rateLimitedFetch.js:63` | `new URL()` |

### Package Compatibility:

| Package | Version | Node 22 Status |
|---------|---------|----------------|
| `node-fetch` | 2.7.0 | ✅ Compatible |
| `@google-cloud/datastore` | 8.7.0 | ✅ Compatible |
| `signale` | 1.4.0 | ✅ Compatible |
| `lru-cache` | 6.0.0 | ⚠️ Works, but v7+ recommended |
| `busboy` | 1.6.0 | ✅ Compatible |
| `nunjucks` | 3.2.4 | ✅ Compatible |
| `cookie` | 0.6.0 | ✅ Compatible |
| `middy` | 0.36.0 | ⚠️ Very old, may have issues |
| `casual` | 1.6.2 | ✅ Compatible |

---

## Recommended Fixes

### Priority 1: Critical Bugs (Must Fix)

#### 1.1 Fix `search_do/search_do.js`

The function is missing several key pieces. Either:
- Import or implement `createPageObject` and `addExampleAndPlaygroundLink` functions
- Remove the call to these functions if not needed
- Fix the `config.getDefaultLocale()` reference (use `DEFAULT_LOCALE` constant instead)
- Fix `request.query` to use `searchQuery`

#### 1.2 Fix `fetch/fetch.js`

```javascript
// Line 49: Change from:
body = `Internal error fetching ${request.query.url}`;

// To:
body = `Internal error fetching ${query.url}`;
```

### Priority 2: Node 22 Deprecations

#### 2.1 Fix `googleSearch.js` substr()

```javascript
// Change from:
language = language.substr(0, 2);

// To:
language = language.substring(0, 2);
```

#### 2.2 Fix `rateLimitedFetch.js` url.parse()

```javascript
// Change from:
const fetchUrl = url.parse(urlString);

// To:
let fetchUrl;
try {
  fetchUrl = new URL(urlString);
} catch (e) {
  throw new FetchError(
    FetchError.INVALID_URL,
    `${urlString} is not a valid URL.`
  );
}
```

### Priority 3: Package Updates (Nice to Have)

- Consider updating `lru-cache` to v7+ and updating the API from `maxAge` to `ttl`
- Consider updating `middy` from v0.36.0 to v4.x+ (major breaking changes)

---

## Function Inventory

| Function | Type | Status | Notes |
|----------|------|--------|-------|
| `search_do` | Search | 🔴 Broken | Multiple critical bugs |
| `search_autosuggest` | Search | ✅ OK | |
| `latest-query` | Search | ✅ OK | Minimal function |
| `fetch` | Utility | 🔴 Broken | Undefined variable |
| `autosuggest` | Data | ✅ OK | Static data export |
| `cache` | Utility | ✅ OK | Static style export |
| `examples_api_products` | Example | ✅ OK | |
| `examples_api_hello` | Example | ✅ OK | |
| `examples_api_echo` | Example | ✅ OK | |
| `examples_api_time` | Example | ✅ OK | |
| `examples_api_photo_stream` | Example | ✅ OK | |
| `examples_api_amp-inputmask` | Example | ⚠️ Warning | Old middy version |
| `examples_api_amp-access_*` | Example | ✅ OK | Multiple functions |
| `examples_api_amp-form_*` | Example | ✅ OK | Multiple functions |
| `examples_api_amp-consent_*` | Example | ✅ OK | Multiple functions |
| `examples_api_autosuggest_*` | Example | ✅ OK | Multiple functions |
| `examples_api_cache_*` | Example | ✅ OK | Multiple functions |
| `examples_api_slow_response_*` | Example | ✅ OK | Multiple functions |
| `examples_interactivity_*` | Example | ✅ OK | Multiple functions |
| `examples_source_*` | Example | ✅ OK | |
| `examples_static_*` | Example | ✅ OK | |

---

## Next Steps

1. **Immediate:** Fix the critical bugs in `search_do/search_do.js` and `fetch/fetch.js`
2. **Short-term:** Update deprecated APIs (`substr()`, `url.parse()`)
3. **Long-term:** Consider updating outdated packages (`middy`, `lru-cache`)

---

## Netlify Configuration Notes

The functions are configured in `netlify/configs/amp.dev/netlify.toml`:

```toml
[functions]
  directory = "./netlify/functions/"
```

Functions are accessed via redirects like:
- `/search/do` → `/.netlify/functions/search_do/search_do.js`
- `/search/autosuggest` → `/.netlify/functions/search_autosuggest/search_autosuggest.js`

---

*Analysis completed by Claude on December 18, 2025*
