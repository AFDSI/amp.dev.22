# CLAUDE.md - amp.dev.22 Repository Knowledge Base

## Project Overview

This is the AMP (Accelerated Mobile Pages) documentation website. It's a complex static site generator project that:
- Uses **Grow** (Python-based SSG) to render pages
- Uses **Gulp** for build orchestration
- Imports documentation from external GitHub repositories (primarily `ampproject/amphtml`)
- Supports **15 locales**: en, de, fr, ar, es, it, id, ja, ko, pt_BR, ru, tr, zh_CN, pl, vi
- Generates approximately 49,673 pages across all locales

## Build System Architecture

### Core Build Pipeline

The build is orchestrated via Gulp tasks defined in:
- `gulpfile.js/index.js` - Main entry, exports tasks
- `gulpfile.js/build.js` - Build tasks
- `gulpfile.js/develop.js` - Development/bootstrap tasks

### Key Gulp Tasks

```
bootstrap       → Parallel: buildBoilerplate, buildPlayground, importAll, samplesBuilder
buildPrepare    → Series: buildSamples, parallel(buildPlayground, buildBoilerplate, buildFrontend21, importAll, zipTemplates), packArtifacts
buildPages      → Series: buildFrontend, collectStatics, buildGrow
buildFinalize   → Series: parallel(collectStatics, persistBuildInfo), thumborImageIndex, copyNetlifyConfig, copyRootFiles
build           → Series: clean, buildPrepare, buildPages, parallel(collectStatics, persistBuildInfo), generateSitemap, copyRootFiles
```

### Build Modes

1. **`npm run develop`** - Local development with live reload
   - Runs `bootstrap` then starts Grow dev server
   - Watches for file changes
   - Requires substitute files to be in place

2. **`npm run build`** - Full production build
   - Complete build with minification and optimization
   - Takes 3+ hours locally
   - Generates all locale pages in `dist/pages/`

3. **`npm run build:staging`** - Staging environment build
   - Uses staging configuration

### GitHub Actions Build (deploy.yaml)

The GitHub Actions workflow splits the build across parallel jobs:

```
verify → prepare → build (15 parallel locale jobs) → deploy
```

- **prepare**: Runs `buildPrepare --queue-imports`, stores artifacts
- **build**: Matrix job for each locale, runs `buildPages --locales {locale}`
- **deploy**: Runs `buildFinalize` then `staticDeploy`

## Import System

### External Content Sources

The project imports documentation from external GitHub repositories:

1. **Component Reference Importer** (`platform/lib/pipeline/componentReferenceImporter.js`)
   - Imports AMP component documentation from `ampproject/amphtml`
   - Creates files like `amp-img-v0.1.md`, `amp-bind-v0.1.md`

2. **Spec Importer** (`platform/lib/pipeline/specImporter.js`)
   - Configuration: `platform/config/imports/spec.json`
   - Imports specification documents

3. **Roadmap Importer** - Imports project roadmap data

4. **Working Groups Importer** - Imports working group information

5. **Ad Vendor List Importer** - Imports advertising vendor data

### GitHub Importer Core (`platform/lib/pipeline/gitHubImporter.js`)

- Uses `AMP_DOC_TOKEN` environment variable for GitHub API authentication
- Subject to GitHub API rate limits (5,000 requests/hour authenticated)
- Downloads files from `ampproject/amphtml` repository

### Known Import Issues

1. **Branch name change**: The `ampproject/amphtml` repo default branch changed from `master` to `main`
2. **Missing files**: Some referenced files no longer exist upstream (e.g., `docs/SUPPORT.md`)
3. **Rate limiting**: Heavy import runs can exhaust GitHub API quota

## Content Structure

### Source Content Location
```
pages/content/amp-dev/
├── community/
├── documentation/
│   ├── components/
│   │   └── reference/          # Imported component docs (amp-*.md)
│   ├── courses/
│   ├── guides-and-tutorials/
│   └── examples/
├── about/
└── support/
```

### Locale File Naming Convention
- Base English file: `filename.md`
- Localized files: `filename@{locale}.md` (e.g., `amp-img-v0.1@ar.md`)

### Built Output
```
dist/
├── pages/          # Rendered HTML pages (created by Grow)
├── static/         # Static assets
├── examples/
└── playground/
```

## Configuration Files

### Environment Configuration
```
platform/config/environments/
├── development.json
├── staging.json      # Must include websocket.host for samples builder
├── production.json
└── shared.json
```

