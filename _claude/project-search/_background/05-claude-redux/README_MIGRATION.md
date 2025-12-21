# amp-site-search Migration Package

## Overview

This package contains everything needed to migrate the restored `amp-site-search` functionality from `amp.dev.n4` to `amp.dev.20`.

## What is amp-site-search?

A sophisticated search system for amp.dev that combines:

- **AMP Components**: amp-lightbox, amp-list, amp-autocomplete, amp-mustache, amp-bind
- **Backend API**: Express routes + Netlify serverless functions
- **Google Programmable Search**: External API integration for indexing
- **Service Worker**: Caching for persistent search across pages
- **Frontend CSS**: Two generation styles (BEM + minified)

## Repository Information

- **Source Repository**: AFDSI/amp.dev.n4
- **Source Branch**: `claude/analyze-tar-011CUppL4unTTnGJgitdWds5`
- **Target Repository**: amp.dev.20
- **Migration Date**: 2025-11-11

## Migration Files

### 📋 Documentation

1. **QUICK_START_MIGRATION.md** (⭐ Start Here)
   - Step-by-step migration guide
   - 30-60 minute setup
   - Includes testing checklist

2. **MIGRATION_SITE_SEARCH_TO_AMP_DEV_20.md** (Comprehensive)
   - Complete migration strategy
   - Multiple migration approaches
   - Post-migration configuration
   - Troubleshooting guide

3. **HANDOFF_SITE_SEARCH_RESTORATION.md** (Architecture)
   - Complete architecture details
   - Component breakdown
   - Deprecation history
   - Node.js 22 compatibility
   - Future enhancements (GKG integration)

4. **README_MIGRATION.md** (This File)
   - Package overview and index

### 🔧 Migration Tools

1. **migrate-site-search.sh** (⭐ Main Script)
   - Automated migration script
   - Copies all components from n4 to .20
   - Creates necessary directories
   - Provides post-migration instructions

2. **verify-site-search-migration.sh** (Verification)
   - Validates migration completeness
   - Checks for missing files
   - Environment variable verification
   - Exit codes for CI/CD integration

### 📁 Components to be Migrated

#### Backend (3 files)
```
platform/lib/routers/search.js           # Express search router
platform/lib/utils/googleSearch.js       # Google API wrapper
platform/config/search-promoted-pages.json  # Curated highlights
```

#### Serverless Functions (2 directories)
```
netlify/functions/search_do/             # Main search endpoint
netlify/functions/search_autosuggest/    # Autocomplete endpoint
```

#### Frontend Templates (2 files)
```
frontend/templates/views/partials/search.j2         # Search UI
frontend/templates/views/partials/service-worker.j2 # SW template
```

#### CSS (3 files)
```
frontend/scss/components/organisms/search.scss      # Main styles
frontend/scss/components/molecules/search-trigger.scss  # Trigger button
frontend21/scss/components/search-trigger.scss      # Gen2 trigger
```

#### Service Worker (1 file)
```
pages/static/serviceworker.js            # Cache handlers
```

#### Reference Files (3+ files)
```
ontology-search/reference-files/
├── _amp-site-search-introduction.pdf    # Official AMP blog post
├── search-client.html                   # Standalone example
└── _analysis-deprecated-site-search.md  # Deprecation analysis
```

## Quick Start

### 1. Run Migration

```bash
cd /home/user/amp.dev.n4
./migrate-site-search.sh /home/user/amp.dev.20
```

### 2. Verify

```bash
cd /home/user/amp.dev.20
./verify-site-search-migration.sh
```

### 3. Configure

Add to `.env` or `.env.secrets`:
```bash
GOOGLE_CSE_API_KEY=your-api-key-here
GOOGLE_CSE_ID=014077439351665726204:s4tidjx0agu
```

### 4. Integrate

- Register router in `platform/lib/platform.js`
- Include search in layout template
- Add search trigger to header
- Build CSS: `npm run build:css`

### 5. Test

```bash
npm run dev
curl "http://localhost:8080/search/do?q=carousel&locale=en"
```

For detailed instructions, see **QUICK_START_MIGRATION.md**.

## Migration Approaches

### Automated (Recommended) ⭐

Use the migration script:
```bash
./migrate-site-search.sh /path/to/amp.dev.20
```

**Pros:**
- Fast (< 1 minute)
- Comprehensive
- Error checking
- Creates directories automatically

**Cons:**
- Overwrites existing files
- May copy unnecessary files

### Manual (Surgical)

Copy specific files based on `MIGRATION_SITE_SEARCH_TO_AMP_DEV_20.md` guide.

**Pros:**
- Full control
- Selective copying
- Merge with existing code

**Cons:**
- Time-consuming (30+ minutes)
- Risk of missing files
- Manual directory creation

### Git Patch

Create and apply patches:
```bash
# In amp.dev.n4
git diff origin/main -- [files] > /tmp/site-search.patch

# In amp.dev.20
git apply /tmp/site-search.patch
```

**Pros:**
- Git-native approach
- Preserves file history
- Good for version control

