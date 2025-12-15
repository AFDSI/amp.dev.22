
# See what was removed from header templates
git show df1c26b9f569758075abaceae01a66ccb6ad79c3 -- frontend/templates/views/2021/partials/header.j2
```
commit df1c26b9f569758075abaceae01a66ccb6ad79c3
Author: patrick kettner <patrickkettner@gmail.com>
Date:   Mon Nov 28 12:45:43 2022 -0500

    Static production amp dev (#6533)

    * Static production amp dev updates (#6523)

    * fix svg output of Cheerio

    * another email example endpoint fix

    * fixed paged-list example

    * amp-form example fix

    * fix about/websites rendering issue

diff --git a/frontend/templates/views/2021/partials/header.j2 b/frontend/templates/views/2021/partials/header.j2
index 3fa54a351..ae97e13dc 100644
--- a/frontend/templates/views/2021/partials/header.j2
+++ b/frontend/templates/views/2021/partials/header.j2
@@ -89,18 +89,6 @@ to provide its state to other components #}
     {% include '/views/2021/partials/language-selector.j2' %}
     {% endif %}

-    {% do doc.icons.useIcon('/icons/magnifier.svg') %}
-    <button id="searchTriggerOpen"
-        class="ap-search-trigger"
-        on="tap:searchLightbox"
-        role="button"
-        aria-label="{{ _('Search') }}"
-        tabindex="0">
-      <div class="ap-icon ap-search-trigger-icon">
-        <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#magnifier"></use></svg>
-      </div>
-    </button>
-
     <button class="ap-header-burger"
         on="tap:AMP.setState({mainmenuopen: !mainmenuopen, noScrollState: !noScrollState})"
         [class]="'ap-header-burger ' + (mainmenuopen ? '--mainmenuopen ' : '')"
(END)
```

git show df1c26b9f569758075abaceae01a66ccb6ad79c3 -- frontend/templates/views/partials/header.j2

```
commit df1c26b9f569758075abaceae01a66ccb6ad79c3
Author: patrick kettner <patrickkettner@gmail.com>
Date:   Mon Nov 28 12:45:43 2022 -0500

    Static production amp dev (#6533)

    * Static production amp dev updates (#6523)

    * fix svg output of Cheerio

    * another email example endpoint fix

    * fixed paged-list example

    * amp-form example fix

    * fix about/websites rendering issue

diff --git a/frontend/templates/views/partials/header.j2 b/frontend/templates/views/partials/header.j2
index 2c81c6f7b..c639b29fe 100644
--- a/frontend/templates/views/partials/header.j2
+++ b/frontend/templates/views/partials/header.j2
@@ -95,14 +95,6 @@
     {{ doc.pod.amp_dev.template_cache.get(cache_key)|safe }}
     {% endif %}

-    {% do doc.styles.addCssFile('/css/components/molecules/search-trigger.css') %}
-    {% do doc.icons.useIcon('/icons/magnifier.svg') %}
-    <div id="searchTriggerOpen" class="ap-m-search-trigger" on="tap:searchLightbox" role="button" aria-label="{{ _('Search') }}"  tabindex="0">
-      <div class="ap-a-ico ap-m-search-trigger-icon">
-        <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#magnifier"></use></svg>
-      </div>
-    </div>
-
     {# blog.amp.dev shares the header with amp.dev but isn't localized.
        Therefore it's nice to have a way to turn off the language selector #}
     {% if language_selector != False %}
(END)
```

# See what changed in search functions

git show df1c26b9f569758075abaceae01a66ccb6ad79c3 -- netlify/functions/search_do/search_do.js

