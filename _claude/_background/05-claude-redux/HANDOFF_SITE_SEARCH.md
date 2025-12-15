# Handoff Document: Site-Search Analysis

## Project Overview

Comprehensive analysis of the **site-search** implementation in amp.dev.n4. This document provides a baseline understanding of the current site-wide search architecture, which uses Google Custom Search API and AMP components.

## Repository Information

- **Repository**: AFDSI/amp.dev.n4
- **Branch**: `claude/analyze-tar-011CUppL4unTTnGJgitdWds5`
- **Analysis Date**: 2025-11-06
- **Related Work**: See `HANDOFF_ONTOLOGY_SEARCH.md` for the refactored playground search

## What is Site-Search?

Site-search is the **main search functionality** for the amp.dev website. It provides:
- Site-wide content search across documentation, guides, examples, blog posts
- Component name autocomplete
- Highlighted/promoted pages and components
- Multi-locale support
- Paginated results (10 per page, max 100 total)

## Architecture Overview

### High-Level Flow

```
User Types Query
     ↓
AMP Autocomplete (component suggestions)
     ↓
Form Submit (query state change)
     ↓
amp-list fetches from /search/do
     ↓
Express Router → Google Custom Search API
     ↓
Results processed & formatted
     ↓
amp-mustache renders results
     ↓
User sees components + pages
```

### Key Architectural Decisions

1. **Server-Side Search**: Uses Google Custom Search API (not client-side indexing)
2. **AMP Framework**: Leverages AMP components for performance and functionality
3. **State Management**: Uses `amp-state` and `amp-bind` for reactive updates
4. **Template Rendering**: Jinja2 for initial HTML, Mustache for dynamic results
5. **Progressive Loading**: Automatic load-more with pagination

## File Structure

```
Backend:
platform/
├── lib/
│   ├── routers/
│   │   ├── search.js                    # Main search router (401 lines)
│   │   └── search.test.js               # Tests
│   └── utils/
│       └── googleSearch.js              # Google CSE API wrapper (88 lines)
└── config/
    ├── podspec.yaml                      # Grow configuration
    └── search-promoted-pages.json        # Highlights input (currently empty)

Netlify Functions:
netlify/functions/
├── search_do/
│   ├── search_do.js                     # Serverless search endpoint
│   └── googleSearch.js                  # CSE wrapper
├── search_autosuggest/
│   ├── search_autosuggest.js            # Component autocomplete
│   ├── component-versions.json          # Component list
│   └── AmpConstants.js                  # Built-in components
└── examples_api_autosuggest_search_list/
    └── examples_api_autosuggest_search_list.js

Frontend:
frontend/
├── templates/
│   └── views/
│       └── partials/
│           └── search.j2                # Main search template (177 lines)
└── scss/
    └── components/
        ├── organisms/
        │   └── search.scss              # Search modal styles
        └── molecules/
            └── search-trigger.scss      # Search button styles

Generated at Build:
dist/static/files/search-promoted-pages/
└── {locale}.json                        # Generated highlights per locale
```

## Component Breakdown

### 1. Backend Router (`platform/lib/routers/search.js`)

**Purpose**: Main Express router handling all search endpoints

**Endpoints**:

1. **`GET /search/do`** - Main search execution
   - Query params: `q` (query), `locale`, `page`
   - Calls Google Custom Search API
   - Returns: `{ result: { components, pages, totalResults, currentPage, pageCount }, nextUrl, prevUrl }`
   - Special handling for component pages (highlights top 3)
   - Caching: 6 hours

2. **`GET /search/highlights`** - Promoted pages
   - Query params: `locale`
   - Returns pre-configured popular pages and components
   - Source: Generated from `search-promoted-pages.json`
   - Caching: 24 hours

3. **`GET /search/autosuggest`** - Component autocomplete
   - Returns list of all AMP component names
   - Source: `component-versions.json` + built-in components
   - Caching: 24 hours

**Key Functions**:
- `handleSearchRequest()`: Main search logic with locale filtering
- `createPageObject()`: Transforms CSE results to standard format
- `enrichComponentPageObject()`: Adds example/playground links
- `cleanupTexts()`: Sanitizes markdown and special characters
- `handleTestSearchRequest()`: Test mode for development

**Important Constants**:
```javascript
PAGE_SIZE = 10                      // Google CSE limit
MAX_PAGE = 10                        // Max 100 results (10 pages)
MAX_HIGHLIGHT_COMPONENTS = 3         // Top components highlighted
COMPONENT_REFERENCE_DOC_PATTERN      // Regex to identify component docs
```

