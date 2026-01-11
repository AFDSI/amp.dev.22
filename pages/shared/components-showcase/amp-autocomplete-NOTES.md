
## Claudius Analysis Report

Component Showcase (pages/shared/components-showcase/amp-autocomplete.html)
```
<amp-autocomplete
  filter="substring"                                          <!-- Client-side filtering -->
  src="/static/samples/json/amp-autocomplete-cities.json"     <!-- Static JSON file -->
>
```

Use Case: Demonstrating client-side filtering - browser downloads full list, filters locally.

Data Comparison

Aspect	Static JSON	Netlify API (/cities)
File	amp-autocomplete-cities.json	autosuggest.js → US_CAPITAL_CITIES_RICH
Data	52 cities (strings)	Only 3 cities (objects with city/state/areaCode/population)
Format	["Albany, New York", ...]	[{city: "Albany", state: "New York", ...}]
Filtering	Client-side (filter="substring")	Server-side (?q= parameter)
Count	52 items	3 items
⚠️ The data sets are intentionally DIFFERENT:

Static JSON = Full 52 US state capitals (simple strings)
API /cities = Only 3 cities with rich metadata (for demonstrating templated rendering)

Pattern Summary
Example Location	Pattern	Data Source	Purpose
components-showcase/amp-autocomplete.html	Static JSON + client filter	/static/samples/json/amp-autocomplete-cities.json	Demo basic client-side autocomplete
amp-autocomplete.html (main example)	Static JSON + client filter	Same static JSON	Demo various filter modes
amp-autocomplete-email.html	API + server filter	/api/autosuggest/cities?q=	Demo server-side filtering with rich data
Recommendation

## Do NOT change components-showcase/amp-autocomplete.html from static JSON to API because:

- It's demonstrating client-side filtering (filter="substring")
- The static file works without network dependency
- The API endpoint uses different data (only 3 cities with rich objects)
- The static JSON path /static/samples/json/amp-autocomplete-cities.json is a relative path that will work correctly when served from any domain - no parameterization needed.

## Claudia comment

This is the right analysis. **No change needed.**

**Key insight:** The static JSON path is relative (`/static/samples/json/...`), not absolute. It will resolve correctly on any domain — amp.dev, amp-new.netlify.app, or abc.dev.

**Summary:**

| Pattern | Parameterization Needed? | Why |
|---------|-------------------------|-----|
| Relative static path (`/static/...`) | No | Works on any domain |
| Absolute URL (`https://amp.dev/...`) | Yes | Domain-specific |
| Podspec variable (`{{ podspec.base_urls.* }}`) | Already done | Parameterized at build |

**For your TODO list:**

Only hunt for **absolute URLs** that are hardcoded. Relative paths are fine.

```bash
# Find hardcoded absolute URLs that need attention
grep -rn "https://amp\.dev\|https://preview\.amp\.dev\|https://playground\.amp\.dev" pages/ examples/ --include="*.html" --include="*.md" | grep -v node_modules | head -30
```

=====

## Returning to work on the parameterization project.

For this file: `pages/shared/components-showcase/amp-autocomplete.html`
we have this:
```
<amp-autocomplete filter="substring" id="myAutocomplete">
  <p>Search for</p>
  <form
    class="sample-form"
    method="post"
    action-xhr="https://amp-new.netlify.app/documentation/examples/api/echo"
    target="_top"
  >
    <amp-autocomplete
      filter="substring"
      src="/static/samples/json/amp-autocomplete-cities.json"
    >
      <input />
    </amp-autocomplete>
  </form>
</amp-autocomplete>
```

the target JSON file is located here: `examples/static/samples/json/amp-autocomplete-cities.json`

in the following format:
```
{
	"items": [
		"Albany, New York",
		"Annapolis, Maryland",
		"Atlanta, Georgia",
		"Augusta, Maine",
		"Austin, Texas",
		"Baton Rouge, Louisiana",
		"Bismarck, North Dakota",
		"Boise, Idaho",
		"Boston, Massachusetts"
}
```

however, the Netlify version is located here: `netlify/functions/examples_api_autosuggest_cities`

in the following format:

```
const US_CAPITAL_CITIES = [
  'Montgomery, Alabama',
  'Juneau, Alaska',
  'Phoenix, Arizona',
  'Little Rock, Arkansas',
  'Sacramento, California',
  'Denver, Colorado',
  'Hartford, Connecticut',
  'Dover, Delaware',
  'Tallahassee, Florida',
  'Atlanta, Georgia'
  ]
```

How to update `pages/shared/components-showcase/amp-autocomplete.html` to use the new parameterized methods?
