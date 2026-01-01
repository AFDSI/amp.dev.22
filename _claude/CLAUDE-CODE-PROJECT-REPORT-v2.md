commit 1a8c569c0d9c7e6b66bd8ac15aefa489791f61d6
Author: Claude <noreply@anthropic.com>
Date: Thu Jan 1 01:07:34 2026 +0000

    Remove dead gCloud code and unused dependencies

    - Delete platform/lib/routers/packager.js (SXG packager - commented out)
    - Remove unused npm packages: @google-cloud/datastore, gcp-metadata,
      ioredis, http-proxy, dropzone, json-tree-view
    - Simplify pageCache.js to LRU-only (remove Redis/GCP metadata code)
    - Simplify credentials.js (platform and netlify) to env-var only

    These changes implement the HIGH priority recommendations from the
    health check report. All removed code was dead on Netlify deployment.

diff --git a/netlify/functions/search_do/credentials.js b/netlify/functions/search_do/credentials.js
index 22eafbabb..ae95953dd 100644
--- a/netlify/functions/search_do/credentials.js
+++ b/netlify/functions/search_do/credentials.js
@@ -16,21 +16,12 @@

'use strict';

## -const {Datastore} = require('@google-cloud/datastore');

-/_ The entity name used in the GCloud Datastore _/
-const CREDENTIAL_ENTITY = 'Credential';

- -/_ Prefix for local environment variables containing credentials _/
  +/_ Prefix for environment variables containing credentials _/
  const ENV*PREFIX = 'AMP_DEV_CREDENTIAL*';
  -/_ A Datastore instance _/
  -const datastore = new Datastore();
- /\*\*
- - Tries to get a credential by name either from an environment variable
- - or if on app engine from the GCloud Datastore
- - @param {String} key A named Credential entity entry in the datastore

* - Gets a credential by name from an environment variable
* - @param {String} key A named credential key
    - @return {Promise}
      \*/
      function get(key) {
      @@ -39,21 +30,11 @@ function get(key) {
      return Promise.resolve(credential);
      }

- return new Promise((resolve, reject) => {
- const datastoreKey = datastore.key([CREDENTIAL_ENTITY, key.toUpperCase()]);
- datastore.get(datastoreKey, (e, entity) => {
-      if (e) {
-        reject(e);
-        return;
-      }
-
-      if (!entity) {
-        reject(new Error(`empty entity for key ${key}`));
-        return;
-      }
-      resolve(entity.credential);
- });
- });

* return Promise.reject(
* new Error(
*      `Environment variable ${ENV_PREFIX}${key.toUpperCase()} is not set.`
* )
* );
  }