### 2. Google Search Utility (`platform/lib/utils/googleSearch.js`)

**Purpose**: Wrapper for Google Custom Search API

**Configuration**:
- **Base URL**: `https://www.googleapis.com/customsearch/v1`
- **CSE ID**: `014077439351665726204:s4tidjx0agu`
- **API Key**: Loaded from credentials (`GOOGLE_CSE_API_KEY`)

**Search Options**:
- `hiddenQuery`: Filters results by locale metatag
- `noLanguageFilter`: Disable for non-default locales
- Language parameter: First 2 chars of locale
- Page size: 10 (hardcoded by Google)

**API Parameters**:
```javascript
cx: CSE_ID                          // Custom search engine ID
key: API_KEY                        // API key
hl: language                        // UI language
q: query                            // Search query
start: startIndex                   // Pagination (1-based)
lr: lang_${language}                // Result language filter
hq: options.hiddenQuery             // Hidden query constraints
```

### 3. Frontend Template (`frontend/templates/views/partials/search.j2`)

**Purpose**: Jinja2 template defining the search UI using AMP components

**Structure**:

```html
<amp-lightbox id="searchLightbox">          <!-- Modal overlay -->
  <amp-state id="query">                    <!-- Query state -->
  <amp-state id="search">                   <!-- Results state -->

  <form action-xhr="/search/do">             <!-- Search form -->
    <amp-autocomplete                        <!-- Component suggestions -->
      src="/search/autosuggest"
      on="select:AMP.setState({query: event.value})"
    >
      <input id="searchInput"
        on="input-throttled:AMP.setState({throttledValue: event.value})"
      >
    </amp-autocomplete>
  </form>

  <amp-list id="searchList"                 <!-- Results list -->
    src="/search/highlights/{locale}.json"
    [src]="query ? '/search/do?q=' + query : '/search/highlights/...'"
    load-more="auto"
    load-more-bookmark="nextUrl"
  >
    <template type="amp-mustache">           <!-- Result template -->
      <!-- Components section -->
      {{#result.components}}
        <div class="result-item-highlight">
          <a href="{{url}}">
            <h4>{{title}}</h4>
            <p>{{description}}</p>
          </a>
          <a href="{{exampleUrl}}">Open example</a>
          <a href="{{playgroundUrl}}">Open in playground</a>
        </div>
      {{/result.components}}

      <!-- Pages section -->
      {{#result.pages}}
        <div class="result-item">
          <a href="{{url}}">
            <h4>{{title}}</h4>
            <p>{{description}}</p>
          </a>
        </div>
      {{/result.pages}}
    </template>
  </amp-list>
</amp-lightbox>
```

**Key Features**:
- **Reactive State**: Query changes trigger new searches automatically
- **Autocomplete**: Component name suggestions as you type
- **Progressive Loading**: "Load more" button for pagination
- **Initial State**: Shows highlights before search
- **Error Handling**: Fallback UI for failures and no results
- **Accessibility**: Keyboard navigation, focus management, ARIA attributes

### 4. Highlights System

**Purpose**: Curated list of popular/important pages shown before searching

**Input File**: `platform/config/search-promoted-pages.json`
```json
{
  "default": {
    "components": [],
    "pages": []
  }
}
```

**Build Process**:
1. Grow extension `ExtractHighlightsInfoExtension` reads input
2. For each locale, resolves content paths to full page objects
3. Extracts title, description, URL from actual pages
4. Generates `{locale}.json` in output folder

**Output Format**: `dist/static/files/search-promoted-pages/{locale}.json`
```json
{
  "components": [
    {
      "title": "amp-carousel",
      "description": "A generic carousel for displaying multiple similar pieces of content",
      "url": "/documentation/components/amp-carousel",
      "exampleUrl": "/documentation/examples/...",
      "playgroundUrl": "https://playground.amp.dev/..."
    }
  ],
  "pages": [
    {
      "title": "Getting Started",
      "description": "Learn how to create your first AMP page",
      "url": "/documentation/guides-and-tutorials/start/..."
    }
  ]
}
```

**Current State**: Input file is empty - no highlights configured yet

### 5. Autosuggest System

**Purpose**: Component name autocomplete in search input

**Data Source**: `netlify/functions/search_autosuggest/component-versions.json`
- Contains all versioned AMP components (300+ entries)
- Plus built-in components from `AmpConstants.js`
- Sorted alphabetically

