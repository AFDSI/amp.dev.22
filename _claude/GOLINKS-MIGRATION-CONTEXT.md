# Go-Links Migration Context

Collected for Claudia to design Netlify redirect migration.

---

## 1. Site Configuration Files

### Note: `hosts.js` Does Not Exist

The project uses JSON environment files instead:

### `platform/config/environments/production.json`

```json
{
  "name": "production",
  "hosts": {
    "pages": {
      "scheme": "https",
      "host": "amp-new.netlify.app",
      "port": ""
    },
    "api": {
      "scheme": "https",
      "host": "api-dot-amp-new.netlify.app",
      "port": ""
    },
    "platform": {
      "scheme": "https",
      "host": "amp-new.netlify.app",
      "port": ""
    },
    "websocket": {
      "scheme": "wss",
      "host": "amp-new.netlify.app",
      "port": ""
    },
    "playground": {
      "scheme": "https",
      "host": "playground-amp-new.netlify.app",
      "port": ""
    },
    "preview": {
      "scheme": "https",
      "host": "preview-amp-new.netlify.app",
      "port": ""
    },
    "go": {
      "scheme": "https",
      "host": "go-amp-new.netlify.app",
      "port": ""
    },
    "log": {
      "scheme": "https",
      "host": "log-amp-new.netlify.app",
      "port": ""
    }
  }
}
```

### `platform/config/environments/development.json`

```json
{
  "name": "development",
  "hosts": {
    "pages": {
      "scheme": "http",
      "host": "localhost",
      "port": "8081"
    },
    "api": {
      "scheme": "http",
      "host": "localhost",
      "port": "8082"
    },
    "platform": {
      "scheme": "http",
      "host": "localhost",
      "port": "8080"
    },
    "websocket": {
      "scheme": "ws",
      "host": "localhost",
      "port": "8080"
    },
    "playground": {
      "scheme": "http",
      "subdomain": "playground",
      "host": "localhost",
      "port": "8083"
    },
    "preview": {
      "scheme": "http",
      "subdomain": "preview",
      "host": "localhost",
      "port": "8084"
    },
    "go": {
      "scheme": "http",
      "subdomain": "go",
      "host": "localhost",
      "port": "8086"
    },
    "log": {
      "scheme": "http",
      "subdomain": "log",
      "host": "localhost",
      "port": "8087"
    }
  }
}
```

### `platform/config/shared.json`

```json
{
  "gaTrackingId": "G-1HFVWLN28T",
  "baseUrls": {
    "playground": "/#url=",
    "repository": "https://github.com/AFDSI/amp-dev-22/docs/blob/future/"
  },
  "site": {
    "name": "amp-new",
    "shortName": "amp-new",
    "title": "AMP-VERIFY",
    "description": "The AMP Project website."
  },
  "social": {
    "twitter": { "handle": "@ampproject", "url": "https://twitter.com/AMPhtml" },
    "youtube": { "url": "https://www.youtube.com/channel/UCXPBsjgKKG2HqsKBhWA4uQw" },
    "github": { "org": "ampproject", "url": "https://github.com/ampproject" }
  }
}
```

### Config Directory Contents

```
platform/config/
├── amp-dev-redirects.yaml       # Additional redirects
├── build-info.yaml              # Build metadata
├── component-versions.json      # Component version tracking
├── environments/
│   ├── development.json
│   └── production.json
├── go-links.md                  # Documentation
├── go-links.yaml                # GO-LINKS SOURCE (71 simple + 4 regex)
├── imports/                     # Import configs
├── podspec.yaml                 # Grow pod spec
├── search-promoted-pages.json   # Search config
├── shared.json                  # Shared site config
└── z-amp-dev-redirects.yaml.bak # Backup
```

---

## 2. Go-Links Source Data

### `platform/config/go-links.yaml` (Full Contents)