**Critical staging.json requirement:**
```json
{
  "websocket": {
    "scheme": "wss",
    "host": "your-domain.netlify.app",
    "port": ""
  }
}
```

### Import Configuration
```
platform/config/imports/
└── spec.json         # Defines files to import from GitHub
```

### Grow Configuration
```
pages/podspec.yaml    # Grow SSG configuration
├── localization settings (15 locales)
├── sitemap configuration
└── extension registrations
```

### Platform Configuration
```
platform/config/
├── podspec.yaml
├── search-promoted-pages.json   # Highlighted pages for search
├── amp-dev-redirects.yaml
└── go-links.yaml
```

## Key Dependencies

### Node.js
- Version: 22 (as specified in GitHub Actions)
- Package manager: npm with `package-lock.json`

### Python/Grow
- Python version: 3.9
- Grow SSG: Installed via `pip install grow`
- Virtual environment created at `.venv/`

### Grow Extensions (pages/extensions/)
- `extract_highlights_info/` - Extracts page info for search highlights
- `amp_example_preview/`
- `amp_dependencies/`
- `url_beautifier/`
- `internal_links/`

## Substitute Files System

The project requires certain files that are not in the repository to be manually placed. These are maintained in:
```
/mnt/e/users/gigster/workspace/repos/amp/_substitutes/
```

### Key Substitute Files

| File | Purpose |
|------|---------|
| `credentials.js` | API credentials configuration |
| `.env` | Environment variables |
| `podspec.yaml` | Grow configuration (customized) |
| `staging.json` | Staging environment config |
| `production.json` | Production environment config |
| `search-promoted-pages.json` | Search highlight configuration |
| `samples.json` | Samples configuration |
| `componentSamples.json` | Component samples data |
| `sitemap_*.xml` | Various sitemap files |

## Sitemap Architecture

### Sitemap Index Structure
```xml
<!-- pages/static/sitemap/sitemap.xml -->
<sitemapindex>
  <sitemap><loc>https://domain/sitemap_generated.xml</loc></sitemap>
  <sitemap><loc>https://domain/sitemap_manual.xml</loc></sitemap>
</sitemapindex>
```

### Sitemap Types
- `sitemap_generated.xml` - Auto-generated from built pages (not currently working)
- `sitemap_manual.xml` - Manually maintained
- `sitemap_ampproject.xml` - Legacy ampproject.org URLs
- `sitemap_ampbyexample.xml` - Legacy amp by example URLs
- `sitemap_grow.xml` - Grow's built-in sitemap (configured but not generating)

### Grow Sitemap Configuration (in podspec.yaml)
```yaml
sitemap:
  enabled: 'yes'
  path: /sitemap_grow.xml
  template: /layouts/sitemap.xml
```

## Known Technical Debt

1. **Import resilience**: The `importAll` function uses `Promise.all` which fails fast. Consider wrapping individual imports to continue on failure.

2. **Branch references**: Some code still references `master` branch instead of `main` for ampproject/amphtml.

3. **Hardcoded paths**: Some substitute files have hardcoded domain references that need updating.

4. **CI exit behavior**: `buildPrepare` contains `process.exit(0)` designed for split CI builds. This prematurely terminates unified builds.

5. **Missing upstream files**: `spec.json` references files that no longer exist in upstream repos.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `AMP_DOC_TOKEN` | GitHub Personal Access Token for API imports |
| `APP_ENV` | Environment: development, staging, production |
| `GOOGLE_CSE_API_KEY` | Google Custom Search Engine API key |
| `GOOGLE_CSE_ID` | Google Custom Search Engine ID |
| `GOOGLE_KNOWLEDGE_GRAPH_API_KEY` | Google Knowledge Graph API |
| `GOOGLE_MAPS_API_KEY` | Google Maps API |

## File Path Aliases

Defined in build configuration, these aliases simplify imports:

- `@lib` → `platform/lib/`
- Common usage: `require('@lib/utils')`, `require('@lib/config')`

## Useful Commands

```bash
# Check GitHub API rate limit
curl -s -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit | jq '.rate'

# List available Gulp tasks
npx gulp --tasks

# Run specific importer
npx gulp importAll

# Build for specific locale
npx gulp buildPages --locales en

# Development mode
npm run develop

# Full production build
npm run build
```

## Repository URLs

- **GitHub**: https://github.com/AFDSI/amp.dev.22
- **Upstream amphtml**: https://github.com/ampproject/amphtml

---

*This document was generated from debugging sessions and code analysis. Last updated: December 2025*