**Behavior**:
- Triggers after 1 character typed
- Uses substring matching (AMP's built-in filter)
- Shows dropdown below search input
- Click to fill search box

**Example Suggestions**: `amp-accordion`, `amp-carousel`, `amp-video`, etc.

### 6. Styling

**`frontend/scss/components/organisms/search.scss`**:
- Modal overlay (`ap-o-search`)
- Search container with responsive sizing
- Form and input styling
- Result list layout
- Autocomplete dropdown
- Error states

**Key Classes**:
- `.ap-o-search` - Main search modal
- `.ap-o-search-container` - Content container
- `.ap-o-search-input` - Search input field
- `.ap-o-search-result-item` - Individual result
- `.ap-o-search-result-item-highlight` - Component highlight

## Data Flow Details

### Search Request Flow

1. **User Input**:
   - Types in search box
   - `input-throttled` event fires
   - `AMP.setState({ throttledValue: event.value })`

2. **Form Submit**:
   - User presses Enter or clicks Search
   - `submit` event fires
   - `AMP.setState({ query: throttledValue })`

3. **State Change**:
   - `query` state changes
   - `amp-list [src]` binding updates
   - New URL: `/search/do?q={query}&locale={locale}`

4. **Server Processing**:
   - Express router receives request
   - Validates query and page
   - Constructs Google CSE request with hidden filters
   - Calls `googleSearch.search(query, locale, page, options)`

5. **Google CSE**:
   - Searches across amp.dev domain
   - Filters by locale metatag
   - Returns max 10 results per request
   - Includes page metadata (title, description, URL)

6. **Result Processing**:
   - Parses CSE response
   - Identifies component pages (first 8 results)
   - Enriches components with example/playground links
   - Separates into components (max 3) and pages arrays
   - Cleans up text (removes markdown, special chars)

7. **Response**:
   ```json
   {
     "result": {
       "totalResults": 42,
       "currentPage": 1,
       "pageCount": 5,
       "components": [
         { "title": "...", "description": "...", "url": "...", "exampleUrl": "...", "playgroundUrl": "..." }
       ],
       "pages": [
         { "title": "...", "description": "...", "url": "..." }
       ]
     },
     "initial": false,
     "nextUrl": "/search/do?q=...&locale=...&page=2",
     "prevUrl": null
   }
   ```

8. **Rendering**:
   - `amp-list` receives JSON
   - `amp-mustache` template iterates over data
   - Renders components section (if any)
   - Renders pages section
   - Shows "Load more" if `nextUrl` exists

9. **Pagination**:
   - User clicks "Load more" or scrolls down
   - `amp-list load-more="auto"` fetches `nextUrl`
   - Appends new results to existing list

### Locale Handling

**Hidden Query Construction**:
```javascript
// For default locale (en):
hiddenQuery: "more:pagemap:metatags-page-locale:en OR site:blog.amp.dev OR site:playground.amp.dev"

// For other locales (e.g., de):
hiddenQuery: "more:pagemap:metatags-page-locale:en OR more:pagemap:metatags-page-locale:de OR site:blog.amp.dev OR site:playground.amp.dev"
noLanguageFilter: true  // Don't restrict to German results only
```

**Rationale**:
- Default locale (en) gets strict filtering
- Other locales see both English and translated pages
- Blog and playground always included (no locale metatag)

### Component Highlighting Logic

**When**: Only on first page of results (`page == 1`)

**How**:
1. Iterate through first 10 results
2. Check if URL matches `COMPONENT_REFERENCE_DOC_PATTERN`
3. If match and within first 8 results:
   - Add to `components` array
   - Enrich with example/playground URLs
   - Remove from pages array
4. Stop after 3 components highlighted

**Purpose**: Give prominence to relevant AMP components in search results

## API Integration

### Google Custom Search API

**Quota**:
- Free tier: 100 queries/day
- Paid: Up to 10,000 queries/day ($5/1000 queries)

**Limitations**:
- Max 10 results per request
- Max 100 total results accessible (10 pages)
- Cannot customize ranking algorithm
- Requires internet connectivity

**Configuration**:
- CSE ID configured in `googleSearch.js`
- API key loaded from credentials at startup
- If key missing, search fails gracefully with error

**Search Scope**:
- Primary: amp.dev domain
- Included: blog.amp.dev, playground.amp.dev
- Filtered: By page-locale metatag (except blog/playground)

## Comparison: Site-Search vs Ontology-Search

### Architectural Differences

| Aspect | Site-Search | Ontology-Search |
|--------|-------------|-----------------|
| **Search Scope** | Entire website (all pages) | Specific ontologies (playgrounds, components, etc.) |
| **Search Engine** | Google Custom Search API | Wade.js (local full-text index) |
| **Data Source** | Live web crawl + API | Static JSON files |
| **Index Location** | Google servers | Client browser memory |
| **Search Latency** | Network-dependent (100-500ms) | Sub-millisecond local |
| **Implementation** | Server-side (Node.js/Express) | Client-side (Vanilla JavaScript) |
| **UI Framework** | AMP components | Native DOM manipulation |
| **State Management** | amp-state + amp-bind | JavaScript class properties |
| **Rendering** | Mustache templates | Programmatic innerHTML |
| **Pagination** | Server-side (10/page, max 100) | Client-side filtering (all results) |
| **Autocomplete** | Component names only | Not implemented yet |
| **Highlights** | Curated promoted pages | Not applicable |
| **Offline Support** | No (requires API) | Yes (after initial load) |
| **Cost** | API quota limits | Free (bandwidth only) |
| **Maintenance** | Requires API key, monitoring | Update JSON files |
| **Scalability** | Google handles indexing | Limited by client memory |

### When to Use Which

**Use Site-Search for**:
- Site-wide content discovery
- Finding documentation, guides, blog posts
- Users want Google-quality ranking
- Content changes frequently (crawled automatically)
- Need to search across multiple domains

**Use Ontology-Search for**:
- Specific, curated datasets
- Fast, instant filtering experiences
- Offline-capable applications
- No API costs desired
- Full control over search logic and ranking

### Potential Convergence

Could site-search adopt the ontology-search pattern?

**Pros**:
- ✅ Eliminate API costs and quota limits
- ✅ Faster search (no network latency)
- ✅ Offline capability
- ✅ More control over ranking/filtering
- ✅ Unified architecture with playground search

**Cons**:
- ❌ Requires building/maintaining search index
- ❌ Index size could be large (entire site content)
- ❌ Manual updates needed when content changes
- ❌ Loses Google's ranking algorithms
- ❌ No automatic crawling of new content

**Hybrid Approach**:
- Use ontology-search for structured content (components, examples, tutorials)
- Keep Google CSE for unstructured content (blog, guides)
- Progressive enhancement: start with ontology, fallback to CSE

## Current Issues & Opportunities

### Issues

1. **Empty Highlights**: `search-promoted-pages.json` is empty
   - No curated content shown before searching
   - Users see empty state initially

2. **API Dependency**: Requires Google API key
   - Dev environments may lack key
   - Quota limits in production

3. **Limited Results**: Max 100 results accessible
   - Users cannot see beyond page 10
   - No way to refine/filter further

4. **No Type Filtering**: Unlike ontology-search
   - Can't filter by content type (component vs guide vs example)
   - All results mixed together

5. **Network Required**: No offline functionality
   - Fails without internet
   - Slow on poor connections

### Opportunities

1. **Populate Highlights**:
   - Curate important pages per locale
   - Showcase popular components
   - Guide new users to key content

2. **Add Ontology Search Integration**:
   - Use ontology-search for components/examples
   - Keep CSE for guides/blog
   - Best of both worlds

3. **Enhanced Filtering**:
   - Add content type filters (Component, Guide, Example, Blog)
   - Add tag/category filters
   - Add difficulty level for tutorials

4. **Improved Autocomplete**:
   - Suggest popular searches
   - Show recent searches
   - Include page titles, not just components

5. **Analytics**:
   - Track popular queries
   - Identify content gaps
   - Optimize promoted pages

6. **Performance**:
   - Cache CSE results client-side
   - Prefetch next page
   - Debounce search requests

## Testing

### Manual Testing

1. **Basic Search**:
   - Open site with search
   - Click search trigger (magnifying glass icon)
   - Type query: "carousel"
   - Should see: amp-carousel component + related pages

2. **Autocomplete**:
   - Start typing "amp-"
   - Should see: Dropdown with component names
   - Select one
   - Should: Fill search box

3. **Pagination**:
   - Search for common term (e.g., "amp")
   - Should see: "Load more" button
   - Click button
   - Should see: Next 10 results appended

4. **Highlights**:
   - Open search (before typing)
   - Should see: Promoted pages (currently empty)

5. **Multi-locale**:
   - Switch site locale to German
   - Search for "video"
   - Should see: German + English results

### Test Mode

**Available in development only**: Query containing "test" triggers mock results

Example queries:
- `5-pages` → Returns 5 pages of results
- `3-error` → Simulates error on page 3
- `amp-accordion` → Shows component results

### Automated Tests

**Location**: `platform/lib/routers/search.test.js`

Tests cover:
- Route registration
- Request validation
- Response format
- Error handling
- Locale filtering
- Component highlighting

## Configuration

### Environment Variables

**Required**:
- `GOOGLE_CSE_API_KEY` - Google Custom Search API key

**Optional**:
- None specific to search (uses global config)

### Config Files

**`platform/config/podspec.yaml`**:
```yaml
ext:
  - extensions.extract_highlights_info.ExtractHighlightsInfoExtension:
      input_file: /platform/config/search-promoted-pages.json
      output_folder: /dist/static/files/search-promoted-pages
```

**`platform/config/search-promoted-pages.json`**:
```json
{
  "default": {
    "components": [
      "/content/amp-dev/documentation/components/reference/amp-carousel.md"
    ],
    "pages": [
      "/content/amp-dev/documentation/guides-and-tutorials/start/create/basic_markup.md"
    ]
  },
  "de": {
    "components": [],
    "pages": []
  }
}
```

### Constants

**In `search.js`**:
```javascript
PAGE_SIZE = 10                           // Results per page
LAST_PAGE = 10                           // Max pages (100 results)
MAX_HIGHLIGHT_COMPONENTS = 3             // Components to highlight
MAX_HIGHLIGHT_COMPONENT_INDEX = 7        // Search first 8 for components
RESPONSE_MAX_AGE.search = 21600          // 6 hours
RESPONSE_MAX_AGE.highlights = 86400      // 24 hours
RESPONSE_MAX_AGE.autosuggest = 86400     // 24 hours
```

**In `googleSearch.js`**:
```javascript
CSE_ID = '014077439351665726204:s4tidjx0agu'
CSE_BASE_URL = 'https://www.googleapis.com/customsearch/v1'
```

## Dependencies

### Backend
- `express` - Web framework
- `node-fetch` - HTTP client for Google API
- `@lib/config` - App configuration
- `@lib/utils/credentials` - API key management
- `@lib/common/samples` - Example/playground links
- `@lib/utils/cacheHelpers` - Response caching

### Frontend (AMP Components)
- `amp-lightbox` - Modal overlay
- `amp-state` - State management
- `amp-bind` - Data binding
- `amp-list` - Dynamic list rendering
- `amp-autocomplete` - Autocomplete input
- `amp-mustache` - Template rendering

### Build
- Grow CMS - Static site generator
- `ExtractHighlightsInfoExtension` - Custom Grow extension

## Next Steps & Recommendations

### Immediate Actions

1. **Populate Highlights**:
   - Add top 5-10 pages to `search-promoted-pages.json`
   - Include key components (carousel, video, accordion, etc.)
   - Add getting started guides
   - Test generation process

2. **Verify API Key**:
   - Ensure `GOOGLE_CSE_API_KEY` is set in all environments
   - Test production quota limits
   - Set up monitoring/alerts

3. **Documentation**:
   - Add comments to complex functions
   - Document locale filtering logic
   - Create troubleshooting guide

### Future Enhancements

1. **Integrate Ontology Search**:
   - Replace CSE for components/examples with ontology-search
   - Keep CSE for guides/blog
   - Unified UI with type toggle

2. **Advanced Filtering**:
   - Content type filters
   - Tag/category filters
   - Date range for blog posts
   - Difficulty level for tutorials

3. **Better Autocomplete**:
   - Include popular pages (not just components)
   - Show recent searches
   - Add keyboard shortcuts

4. **Performance Optimizations**:
   - Client-side result caching
   - Prefetch next page
   - Debounce/throttle requests
   - Lazy load results

5. **Analytics & Insights**:
   - Track popular queries
   - Measure search success (clicks)
   - Identify "no results" queries
   - A/B test result ranking

6. **UI Improvements**:
   - Sticky search bar
   - Search history
   - Related searches
   - "Did you mean?" suggestions

7. **Accessibility**:
   - Screen reader announcements for result counts
   - Better keyboard navigation
   - High contrast mode support

## Questions for Future Work

When working on site-search enhancements, consider:

1. **Scope**: Should site-search be refactored to use ontology-search pattern?
2. **Filtering**: What content type filters would be most useful?
3. **Highlights**: Which pages should be promoted per locale?
4. **Performance**: Is API latency acceptable, or do we need client-side indexing?
5. **Offline**: Is offline search capability desired?
6. **Analytics**: What search metrics should we track?
7. **Integration**: How should site-search and ontology-search coexist?

## Related Documents

- **`HANDOFF_ONTOLOGY_SEARCH.md`** - Refactored playground search system (client-side)
- **`ontology-search/README.md`** - Ontology search implementation guide
- **`pages/extensions/extract_highlights_info/readme.md`** - Highlights generation

---

**Last Updated**: 2025-11-06
**Status**: ✅ Analysis complete, system functional
**Next Phase**: Decide on enhancements or integration with ontology-search
