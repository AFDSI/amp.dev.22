## `amp.dev` Server Strategy

- `amp.dev` has two server strategies: Node-based `express.js` and Netlify-based `functions`.
- Nearly 100% of `amp.dev` examples and templates use `express`.
- However, a critical service - `amp-site-search` - may work best using `functions`.
- Further, Google planned migration from Node `express` to Netlify `functions` before it was sidetracked by other issues.
- In preparation for migration to `functions`, Google developed many `functions` that are approximate equivalents of `express` services.

## Objective

- Selectively migrate `express-based` services to `function-based` service.
- Specifically, enable `amp-site-search` using `function-based` services.

## Process

- Review services `AS-IS`
- Define services `TO-BE`
- Define `TO-DO` actions to enable `amp-site-search` using `functions`.

## AS-IS

### Example - one named service enabled 2 ways - `googleSearch`

#### Node Express

- `platform/lib/utils/googleSearch.js`

##### Used by

- platform/...
- examples/...

#### Netlify Functions

- `netlify/functions/search_do/googleSearch.js`

##### Used by

- Under Construction

### Express instance - `search.js`

-`search.js` is constructed using `googleSearch.js`:

```javascript
const express = require('express');
const path = require('path');
const config = require('@lib/config.js');
const project = require('@lib/utils/project.js');
const googleSearch = require('@lib/utils/googleSearch.js');
const samples = require('@lib/common/samples.js');
const {setMaxAge} = require('@lib/utils/cacheHelpers');
const log = require('@lib/utils/log')('Search');
const URL = require('url').URL;
const componentVersions = require(project.paths.COMPONENT_VERSIONS);

const {
  BUILT_IN_COMPONENTS,
  IMPORTANT_INCLUDED_ELEMENTS,
} = require('@lib/common/AmpConstants.js');
```

- `googleSearch.js` is defined at `platform/lib/utils/googleSearch.js`

### Netlify instance - `search_do`

- `netlify/functions/search_do/search_do.js` uses `netlify/functions/search_do/googleSearch.js`

```javascript
const googleSearch = require('./googleSearch.js');
```

- `netlify/functions/search_do/googleSearch.js` is constructed using:

```javascript
const fetch = require('node-fetch');
const credentials = require('./credentials');
const log = require('./log')('Google Search');
```

- `netlify/functions/search_do/googleSearch.js` depends on `package.json`

```javascript
"node-fetch": "2.7.0",
```

### Example - one named service enabled 2 ways - `autosuggest`

#### `express`

- item
- item
- item
- item

#### `functions`

- `netlify/functions/search_autosuggest/search_autosuggest.js` is constructed using:

```javascript
const componentVersions = require('./component-versions.json');

const {
  BUILT_IN_COMPONENTS,
  IMPORTANT_INCLUDED_ELEMENTS,
} = require('./AmpConstants.js');
```

- located here:

```
netlify/functions/search_autosuggest/AmpConstants.js
netlify/functions/search_autosuggest/component-versions.json
```

#### `express`

- Express form uses `form action-xhr="https://amp.dev/documentation/examples/api/echo"`
- Netlify alternative is `netlify/functions/examples_api_echo/examples_api_echo.js`

- netlify/functions/examples_api_autosuggest_cities/examples_api_autosuggest_cities.js

#### working example:

- endpoint: `https://amp.dev/documentation/examples/api/echo`

#### examples/api/echo.js

- source: `"https://amp.dev/search/autosuggest"`

#### examples/api/autosuggest.js

- `form action-xhr=""`
- `src=""`

```html
<form
  action-xhr="https://amp.dev/documentation/examples/api/echo"
  class=""
  id="searchForm"
  method="POST"
  on="submit:AMP.setState({ query: throttledValue }),searchResult.focus,searchList.changeToLayoutContainer"
  target="_top"
>
  <amp-autocomplete
    class=""
    filter="substring"
    min-characters="1"
    on="select:AMP.setState({ query: event.value })"
    submit-on-enter="false"
    src="https://amp.dev/search/autosuggest"
  >
    <div class="">
      <svg>
        <use
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xlink:href="#magnifier"
        />
      </svg>
    </div>

    <input
      id="searchInput"
      class=""
      name="q"
      placeholder="What are you looking for?"
      on="input-throttled:AMP.setState({ throttledValue: event.value })"
      [value]="query == null ? '' : query"
      required
    />

    <button
      class=""
      type="submit"
      name="search-submit"
      disabled
      [disabled]="!throttledValue"
    >
      Search
    </button>
  </amp-autocomplete>
</form>
```

### NETLIFY EQUIVALENT

For `express.js` examples like `examples/api/autosuggest.js`

```javascript
const express = require('express');
const examples = express.Router();
const US_CAPITAL_CITIES = [
  'Montgomery, Alabama',
  'Juneau, Alaska',
  'Phoenix, Arizona',
```

Netlify uses:

- netlify/functions/examples_api_autosuggest_cities/autosuggest.js
- netlify/functions/examples_api_autosuggest_cities/examples_api_autosuggest_cities.js

Express uses:

- form action-xhr="https://amp.dev/documentation/examples/api/echo"

Netlify uses:

- netlify/functions/examples_api_echo/examples_api_echo.js depends on:

```javascript
const busboyLib = require('busboy');
```

- `package.json` declares:

```json
"busboy": "1.6.0",
```

## TO-BE

### Step 1

- item

### Step 2

- item

## TO-DO

### Step 1

- update

```html
<form
  action-xhr="https://amp.dev/documentation/examples/api/echo"
  class=""
  id="searchForm"
  method="POST"
  on="submit:AMP.setState({ query: throttledValue }),searchResult.focus,searchList.changeToLayoutContainer"
  target="_top"
>
  <amp-autocomplete
    class=""
    filter="substring"
    min-characters="1"
    on="select:AMP.setState({ query: event.value })"
    submit-on-enter="false"
    src="https://amp.dev/search/autosuggest"
  >
    <div class="">
      <svg>
        <use
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xlink:href="#magnifier"
        />
      </svg>
    </div>

    <input
      id="searchInput"
      class=""
      name="q"
      placeholder="What are you looking for?"
      on="input-throttled:AMP.setState({ throttledValue: event.value })"
      [value]="query == null ? '' : query"
      required
    />

    <button
      class=""
      type="submit"
      name="search-submit"
      disabled
      [disabled]="!throttledValue"
    >
      Search
    </button>
  </amp-autocomplete>
</form>
```

### Step 2

- Test
