# File Mapping - Search Highlights

This document provides a quick reference mapping of extracted files to their original locations in the ampproject/amp.dev repository at commit `df1c26b9^`.

## File Mappings

| Extracted File | Original Path in Repository | Type | Description |
|----------------|----------------------------|------|-------------|
| `search-promoted-pages.json` | `platform/config/search-promoted-pages.json` | JSON Config | Source configuration for promoted search content |
| `extract_highlights_info/__init__.py` | `pages/extensions/extract_highlights_info/__init__.py` | Python | Grow extension entry point |
| `extract_highlights_info/page_info_collector.py` | `pages/extensions/extract_highlights_info/page_info_collector.py` | Python | Core logic for extracting page metadata |
| `extract_highlights_info/page_info_collector_test.py` | `pages/extensions/extract_highlights_info/page_info_collector_test.py` | Python | Unit tests |
| `extract_highlights_info/readme.md` | `pages/extensions/extract_highlights_info/readme.md` | Markdown | Extension documentation |
| `search-router.js` | `platform/lib/routers/search.js` | JavaScript | Express router for search endpoints |

## Related Files Not Extracted

These files reference or interact with the highlights functionality but were not extracted:

| File Path | Relevant Lines/Content | Description |
|-----------|----------------------|-------------|
| `platform/config/podspec.yaml` | Lines 41-43 | Extension configuration |
| `gulpfile.js/build.js` | Reference to dist folder | Build script |
| `gulpfile.js/staticify.js` | Copies generated JSON files | Build script |
| `platform/lib/routers/search.test.js` | N/A | Router tests |
| `netlify/functions/search_do/search_do.js` | N/A | Search function |
| `netlify/functions/search_autosuggest/search_autosuggest.js` | N/A | Autosuggest function |
| `frontend/templates/views/partials/search.j2` | N/A | Search UI template |
| `frontend/scss/components/organisms/search.scss` | N/A | Search styles |

## Generated Files (Not in Repository)

These files were generated at build time and were not committed to the repository:

| Generated File | Location | Description |
|----------------|----------|-------------|
| `en.json` | `/dist/static/files/search-promoted-pages/en.json` | English highlights |
| `es.json` | `/dist/static/files/search-promoted-pages/es.json` | Spanish highlights |
| `fr.json` | `/dist/static/files/search-promoted-pages/fr.json` | French highlights |
| `de.json` | `/dist/static/files/search-promoted-pages/de.json` | German highlights |
| `ja.json` | `/dist/static/files/search-promoted-pages/ja.json` | Japanese highlights |
| `ko.json` | `/dist/static/files/search-promoted-pages/ko.json` | Korean highlights |
| `pt.json` | `/dist/static/files/search-promoted-pages/pt.json` | Portuguese highlights |
| `ar.json` | `/dist/static/files/search-promoted-pages/ar.json` | Arabic highlights |
| `id.json` | `/dist/static/files/search-promoted-pages/id.json` | Indonesian highlights |
| `it.json` | `/dist/static/files/search-promoted-pages/it.json` | Italian highlights |
| `pl.json` | `/dist/static/files/search-promoted-pages/pl.json` | Polish highlights |
| `ru.json` | `/dist/static/files/search-promoted-pages/ru.json` | Russian highlights |
| `tr.json` | `/dist/static/files/search-promoted-pages/tr.json` | Turkish highlights |
| `vi.json` | `/dist/static/files/search-promoted-pages/vi.json` | Vietnamese highlights |
| `zh_CN.json` | `/dist/static/files/search-promoted-pages/zh_CN.json` | Simplified Chinese highlights |

## Repository Information

- **Repository:** https://github.com/ampproject/amp.dev
- **Commit:** `df1c26b9^` (parent of df1c26b9f)
- **Extraction Date:** 2025-10-30
- **Working Repository:** `/mnt/e/users/gigster/workspace/repos/amp/amp.dev.20`

## API Endpoints

The search highlights were served via these endpoints:

- `GET /search/highlights?locale={locale}` - Handled by `handleHighlightsRequest()` in `search-router.js:91-111`
- Cache TTL: 24 hours (86400 seconds)
- Response format: `{ result: { components: [...], pages: [...] }, initial: true }`
