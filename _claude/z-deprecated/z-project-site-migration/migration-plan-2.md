Let me create both files with detailed comments explaining the structure and integration points.
Now let me show how the Jinja templates would reference these values:Here's the complete system. Let me summarize how these pieces work together:

## Architecture Overview

```
config/
  site-vars.yaml              ← SINGLE SOURCE OF TRUTH (you edit this)
  sites/
    wabc.yaml                 ← Per-site variants (optional)
    amp-new.yaml

scripts/
  prebuild.js                 ← Generates: manifest.json, robots.txt,
                                           sitemap_manual.xml, serviceworker.html
                                 Copies: netlify.toml

platform/lib/
  config.js                   ← Extended to read site-vars.yaml
    └── buildGrowPodSpec()    ← Injects all values into Grow/Jinja context
```

## Build Flow

```bash
# Standard build (uses config/site-vars.yaml)
npm run prebuild && npm run build

# Site-specific build
SITE_CONFIG=wabc npm run prebuild && npm run build
```

## What Each File Does

| File                             | Purpose                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| `site-vars.yaml`                 | Master config with all site variables, organized by category          |
| `config.js`                      | Loads YAML, builds podspec, provides values to Grow and other scripts |
| `prebuild.js`                    | Generates static files that can't use Jinja (JSON, XML, TXT)          |
| `template-migration-examples.j2` | Reference showing how to update existing templates                    |

## Key Design Decisions

1. **Jinja files never get preprocessed** — they receive variables through `podspec`, which is Grow's native mechanism.

2. **Static files are generated** — manifest.json, robots.txt, etc. are created by `prebuild.js` since they can't use template engines.

3. **TOML uses file replacement** — netlify.toml variants live in `netlify/configs/{site}/` and are copied during prebuild.

4. **Environment JSON files can be generated or hand-maintained** — the `config.js` includes a CLI mode (`--generate-env-configs`) if you want full generation.

The template migration examples file shows the before/after for each common pattern you identified in PROJECT-1.md. The variable reference at the bottom gives your contractors a quick lookup for what's available.
