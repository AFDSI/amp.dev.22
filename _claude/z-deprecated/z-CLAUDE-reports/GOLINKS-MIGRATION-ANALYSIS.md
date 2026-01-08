# Go-Links Migration Analysis: Express to Netlify

**Date**: 2026-01-04
**Objective**: Migrate go-links from Express.js to Netlify
**Source**: `platform/lib/routers/go.js`
**Data**: `platform/config/go-links.yaml`

---

## Executive Summary

The go-links system provides URL shortening/redirects for amp.dev (e.g., `go.amp.dev/docs` → `/documentation/guides-and-tutorials/`). Currently implemented as an Express router with subdomain routing, it can be migrated to Netlify using static redirects in `netlify.toml`.

**Key finding**: 4 of 4 regex patterns are already migrated to Netlify. Only 74 simple redirects remain.

---

## Current Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        go.amp.dev                                │
│                    (subdomain routing)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              platform/lib/middleware/subdomain.js               │
│           (creates subdomain middleware or dev server)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  platform/lib/routers/go.js                      │
│              (Express router with redirect logic)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              platform/config/go-links.yaml                       │
│                   (74 simple + 4 regex links)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Source Data Dependencies

### go-links.yaml Structure

| Type | Count | Example |
|------|-------|---------|
| Simple links | 74 | `/ads: /about/ads/` |
| Regex links | 4 | `^/c/amp-([a-z-]+)$` → component docs |

### Regex Patterns (All 4)

```yaml
^/c/amp-([a-z-]+)$:
  url: /documentation/components/amp-$1
  useRegex: true

^/e/amp-([a-z-]+)$:
  url: /documentation/examples/components/amp-$1/
  useRegex: true

^/pr/([0-9]+)$:
  url: https://github.com/ampproject/amphtml/pull/$1
  useRegex: true

^/issue/([0-9]+)$:
  url: https://github.com/ampproject/amphtml/issues/$1
  useRegex: true
```

---

## 2. npm Dependencies

| Package | Version | Purpose | Netlify Equivalent |
|---------|---------|---------|-------------------|
| `js-yaml` | 4.1.0 | Parse YAML config | Build-time only |
| `express` | 4.19.2 | Router middleware | `[[redirects]]` |

---

## 3. Platform Module Dependencies

| Module | Path | Purpose | Migration Impact |
|--------|------|---------|------------------|
| `@lib/config.js` | `platform/lib/config.js` | URL base resolution | Hardcode in redirects |
| `@lib/utils/log` | `platform/lib/utils/log.js` | Logging | Not needed |
| `./robots` | `platform/lib/routers/robots.js` | robots.txt | Separate config |

---

## 4. Configuration Dependencies

### Host Configuration

| Config Key | Production Value | Purpose |
|------------|------------------|---------|
| `hosts.go.host` | `go-amp-new.netlify.app` | Subdomain host |
| `hosts.go.scheme` | `https` | Protocol |
| `hosts.platform.base` | `https://amp-new.netlify.app` | Base for relative URLs |

### Files

| File | Purpose |
|------|---------|
| `platform/config/environments/production.json:34-38` | Go host config |
| `platform/config/go-links.yaml` | Link definitions |

---

## 5. Subdomain Infrastructure

### Current Implementation

```javascript
// platform/lib/platform.js:149
this.server.use(await subdomain.map(config.hosts.go, routers.go));
```

### subdomain.js Behavior

1. In dev/local mode: Starts separate Express server on configured port
2. In production: Creates middleware matching subdomain requests
3. 404 handling: Redirects to main site

---

## 6. Existing Netlify Migration (Already Done)

The 4 regex patterns are **already in** `netlify/configs/amp.dev/netlify.toml`:

```toml
[[redirects]]
  from = "/c/amp-*"
  to = "/documentation/components/amp-:splat"
  status = 301

[[redirects]]
  from = "/e/amp-*"
  to = "/documentation/examples/components/amp-:splat"
  status = 301

[[redirects]]
  from = "/pr/:githubIssueId"
  to = "https://github.com/ampproject/amphtml/pull/:githubIssueId"
  status = 301

[[redirects]]
  from = "/issue/:githubIssueId"
  to = "https://github.com/ampproject/amphtml/issues/:githubIssueId"
  status = 301
```

---

## 7. Migration Options

### Option A: Static Netlify Redirects (Recommended)

**Convert YAML to TOML redirects**

```toml
# Example conversions
[[redirects]]
  from = "/ads"
  to = "/about/ads/"
  status = 301

[[redirects]]
  from = "/docs"
  to = "/documentation/guides-and-tutorials/"
  status = 301
```

