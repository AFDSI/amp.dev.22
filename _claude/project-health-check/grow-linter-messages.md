Now I understand. The warning is about these Grow-specific custom constructors:

## Custom Constructors in Your File

```yaml
$title: 'Working Group: AMP for Email'    # $ prefix - Grow metadata
$titles:                                  # $ prefix - Grow metadata
  navigation: Working Groups

data: !g.json content/amp-dev/...         # !g.json - Grow JSON loader
```

## What They Mean

| Constructor | Purpose |
|-------------|---------|
| `$title`    | Grow built-in: page title metadata      |
| `$titles`   | Grow built-in: navigation titles        |
| `!g.json`   | Grow custom tag: load JSON file as data |

## Is This a Problem?

**No.** This warning is safe to ignore.

The linter doesn't understand Grow's custom YAML syntax, but Grow itself knows how to process these tags. If your build completes successfully, everything is working correctly.

## Why the Warning Exists

Standard YAML validators don't recognize:
- `$` prefixed keys (Grow metadata convention)
- `!g.json`, `!g.doc`, `!g.yaml` (Grow data loaders)

The linter is being cautious: "I see syntax I don't understand, so I can't guarantee this file is valid."

## Summary

| Status | Action |
|--------|--------|
| ⚠️ Warning | Safe to ignore |
| ✅ Build succeeds | File is valid for Grow |
| 📝 Note | This is standard Grow syntax |

If you want to suppress these warnings, you could configure the linter to skip Grow YAML files, but that's optional. The warning is informational, not an error.
