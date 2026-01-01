# Claude Code Assignment: amp.dev.22 Project Analysis

**Date:** December 31, 2025  
**Repository:** `/mnt/e/users/gigster/workspace/repos/amp/amp.dev.22`  
**Reference Directory:** `_claude/` (see DIRECTORY-TREE-PS.txt for structure)

---

## Assignment Objective

Analyze the 19 projects planned for amp.dev.22, identify dependencies between them, assess testability, and produce a sequenced implementation plan that minimizes risk and rework.

---

## Required Deliverables

### 1. Dependency Matrix

For each project, identify:

| Field | Description |
|-------|-------------|
| **Upstream** | Projects that must be completed first |
| **Downstream** | Projects this unblocks |
| **Shared Infrastructure** | Common dependencies (Google Sheets, credentials, Netlify Functions patterns) |
| **Files Modified** | Key files this project touches |
| **Conflicts** | Projects that modify the same files |

### 2. Recommended Sequence

Group projects into phases based on dependency analysis:

| Phase | Purpose | Criteria |
|-------|---------|----------|
| **Phase 0** | Prerequisites | Dead code removal, Health Check cleanup - reduces noise for subsequent work |
| **Phase 1** | Infrastructure | Shared services (Google Sheets, Site Configuration) that multiple projects depend on |
| **Phase 2** | Core Features | Projects that depend on Phase 1 infrastructure |
| **Phase 3** | Enhancements | Independent improvements (CSS, ARIA, Analytics) |
| **Phase 4** | Polish | Final integration, documentation |

### 3. Testability Assessment

For each project, provide:

```
Project: [Name]
├── Unit Testable: Y/N
│   └── Test approach: [description]
├── Integration Test Needed: Y/N
│   └── Dependencies: [what must be running]
├── Manual Verification: Y/N
│   └── Steps: [how to verify]
├── Error Scenarios:
│   ├── [Error 1]: [handling approach]
│   └── [Error 2]: [handling approach]
└── Rollback Strategy: [how to undo if broken]
```

### 4. Health Check Delta

**Context:** Pixi and most gCloud dependencies have been pruned. The Health Check report (`_claude/project-health-check/_HEALTH-CHECK-2025-12-30.md`) identifies remaining cleanup work.

Provide:
- List of completed cleanup items (for reference)
- List of remaining cleanup items with priority
- New warnings/errors not yet catalogued
- Recommended cleanup sequence before feature work begins

### 5. Express-to-Netlify Function Migration Map

Several projects involve migrating Express routes to Netlify Functions. Provide a consolidated view:

| Express File | Netlify Function | Project | Status | Pattern |
|--------------|------------------|---------|--------|---------|
| `examples/api/X.js` | `netlify/functions/X/X.js` | [Project] | Done/TODO | [POST/GET/etc] |

---

## Analysis Instructions

### Step 1: Read Reference Files

For each project, read the referenced files in `_claude/project-*/` to understand:
- Current implementation state
- Known issues documented
- Proposed solutions

### Step 2: Cross-Reference Repository

Check the actual repository files against the reference documents:
- Do the files exist?
- Are they in the expected locations?
- What is their current state?

### Step 3: Identify Shared Patterns

Look for:
- Common credential/authentication patterns
- Shared utility functions
- Repeated code that should be consolidated
- Configuration that affects multiple projects

### Step 4: Assess Risk

For each project, evaluate:
- **Complexity:** Lines of code, number of files, external dependencies
- **Blast radius:** What breaks if this fails?
- **Reversibility:** Can changes be easily rolled back?

---

## Project Inventory

### Infrastructure Projects

| # | Project | Purpose | Reference Files |
|---|---------|---------|-----------------|
| 9 | Google Sheets | Storage backend for Contact Us, Survey, Star Rating | `project-google-sheets/` |
| 10 | Health Check | Reduce build/deploy errors and warnings | `project-health-check/` |
| 15 | Site Configuration | Centralized site variables and config | `project-site-configuration/` |
| 13 | Repository Management | Keep repo clean via Renovate | `project-repository-management/` |

### Migration Projects

| # | Project | Purpose | Reference Files |
|---|---------|---------|-----------------|
| 7 | Express to Functions | Migrate Express routes to Netlify Functions | `project-express-to-functions/` |
| 3 | Autosuggest | Migrate autosuggest examples to Netlify | `project-autosuggest/` |
| 12 | Playground | Transform playground URLs to new domain | `project-playground/` |
| 8 | Go Links | Enable Go shortcuts via Netlify redirects | `project-go-links/` |
| 11 | Platforms | Add preview-amp-new.netlify.app support | N/A |

### Feature Projects

| # | Project | Purpose | Reference Files |
|---|---------|---------|-----------------|
| 4 | Boilerplate | Restore AMP Boilerplate Generator tool | `project-boilerplate/` |
| 5 | Contact Us | Build Contact Us form for Support menu | `project-contact-us/` |
| 17 | Star Rating | Implement page star ratings | `project-star-rating/` |
| 19 | Survey | Restore survey functionality | `project-survey/` |
| 16 | Site Search | Integrate autosuggest with GPSE | `project-site-search/` |
| 14 | Serviceworker | Improve serviceworker configuration | `project-serviceworker/` |

### Enhancement Projects

| # | Project | Purpose | Reference Files |
|---|---------|---------|-----------------|
| 1 | Analytics | Improve page tracking | `project-analytics/` |
| 2 | ARIA | Improve accessibility scores | `project-aria/` |
| 6 | CSS Repair | Fix component/example page styling | `project-css-repair/` |
| 18 | Structured Data | Update JSON-LD for Rich Results | `project-structured-data/` |

---

## Known Dependencies (Starter List)

Verify and expand this dependency graph:

```
Google Sheets (9)
├── Contact Us (5) - needs storage
├── Survey (19) - needs storage
└── Star Rating (17) - needs storage

Site Configuration (15)
├── Playground (12) - needs URL config
├── Platforms (11) - needs environment config
└── Go Links (8) - needs subdomain config

Express to Functions (7)
├── Autosuggest (3) - pattern dependency
├── Contact Us (5) - pattern dependency
└── Star Rating (17) - pattern dependency

Health Check (10)
└── ALL PROJECTS - clean baseline reduces debugging noise
```

---

## Output Format

Provide the analysis as a structured markdown report with:

1. **Executive Summary** - Key findings, critical path, major risks
2. **Dependency Matrix** - Table format
3. **Recommended Sequence** - Phases with rationale
4. **Per-Project Details** - Testability, errors, rollback
5. **Health Check Status** - Completed vs remaining
6. **Migration Map** - Express to Netlify consolidated view
7. **Recommendations** - Suggested order of work for Claude Chat negotiation

---

## Notes for Claude Code

- The `_claude/` directory contains project-specific reference materials
- Some reference files may be outdated - flag discrepancies with actual repo state
- Search integration (Project 16) is already working end-to-end with GPSE - verify current state
- Site Configuration (Project 15) Phase 1-3 completed per handoff document - identify Phase 4 work
- Prioritize findings that affect multiple projects over isolated issues
