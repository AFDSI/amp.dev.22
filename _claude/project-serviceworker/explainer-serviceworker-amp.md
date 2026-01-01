## **General Explanation of a Service Worker**

A **service worker** is a background script that runs separately from the main browser thread and acts as a **proxy between your web app and the network**. Key points:

- **Runs in the background**: It doesn’t interact directly with the DOM but can intercept network requests, cache resources, and handle push notifications.
- **Intercepts requests**: It listens for `fetch` events, giving you control over how requests are handled (e.g., serve from cache, hit the network, or both).
- **Enables offline experiences**: By caching key assets/pages, a service worker allows a site to work offline or with unreliable connections.
- **Custom caching strategies**: You can define how different resources should be cached — e.g., _Cache First_, _Network First_, _Stale While Revalidate_, etc.
- **Lifecycle**: Service workers follow a strict lifecycle (`install` → `activate` → `idle` → `fetch`/`message` events). They are versioned and updated independently of the site.

In short:
**The service worker makes your site faster, more resilient, and more app-like by controlling how requests are cached and handled.**

---

## **Explanation of This Instance**

This service worker is specific to **AMP.dev**. It combines AMP’s built-in SW library (`amp-sw.js`) with custom logic for handling **search queries**.

### 1. **AMP Service Worker Setup**

```js
importScripts('https://cdn.ampproject.org/sw/amp-sw.js');
AMP_SW.init({
  assetCachingOptions: [
    {
      regexp: /\.(png|jpg|woff2|woff|css|js)/,
      cachingStrategy: 'CACHE_FIRST',
    },
  ],
  offlinePageOptions: {
    url: '/offline.html',
    assets: [],
  },
});
```

- Loads AMP’s helper script for service workers.
- Configures **asset caching** for common file types (`png, jpg, fonts, css, js`) using a **Cache First** strategy → serve cached copy if available, otherwise fetch.
- Provides an **offline fallback page** (`/offline.html`) for when the user is completely offline.

---

### 2. **Search-Specific Caching**

```js
const SEARCH_CACHE_NAME = 'AMP-DEV-SEARCH-CACHE';
const SEARCH_LATEST_QUERY_PATH = '/search/latest-query';
```

- Defines a dedicated cache for search results.
- Keeps track of the **latest query string** separately.

---

### 3. **Handling `/search/do` requests**

```js
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname === '/search/do') {
    event.respondWith(searchDoRequestHandler(requestUrl, event.request));
  }
});
```

#### Inside `searchDoRequestHandler`:

- Extracts the search query (`q=...`) and stores it as the “latest query.”
- Looks for cached results for the same request:

  - If cached, returns immediately (faster).
  - If not cached, fetches from the network.
  - If response is `200 OK`, caches the new results.

👉 This means users get **instant repeat searches** without hitting the network.

---

### 4. **Handling `/search/latest-query`**

```js
if (requestUrl.pathname === SEARCH_LATEST_QUERY_PATH) {
  event.respondWith(searchLatestQueryHandler());
}
```

#### Inside `searchLatestQueryHandler`:

- Reads the “latest query” string from cache.
- Returns it as a `Response`.
- If nothing stored yet, returns `"null"`.

👉 This is how the frontend can ask: _“What was the user’s last search?”_

---

### 5. **Handling `/search/clear-latest-query`**

```js
if (requestUrl.pathname === '/search/clear-latest-query') {
  event.respondWith(searchClearLatestQueryRequestHandler());
}
```

#### Inside `searchClearLatestQueryRequestHandler`:

- Deletes the stored latest query from cache.
- Returns `"null"`.

👉 This allows the app to “forget” the last search when needed (e.g., reset state).

---

## **Summary of What This Service Worker Does**

1. **AMP-SW** handles offline caching of assets and fallback page.
2. **Custom logic for search**:

   - `/search/do`: caches results + saves latest query.
   - `/search/latest-query`: retrieves last query.
   - `/search/clear-latest-query`: clears stored query.

This turns search into a **stateful, cache-aware feature**:

- Faster repeated queries.
- Works even if the user navigates offline (still knows the last query).
- App-like behavior without requiring a backend session store.

---

👉 Would you like me to also diagram the **request flow** (from user → service worker → cache/network) for these three search endpoints, so you can include it in your Training Manual?
