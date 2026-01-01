## Environment Config Addition

Add to `platform/config/environments/production.json`:

```json
{
  "hosts": {
    "playground": {
      "scheme": "https",
      "host": "playground-amp-new.netlify.app",
      "port": 443
    }
  }
}
```

This should merge with existing hosts in that file. Check the current structure - it likely already has `platform`, `api`, `preview` hosts defined. Add `playground` alongside them.

Also verify the same pattern exists in:
- `staging.json` (use same value or a staging playground if you have one)
- `development.json` / `local.json` (can use `localhost:8083` or the production URL)

---

## Clarification on #3: 2021 Templates

The repo has two template sets:

```
frontend/templates/views/partials/          ← Main templates
frontend/templates/views/2021/partials/     ← 2021 redesign templates
```

Both may have hardcoded values like site title and social links.

**My question:** Do you want me to:

**Option A:** Examine the 2021 template files now and provide the exact line-by-line changes needed (like I did for the main templates in Step 2.2-2.6)?

**Option B:** You apply the pattern yourself to 2021 templates after completing the main templates, since the changes follow the same pattern?

If you choose Option A, please share these files:
```bash
cat frontend/templates/views/2021/partials/header.j2
cat frontend/templates/views/2021/partials/footer.j2
```

And I'll provide exact changes.

---

## Ready to Start?

Begin with **Step 1.1: Update shared.json**.
Let me know if you want me to provide the complete `shared.json` file with all additions in context, or if the snippet in the plan is sufficient.
