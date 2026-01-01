see:
E:\users\gigster\workspace\repos\amp\amp.dev.22_claude\PROJECT-1.md

/\*\*

- Builds the playground
- @return {Promise}
  \*/
  async function buildPlayground() {
  await sh('mkdir -p playground/dist');
  await sh('npm run build:playground');

await gulp
.src(project.absolute('netlify/configs/preview.amp.dev/netlify.toml'))
.pipe(gulp.dest(`${project.paths.DIST}/examples`));

await gulp
.src([project.absolute('pages/static/**/*')])
.pipe(gulp.dest(`${project.paths.DIST}/playground/static`));

await gulp
.src(project.absolute('playground/dist/\*_/_'))
.pipe(gulp.dest(`${project.paths.DIST}/playground`));

return await gulp
.src(project.absolute('netlify/configs/playground.amp.dev/netlify.toml'))
.pipe(gulp.dest(`${project.paths.DIST}/playground`));
}

### 11. Playground URLs (CRITICAL)

The playground is a separate application that loads AMP pages for editing/preview. It receives the target page URL via query parameter: `{playground_base}/?url={page_url_encoded}`

**Current Production Domain**: `playground.amp.dev`
**Current Build Domain**: `playground-amp-new.netlify.app`

#### A. Configuration-Based (Already Externalized)

These use `config.hosts.playground.base` or `podspec.base_urls.playground`:

| File                                                             | Line  | Pattern                                                                            | Variable Type |
| ---------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------- | ------------- | ------ |
| `platform/config/environments/production.json`                   | 25-28 | `"playground": { "host": "playground-amp-new.netlify.app" }`                       | JSON          |
| `platform/config/environments/staging.json`                      | 25-28 | `"playground": { "host": "playground-amp-new.netlify.app" }`                       | JSON          |
| `platform/config/environments/development.json`                  | 26-29 | `"playground": { "host": "localhost", "port": "8083" }`                            | JSON          |
| `platform/lib/common/samples.js`                                 | 46-50 | `config.hosts.playground.base + '/?url=' + encodeURIComponent(previewUrl)`         | JavaScript    |
| `platform/lib/config.js`                                         | 230   | Builds `podspec.base_urls.playground` from `this.hosts.playground.base`            | JavaScript    |
| `frontend/templates/views/partials/code-preview/code-preview.j2` | 146   | `{{podspec.base_urls.playground}}/?url={{preview.url                               | urlencode}}`  | Jinja2 |
| `frontend/templates/views/examples/documentation.j2`             | 101   | `podspec.base_urls.playground + '/?url=' + podspec.base_urls.preview + doc.source` | Jinja2        |

#### B. Hardcoded `playground.amp.dev` (Needs Externalization)

These have `playground.amp.dev` hardcoded and need substitution:

| File                                                      | Line    | Context                                                       | Variable Type |
| --------------------------------------------------------- | ------- | ------------------------------------------------------------- | ------------- |
| `pages/content/amp-dev/documentation/examples/index.html` | 212-213 | Examples index page - format-based playground links           | HTML/AMP      |
| `platform/lib/routers/search.js`                          | 267     | Search scope: `site:playground.amp.dev`                       | JavaScript    |
| `platform/lib/routers/search.js`                          | 396     | Search results: `playgroundUrl: 'https://playground.amp.dev'` | JavaScript    |
| `netlify/functions/search_do/search_do.js`                | 116     | Search scope: `site:playground.amp.dev`                       | JavaScript    |
| `pages/shared/data/tools.yaml`                            | 462     | Tools listing: `url: https://playground.amp.dev/`             | YAML          |
| `examples/static/inline-examples/data/amp-list-urls.json` | 17      | Example data: `"url": "https://playground.amp.dev/"`          | JSON          |
| `pages/static/sitemap/sitemap_manual.xml`                 | 4       | Sitemap entry (currently `playground-amp-new.netlify.app`)    | XML           |

#### C. Documentation Content (100+ files)

Hardcoded `playground.amp.dev` URLs in markdown documentation across all locales:

| Pattern                                            | File Count | Example Files                                          |
| -------------------------------------------------- | ---------- | ------------------------------------------------------ |
| `https://playground.amp.dev/?runtime=amp4email`    | ~45        | `create_email.md`, `validate_emails.md` (all locales)  |
| `https://playground.amp.dev/`                      | ~30        | `testing_amp_emails.md`, `formatting.md` (all locales) |
| `[AMP Playground](https://playground.amp.dev/...)` | ~50        | Various guide/tutorial files                           |

**Locales affected**: en, de, fr, ar, es, it, id, ja, ko, pt_BR, ru, tr, zh_CN, pl, vi

#### D. URL Construction Pattern

The playground expects a URL parameter pointing to the page to preview:

```
https://playground.amp.dev/?url=https://preview.amp.dev/documentation/examples/...
                          ↑                    ↑
                    playground host      preview host (page being edited)
```

**Key Integration Points**:

1. `platform/lib/common/samples.js:46-50` - `getPlaygroundUrlForPreviewLink()` - Central function for constructing playground URLs
2. `platform/lib/config.js:230` - Injects playground base URL into podspec for Jinja2 templates
3. `frontend/templates/views/examples/documentation.j2:101` - Template-based URL construction

#### E. Recommended Approach

1. **For configuration-based references**: Already handled via environment configs
2. **For hardcoded JS/YAML/JSON**: Replace with config variable references
3. **For search scopes**: Make `site:` filter configurable
4. **For documentation content**: Consider:
   - Build-time string replacement
   - Or: Accept that documentation refers to canonical `playground.amp.dev` (may be intentional)
