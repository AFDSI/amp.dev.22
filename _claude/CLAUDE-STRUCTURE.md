Create a `_claude/` directory for collaboration artifacts.

## Recommended Structure

```
amp.dev.22/
├── _claude/                          # Collaboration workspace
│   ├── README.md                     # Purpose and guidelines
│   ├── features/                     # Feature migration tracking
│   │   ├── 01-gpse-migration.md      # Feature 1 specs
│   │   ├── 02-autosuggest.md         # Feature 2 specs
│   │   └── ...
│   ├── analysis/                     # CCW analysis outputs
│   │   ├── repo-comparison.md        # Overall diff summary
│   │   └── gpse-diff.md              # Specific feature analysis
│   ├── branches/                     # Branch tracking
│   │   └── active-branches.md        # What's in progress
│   └── decisions/                    # Decision log
│       └── 2024-12-15-gpse.md        # Why we did what we did
└── .gitignore                        # Add _claude/temp/
```

## What to Put There

### 1. Feature Specifications (`features/01-gpse-migration.md`)
```markdown
# Feature 1: GPSE Migration

## Source (amp.dev.20)
- Files: gulpfile.js/googleSearch.js
- Secrets: GOOGLE_CSE_API_KEY, GOOGLE_CSE_ID
- Status: Working in production

## Target (amp.dev.22)
- Current state: Partially implemented
- Missing: [list gaps]

## Implementation Plan
[Steps CCW should follow]

## Testing Criteria
- [ ] Search box appears
- [ ] Search executes without errors
- [ ] Results display correctly

## Branch
- Name: claude/restore-gpse-xxx
- Status: In progress
```

### 2. Analysis Outputs (`analysis/gpse-diff.md`)
```markdown
# GPSE Differences Between Repos

## Files in amp.dev.20 (working)
[CCW pastes analysis here]

## Files in amp.dev.22 (missing/broken)
[CCW pastes analysis here]

## Key Changes Needed
[CCW lists what to migrate]
```

### 3. Decision Log (`decisions/2024-12-15-gpse.md`)
```markdown
# Decision: GPSE Migration Approach

**Date:** 2024-12-15
**Context:** Migrating working GPSE from .20 to .22

**Decision:** Use direct file migration rather than rewrite
**Rationale:** .20 implementation already works in production

**Alternatives Considered:**
- Rewrite from scratch (rejected: too risky)
- Use different search API (rejected: secrets already configured)
```

## Update `.gitignore`

```bash
# Add to .gitignore
echo "" >> .gitignore
echo "# Claude collaboration workspace - ignore temp files" >> .gitignore
echo "_claude/temp/" >> .gitignore
echo "_claude/scratch/" >> .gitignore
```

## Benefits

✅ **Context preservation** - CCW can reference specs across sessions  
✅ **Progress tracking** - See what's done, what's pending  
✅ **Decision history** - Remember why you made choices  
✅ **Contractor onboarding** - Clear documentation of changes  
✅ **Rollback info** - Know what was changed and why  

## Create It Now

```bash
cd amp.dev.22

# Create structure
mkdir -p _claude/{features,analysis,branches,decisions,temp}

# Create README
cat > _claude/README.md << 'EOF'
# Claude Collaboration Workspace

This directory contains artifacts from Claude-assisted development.

## Structure

- `features/` - Feature migration specifications
- `analysis/` - Code analysis outputs
- `branches/` - Active branch tracking
- `decisions/` - Decision log
- `temp/` - Temporary scratch work (gitignored)

## Usage

When working with Claude Code Web (CCW):
1. Reference specs in `features/` for context
2. Save analysis outputs in `analysis/`
3. Log decisions in `decisions/`
4. Track branch progress in `branches/`

## Guidelines

- Keep files focused and concise
- Use markdown for readability
- Date all decision logs
- Update branch tracking when merging
EOF

# Update .gitignore
echo "" >> .gitignore
echo "# Claude workspace - ignore temp files" >> .gitignore
echo "_claude/temp/" >> .gitignore

# Commit
git add _claude/ .gitignore
git commit -m "Add: Claude collaboration workspace structure"
git push origin main
```

## Tell CCW About It

In your first CCW prompt, mention:

```markdown
**Note:** This repo has a `_claude/` directory for collaboration artifacts.
Please save your analysis to `_claude/analysis/gpse-diff.md` so we can
reference it later.
```

---

**Yes, create `_claude/`!** It'll make the collaboration much smoother and preserve institutional knowledge. 📁✨

