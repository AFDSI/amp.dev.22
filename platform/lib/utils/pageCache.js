/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

require('module-alias/register');

const config = require('@lib/config.js');
const utils = require('@lib/utils');
const log = require('@lib/utils/log')('Page Cache');
const yaml = require('js-yaml');
const fs = require('fs');
const LRU = require('lru-cache');

const buildInfo = yaml.load(
  fs.readFileSync(utils.project.paths.BUILD_INFO_PATH, 'utf8')
);

/**
 * Number of pages that is cached in the LRU cache at maximum
 * @type {Number}
 */
const LRU_MAX_ITEMS = 100;

/**
 * LRU cache instance for page caching
 */
const lru = new LRU({
  max: LRU_MAX_ITEMS,
});

log.info('Using LRU cache with max', LRU_MAX_ITEMS, 'items');

/**
 * Prefixes the key (which should be the request URL) with the current
 * build number to ensure updated content is served after a new deployment
 * @param  {String} key
 * @return {String}
 */
function prefixKey(key) {
  return `${buildInfo.number}:${key}`;
}

/**
 * Tries to fetch a rendered page from the LRU cache
 * @param  {String} key
 * @return {Promise}
 */
async function get(key) {
  const prefixedKey = prefixKey(key);
  return lru.get(prefixedKey);
}

/**
 * Adds a rendered page to the LRU cache. Simply falls
 * through if in development mode
 * @param {String} key
 * @param {String} html
 */
function set(key, html) {
  if (config.isDevMode()) {
    return;
  }

  const prefixedKey = prefixKey(key);
  lru.set(prefixedKey, html);
}

module.exports = {
  get,
  set,
};
