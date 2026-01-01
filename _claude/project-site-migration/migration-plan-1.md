This is exactly the right approach, and I appreciate you framing the full context.

## What I'm Hearing

**Immediate deliverable:** Refactored `amp.dev.22` → `amp-new.netlify.app` that demonstrates to Google:
1. Their broken pages are fixed
2. Site variables are now centrally managed (lower maintenance cost)

**Longer-term goal:** `amp.dev.22` evolves into `abc.dev`, a generalized repo capable of generating 6 distinct sites from one codebase.

**Execution philosophy:**
- Incremental, testable changes (not a big-bang rewrite)
- Plan negotiated here in Chat, then handed to Claude Code for implementation
- Each step should be deployable and demonstrable

## Why This Approach Works

The proposal I sketched is designed to be **non-invasive**:

- `site-vars.yaml` is additive — it doesn't replace existing configs, it sits above them
- `config.js` modifications extend `buildGrowPodSpec()` rather than rewriting it
- Jinja template changes are mechanical find-and-replace operations (hardcoded value → `{{ podspec.xyz }}`)
- `prebuild.js` slots into the existing build chain as a new step, not a replacement

This means you can migrate incrementally: start with one category (say, site identity), verify it works, then move to the next.

## Next Steps

When you're ready, come back with:

1. **Gaps or corrections** — things in PROJECT-1.md that my proposal doesn't address, or assumptions I got wrong
2. **Prioritization** — which variable categories matter most for the Google demo vs. can wait for `abc.dev`
3. **Constraints** — anything about the existing build process that would make certain changes risky

From there, we'll refine the plan into a precise specification that Claude Code can execute systematically — likely as a series of discrete tasks, each producing a testable commit.