module.exports = {
diff --git a/package.json b/package.json
index d82e2380c..1fd11cbfb 100644
--- a/package.json
+++ b/package.json
@@ -56,7 +56,6 @@
"@ampproject/toolbox-cache-list": "2.10.1",
"@ampproject/toolbox-cors": "2.10.1",
"@ampproject/toolbox-optimizer": "2.10.1",

-     "@google-cloud/datastore": "8.7.0",
  "@iarna/toml": "2.2.5",
  "busboy": "1.6.0",
  "casual": "1.6.2",
  @@ -66,18 +65,13 @@
  "cookie-parser": "1.4.6",
  "cors": "2.8.5",
  "crypto-browserify": "3.12.0",
-     "dropzone": "5.9.3",
      "express": "4.19.2",
      "express-formidable": "1.2.0",
-     "gcp-metadata": "6.1.0",
      "google-spreadsheet": "4.1.2",
      "gulp-file": "0.4.0",
      "helmet-csp": "3.4.0",
-     "http-proxy": "1.18.1",
-     "ioredis": "5.4.1",
      "joi": "17.13.3",
      "js-yaml": "4.1.0",
-     "json-tree-view": "0.4.12",
  "linkifyjs": "2.1.9",
  "lru-cache": "6.0.0",
  "middy": "0.36.0",
  diff --git a/platform/lib/routers/packager.js b/platform/lib/routers/packager.js
  deleted file mode 100644
  index 3cd7875c1..000000000
  --- a/platform/lib/routers/packager.js
  +++ /dev/null
  @@ -1,102 +0,0 @@
  -/\*\*
- - Copyright 2018 The AMP HTML Authors. All Rights Reserved.
- -
- - Licensed under the Apache License, Version 2.0 (the "License");
- - you may not use this file except in compliance with the License.
- - You may obtain a copy of the License at
- -
- -      http://www.apache.org/licenses/LICENSE-2.0
- -
- - Unless required by applicable law or agreed to in writing, software
- - distributed under the License is distributed on an "AS-IS" BASIS,
- - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
- - See the License for the specific language governing permissions and
- - limitations under the License.
- \*/
- -'use strict';
- -const HttpProxy = require('http-proxy');
  -const config = require('@lib/config');
  -const mime = require('mime-types');
  -const log = require('@lib/utils/log')('Packager');
- -const proxyOptions = {
- target: config.hosts.packager.base,
- changeOrigin: true,
  -};
- -const proxy = HttpProxy.createProxyServer(proxyOptions);
- -/\*\*
- - Proxy SXG requests to the AMPPackager:
- -
- - - If the URL starts with /amppkg/, forward the request unmodified.
- - - If the URL points to an AMP page and the AMP-Cache-Transform request header is present,
- - rewrite the URL by prepending /priv/doc and forward the request.
- - - Set the vary when serving AMP documents
- -
- - See https://github.com/ampproject/amppackager#productionizing
- \*/
  -const packager = (request, response, next) => {
- // Redirect all packager requests
- if (request.path.startsWith('/amppkg/')) {
- sxgProxy(request, response, request.url, next);
- return;
- }
- // Don't package non valid AMP pages
- let pagesHost = config.hosts.platform.host;
- if (config.hosts.platform.port) {
- pagesHost += `:${config.hosts.platform.port}`;
- }
- if (request.get('host') !== pagesHost) {
- log.info('Not packaging', request.get('host'), pagesHost);
- next();
- return;
- }
- // We'll only serve SXG for non-static files
- if (request.path.startsWith('/static/')) {
- next();
- return;
- }
- // We'll only serve SXG for html documents
- const mimeType = mime.lookup(request.path);
- if (mimeType && mimeType !== 'text/html') {
- next();
- return;
- }
- // We only serve SXG if the amp-cache-transform header is set. This
- // is to avoid sending SXGs to normal users. We have to tell our CDN
- // that the response varies depending on the amp-cache-transform header.
- response.set('vary', 'Accept, AMP-Cache-Transform');
- // Don't send SXG to normal users
- if (!request.header('amp-cache-transform')) {
- next();
- return;
- }
- // Hard-code amp.dev as it has to match the cert
- const urlToSign = `https://amp.dev${request.url}`;
- const searchParams = new URLSearchParams({
- sign: urlToSign,
- }).toString();
- const url = `/priv/doc?${searchParams}`;
- try {
- // Serve webpackage via packager
- sxgProxy(request, response, url, next);
- } catch (error) {
- log.error('[SXG] could not proxy request to amppackager', error);
- // Serve normal version of the page
- next();
- }
  -};
- -function sxgProxy(request, response, url) {
- log.info('Proxy', url);
- request.url = url;
- proxy.web(request, response, proxyOptions, (error) => {
- log.info('Proxy error', error);
- response.status(502).end();
- });
  -}
- -module.exports = packager;
  diff --git a/platform/lib/utils/credentials.js b/platform/lib/utils/credentials.js
  index c2af86a94..ae95953dd 100644
  --- a/platform/lib/utils/credentials.js
  +++ b/platform/lib/utils/credentials.js
  @@ -16,24 +16,12 @@
  'use strict';
  -require('module-alias/register');
- -const config = require('@lib/config');
  -const {Datastore} = require('@google-cloud/datastore');
- -/_ The entity name used in the GCloud Datastore _/
  -const CREDENTIAL_ENTITY = 'Credential';
- -/_ Prefix for local environment variables containing credentials _/
  +/_ Prefix for environment variables containing credentials _/
  const ENV*PREFIX = 'AMP_DEV_CREDENTIAL*';
  -/_ A Datastore instance _/
  -const datastore = new Datastore();
- /\*\*
- - Tries to get a credential by name either from an environment variable
- - or if on app engine from the GCloud Datastore
- - @param {String} key A named Credential entity entry in the datastore

* - Gets a credential by name from an environment variable
* - @param {String} key A named credential key
    - @return {Promise}
      \*/
      function get(key) {
      @@ -42,29 +30,11 @@ function get(key) {
      return Promise.resolve(credential);
      }

- if (!config.isProdMode() && !config.isStageMode()) {
- return Promise.reject(
-      new Error(
-        `Environment variable ${ENV_PREFIX}${key.toUpperCase()} is not set.`
-      )
- );
- }
-
- return new Promise((resolve, reject) => {
- const datastoreKey = datastore.key([CREDENTIAL_ENTITY, key.toUpperCase()]);
- datastore.get(datastoreKey, (e, entity) => {
-      if (e) {
-        reject(e);
-        return;
-      }
-
-      if (!entity) {
-        reject(new Error(`empty entity for key ${key}`));
-        return;
-      }
-      resolve(entity.credential);
- });
- });

* return Promise.reject(
* new Error(
*      `Environment variable ${ENV_PREFIX}${key.toUpperCase()} is not set.`
* )
* );
  }

module.exports = {
diff --git a/platform/lib/utils/pageCache.js b/platform/lib/utils/pageCache.js
index a25d5fa62..68f14be4a 100644
--- a/platform/lib/utils/pageCache.js
+++ b/platform/lib/utils/pageCache.js
@@ -19,97 +19,30 @@
require('module-alias/register');

const config = require('@lib/config.js');
-const Redis = require('ioredis');
-const ms = require('ms');
const utils = require('@lib/utils');
const log = require('@lib/utils/log')('Page Cache');
const yaml = require('js-yaml');
const fs = require('fs');
const LRU = require('lru-cache');
-const gcpMetadata = require('gcp-metadata');

const buildInfo = yaml.load(
fs.readFileSync(utils.project.paths.BUILD_INFO_PATH, 'utf8')
);

/\*\*

- - Time in seconds an item in Redis will stay valid
- - @type {Integer}
- \*/
  -const EXPIRATION_TIME = ms('1d') / 1000;
- -/\*\*
- - Number of pages that is cached in the fallback LRU cache at maximum

* - Number of pages that is cached in the LRU cache at maximum
  - @type {Number}
    \*/
    const LRU_MAX_ITEMS = 100;

/\*\*

- - The region the querying instance is running in
- - @type {String}
- \*/
  -const REGION = process.env.FUNCTION_REGION || '-';
- -/\*\*
- - Contains host and port a configured redis instance for the region the
- - Google Computing instance is running in
- - @type {Object|null}

* - LRU cache instance for page caching
    \*/
    -const instance = (async () => {

- // Do not try to search for instances if running locally
- if (config.isDevMode() || config.isLocalMode()) {
- return null;
- }
-
- let region = null;
- try {
- // Zone is in URL like scheme: projects/123/zones/us-central1-b
- let zone = await gcpMetadata.instance('zone');
- zone = zone.split('/').pop();
  +const lru = new LRU({

* max: LRU_MAX_ITEMS,
  +});

- // As instances are available across zones in the same region,
- // slice the zone identifier
- region = zone.slice(0, -2);
-
- log.info('Zone & Region', zone, region);
- } catch (e) {
- log.error('Fetching zone failed falling back to', REGION);
- region = REGION;
- }
-
- return config.redis[region] || null;
  -})();
- -let redis = null;
  -let lru = null;
- -instance
- .then((instance) => {
- // Check if there is an instance available. If there is, instantiate
- // a client to use it, if there is none fall back to LRU cache
- if (instance) {
-      log.info('Connecting to Redis', instance.port, instance.host);
-      try {
-        redis = new Redis(instance.port, instance.host);
-        log.info(
-          'Connected to Redis instance at',
-          instance.host,
-          instance.port
-        );
-        return;
-      } catch (e) {
-        log.error('Connecting to Redis failed', e);
-      }
- }
-
- log.warn('No Redis instances available. Falling back to LRU');
- lru = new LRU({
-      max: LRU_MAX_ITEMS,
- });
- })
- .catch((e) => {
- log.error('Could not initialize caches', e);
- });
  +log.info('Using LRU cache with max', LRU_MAX_ITEMS, 'items');

/\*\*

- Prefixes the key (which should be the request URL) with the current
  @@ -122,25 +55,17 @@ function prefixKey(key) {
  }

/\*\*

- - Tries to fetch a rendered page from either the LRU cache or from
- - an redis instance or returns null if none of them is available

* - Tries to fetch a rendered page from the LRU cache
  - @param {String} key
  - @return {Promise}
    \*/
    async function get(key) {
    const prefixedKey = prefixKey(key);

-
- if (lru) {
- return lru.get(prefixedKey);
- } else if (redis) {
- return await redis.get(prefixedKey);
- }
-
- return null;

* return lru.get(prefixedKey);
  }

/\*\*

- - Adds a rendered page to either the LRU or the Redis cache. Simply falls

* - Adds a rendered page to the LRU cache. Simply falls
    - through if in development mode
    - @param {String} key
    - @param {String} html
      @@ -151,14 +76,7 @@ function set(key, html) {
      }
      const prefixedKey = prefixKey(key);

-
- if (lru) {
- lru.set(prefixedKey, html);
- } else if (redis) {
- redis.set(prefixedKey, html, 'ex', EXPIRATION_TIME);
- } else {
- log.warn('No cache available to cache', key);
- }

* lru.set(prefixedKey, html);
  }

module.exports = {
