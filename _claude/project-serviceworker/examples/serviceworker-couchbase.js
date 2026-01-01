
source: https://pouchdb.com/serviceWorker.js

// Useful resources:
// - https://eduardoboucas.com/blog/2015/06/04/supercharging-jekyll-with-a-serviceworker.html
// - https://jakearchibald.com/2014/offline-cookbook

var newCacheName = 'pouchdb-assets-cache-v2017-09-03 10:37:22 +0100';

var criticalAssets = [
  '/offline.html',
  '/static/css/pouchdb.css',
];

var pages = [
      '/adapters.html',
      '/api.html',
      '/custom.html',
      '/download.html',
      '/errors.html',
      '/external.html',
      '/faq.html',
      '/feed.xml',
      '/getting-started.html',
      '/gql.html',
      '/blog/',
      '/',
      '/learn.html',
      '/offline.html',
      '/serviceWorker.js',
      '/users.html',
      '/blog/page2/',
      '/blog/page3/',
      '/blog/page4/',
      '/blog/page5/',
      '/blog/page6/',
      '/blog/page7/',
      '/blog/page8/',
      '/blog/page9/',
    '/guides/async-code.html',
    '/guides/attachments.html',
    '/guides/bulk-operations.html',
    '/guides/changes.html',
    '/guides/compact-and-destroy.html',
    '/guides/conflicts.html',
    '/guides/databases.html',
    '/guides/documents.html',
    '/guides/',
    '/guides/local-documents.html',
    '/guides/mango-queries.html',
    '/guides/queries.html',
    '/guides/replication.html',
    '/guides/setup-couchdb.html',
    '/guides/setup-pouchdb.html',
    '/guides/updating-deleting.html',
];

var blogPosts = [
    '/2017/07/13/pouchdb-6.3.0.html',
    '/2017/04/20/pouchdb-6.2.0.html',
    '/2017/01/05/pouchdb-6.1.1.html',
    '/2016/12/12/pouchdb-6.1.0.html',
    '/2016/09/05/pouchdb-6.0.0.html',
    '/2016/06/06/pouchdb-5.4.0.html',
    '/2016/06/06/introducing-pouchdb-custom-builds.html',
    '/2016/04/28/prebuilt-databases-with-pouchdb.html',
    '/2016/03/04/pouchdb-5.3.0-sqlite-support-in-node.html',
    '/2016/01/13/pouchdb-5.2.0-a-better-build-system-with-rollup.html',
    '/2015/11/03/cover-all.html',
    '/2015/10/06/pouchdb-5.0.0-five-years-of-pouchdb.html',
    '/2015/09/12/pouchdb-4.0.2-a-little-extra.html',
    '/2015/09/01/pouchdb-4.0.1-gotta-go-fast.html',
    '/2015/08/03/pouchdb-4.0.0-ballast-overboard.html',
    '/2015/06/01/pouchdb-3.6.0.html',
    '/2015/05/18/we-have-a-problem-with-promises.html',
    '/2015/05/07/pouchdb-3.5.0-vote-for-pouchdb.html',
    '/2015/04/07/better-late-than-never.html',
    '/2015/04/05/filtered-replication.html',
    '/2015/03/05/taming-the-async-beast-with-es7.html',
    '/2015/02/28/efficiently-managing-ui-state-in-pouchdb.html',
    '/2015/02/14/a-quick-one.html',
    '/2015/02/03/fix-up-look-sharp.html',
    '/2015/01/05/pouchdb-3.2.1-you-can-always-be-faster.html',
    '/2014/12/11/the-pains-of-being-async-at-heart.html',
    '/2014/12/04/3.2.0.html',
    '/2014/11/27/testing-pouchdb.html',
    '/2014/11/10/3.1.0.html',
    '/2014/10/26/10-things-i-learned-from-reading-and-writing-the-pouchdb-source.html',
    '/2014/09/22/3.0.6.html',
    '/2014/09/07/pouchdb-3.0.5.html',
    '/2014/09/04/pouchdb-3.0.4.html',
    '/2014/08/29/pouchdb-3.0.3.html',
    '/2014/08/20/pouchdb-3.0.2.html',
    '/2014/08/16/pouchdb-3.0.1.html',
    '/2014/08/12/pouchdb-3.0.0.html',
    '/2014/07/25/pouchdb-levels-up.html',
    '/2014/06/17/12-pro-tips-for-better-code-with-pouchdb.html',
    '/2014/06/01/pouchdb-2.2.3.html',
    '/2014/05/01/secondary-indexes-have-landed-in-pouchdb.html',
    '/2014/05/01/pouchdb-2.2.0.html',
    '/2014/04/14/pagination-strategies-with-pouchdb.html',
    '/2014/04/01/welcome-to-the-pouchdb-blog.html',
    '/2014/04/01/pouchdb-2.1.0.html',
];

// Only cache the first blog page
var nonCriticalAssets =
  [
    '/static/favicon.ico',
    '/static/js/code.min.js',
    'https://code.jquery.com/jquery.min.js',
    'https://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js',
    'https://cdn.jsdelivr.net/pouchdb/latest/pouchdb.min.js',
  ]
  .concat(pages)
  .filter(function(file) {
    return file.indexOf('/blog/page') === -1;
  })
  .concat(blogPosts.slice(0, 5)); // Let's only cache the first five by default

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(newCacheName)
      .then(function(cache) {
        cache.addAll(nonCriticalAssets);
        // Only return the criticalAssets to waitUntil
        // This will allow the noncritical assets to fail
        return cache.addAll(criticalAssets);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  // remove caches beginning "pouchdb-" that aren't the new cache
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (!/^pouchdb-/.test(cacheName)) {
              return;
            }
            if (newCacheName !== cacheName) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Try the cache, if it's not in there try the network, then cache that response
  // if that network request fails show the offline.html page.
  event.respondWith(
    caches.open(newCacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        }).catch(function () {
          return cache.match('/offline.html');
        });
      });
   })
  );
});