```
commit df1c26b9f569758075abaceae01a66ccb6ad79c3
Author: patrick kettner <patrickkettner@gmail.com>
Date:   Mon Nov 28 12:45:43 2022 -0500

    Static production amp dev (#6533)

    * Static production amp dev updates (#6523)

    * fix svg output of Cheerio

    * another email example endpoint fix

    * fixed paged-list example

    * amp-form example fix

    * fix about/websites rendering issue

diff --git a/netlify/functions/search_do/search_do.js b/netlify/functions/search_do/search_do.js
index 9ea4761ee..ff645b2a0 100644
--- a/netlify/functions/search_do/search_do.js
+++ b/netlify/functions/search_do/search_do.js
@@ -108,7 +108,7 @@ function createResult(
 }

 const handler = async (ev) => {
-  const searchQuery = ev.searchQueryStringParameters;
+  const searchQuery = ev.queryStringParameters;

   const locale = searchQuery.locale ? searchQuery.locale : DEFAULT_LOCALE;
   const page = searchQuery.page ? parseInt(searchQuery.page) : 1;
@@ -144,6 +144,7 @@ const handler = async (ev) => {
     return {
       statusCode: 200,
       headers: {
+        'Access-Control-Allow-Origin': ev.headers?.origin || '',
         'Content-Type': 'application/javascript',
         'Cache-Control': `max-age=${RESPONSE_MAX_AGE.search}, immutable`,
       },
@@ -161,6 +162,7 @@ const handler = async (ev) => {
     return {
       statusCode: 500,
       headers: {
+        'Access-Control-Allow-Origin': ev.headers?.origin || '',
         'Content-Type': 'text/plain',
         'Cache-Control': `no-cache`,
       },
@@ -201,6 +203,7 @@ const handler = async (ev) => {
   return {
     statusCode: 200,
     headers: {
+      'Access-Control-Allow-Origin': ev.headers?.origin || '',
       'Content-Type': 'application/javascript',
       'Cache-Control': `max-age=${RESPONSE_MAX_AGE.search}, immutable`,
     },
(END)
```

git show df1c26b9f569758075abaceae01a66ccb6ad79c3 -- netlify/functions/search_autosuggest/search_autosuggest.js

```
commit df1c26b9f569758075abaceae01a66ccb6ad79c3
Author: patrick kettner <patrickkettner@gmail.com>
Date:   Mon Nov 28 12:45:43 2022 -0500

    Static production amp dev (#6533)

    * Static production amp dev updates (#6523)

    * fix svg output of Cheerio

    * another email example endpoint fix

    * fixed paged-list example

    * amp-form example fix

    * fix about/websites rendering issue

diff --git a/netlify/functions/search_autosuggest/search_autosuggest.js b/netlify/functions/search_autosuggest/search_autosuggest.js
index c2ad7754a..42f850fa1 100644
--- a/netlify/functions/search_autosuggest/search_autosuggest.js
+++ b/netlify/functions/search_autosuggest/search_autosuggest.js
@@ -30,6 +30,7 @@ const handler = async () => {
   return {
     statusCode: 200,
     headers: {
+      'Access-Control-Allow-Origin': ev.headers?.origin || '',
       'Content-Type': 'application/javascript',
       'Cache-Control': `max-age=${RESPONSE_MAX_AGE.autosuggest}, immutable`,
     },
(END)
```
# See the full diff in sections

git show df1c26b9f569758075abaceae01a66ccb6ad79c3 -- frontend/templates/ > /tmp/template-changes.diff
git show df1c26b9f569758075abaceae01a66ccb6ad79c3 -- netlify/functions/search* > /tmp/search-functions.diff