**Cons:**
- Requires shared git history
- Conflicts need manual resolution

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                       │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │amp-       │  │amp-list  │  │amp-      │  │amp-      │   │
│  │lightbox   │  │+infinite │  │autocomplete│  │mustache  │   │
│  │(modal)    │  │scroll    │  │(suggest) │  │(render)  │   │
│  └───────────┘  └──────────┘  └──────────┘  └──────────┘   │
│          └──────────── amp-bind (state management) ────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                   Service Worker Layer                      │
│  • Caches /search/do results                                │
│  • Persists /search/latest-query                            │
│  • Cache-first strategy for performance                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                      Backend APIs                           │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │Express       │  │Netlify      │  │Google            │   │
│  │/search/*     │  │Functions    │  │Programmable      │   │
│  │(platform)    │  │(serverless) │  │Search API        │   │
│  └──────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

✅ **Full-text Search**: Powered by Google Programmable Search
✅ **Autocomplete**: Component name suggestions
✅ **Infinite Scroll**: Paginated results with "Load more"
✅ **Service Worker**: Cached results persist across pages
✅ **Highlights**: Curated promoted components/pages
✅ **Multilingual**: Supports all amp.dev locales
✅ **AMP-Valid**: 100% AMP components (no custom JS)
✅ **Responsive**: Mobile-optimized UI

## Post-Migration Tasks

### Immediate (Required)

1. ✅ Configure `GOOGLE_CSE_API_KEY`
2. ✅ Register search router in platform
3. ✅ Include search partial in layout
4. ✅ Add search trigger to header
5. ✅ Build and compile CSS
6. ✅ Test endpoints locally

### Short-Term (Recommended)

1. 📝 Populate `search-promoted-pages.json` with quality content
2. 🧪 Test across different browsers
3. 📱 Verify mobile UX
4. 🌐 Test multilingual support
5. 📊 Add analytics tracking
6. 🚀 Deploy to staging environment

### Long-Term (Optional)

1. 🔍 Consider Google Knowledge Graph integration
2. ⚡ Optimize search performance
3. 📈 Analyze search queries for insights
4. 🎨 Enhance UI/UX based on feedback
5. 🔧 Migrate to unified CSS system
6. 🔄 Integrate with ontology-search

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Search button not visible | Check template includes, CSS compilation |
| No search results | Verify API key, test Google CSE directly |
| Service Worker not caching | Check DevTools → Application → SW status |
| CORS errors | Verify serverless function headers |
| CSS not loading | Run `npm run build:css` |

See **MIGRATION_SITE_SEARCH_TO_AMP_DEV_20.md** for detailed troubleshooting.

## Testing Checklist

After migration, verify:

- [ ] Backend API endpoints respond correctly
- [ ] Search trigger button appears in header
- [ ] Clicking trigger opens lightbox modal
- [ ] Autocomplete shows suggestions
- [ ] Search executes and displays results
- [ ] Pagination "Load more" works
- [ ] Service Worker caches results
- [ ] Search persists across page navigation
- [ ] Mobile responsive design works
- [ ] All locales function properly

## Version Compatibility

- **Node.js**: 22+ (tested and compatible)
- **AMP Version**: Compatible with current AMP spec
- **Google API**: Programmable Search (formerly Custom Search)
- **Browser**: Modern browsers with Service Worker support

## Environment Variables

Required:
```bash
GOOGLE_CSE_API_KEY=<your-api-key>
```

Optional:
```bash
GOOGLE_CSE_ID=014077439351665726204:s4tidjx0agu  # Default CSE ID
DOMAIN_NAME=amp.dev.20  # For manifest generation
```

## File Inventory

| Category | Files | Size | Description |
|----------|-------|------|-------------|
| Backend | 3 | ~5 KB | Routers, utilities, config |
| Serverless | 2 dirs | ~15 KB | Netlify functions |
| Frontend | 2 | ~8 KB | Jinja2 templates |
| CSS | 3 | ~10 KB | SCSS stylesheets |
| Service Worker | 1 | ~3 KB | Cache handlers |
| Documentation | 4 | ~150 KB | Guides and references |
| Scripts | 2 | ~15 KB | Migration tools |
| **Total** | **15+** | **~200 KB** | Complete package |

## Dependencies

### Required
- **Google Programmable Search API** key
- **Node.js** 22+
- **npm** or **yarn**

### Optional
- **Netlify CLI** (for serverless function testing)
- **Google Analytics** (for search tracking)

## License

Same as parent repository.

## Credits

- **Original Implementation**: Jung von Matt (AMP blog post, Feb 2020)
- **Restoration Analysis**: Claude AI (Nov 2025)
- **Migration Package**: Automated tooling for amp.dev.20 transition

## Timeline

- **2020-02-14**: Original site-search implementation published
- **2021-2022**: Site-search deprecated (removed from default layout)
- **2025-11-06**: Complete restoration analysis completed
- **2025-11-11**: Migration package created for amp.dev.20

## Next Steps

1. **Read**: `QUICK_START_MIGRATION.md` for step-by-step guide
2. **Run**: `./migrate-site-search.sh /path/to/amp.dev.20`
3. **Verify**: `./verify-site-search-migration.sh`
4. **Configure**: Set environment variables
5. **Integrate**: Register router, include templates
6. **Test**: Local testing with `npm run dev`
7. **Deploy**: Staging → Production

## Support

For questions or issues:

1. Check **QUICK_START_MIGRATION.md** for common tasks
2. Review **MIGRATION_SITE_SEARCH_TO_AMP_DEV_20.md** for troubleshooting
3. Consult **HANDOFF_SITE_SEARCH_RESTORATION.md** for architecture details
4. Examine reference files in `ontology-search/reference-files/`

---

**Package Status**: ✅ Complete and ready for migration
**Last Updated**: 2025-11-11
**Version**: 1.0
**Complexity**: Medium
**Estimated Migration Time**: 30-60 minutes