```yaml
# Use via: go.amp.dev/ads
# Add new entries in alphabetical order
/ads: /about/ads/
/ampdevmode: https://github.com/ampproject/amphtml/issues/20974
/amp-email-register: https://docs.google.com/forms/d/e/1FAIpQLSdso95e7UDLk_R-bnpzsAmuUMDQEMUgTErcfGGItBDkghHU2A/viewform?gxids=7628
/amp-optimizer: /documentation/guides-and-tutorials/optimize-and-measure/amp-optimizer-guide/
/amp-packager: https://github.com/ampproject/amppackager
/amp-pwa-amp: https://blog.amp.dev/2018/06/19/the-shadow-reader-improved/
/amp-script-apis: https://github.com/ampproject/worker-dom/blob/main/web_compat_table.md
/ampcs: /events/amp-cs-2019/#Schedule
/auto-sw: https://github.com/ampproject/amp-sw/
/axios-case-study: https://blog.amp.dev/2020/04/07/people-behind-the-code-the-axios-ascent/
/camp-code: https://github.com/ampproject/samples/tree/master/amp-camp
/cherry-picks: https://github.com/ampproject/amphtml/blob/main/docs/contributing-code.md#Cherry-picks
/components: https://amp.dev/documentation/components/
/contribute: https://amp.dev/documentation/guides-and-tutorials/contribute/
/contribute/code: https://github.com/ampproject/amphtml/blob/main/docs/contributing-code.md
/contribute/code-samples: /documentation/guides-and-tutorials/contribute/contribute-documentation/formatting/?format=websites#preview-code-samples
/contribute/docs: /documentation/guides-and-tutorials/contribute/contribute-documentation/
/contribute/samples: /documentation/examples/
/contribute/translations: /documentation/guides-and-tutorials/contribute/translations/
/cors: /documentation/guides-and-tutorials/learn/amp-caches-and-cors/amp-cors-requests/
/design-reviews: https://github.com/ampproject/amphtml/issues?q=is%3Aissue+is%3Aopen+design+review+utc+in%3Atitle
/devx-survey: https://google.qualtrics.com/jfe/form/SV_1FA0wBp7elD7Xa5
/docs: /documentation/guides-and-tutorials/
/docsgfi: https://github.com/ampproject/amp.dev/issues?q=is:open+is:issue+label:%22good+first+issue%22
/eleventy: https://github.com/ampproject/eleventy-plugin-amp
/email: /about/email/
/email-registration: https://docs.google.com/forms/d/e/1FAIpQLSdso95e7UDLk_R-bnpzsAmuUMDQEMUgTErcfGGItBDkghHU2A/viewform?gxids=7628
/email-support: /support/faq/email-support/
/email-tools: /documentation/tools/?format=email
/email-viewer: https://github.com/ampproject/amp-email-viewer
/getting-started: https://github.com/ampproject/amphtml/blob/main/docs/getting-started-quick.md
/github: https://github.com/ampproject/amphtml
/governance: /community/governance/
/i2i: https://github.com/ampproject/amphtml/issues/new?assignees=&labels=INTENT+TO+IMPLEMENT&template=intent-to-implement.yml
/io-email: /documentation/examples/interactivity-dynamic-content/conference_survey_email/
/learn: /documentation/courses/
/learn-advanced: /documentation/guides-and-tutorials/start/add_advanced/
/learn-email: /documentation/guides-and-tutorials/learn/email_fundamentals/?format=email
/learn-first: /documentation/guides-and-tutorials/start/create/
/learn-interact: /documentation/guides-and-tutorials/develop/interactivity/
/learn-script: /documentation/guides-and-tutorials/develop/custom-javascript-tutorial/
/learn-story: /documentation/guides-and-tutorials/start/visual_story/?format=stories
/learn-pwa: https://codelabs.developers.google.com/codelabs/amp-pwa-workbox/
/nextjs: https://nextjs.org/docs/advanced-features/amp-support/introduction
/optimize: /documentation/guides-and-tutorials/optimize-and-measure/amp-optimizer-guide/
/optimizer: /documentation/guides-and-tutorials/optimize-and-measure/amp-optimizer-guide/
/optimize-amp: /documentation/guides-and-tutorials/optimize-and-measure/amp-optimizer-guide/
/optimize-guide: /documentation/guides-and-tutorials/optimize-and-measure/optimize_amp/
/owners: https://ampproject-owners-bot.appspot.com/tree
/publishing-checklist: /documentation/guides-and-tutorials/optimize-and-measure/publishing_checklist/
/px-faq: https://support.google.com/webmasters/thread/104436075
/px-video-series: https://www.youtube.com/playlist?list=PLKoqnv2vTMUPC5r00xToO6wPtxkmprj13
/reftemplate: https://docs.google.com/document/d/1lRFcErFBnqsuv6W9mZsfYk2qnXO9nPzMkeog4Xtunl8/edit?usp=sharing
/service: https://blog.amp.dev/2020/06/29/amp-as-a-service-2020-roadmap/
/shopify-apps: https://blog.amp.dev/2019/04/15/shopify-apps-make-amp-easy-and-effective-for-ecommerce
/stories-best-practices: /documentation/guides-and-tutorials/develop/amp_story_best_practices/
/stories: /about/stories/
/sxg: /documentation/guides-and-tutorials/optimize-and-measure/signed-exchange/
/templates: /documentation/templates/
/test-email: /documentation/guides-and-tutorials/develop/testing_amp_emails/?format=email
/twitter-devx-survey: https://google.qualtrics.com/jfe/form/SV_2fZ0z843nw0CBOR
/tools: /documentation/tools/
/validate: /documentation/guides-and-tutorials/learn/validation-workflow/validate_amp/
/verizonmedia: https://developer.verizonmedia.com/mail/amp-for-email/
/vision-mission: /about/mission-and-vision/
/web-story-player: /documentation/guides-and-tutorials/integrate/web-story-player-guide/?format=stories
/web-player: /documentation/guides-and-tutorials/integrate/web-story-player-guide/?format=stories
/websites: /about/websites/
/wg: https://github.com/ampproject/meta/tree/master/working-groups
/wg-updates: https://github.com/search?o=desc&q=org%3Aampproject+label%3A%22Type%3A+Status+Update%22&s=created&
/wordpress: https://amp-wp.org/

# Regex-based entries
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

### Summary
- **71 simple redirects** (path → URL mappings)
- **4 regex patterns** (already in netlify.toml as static patterns)

---

## 3. Netlify Directory Structure

```
netlify/
├── configs/
│   ├── amp.dev/
│   │   └── netlify.toml          # Main site config (449 lines)
│   ├── playground.amp.dev/
│   │   └── netlify.toml          # Playground config
│   └── preview.amp.dev/
│       └── netlify.toml          # Preview config
└── functions/                     # ~40+ Netlify Functions
    ├── autosuggest.js
    ├── cache.js
    ├── fetch/
    │   ├── fetch.js
    │   ├── fetchError.js
    │   └── rateLimitedFetch.js
    ├── examples_api_*/            # API endpoint functions
    ├── examples_interactivity_*/  # Interactive examples
    └── ...