cat /tmp/template-changes.diff
```
commit df1c26b9f569758075abaceae01a66ccb6ad79c3
Author: patrick kettner <patrickkettner@gmail.com>
Date:   Mon Nov 28 12:45:43 2022 -0500

    Static production amp dev (#6533)

    * Static production amp dev updates (#6523)

    * fix svg output of Cheerio

    * another email example endpoint fix

    * fixed paged-list example

    * amp-form example fix

    * fix about/websites rendering issue

diff --git a/frontend/templates/layouts/default.j2 b/frontend/templates/layouts/default.j2
index 6036be817..da90cb386 100644
--- a/frontend/templates/layouts/default.j2
+++ b/frontend/templates/layouts/default.j2
@@ -112,8 +112,6 @@
     {% include 'views/partials/burger-menu.j2' %}
     {% endblock %}

-    {% include 'views/partials/search.j2' %}
-
     {% block main %}
     {# Only render the grid toggle during development #}
     {% include 'views/partials/content.j2' %}
diff --git a/frontend/templates/views/2021/partials/header.j2 b/frontend/templates/views/2021/partials/header.j2
index 3fa54a351..ae97e13dc 100644
--- a/frontend/templates/views/2021/partials/header.j2
+++ b/frontend/templates/views/2021/partials/header.j2
@@ -89,18 +89,6 @@ to provide its state to other components #}
     {% include '/views/2021/partials/language-selector.j2' %}
     {% endif %}

-    {% do doc.icons.useIcon('/icons/magnifier.svg') %}
-    <button id="searchTriggerOpen"
-        class="ap-search-trigger"
-        on="tap:searchLightbox"
-        role="button"
-        aria-label="{{ _('Search') }}"
-        tabindex="0">
-      <div class="ap-icon ap-search-trigger-icon">
-        <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#magnifier"></use></svg>
-      </div>
-    </button>
-
     <button class="ap-header-burger"
         on="tap:AMP.setState({mainmenuopen: !mainmenuopen, noScrollState: !noScrollState})"
         [class]="'ap-header-burger ' + (mainmenuopen ? '--mainmenuopen ' : '')"
diff --git a/frontend/templates/views/partials/header.j2 b/frontend/templates/views/partials/header.j2
index 2c81c6f7b..c639b29fe 100644
--- a/frontend/templates/views/partials/header.j2
+++ b/frontend/templates/views/partials/header.j2
@@ -95,14 +95,6 @@
     {{ doc.pod.amp_dev.template_cache.get(cache_key)|safe }}
     {% endif %}

-    {% do doc.styles.addCssFile('/css/components/molecules/search-trigger.css') %}
-    {% do doc.icons.useIcon('/icons/magnifier.svg') %}
-    <div id="searchTriggerOpen" class="ap-m-search-trigger" on="tap:searchLightbox" role="button" aria-label="{{ _('Search') }}"  tabindex="0">
-      <div class="ap-a-ico ap-m-search-trigger-icon">
-        <svg><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#magnifier"></use></svg>
-      </div>
-    </div>
-
     {# blog.amp.dev shares the header with amp.dev but isn't localized.
        Therefore it's nice to have a way to turn off the language selector #}
     {% if language_selector != False %}
```

cat /tmp/search-functions.diff

```
commit df1c26b9f569758075abaceae01a66ccb6ad79c3
Author: patrick kettner <patrickkettner@gmail.com>
Date:   Mon Nov 28 12:45:43 2022 -0500

    Static production amp dev (#6533)

    * Static production amp dev updates (#6523)

    * fix svg output of Cheerio

    * another email example endpoint fix

    * fixed paged-list example

    * amp-form example fix

    * fix about/websites rendering issue

diff --git a/netlify/functions/search_autosuggest/search_autosuggest.js b/netlify/functions/search_autosuggest/search_autosuggest.js
index c2ad7754a..42f850fa1 100644
--- a/netlify/functions/search_autosuggest/search_autosuggest.js
+++ b/netlify/functions/search_autosuggest/search_autosuggest.js
@@ -30,6 +30,7 @@ const handler = async () => {
   return {
     statusCode: 200,
     headers: {
+      'Access-Control-Allow-Origin': ev.headers?.origin || '',
       'Content-Type': 'application/javascript',
       'Cache-Control': `max-age=${RESPONSE_MAX_AGE.autosuggest}, immutable`,
     },
diff --git a/netlify/functions/search_do/search_do.js b/netlify/functions/search_do/search_do.js
index 9ea4761ee..ff645b2a0 100644
--- a/netlify/functions/search_do/search_do.js
+++ b/netlify/functions/search_do/search_do.js
@@ -108,7 +108,7 @@ function createResult(
 }

 const handler = async (ev) => {
-  const searchQuery = ev.searchQueryStringParameters;
+  const searchQuery = ev.queryStringParameters;

   const locale = searchQuery.locale ? searchQuery.locale : DEFAULT_LOCALE;
   const page = searchQuery.page ? parseInt(searchQuery.page) : 1;
@@ -144,6 +144,7 @@ const handler = async (ev) => {
     return {
       statusCode: 200,
       headers: {
+        'Access-Control-Allow-Origin': ev.headers?.origin || '',
         'Content-Type': 'application/javascript',
         'Cache-Control': `max-age=${RESPONSE_MAX_AGE.search}, immutable`,
       },
@@ -161,6 +162,7 @@ const handler = async (ev) => {
     return {
       statusCode: 500,
       headers: {
+        'Access-Control-Allow-Origin': ev.headers?.origin || '',
         'Content-Type': 'text/plain',
         'Cache-Control': `no-cache`,
       },
@@ -201,6 +203,7 @@ const handler = async (ev) => {
   return {
     statusCode: 200,
     headers: {
+      'Access-Control-Allow-Origin': ev.headers?.origin || '',
       'Content-Type': 'application/javascript',
       'Cache-Control': `max-age=${RESPONSE_MAX_AGE.search}, immutable`,
     },
```
