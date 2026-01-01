# Implement Netlify Functions


# AUTOSUGGEST

## Express

### API

- examples/api/autosuggest.js
- https://github.com/ampproject/amp.dev/blob/main/examples/api/autosuggest.js

#### Snipet
```
const examples = express.Router();
const US_CAPITAL_CITIES = [
  'Montgomery, Alabama',
]
```

- examples/api/echo.js
- https://github.com/ampproject/amp.dev/blob/main/examples/api/echo.js

#### Snipet
```
examples.get('/echo', (request, response)
examples.post('/echo', upload.none(), (request, response)
```

### amp-autocomplete.html

- examples/source/1.components/amp-autocomplete.html
- https://github.com/ampproject/amp.dev/blob/main/examples/source/1.components/amp-autocomplete.html

#### Snipet
```
  <form class="sample-form" method="post"
        action-xhr="<% hosts.platform %>/documentation/examples/api/echo"
        target="_top">
    <amp-autocomplete filter="substring" src="/static/samples/json/amp-autocomplete-cities.json">
      <input>
    </amp-autocomplete>
  </form>
```
- examples/static/samples/json/amp-autocomplete-cities.json
- https://github.com/ampproject/amp.dev/blob/main/examples/static/samples/json/amp-autocomplete-cities.json

#### Snipet
```
{
    "items" : [
        "Albany, New York",
]}
```

## Functions

### search_autosuggest.js

- netlify/functions/search_autosuggest/search_autosuggest.js
- https://github.com/ampproject/amp.dev/blob/main/netlify/functions/search_autosuggest/search_autosuggest.js

#### Snipet
```
const componentVersions = require('./component-versions.json');
```

- netlify/functions/search_autosuggest/component-versions.json
- https://github.com/ampproject/amp.dev/blob/main/netlify/functions/search_autosuggest/component-versions.json

#### Snipet
```
{
  "amp-3d-gltf": "0.1",
  "amp-3q-player": "0.1",
  "amp-access": "0.1",
  "amp-access-fewcents": "0.1",
  "amp-access-laterpay": "0.2",
  "amp-access-poool": "0.1",
  "amp-access-scroll": "0.1",
  "amp-accordion": "0.1",
}
```

- netlify/functions/search_autosuggest/AmpConstants.js
- https://github.com/ampproject/amp.dev/blob/main/netlify/functions/search_autosuggest/AmpConstants.js


### search_do.js

- netlify/functions/search_do/search_do.js
- https://github.com/ampproject/amp.dev/blob/main/netlify/functions/search_do/search_do.js

#### Snipet
```
const googleSearch = require('./googleSearch.js');
```

- netlify/functions/search_do/googleSearch.js
- https://github.com/ampproject/amp.dev/blob/main/netlify/functions/search_do/googleSearch.js

#### Snipet
```
const fetch = require('node-fetch');
const credentials = require('./credentials');
const log = require('./log')('Google Search');
```

- netlify/functions/search_do/credentials.js
- https://github.com/ampproject/amp.dev/blob/main/netlify/functions/search_do/credentials.js

#### Snipet
```
const ENV_PREFIX = 'AMP_DEV_CREDENTIAL_';
```
