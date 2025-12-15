# Search Highlights / Promoted Pages

This directory contains code extracted from the ampproject/amp.dev repository at commit `df1c26b9^` related to search highlights functionality.

## Overview

The search highlights feature provided curated/promoted content that appeared in search results. This system used a JSON configuration file that was processed by a Grow extension to generate locale-specific JSON files at build time.

## Extracted Files

### 1. search-promoted-pages.json
- **Original Path:** `platform/config/search-promoted-pages.json`
- **Purpose:** Source configuration file containing promoted pages and components
- **Structure:**
  - Contains a `default` locale with two categories: `components` and `pages`
  - Lists paths to markdown content files that should be promoted in search
  - At build time, this was transformed into locale-specific JSON files with full page metadata

**Example content:**
```json
{
  "default": {
    "components": [
      "/content/amp-dev/documentation/components/reference/amp-img-v0.1.md",
      "/content/amp-dev/documentation/components/reference/amp-bind-v0.1.md",
      "/content/amp-dev/documentation/components/reference/amp-form-v0.1.md"
    ],
    "pages": [
      "/content/amp-dev/documentation/guides-and-tutorials/start/converting/index.md",
      "/content/amp-dev/documentation/guides-and-tutorials/learn/common_attributes.md",
      "/content/amp-dev/documentation/guides-and-tutorials/learn/amp-actions-and-events.md"
    ]
  }
}
```

### 2. extract_highlights_info/ (Directory)
- **Original Path:** `pages/extensions/extract_highlights_info/`
- **Purpose:** Grow CMS extension that transforms the source configuration into locale-specific output files
- **Key Files:**
  - `__init__.py` - Extension entry point
  - `page_info_collector.py` - Core logic for extracting page metadata
  - `page_info_collector_test.py` - Unit tests
  - `readme.md` - Extension documentation

**How it worked:**
1. Read `search-promoted-pages.json` input file
2. For each locale configured in the Grow pod:
   - Look for locale-specific configuration or fall back to "default"
   - For each page path, fetch the actual document from Grow
   - Extract title and description from the document
   - Generate URL for the page
3. Write output file to `/dist/static/files/search-promoted-pages/{locale}.json`

**Output format:**
```json
{
  "components": [
    {
      "title": "The locale specific title",
      "description": "The locale specific description",
      "url": "/url/path/to/page.html"
    }
  ],
  "pages": [...]
}
```

### 3. search-router.js
- **Original Path:** `platform/lib/routers/search.js`
- **Purpose:** Express router handling search-related API endpoints
- **Key Endpoints:**
  - `GET /search/highlights` - Returns promoted pages for a given locale
  - `GET /search/do` - Main search functionality
  - `GET /search/autosuggest` - Component name autocompletion

**Highlights functionality (lines 91-111):**
```javascript
function handleHighlightsRequest(request, response) {
  const locale = request.query.locale ? request.query.locale : config.getDefaultLocale();
  const data = require(path.join(HIGHLIGHTS_FOLDER_PATH, `${locale}.json`));

  // Enrich components with example and playground links
  for (const page of data.components) {
    addExampleAndPlaygroundLink(page, locale);
    cleanupTexts(page);
    page.url = new URL(page.url, config.hosts.platform.base).toString();
  }

  // Add base URL to pages
  for (const page of data.pages) {
    page.url = new URL(page.url, config.hosts.platform.base).toString();
  }

  response.json({
    result: data,
    initial: true
  });
}
```

## Configuration in podspec.yaml

The extension was configured in `platform/config/podspec.yaml`:

```yaml
ext:
  - extensions.extract_highlights_info.ExtractHighlightsInfoExtension:
      input_file: /platform/config/search-promoted-pages.json
      output_folder: /dist/static/files/search-promoted-pages
```

## Build Process

1. During Grow build, the `ExtractHighlightsInfoExtension` would run
2. It would read `search-promoted-pages.json`
3. For each locale (e.g., en, es, fr, de, ja, etc.):
   - Create a locale-specific JSON file (e.g., `en.json`, `es.json`)
   - Populate it with translated titles, descriptions, and URLs
4. Files were output to `/dist/static/files/search-promoted-pages/`
5. At runtime, the search router would serve these files via `/search/highlights?locale=XX`

## Gulpfile References

The build system also referenced these files:

- `gulpfile.js/build.js`: Line references `'./dist/static/files/search-promoted-pages'`
- `gulpfile.js/staticify.js`: Copies generated JSON files to static output

## Related Code

Other files that referenced or interacted with this functionality:

- `netlify/functions/search_do/search_do.js` - Search implementation
- `netlify/functions/search_autosuggest/search_autosuggest.js` - Autocompletion
- `frontend/templates/views/partials/search.j2` - Search UI template
- `frontend/scss/components/organisms/search.scss` - Search styling

## Locale Support

The system supported all locales configured in the Grow pod, including:
- en (English - default)
- es (Spanish)
- fr (French)
- de (German)
- ja (Japanese)
- ko (Korean)
- pt (Portuguese)
- ar (Arabic)
- id (Indonesian)
- it (Italian)
- pl (Polish)
- ru (Russian)
- tr (Turkish)
- vi (Vietnamese)
- zh_CN (Simplified Chinese)

Each locale would get its own generated JSON file with localized content.

## API Response Format

When a client requested `/search/highlights?locale=en`, the response would be:

```json
{
  "result": {
    "components": [
      {
        "title": "amp-img",
        "description": "Use the amp-img component to replace the HTML5 img tag...",
        "url": "https://amp.dev/documentation/components/amp-img/",
        "exampleUrl": "https://amp.dev/documentation/examples/components/amp-img/",
        "playgroundUrl": "https://playground.amp.dev/..."
      }
    ],
    "pages": [
      {
        "title": "Converting HTML to AMP",
        "description": "This guide shows you how to convert your HTML pages to AMP...",
        "url": "https://amp.dev/documentation/guides-and-tutorials/start/converting/"
      }
    ]
  },
  "initial": true
}
```

## Notes

- The `initial: true` flag in the response indicated this was initial/promoted content shown before any search query
- Components in highlights received special treatment with example and playground links
- The system had caching with 24-hour max age for highlights
- Content was chosen to highlight popular/important pages and components
- The promoted content appeared when users opened search before typing anything
