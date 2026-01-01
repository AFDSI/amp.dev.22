# ROUTERS
- note: all routers use Express

## Express

### routers/example/static.js

- platform/lib/routers/example/static.js
- https://github.com/ampproject/amp.dev/blob/main/platform/lib/routers/example/static.js

#### Snipet
```
const staticRouter = express.Router();
staticRouter.use('/static', express.static(project.paths.STATICS_DEST));

staticRouter.use(robots('disallow_all.txt'));
```

### routers/static.js

- platform/lib/routers/static.js
- https://github.com/ampproject/amp.dev/blob/main/platform/lib/routers/static.js

#### Snippet
```
const express = require('express');
const {setMaxAge} = require('@lib/utils/cacheHelpers');
const {join} = require('path');
const config = require('@lib/config');
const project = require('@lib/utils/project');
const robots = require('./robots');

const staticRouter = express.Router();

staticRouter.get('/serviceworker.js', (request, response)
staticRouter.get('/serviceworker.html', (request, response)
staticRouter.use(robots('platform_prod.txt'))
staticRouter.get('/manifest.json', (request, response)
staticRouter.get('/amp-app-banner-manifest.json', (request, response)
staticRouter.get('/googlefc2a7cf70933ae03.html', (request, response)
```

## search.js

- platform/lib/routers/search.js
- https://github.com/ampproject/amp.dev/blob/main/platform/lib/routers/search.js

#### Snipet
```
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
} = require('@lib/common/AmpConstants.js')
```