```

### Root `netlify.toml`
```toml
[build]
  command = "pip install grow && npm run build:staging"
  publish = "dist/pages"

[build.environment]
  PYTHON_VERSION = "3.9"
```

---

## 4. Build Pipeline Hook Points

### Critical Discovery: Go-Links Are Already Generated at Build Time

**Location:** `gulpfile.js/build.js` lines 418-456

The `copyBuildFiles` function (inside `buildPages`) already:
1. Reads `platform/config/go-links.yaml`
2. Filters out regex entries (they're manually in netlify.toml)
3. Converts simple links to Netlify redirect format
4. Appends them to `netlify.toml` during build

```javascript
// gulpfile.js/build.js:418-456
const goLinks = project.absolute('platform/config/go-links.yaml');
let redirects = yaml.load(fs.readFileSync(goLinks, 'utf-8'));

// remove the regex entries in the go links, they were manually added
// to the config
redirects = Object.entries(redirects).filter(
  ([path]) => !path.includes('^')
);

redirects = redirects.map(([from, to]) => {
  from = `https://go.amp.dev${from}`;  // <-- HARDCODED go.amp.dev!

  // we only want to update the URL of shorturls that point to relative URLs
  if (!to.startsWith('http://') && !to.startsWith('https://')) {
    to = `https://amp.dev${to}`;       // <-- HARDCODED amp.dev!
  }

  return {
    from,
    to,
    'status': 302,
    'force': true,
  };
});