| Pros | Cons |
|------|------|
| Edge-level performance (fastest) | Manual YAML → TOML conversion |
| No runtime code | 74 additional entries |
| Already have patterns | Must maintain two formats |

### Option B: Netlify Edge Function

**Dynamic redirect handling**

```javascript
// netlify/edge-functions/go-links.js
import goLinks from './go-links.json';

export default async (request, context) => {
  const path = new URL(request.url).pathname;
  const target = goLinks[path];
  if (target) {
    return Response.redirect(target, 301);
  }
  return context.next();
};
```

| Pros | Cons |
|------|------|
| Can read config dynamically | Adds ~50ms latency |
| Single function for all | More complex debugging |
| Flexible logic | Edge function limits |

### Option C: Build-time Generation (Hybrid)

**Generate TOML from YAML during build**

```javascript
// gulpfile.js/generateGoLinksRedirects.js
const yaml = require('js-yaml');
const fs = require('fs');

function generateRedirects() {
  const links = yaml.load(fs.readFileSync('platform/config/go-links.yaml'));
  let toml = '';
  for (const [from, to] of Object.entries(links)) {
    if (typeof to === 'string') {
      toml += `[[redirects]]\n  from = "${from}"\n  to = "${to}"\n  status = 301\n\n`;
    }
  }
  // Append to netlify.toml
}
```

| Pros | Cons |
|------|------|
| Keep YAML as source | Build step complexity |
| Edge performance | Must integrate with build |
| Single source of truth | Generated file management |

---

## 8. Blocking Issues

| Issue | Severity | Description | Resolution |
|-------|----------|-------------|------------|
| Subdomain routing | HIGH | go.amp.dev requires separate Netlify site or path prefix | Deploy as separate site OR use path-based routing |
| Trailing slash | MEDIUM | `go.js:35` normalizes `/path/` → `/path` | Netlify handles automatically |
| Relative URLs | MEDIUM | Some targets are relative (`/about/ads/`) | Resolve to full URL in redirects |
| 404 fallback | LOW | Unknown paths redirect to main site | Add catch-all redirect |

---

## 9. Test Coverage

| Test Case | File:Line | Status |
|-----------|-----------|--------|
| Simple redirect works | `go.test.js:22-27` | ✅ |
| Regex redirect works | `go.test.js:29-34` | ✅ |
| Returns 404 on invalid | `go.test.js:36-38` | ✅ |
| Strips trailing slashes | `go.test.js:40-45` | ✅ |

---

## 10. Recommended Migration Plan

### Phase 1: Prepare (No Breaking Changes)

1. Create `netlify/configs/go.amp.dev/netlify.toml`
2. Add all 74 simple redirects
3. Verify regex patterns already present

### Phase 2: Deploy Separate Site

1. Create new Netlify site for `go-amp-new.netlify.app`
2. Configure custom domain (if needed)
3. Deploy with redirect-only config

### Phase 3: Verify & Cleanup

1. Test all 78 go-links
2. Monitor redirect analytics
3. Remove Express router from platform.js (optional)

---

## 11. Simple Links to Migrate (74 total)

```yaml
/ads: /about/ads/
/ampdevmode: https://github.com/ampproject/amphtml/issues/20974
/amp-email-register: https://docs.google.com/forms/...
/amp-optimizer: /documentation/guides-and-tutorials/optimize-and-measure/amp-optimizer-guide/
/amp-packager: https://github.com/ampproject/amppackager
/amp-pwa-amp: https://blog.amp.dev/2018/06/19/...
/amp-script-apis: https://github.com/ampproject/worker-dom/...
/ampcs: /events/amp-cs-2019/#Schedule
/auto-sw: https://github.com/ampproject/amp-sw/
/axios-case-study: https://blog.amp.dev/2020/04/07/...
# ... (64 more)
```

---

## 12. Decisions Required

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Deployment model | Separate site vs path prefix | **Separate site** (cleaner) |
| Redirect format | Static TOML vs Edge Function | **Static TOML** (fastest) |
| Source of truth | Keep YAML vs migrate to TOML | **Build-time generation** |
| Trailing slashes | Preserve normalization | **Let Netlify handle** |
| 404 behavior | Redirect to main vs error | **Redirect to main** |

---

## Status

- [x] Current architecture documented
- [x] Dependencies identified
- [x] Migration options analyzed
- [x] Blocking issues listed
- [x] Test coverage verified
- [ ] Implementation pending user decision