netlifyConfig.redirects = [
  ...(netlifyConfig.redirects || []),
  ...redirects,
];
```

### Build Task Order (Relevant Sections)

```
build (gulp.series)
├── clean
├── buildPrepare
│   ├── buildSamples
│   └── gulp.parallel(buildPlayground, buildBoilerplate, buildFrontend21, importAll, zipTemplates)
├── buildPages
│   ├── unpackArtifacts
│   ├── buildFrontend
│   ├── buildGrow (grow deploy)
│   ├── minifyPages
│   ├── sharedPages
│   ├── copyBuildFiles  ← GO-LINKS INJECTION HERE (line 371-459)
│   ├── staticify
│   ├── renderExamples
│   ├── optimizeFiles
│   ├── sitemap
│   └── whoAmI
├── gulp.parallel(collectStatics, persistBuildInfo)
├── generateSitemap
└── copyRootFiles
```

### Alternative Hook: `buildFinalize`

```javascript
exports.buildFinalize = gulp.series(
  gulp.parallel(collectStatics, persistBuildInfo),
  copyNetlifyConfig,   // Could add redirect generation here
  generateSitemap,
  copyRootFiles
);
```

---

## 5. Playground.amp.dev References

### Count: 92 occurrences across 71 files

**By category:**
| Location | Count | Notes |
|----------|-------|-------|
| Documentation (guides/tutorials) | ~45 | Mostly translated versions |
| Component reference docs | ~12 | amp-list translations |
| Validation workflow docs | ~14 | Email validation guides |
| Examples | 2 | examples/index.html |
| Config files | 0 | None in platform/config/ |
| Build scripts | 1 | gulpfile.js/build.js |
| Static files | 3 | Various |
| Analysis docs | 2 | _claude/ reports |

**Sample files:**
- `gulpfile.js/build.js` - Build script reference
- `pages/shared/data/tools.yaml` - Tools listing
- `examples/static/inline-examples/data/amp-list-urls.json`
- Multiple markdown docs with embedded playground URLs

---

## 6. Key Observations for Migration Design

### Current Architecture Issues

1. **Hardcoded Domains**: The build script hardcodes `go.amp.dev` and `amp.dev` in the redirect generation (lines 428-432)

2. **Subdomain Model**: Production uses separate Netlify sites:
   - `amp-new.netlify.app` (main)
   - `go-amp-new.netlify.app` (go links - requires separate site)
   - `playground-amp-new.netlify.app`
   - `preview-amp-new.netlify.app`

3. **Redirect Already Generated**: Simple go-links are already being added to `netlify.toml` at build time with `status: 302` and `force: true`

### Migration Considerations

1. **For abc.dev scaling**: The environment config pattern (`environments/*.json`) is the right place to define domain mappings

2. **Hardcoded domains**: Need to parameterize the build script to read from config instead of hardcoding

3. **Subdomain routing**: Current architecture requires separate Netlify sites per subdomain - this is a fundamental infrastructure decision

4. **`shared.json`**: Contains `baseUrls.playground` which uses relative path `/#url=` - this is good for environment independence

---

## Quick Reference: Files to Modify

| Purpose | File | Action |
|---------|------|--------|
| Domain configuration | `platform/config/environments/*.json` | Add parameterized URLs |
| Build-time redirect gen | `gulpfile.js/build.js:418-456` | Parameterize domain names |
| Netlify config template | `netlify/configs/amp.dev/netlify.toml` | Keep as base template |
| Go-links source | `platform/config/go-links.yaml` | No changes needed |
